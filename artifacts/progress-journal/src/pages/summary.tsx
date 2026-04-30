import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL, AREA_COLORS, type JournalArea, type JournalStrand, type Status } from "../data/journal";
import { useStore, getRatingKey, type Rating, type HistoryEntry } from "../lib/store";
import {
  buildStepVisibility,
  countAll,
  countArea,
  STATUS_LABELS,
  type StepVisibility,
} from "../lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, LogOut, AlertTriangle, Info, ChevronDown, FileText, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSaveAndClose } from "../hooks/use-save-and-close";
import { SaveAndCloseDialog } from "../components/save-and-close-dialog";
import { cn } from "../lib/utils";
import { useDirty } from "../hooks/use-dirty";
import { ageInMonths, formatAge } from "../lib/age";
import { Switch } from "@/components/ui/switch";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function ProgressBar({
  counts,
  height = "h-2",
}: {
  counts: ReturnType<typeof countAll>;
  height?: string;
}) {
  if (counts.total === 0) return null;
  return (
    <div className={cn("w-full rounded-full bg-muted overflow-hidden flex", height)}>
      <div
        className="h-full bg-[hsl(var(--status-emerging))]"
        style={{ width: `${(counts.emerging / counts.total) * 100}%` }}
      />
      <div
        className="h-full bg-[hsl(var(--status-developing))]"
        style={{ width: `${(counts.developing / counts.total) * 100}%` }}
      />
      <div
        className="h-full bg-[hsl(var(--status-secure))]"
        style={{ width: `${(counts.secure / counts.total) * 100}%` }}
      />
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

// Compact date for table cells: "27/04/25" — fits narrow columns.
function formatEntryDate(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(2);
    return `${dd}/${mm}/${yy}`;
  } catch {
    return "";
  }
}

interface RatedItemRow {
  key: string;
  text: string;
  status: Exclude<Status, null>;
  updatedAt: string;
  history?: HistoryEntry[];
}

interface StepBlock {
  stepNumber: number;
  ageRange: string;
  items: RatedItemRow[];
}

function collectStrandBlocks(
  area: JournalArea,
  aIdx: number,
  strand: JournalStrand,
  sIdx: number,
  childId: string,
  ratings: Record<string, Rating>,
  visibility: StepVisibility,
): StepBlock[] {
  const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;

  // Collect every visible step (rated or not) so we can fill gaps later.
  const allBlocks: StepBlock[] = [];
  strand.steps.forEach((step, stIdx) => {
    if (!step.items || step.note) return;
    const inAgeRange = visibleSet ? visibleSet.has(stIdx) : true;
    if (!inAgeRange) return;
    const items: RatedItemRow[] = [];
    step.items.forEach((item) => {
      const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
      const s = r?.status;
      if (s === "emerging" || s === "developing" || s === "secure") {
        items.push({ key: item.key, text: item.text, status: s, updatedAt: r!.updatedAt, history: r!.history });
      }
    });
    items.sort((a, b) => a.key.localeCompare(b.key));
    allBlocks.push({ stepNumber: step.number, ageRange: step.ageRange, items });
  });

  // Ascending step order so the earliest step sits at the top.
  allBlocks.sort((a, b) => a.stepNumber - b.stepNumber);

  // Find the first and last steps that actually have rated items.
  const withItems = allBlocks.filter((b) => b.items.length > 0);
  if (withItems.length === 0) return [];

  // Include every step in the range, even if empty, so gaps are visible in print.
  const first = withItems[0].stepNumber;
  const last = withItems[withItems.length - 1].stepNumber;
  return allBlocks.filter((b) => b.stepNumber >= first && b.stepNumber <= last);
}

function StrandTable({
  area,
  strand,
  blocks,
  stagnantKeys,
}: {
  area: JournalArea;
  strand: JournalStrand;
  blocks: StepBlock[];
  stagnantKeys?: Set<string>;
}) {
  return (
    <section
      className="journal-strand"
      data-testid={`strand-table-${strand.name}`}
      style={{ "--area-color": AREA_COLORS[area.area] ?? "#f6c344" } as React.CSSProperties}
    >
      <div className="journal-strand-header">
        <span className="font-semibold">{area.area}: </span>
        <span className="uppercase tracking-wide">{strand.name}</span>
      </div>
      {blocks.map((block) => (
        <table key={block.stepNumber} className="journal-step-table">
          <colgroup>
            <col className="journal-col-text" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
          </colgroup>
          <thead>
            <tr className="journal-step-row">
              <th scope="col" className="text-left">
                Step {block.stepNumber} ({block.ageRange})
              </th>
              <th scope="col" className="text-center">Emerging</th>
              <th scope="col" className="text-center">Developing</th>
              <th scope="col" className="text-center">Secure</th>
            </tr>
          </thead>
          <tbody>
            {block.items.map((it) => {
              const sk = `${area.area}::${strand.name}::${block.stepNumber}::${it.key}`;
              const isStagnant = stagnantKeys?.has(sk) ?? false;

              // Resolve the date for each status stage from current or history.
              function stageDate(s: "emerging" | "developing" | "secure"): string | null {
                if (it.status === s) return it.updatedAt;
                const h = it.history?.find((e) => e.status === s);
                return h?.date ?? null;
              }

              const eDate = stageDate("emerging");
              const dDate = stageDate("developing");
              const sDate = stageDate("secure");

              return (
                <tr key={it.key}>
                  <td>
                    <span className="font-semibold mr-1">{it.key})</span>
                    {it.text}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {eDate ? (
                      <span className={isStagnant && it.status === "emerging" ? "stagnant-date" : undefined}>
                        {formatEntryDate(eDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {dDate ? (
                      <span className={isStagnant && it.status === "developing" ? "stagnant-date" : undefined}>
                        {formatEntryDate(dDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {sDate ? formatEntryDate(sDate) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Full Development Journal (Full DJ) — all steps, all items, for LA submission
// ---------------------------------------------------------------------------

interface FullDJItemRow {
  key: string;
  text: string;
  status: Exclude<Status, null> | null;
  updatedAt: string | null;
  history?: HistoryEntry[];
}

interface FullDJStepBlock {
  stepNumber: number;
  ageRange: string;
  items: FullDJItemRow[];
}

function collectFullDJBlocks(
  area: JournalArea,
  aIdx: number,
  strand: JournalStrand,
  sIdx: number,
  childId: string,
  ratings: Record<string, Rating>,
): FullDJStepBlock[] {
  const blocks: FullDJStepBlock[] = [];
  strand.steps.forEach((step, stIdx) => {
    if (!step.items || step.note) return;
    const items: FullDJItemRow[] = step.items.map((item) => {
      const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
      const s = r?.status ?? null;
      return {
        key: item.key,
        text: item.text,
        status: s as Exclude<Status, null> | null,
        updatedAt: r?.updatedAt ?? null,
        history: r?.history,
      };
    });
    if (items.length > 0) {
      blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items });
    }
  });
  return blocks;
}

function FullDJStrandTable({
  area,
  strand,
  blocks,
  stagnantKeys,
}: {
  area: JournalArea;
  strand: JournalStrand;
  blocks: FullDJStepBlock[];
  stagnantKeys?: Set<string>;
}) {
  return (
    <section
      className="journal-strand"
      style={{ "--area-color": AREA_COLORS[area.area] ?? "#f6c344" } as React.CSSProperties}
    >
      <div className="journal-strand-header">
        <span className="font-semibold">{area.area}: </span>
        <span className="uppercase tracking-wide">{strand.name}</span>
      </div>
      {blocks.map((block) => (
        <table key={block.stepNumber} className="journal-step-table">
          <colgroup>
            <col className="journal-col-text" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
          </colgroup>
          <thead>
            <tr className="journal-step-row">
              <th scope="col" className="text-left">
                Step {block.stepNumber} ({block.ageRange})
              </th>
              <th scope="col" className="text-center">Emerging</th>
              <th scope="col" className="text-center">Developing</th>
              <th scope="col" className="text-center">Secure</th>
            </tr>
          </thead>
          <tbody>
            {block.items.map((it) => {
              const sk = `${area.area}::${strand.name}::${block.stepNumber}::${it.key}`;
              const isStagnant = stagnantKeys?.has(sk) ?? false;

              function stageDate(s: "emerging" | "developing" | "secure"): string | null {
                if (it.status === s) return it.updatedAt;
                const h = it.history?.find((e) => e.status === s);
                return h?.date ?? null;
              }

              const eDate = it.status ? stageDate("emerging") : null;
              const dDate = it.status ? stageDate("developing") : null;
              const sDate = it.status ? stageDate("secure") : null;

              return (
                <tr key={it.key}>
                  <td>
                    <span className="font-semibold mr-1">{it.key})</span>
                    {it.text}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {eDate ? (
                      <span className={isStagnant && it.status === "emerging" ? "stagnant-date" : undefined}>
                        {formatEntryDate(eDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {dDate ? (
                      <span className={isStagnant && it.status === "developing" ? "stagnant-date" : undefined}>
                        {formatEntryDate(dDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {sDate ? formatEntryDate(sDate) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stagnation detection — items rated Emerging/Developing with no progress
// for more than 6 calendar months.
// ---------------------------------------------------------------------------

interface StagnantItem {
  areaName: string;
  strandName: string;
  stepNumber: number;
  ageRange: string;
  itemKey: string;
  itemText: string;
  status: "emerging" | "developing";
  updatedAt: string;
  monthsStale: number;
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

function computeStagnantItems(
  childId: string,
  ratings: Record<string, Rating>,
  visibility: StepVisibility,
): StagnantItem[] {
  const now = new Date();
  const result: StagnantItem[] = [];

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;
      strand.steps.forEach((step, stIdx) => {
        if (!step.items || step.note) return;
        if (visibleSet && !visibleSet.has(stIdx)) return;
        step.items.forEach((item) => {
          const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
          if (!r || !r.status || r.status === "secure") return;
          const updated = new Date(r.updatedAt);
          if (isNaN(updated.getTime())) return;
          const months = monthsBetween(updated, now);
          if (months < 6) return;
          result.push({
            areaName: area.area,
            strandName: strand.name,
            stepNumber: step.number,
            ageRange: step.ageRange,
            itemKey: item.key,
            itemText: item.text,
            status: r.status as "emerging" | "developing",
            updatedAt: r.updatedAt,
            monthsStale: months,
          });
        });
      });
    });
  });

  // Sort: longest stale first, then by area/strand/item
  result.sort((a, b) =>
    b.monthsStale - a.monthsStale ||
    a.areaName.localeCompare(b.areaName) ||
    a.strandName.localeCompare(b.strandName),
  );
  return result;
}

function StagnantItemsSection({ items }: { items: StagnantItem[] }) {
  if (items.length === 0) return null;

  // Group by area
  const byArea = new Map<string, StagnantItem[]>();
  items.forEach((it) => {
    const list = byArea.get(it.areaName) ?? [];
    list.push(it);
    byArea.set(it.areaName, list);
  });

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-[hsl(38_88%_45%)]" />
        <h2 className="text-lg font-semibold">Areas without progression</h2>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {items.length} item{items.length !== 1 ? "s" : ""} · no change for 6+ months
        </span>
      </div>
      <Card className="border-[hsl(38_88%_62%)/40]">
        <CardContent className="p-0 divide-y divide-border">
          {Array.from(byArea.entries()).map(([areaName, areaItems]) => (
            <div key={areaName} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {areaName}
              </p>
              <ul className="space-y-2">
                {areaItems.map((it) => (
                  <li
                    key={`${it.strandName}::${it.stepNumber}::${it.itemKey}`}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        it.status === "emerging"
                          ? "bg-[hsl(5_72%_66%/20%)] text-[hsl(5_72%_40%)]"
                          : "bg-[hsl(38_88%_62%/20%)] text-[hsl(38_88%_35%)]",
                      )}
                    >
                      {it.status === "emerging" ? "E" : "D"}
                    </span>
                    <span className="flex-1 leading-snug">
                      <span className="font-medium">{it.strandName}</span>
                      <span className="text-muted-foreground"> · Step {it.stepNumber} ({it.ageRange}) · {it.itemKey})</span>
                      <br />
                      {it.itemText}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatEntryDate(it.updatedAt)}
                      <br />
                      <span className="text-[hsl(38_88%_45%)]">{it.monthsStale} mo ago</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

// Short axis labels so the radar stays readable at small sizes.
const AREA_SHORT: Record<string, string> = {
  "Personal, Social and Emotional Development": "PSED",
  "Communication and Language": "C & L",
  "Physical Development": "Physical",
  "Literacy": "Literacy",
  "Mathematics": "Maths",
  "Understanding the World": "World",
  "Expressive Arts and Design": "Arts & Design",
};

interface RadarPoint {
  area: string;
  score: number; // 0–100
  fullLabel: string;
}

function AreaRadarChart({
  childId,
  ratings,
  visibility,
}: {
  childId: string;
  ratings: ReturnType<typeof useStore>["state"]["ratings"];
  visibility: StepVisibility;
}) {
  const data: RadarPoint[] = useMemo(() => {
    return JOURNAL.flatMap((area, aIdx) => {
      const ac = countArea(childId, aIdx, area, ratings, visibility);
      // Use only recognised statuses as the denominator so stale/unknown
      // entries don't artificially deflate the score.
      const recognised = ac.emerging + ac.developing + ac.secure;
      if (recognised === 0) return [];
      // Weighted score: Emerging=1, Developing=2, Secure=3 out of max 3 per item.
      const raw = ac.emerging * 1 + ac.developing * 2 + ac.secure * 3;
      const score = Math.round((raw / (recognised * 3)) * 100);
      return [{ area: AREA_SHORT[area.area] ?? area.area, fullLabel: area.area, score }];
    });
  }, [childId, ratings, visibility]);

  if (data.length < 3) {
    return (
      <p className="text-sm text-muted-foreground italic py-4 text-center">
        Rate statements in at least 3 areas to see the radar chart.
      </p>
    );
  }

  function dotColor(score: number): string {
    if (score >= 70) return "hsl(130 45% 40%)";
    if (score >= 40) return "hsl(38 88% 48%)";
    return "hsl(5 72% 58%)";
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="area"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={4}
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--border))"
            fill="hsl(var(--muted))"
            fillOpacity={0.6}
            dot={(props: {
              cx?: number; cy?: number;
              payload?: RadarPoint;
              [key: string]: unknown;
            }) => {
              const { cx = 0, cy = 0, payload } = props;
              const score = payload?.score ?? 0;
              const color = dotColor(score);
              return (
                <circle
                  key={`dot-${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={color}
                  stroke="white"
                  strokeWidth={1.5}
                />
              );
            }}
          />
          <Tooltip
            formatter={(value: number, _name: string, entry: { payload?: RadarPoint }) => [
              `${value}%`,
              entry.payload?.fullLabel ?? "",
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center text-xs text-muted-foreground">
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[hsl(5_72%_58%)] mr-1.5 align-middle" />
          Low — mainly Emerging (&lt;40%)
        </span>
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[hsl(38_88%_48%)] mr-1.5 align-middle" />
          Mid — mainly Developing (40–69%)
        </span>
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[hsl(130_45%_40%)] mr-1.5 align-middle" />
          High — mainly Secure (70%+)
        </span>
      </div>
    </div>
  );
}

// ── Best-fit step table ──────────────────────────────────────────────────────
// Shown only when the age-relevant filter is active.
// "Best-fit step" = the weighted-average step number across all rated items in
// the visible (age-relevant) range for each strand, rounded to the nearest
// whole step.  Emerging=1 · Developing=2 · Secure=3.

interface StepBreakdown {
  stepNumber: number;
  ageRange: string;
  emerging: number;
  developing: number;
  secure: number;
  stepWeight: number;       // E×1 + D×2 + S×3 for this step
  stepContribution: number; // stepNumber × stepWeight
}

interface StrandBestFitRow {
  label: string;
  areaName: string;
  areaColor: string;
  bestFit: number | null;   // rounded to nearest whole step
  raw: number | null;       // unrounded, for display in breakdown
  totalWeight: number;
  weightedSum: number;
  steps: StepBreakdown[];   // only steps with ≥1 rated item
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(\w)/g, (c) => c.toUpperCase())
    .replace(/\((\w)/g, (_m, c) => `(${c.toUpperCase()}`);
}

function computeBestFitData(
  childId: string,
  ratings: Record<string, Rating>,
  visibility: StepVisibility,
): StrandBestFitRow[] {
  const rows: StrandBestFitRow[] = [];
  JOURNAL.forEach((area, aIdx) => {
    const areaColor = AREA_COLORS[area.area] ?? "#ccc";
    area.strands.forEach((strand, sIdx) => {
      const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;
      let weightedSum = 0;
      let totalWeight = 0;
      const steps: StepBreakdown[] = [];

      strand.steps.forEach((step, stIdx) => {
        if (!step.items || step.note) return;
        const inRange = visibleSet ? visibleSet.has(stIdx) : true;
        if (!inRange) return;

        let e = 0, d = 0, sc = 0;
        step.items.forEach((item) => {
          const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
          const st = r?.status;
          if (st === "emerging") e++;
          else if (st === "developing") d++;
          else if (st === "secure") sc++;
        });

        const stepWeight = e * 1 + d * 2 + sc * 3;
        if (stepWeight > 0) {
          const stepContribution = step.number * stepWeight;
          weightedSum += stepContribution;
          totalWeight += stepWeight;
          steps.push({
            stepNumber: step.number,
            ageRange: step.ageRange,
            emerging: e,
            developing: d,
            secure: sc,
            stepWeight,
            stepContribution,
          });
        }
      });

      const raw = totalWeight > 0 ? weightedSum / totalWeight : null;
      rows.push({
        label: toTitleCase(strand.name),
        areaName: area.area,
        areaColor,
        bestFit: raw !== null ? Math.round(raw) : null,
        raw,
        totalWeight,
        weightedSum,
        steps,
      });
    });
  });
  return rows;
}

function BestFitBreakdownTip({ row }: { row: StrandBestFitRow }) {
  return (
    <div className="text-left space-y-2 min-w-[260px]">
      <p className="font-semibold text-[11px] uppercase tracking-wide border-b border-border/60 pb-1 mb-1">
        Calculation breakdown
      </p>
      <table className="w-full text-[11px] leading-snug border-collapse">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left pr-3 pb-0.5 font-medium">Step</th>
            <th className="text-center px-1 pb-0.5 font-medium">E</th>
            <th className="text-center px-1 pb-0.5 font-medium">D</th>
            <th className="text-center px-1 pb-0.5 font-medium">S</th>
            <th className="text-right pl-2 pb-0.5 font-medium">Pts</th>
            <th className="text-right pl-2 pb-0.5 font-medium">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {row.steps.map((s) => (
            <tr key={s.stepNumber} className="border-t border-border/30">
              <td className="pr-3 py-0.5 whitespace-nowrap">
                Step {s.stepNumber}
                <span className="text-muted-foreground ml-1 text-[10px]">({s.ageRange})</span>
              </td>
              <td className="text-center px-1 py-0.5">{s.emerging || "–"}</td>
              <td className="text-center px-1 py-0.5">{s.developing || "–"}</td>
              <td className="text-center px-1 py-0.5">{s.secure || "–"}</td>
              <td className="text-right pl-2 py-0.5 tabular-nums">{s.stepWeight}</td>
              <td className="text-right pl-2 py-0.5 tabular-nums">
                {s.stepNumber} × {s.stepWeight} = {s.stepContribution}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border/60 font-semibold">
            <td colSpan={4} className="pr-3 pt-1 text-muted-foreground text-[10px]">Totals</td>
            <td className="text-right pl-2 pt-1 tabular-nums">{row.totalWeight} pts</td>
            <td className="text-right pl-2 pt-1 tabular-nums">÷ {row.totalWeight} = {row.raw?.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={6} className="pt-1 text-[11px]">
              <span className="font-semibold">{row.raw?.toFixed(2)}</span>
              <span className="text-muted-foreground"> → rounded to </span>
              <span className="font-semibold">Step {row.bestFit}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function BestFitStepChart({
  childId,
  ratings,
  visibility,
}: {
  childId: string;
  ratings: ReturnType<typeof useStore>["state"]["ratings"];
  visibility: StepVisibility;
}) {
  const data = useMemo(
    () => computeBestFitData(childId, ratings, visibility),
    [childId, ratings, visibility],
  );

  const hasAnyData = data.some((d) => d.bestFit !== null);

  if (!hasAnyData) {
    return (
      <p className="text-sm text-muted-foreground italic py-6 text-center">
        Rate statements in the age-relevant steps to see best-fit steps.
      </p>
    );
  }

  // Group rows by area, preserving JOURNAL order.
  const byArea = JOURNAL.map((area) => ({
    area,
    rows: data.filter((r) => r.areaName === area.area),
  })).filter(({ rows }) => rows.some((r) => r.bestFit !== null));

  return (
    <div className="space-y-2">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-muted-foreground uppercase tracking-wide">
            <th className="text-left py-1.5 px-3 font-medium w-[55%]">Strand</th>
            <th className="text-center py-1.5 px-3 font-medium">Best-fit Step</th>
            <th className="text-left py-1.5 px-3 font-medium text-muted-foreground/60 hidden sm:table-cell">
              Age range
            </th>
          </tr>
        </thead>
        <tbody>
          {byArea.map(({ area, rows }) => (
            <>
              {/* Area header row */}
              <tr key={`area-${area.area}`}>
                <td
                  colSpan={3}
                  className="py-1 px-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: AREA_COLORS[area.area] ?? "#eee" }}
                >
                  {area.area}
                </td>
              </tr>
              {/* Strand rows */}
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-1.5 px-3">{row.label}</td>
                  <td className="py-1.5 px-3 text-center">
                    {row.bestFit !== null ? (
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="inline-flex items-center justify-center min-w-[2.8rem] rounded-md px-2 py-0.5 font-semibold tabular-nums cursor-help text-sm border border-border/50 hover:border-border transition-colors"
                              style={{
                                backgroundColor: row.areaColor,
                                opacity: 0.92,
                              }}
                            >
                              Step {row.bestFit}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-sm p-3"
                            sideOffset={8}
                          >
                            <BestFitBreakdownTip row={row} />
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">—</span>
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {row.steps.length > 0
                      ? row.steps.map((s) => `Step ${s.stepNumber} (${s.ageRange})`).join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
        Best-fit step = weighted average of rated items (E×1 · D×2 · S×3), rounded to nearest
        whole step. Hover any step badge to see the full calculation. Strands with no ratings in
        range are omitted.
      </p>
    </div>
  );
}

const SECTIONS = [
  { id: "sec-overview", label: "Overview" },
  { id: "sec-progress", label: "Progress" },
  { id: "sec-radar", label: "Radar" },
  { id: "sec-best-fit", label: "Best-fit" },
  { id: "sec-by-area", label: "By area" },
  { id: "sec-alerts", label: "Alerts" },
  { id: "sec-journal", label: "Journal" },
] as const;

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id ?? "";
  const { state } = useStore();
  const child = state.children.find((c) => c.id === childId);

  const childMonths = child ? ageInMonths(child.dob) : null;
  const childAgeLabel = child ? formatAge(child.dob) : "";
  const [ageFilterOn, setAgeFilterOn] = useState<boolean>(childMonths !== null);
  const [includeHistory, setIncludeHistory] = useState<boolean>(true);
  const [radarInfoOpen, setRadarInfoOpen] = useState(false);
  const [fullDJPrint, setFullDJPrint] = useState(false);
  const { openDialog, hasData, dialogProps } = useSaveAndClose();

  const [activeSection, setActiveSection] = useState<string>("sec-overview");
  useEffect(() => {
    function onScroll() {
      let active = SECTIONS[0].id as string;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 56) active = s.id;
      }
      setActiveSection(active);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibility: StepVisibility = useMemo(
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn, includeHistory),
    [childId, childMonths, state.ratings, ageFilterOn, includeHistory],
  );

  const overall = useMemo(
    () =>
      childId ? countAll(childId, state.ratings, visibility) : countAll("", {}),
    [childId, state.ratings, visibility],
  );

  // Stagnation scanning is independent of the age filter — we always scan
  // the full rating history so items from earlier steps are never hidden.
  const stagnantItems = useMemo(
    () => computeStagnantItems(childId, state.ratings, null),
    [childId, state.ratings],
  );

  // Lookup set used to highlight stagnant dates in the journal tables.
  // Key format: "${areaName}::${strandName}::${stepNumber}::${itemKey}"
  const stagnantKeys = useMemo(
    () => new Set(stagnantItems.map((it) => `${it.areaName}::${it.strandName}::${it.stepNumber}::${it.itemKey}`)),
    [stagnantItems],
  );

  // Build the strand tables once per render — only strands with at least one
  // rated item appear, so the printout matches the PDF format with only the
  // user's selections.
  const strandTables = useMemo(() => {
    if (!childId) return [];
    const out: { area: JournalArea; strand: JournalStrand; blocks: StepBlock[] }[] = [];
    JOURNAL.forEach((area, aIdx) => {
      area.strands.forEach((strand, sIdx) => {
        const blocks = collectStrandBlocks(
          area,
          aIdx,
          strand,
          sIdx,
          childId,
          state.ratings,
          visibility,
        );
        if (blocks.length > 0) {
          out.push({ area, strand, blocks });
        }
      });
    });
    return out;
  }, [childId, state.ratings, visibility]);

  // Full DJ tables: every step, every item, no age filter — for LA submission.
  const fullDJStrandTables = useMemo(() => {
    if (!childId) return [];
    const out: { area: JournalArea; strand: JournalStrand; blocks: FullDJStepBlock[] }[] = [];
    JOURNAL.forEach((area, aIdx) => {
      area.strands.forEach((strand, sIdx) => {
        const blocks = collectFullDJBlocks(area, aIdx, strand, sIdx, childId, state.ratings);
        if (blocks.length > 0) out.push({ area, strand, blocks });
      });
    });
    return out;
  }, [childId, state.ratings]);

  function handleFullDJPrint() {
    setFullDJPrint(true);
    // Two rAF frames ensures React has committed the DOM update before printing.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setFullDJPrint(false);
      });
    });
  }

  if (!child) {
    return (
      <div className="container max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Child not found</h1>
        <Button asChild className="mt-6">
          <Link href="/">Back to children</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pb-20 print:py-0 print:px-0 print:max-w-none print:pb-0">
      {/* Toolbar (screen only) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <Link
          href={`/child/${childId}`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to journal
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {childMonths !== null && (
            <label
              className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs cursor-pointer select-none hover:bg-muted/40"
              data-testid="toggle-age-filter-summary-label"
            >
              <Switch
                checked={ageFilterOn}
                onCheckedChange={(v) => { setAgeFilterOn(v); if (!v) setIncludeHistory(false); }}
                data-testid="toggle-age-filter-summary"
              />
              <span className="font-medium">Age relevant only</span>
            </label>
          )}
          {childMonths !== null && ageFilterOn && (
            <label
              className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs cursor-pointer select-none hover:bg-muted/40"
              data-testid="toggle-include-history-label"
            >
              <Switch
                checked={includeHistory}
                onCheckedChange={setIncludeHistory}
                data-testid="toggle-include-history"
              />
              <span className="font-medium">Include history</span>
            </label>
          )}
          <Button
            variant="outline"
            className="gap-2"
            disabled={!hasData}
            onClick={openDialog}
          >
            <LogOut className="h-4 w-4" /> Save and close
          </Button>
          <SaveAndCloseDialog {...dialogProps} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2" data-testid="button-print">
                <Printer className="h-4 w-4" /> Print <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Choose what to print
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => window.print()}
                data-testid="button-print-summary"
              >
                <FileText className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium">Summary</div>
                  <div className="text-xs text-muted-foreground">Cover + rated items</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={handleFullDJPrint}
                data-testid="button-print-full-dj"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium">Full DJ</div>
                  <div className="text-xs text-muted-foreground">All steps — for LA submission</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick-jump nav — fixed at viewport bottom (screen only) */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s) =>
            (s.id === "sec-alerts" && stagnantItems.length === 0) ||
            (s.id === "sec-best-fit" && !ageFilterOn) ? null : (
              <button
                key={s.id}
                onClick={() => {
                  const el = document.getElementById(s.id);
                  if (!el) return;
                  const y = el.getBoundingClientRect().top + window.scrollY - 52;
                  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {s.label}
                {s.id === "sec-alerts" && (
                  <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive/15 px-1 text-[10px] font-semibold tabular-nums text-destructive">
                    {stagnantItems.length}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      </nav>

      {/* Print-only cover page — styled to match the EYIT Development Journal */}
      <section className="hidden print:flex print-cover eyit-cover">
        {/* Logo */}
        <div className="eyit-cover-logo-row">
          <img
            src={`${import.meta.env.BASE_URL}eyit-logo.png`}
            alt="Early Years Inclusion Team"
            className="eyit-cover-logo"
          />
        </div>

        {/* Title block — Gill Sans MT, #008264 */}
        <div className="eyit-cover-titles">
          <div className="eyit-cover-h1">Early Years Inclusion Team</div>
          <div className="eyit-cover-h1">Development Journal</div>
          <div className="eyit-cover-h2">
            {fullDJPrint ? "Full Journal Record" : "Summary"} — September 2024
          </div>
        </div>

        {/* Child details — Verdana 12pt */}
        <dl className="eyit-cover-fields">
          <div className="eyit-cover-field">
            <dt>Child's Name</dt>
            <dd>{child.name}</dd>
          </div>
          <div className="eyit-cover-field">
            <dt>Date of Birth</dt>
            <dd>{formatDate(child.dob)}</dd>
          </div>
          {childMonths !== null && (
            <div className="eyit-cover-field">
              <dt>Age</dt>
              <dd>{childAgeLabel}</dd>
            </div>
          )}
          <div className="eyit-cover-field">
            <dt>Journal Start-Date</dt>
            <dd>{formatDate(child.startDate)}</dd>
          </div>
        </dl>

      </section>

      {/* Print-only: Areas without progression — page 2 of the printout */}
      {stagnantItems.length > 0 && (
        <section className="hidden print:block" style={{ pageBreakAfter: "always", breakAfter: "page", marginBottom: 0 }}>
          <div className="print-corner">EYIT September 2024</div>
          <h2 style={{ fontSize: "14pt", fontWeight: 700, marginBottom: "0.5cm", marginTop: "0.3cm" }}>
            Areas without progression
          </h2>
          <p style={{ fontSize: "9pt", color: "#555", marginBottom: "0.4cm" }}>
            The following items have been rated Emerging or Developing for 6 or more months with no change.
            Corresponding dates are highlighted in the journal record.
          </p>
          {/* Group by area */}
          {Array.from(
            stagnantItems.reduce((map, it) => {
              map.set(it.areaName, [...(map.get(it.areaName) ?? []), it]);
              return map;
            }, new Map<string, StagnantItem[]>()),
          ).map(([areaName, items]) => (
            <div key={areaName} style={{ marginBottom: "0.35cm" }}>
              <p style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "0.2cm" }}>
                {areaName}
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "42%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: "#f3f3f3" }}>
                    <th style={{ textAlign: "left", padding: "2px 4px", fontWeight: 600 }}>Strand · Step</th>
                    <th style={{ textAlign: "left", padding: "2px 4px", fontWeight: 600 }}>Statement</th>
                    <th style={{ textAlign: "center", padding: "2px 4px", fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: "center", padding: "2px 4px", fontWeight: 600 }}>Rated</th>
                    <th style={{ textAlign: "center", padding: "2px 4px", fontWeight: 600 }}>Months</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={`${it.strandName}::${it.stepNumber}::${it.itemKey}`} style={{ borderBottom: "1px solid #e8e8e8" }}>
                      <td style={{ padding: "2px 4px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 600 }}>{it.strandName}</span>
                        <br />
                        <span style={{ color: "#555" }}>Step {it.stepNumber} ({it.ageRange})</span>
                      </td>
                      <td style={{ padding: "2px 4px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 600 }}>{it.itemKey})</span> {it.itemText}
                      </td>
                      <td style={{ textAlign: "center", padding: "2px 4px", verticalAlign: "top" }}>
                        <span style={{
                          background: it.status === "emerging" ? "hsl(5 72% 66% / 30%)" : "hsl(38 88% 62% / 30%)",
                          fontWeight: 700,
                          padding: "0 4px",
                          borderRadius: "2px",
                          WebkitPrintColorAdjust: "exact",
                          printColorAdjust: "exact",
                        } as React.CSSProperties}>
                          {it.status === "emerging" ? "E" : "D"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: "2px 4px", verticalAlign: "top" }}>
                        <span style={{ background: "hsl(38 88% 62% / 28%)", fontWeight: 700, padding: "0 3px", borderRadius: "2px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}>
                          {formatEntryDate(it.updatedAt)}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: "2px 4px", verticalAlign: "top", color: "#b45309" }}>
                        {it.monthsStale} mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <p className="print-footnote">
            Early Years Inclusion Team adapted from Special Educational Needs &amp; Inclusion Team,
            Learning Inclusion Service, Leeds City Council.
          </p>
        </section>
      )}

      {/* Screen-only dashboard */}
      <article className="space-y-8 no-print">
        <header id="sec-overview" className="border-b border-border pb-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            EYIT Development Journal — Summary
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">
            {child.name}
            {childAgeLabel && (
              <span className="ml-3 text-xl md:text-2xl font-normal text-muted-foreground">
                {childAgeLabel}
              </span>
            )}
          </h1>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {child.dob && (
              <div>
                <dt className="text-muted-foreground text-xs">Date of birth</dt>
                <dd className="font-medium">{formatDate(child.dob)}</dd>
              </div>
            )}
            {child.startDate && (
              <div>
                <dt className="text-muted-foreground text-xs">Journal started</dt>
                <dd className="font-medium">{formatDate(child.startDate)}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground text-xs">Statements rated</dt>
              <dd className="font-medium tabular-nums">
                {overall.rated} / {overall.total} ({overall.percentRated}%)
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Generated</dt>
              <dd className="font-medium">{formatDate(new Date().toISOString())}</dd>
            </div>
          </dl>
          {ageFilterOn && childMonths !== null && (
            <p className="mt-3 text-xs text-muted-foreground italic">
              {includeHistory
                ? `Age filter on — showing all entries up to the current step (${childAgeLabel}).`
                : `Age filter on — showing the current step only (${childAgeLabel}).`}{" "}
              Progress totals and printed pages reflect this view.
            </p>
          )}
        </header>

        <section id="sec-progress">
          <h2 className="text-lg font-semibold mb-3">Overall progress</h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              <ProgressBar counts={overall} height="h-3" />
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {STATUS_LABELS.emerging}
                  </div>
                  <div className="font-semibold text-2xl tabular-nums">{overall.emerging}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {STATUS_LABELS.developing}
                  </div>
                  <div className="font-semibold text-2xl tabular-nums">{overall.developing}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {STATUS_LABELS.secure}
                  </div>
                  <div className="font-semibold text-2xl tabular-nums">{overall.secure}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="sec-radar">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Strengths &amp; development areas</h2>
            <TooltipProvider>
              <UITooltip open={radarInfoOpen} onOpenChange={setRadarInfoOpen}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="How is this chart calculated?"
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setRadarInfoOpen((v) => !v)}
                  >
                    <Info className="h-4 w-4 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-64 text-xs leading-relaxed">
                  Each area is scored on <strong>rated items only</strong>. Emerging = 1 pt,
                  Developing = 2 pts, Secure = 3 pts. The score is
                  (total points ÷ rated items × 3) × 100, so 100% means all rated items are
                  Secure. Areas with no ratings are hidden. At least 3 areas must have ratings
                  for the chart to appear.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <Card>
            <CardContent className="p-5">
              <AreaRadarChart
                childId={childId}
                ratings={state.ratings}
                visibility={visibility}
              />
            </CardContent>
          </Card>
        </section>

        {/* Best-fit step chart — only when age filter is active */}
        {ageFilterOn && (
          <section id="sec-best-fit">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold">Best-fit step by strand</h2>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="How is best-fit step calculated?"
                      className="rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Info className="h-4 w-4 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-72 text-xs leading-relaxed">
                    For each of the 18 strands, all rated items within the age-relevant
                    range are combined into a single weighted average step number.
                    Emerging counts as 1 point, Developing as 2, Secure as 3 — so a
                    strand where most items are Secure will show a higher step than one
                    where items are Emerging. Strands with no ratings in range are omitted.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <Card>
              <CardContent className="p-5">
                <BestFitStepChart
                  childId={childId}
                  ratings={state.ratings}
                  visibility={visibility}
                />
              </CardContent>
            </Card>
          </section>
        )}

        <section id="sec-by-area">
          <h2 className="text-lg font-semibold mb-3">By area</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {JOURNAL.map((area, aIdx) => {
              const ac = countArea(childId, aIdx, area, state.ratings, visibility);
              return (
                <Card key={aIdx} style={{ borderLeft: `4px solid ${AREA_COLORS[area.area] ?? "transparent"}` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-medium text-sm leading-snug">{area.area}</h3>
                      <span className="text-xs tabular-nums font-medium shrink-0">
                        {ac.percentRated}%
                      </span>
                    </div>
                    <ProgressBar counts={ac} />
                    <div className="mt-2 text-xs text-muted-foreground tabular-nums">
                      E {ac.emerging} · D {ac.developing} · S {ac.secure} · –{" "}
                      {ac.unset}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div id="sec-alerts"><StagnantItemsSection items={stagnantItems} /></div>
      </article>

      {/* Journal pages — PDF-style tables, shown on screen and printed */}
      <section id="sec-journal" className="mt-8 print:mt-0">
        <h2 className="text-lg font-semibold mb-3 no-print">Journal pages (print preview)</h2>

        {/* ── Standard summary journal (screen + standard print) ── */}
        <div className={fullDJPrint ? "hidden" : undefined}>
          {/* Print-only section title */}
          {strandTables.length > 0 && (
            <div className="hidden print:block print-journal-title">
              Journal Record — {child.name}
              <span style={{ fontSize: "9pt", fontWeight: 400, marginLeft: "1cm", color: "#444" }}>
                {ageFilterOn && childMonths !== null
                  ? includeHistory
                    ? `History up to current step (${childAgeLabel})`
                    : `Current step only (${childAgeLabel})`
                  : "All steps"}
              </span>
            </div>
          )}
          {strandTables.length === 0 ? (
            <p className="text-sm text-muted-foreground italic no-print">
              No statements have been rated yet — go back to the journal and mark some items to see
              them here.
            </p>
          ) : (
            <div className="print-pages space-y-6 print:space-y-0">
              {strandTables.map(({ area, strand, blocks }, idx) => (
                <div
                  key={`${area.area}::${strand.name}`}
                  className="journal-page"
                  data-testid={`journal-page-${idx}`}
                >
                  <div className="hidden print:block print-corner">EYIT September 2024</div>
                  <StrandTable area={area} strand={strand} blocks={blocks} stagnantKeys={stagnantKeys} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Full DJ journal (only injected during Full DJ print) ── */}
        {fullDJPrint && (
          <div>
            <div className="hidden print:block print-journal-title">
              Full Development Journal — {child.name}
              <span style={{ fontSize: "9pt", fontWeight: 400, marginLeft: "1cm", color: "#444" }}>
                All steps and statements
                {childAgeLabel ? ` · Age ${childAgeLabel}` : ""}
              </span>
            </div>
            <div className="print-pages space-y-6 print:space-y-0">
              {fullDJStrandTables.map(({ area, strand, blocks }, idx) => (
                <div
                  key={`fulldj-${area.area}::${strand.name}`}
                  className="journal-page"
                  data-testid={`full-dj-page-${idx}`}
                >
                  <div className="hidden print:block print-corner">EYIT September 2024</div>
                  <FullDJStrandTable area={area} strand={strand} blocks={blocks} stagnantKeys={stagnantKeys} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="pt-4 mt-8 border-t border-border text-xs text-muted-foreground no-print">
        Adapted from EYIT Development Journal, September 2024 — Early Years Inclusion Team,
        Leeds City Council.
      </footer>
    </div>
  );
}
