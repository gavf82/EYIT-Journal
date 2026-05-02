import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL, AREA_COLORS, type Status } from "../data/journal";
import { useStore, getRatingKey, type Rating } from "../lib/store";
import { formatEntryDate } from "../components/journal-print";
import { type StagnantItem, computeStagnantItems } from "../lib/stagnation";
import {
  buildStepVisibility,
  countAll,
  countArea,
  STATUS_LABELS,
  type StepVisibility,
} from "../lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, AlertTriangle, Info, CheckCircle2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChildNav } from "../components/child-nav";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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


interface StagnantItemsSectionProps {
  activeItems: StagnantItem[];
  dismissedItems: StagnantItem[];
  onAcknowledge: (it: StagnantItem, note: string) => void;
  onUnacknowledge: (it: StagnantItem) => void;
}

function StagnantItemsSection({ activeItems, dismissedItems, onAcknowledge, onUnacknowledge }: StagnantItemsSectionProps) {
  const [showDismissed, setShowDismissed] = useState(false);
  const [pendingItem, setPendingItem] = useState<StagnantItem | null>(null);
  const [noteText, setNoteText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (activeItems.length === 0 && dismissedItems.length === 0) return null;

  function openAcknowledgeDialog(it: StagnantItem) {
    setPendingItem(it);
    setNoteText("");
  }

  function handleDialogSubmit() {
    if (!pendingItem || noteText.trim() === "") return;
    onAcknowledge(pendingItem, noteText.trim());
    setPendingItem(null);
    setNoteText("");
  }

  function renderItems(items: StagnantItem[], isDismissed: boolean) {
    const byArea = new Map<string, StagnantItem[]>();
    items.forEach((it) => {
      const list = byArea.get(it.areaName) ?? [];
      list.push(it);
      byArea.set(it.areaName, list);
    });

    return Array.from(byArea.entries()).map(([areaName, areaItems]) => (
      <div key={areaName} className="px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {areaName}
        </p>
        <ul className="space-y-3">
          {areaItems.map((it) => (
            <li
              key={`${it.strandName}::${it.stepNumber}::${it.itemKey}`}
              className={cn("flex items-start gap-3 text-sm", isDismissed && "opacity-60")}
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
              <span className="flex-1 leading-snug min-w-0">
                <span className="font-medium">{it.strandName}</span>
                <span className="text-muted-foreground"> · Step {it.stepNumber} ({it.ageRange}) · {it.itemKey})</span>
                <br />
                {it.itemText}
                {isDismissed && it.reviewNote && (
                  <span className="block mt-1.5 text-xs italic text-muted-foreground border-l-2 border-[#008264]/40 pl-2">
                    {it.reviewNote}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums whitespace-nowrap text-right">
                {formatEntryDate(it.updatedAt)}
                <br />
                <span className="text-[hsl(38_88%_45%)]">{it.monthsStale} mo ago</span>
              </span>
              {isDismissed ? (
                <button
                  onClick={() => onUnacknowledge(it)}
                  title="Remove reviewed mark"
                  className="shrink-0 flex items-center justify-center h-9 w-9 -mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => openAcknowledgeDialog(it)}
                  title="Mark as reviewed — requires a note"
                  className="shrink-0 flex items-center justify-center h-9 w-9 -mr-1 rounded-md text-muted-foreground hover:text-[#008264] hover:bg-[#00826415] transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    ));
  }

  return (
    <>
      <section>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-[hsl(38_88%_45%)]" />
          <h2 className="text-lg font-semibold">Areas without progression</h2>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {activeItems.length} item{activeItems.length !== 1 ? "s" : ""} · no change for 6+ months
          </span>
        </div>
        <Card className="border-[hsl(38_88%_62%)/40]">
          <CardContent className="p-0 divide-y divide-border">
            {activeItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                All items have been marked as reviewed.
              </div>
            ) : (
              renderItems(activeItems, false)
            )}
            {dismissedItems.length > 0 && (
              <div className="px-4 py-2">
                <button
                  onClick={() => setShowDismissed((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#008264]" />
                  {dismissedItems.length} reviewed item{dismissedItems.length !== 1 ? "s" : ""} hidden
                  <span className="underline underline-offset-2">{showDismissed ? "· Hide" : "· Show"}</span>
                </button>
                {showDismissed && (
                  <div className="mt-2 divide-y divide-border border-t border-border pt-2">
                    {renderItems(dismissedItems, true)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Acknowledge dialog — requires a note before dismissing */}
      <Dialog
        open={pendingItem !== null}
        onOpenChange={(open) => { if (!open) { setPendingItem(null); setNoteText(""); } }}
      >
        <DialogContent className="sm:max-w-lg" onOpenAutoFocus={(e) => { e.preventDefault(); textareaRef.current?.focus(); }}>
          <DialogHeader>
            <DialogTitle>Mark as reviewed</DialogTitle>
            <DialogDescription>
              Record the reason this stagnation is being marked as reviewed. The note will be saved to the journal.
            </DialogDescription>
          </DialogHeader>
          {pendingItem && (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm space-y-0.5">
              <p className="font-medium">{pendingItem.strandName} · Step {pendingItem.stepNumber} ({pendingItem.ageRange})</p>
              <p className="text-muted-foreground text-xs">{pendingItem.itemText}</p>
              <p className="text-xs text-[hsl(38_88%_45%)] tabular-nums">{pendingItem.monthsStale} months without progression</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="ack-note">Review note <span className="text-destructive">*</span></label>
            <Textarea
              id="ack-note"
              ref={textareaRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Describe what actions have been taken or why this has been reviewed…"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">A note is required before marking as reviewed.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPendingItem(null); setNoteText(""); }}>
              Cancel
            </Button>
            <Button
              onClick={handleDialogSubmit}
              disabled={noteText.trim() === ""}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark as reviewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
          </tr>
        </thead>
        <tbody>
          {byArea.map(({ area, rows }) => (
            <>
              {/* Area header row */}
              <tr key={`area-${area.area}`}>
                <td
                  colSpan={2}
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
] as const;

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id ?? "";
  const { state, setStagnationAcknowledged } = useStore();
  const child = state.children.find((c) => c.id === childId);

  const childMonths = child ? ageInMonths(child.dob) : null;
  const childAgeLabel = child ? formatAge(child.dob) : "";
  const [ageFilterOn, setAgeFilterOn] = useState<boolean>(childMonths !== null);
  const [includeHistory, setIncludeHistory] = useState<boolean>(false);
  const [radarInfoOpen, setRadarInfoOpen] = useState(false);

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
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn, includeHistory, child?.baselineStep),
    [childId, childMonths, state.ratings, ageFilterOn, includeHistory, child?.baselineStep],
  );

  const overall = useMemo(
    () =>
      childId ? countAll(childId, state.ratings, visibility) : countAll("", {}),
    [childId, state.ratings, visibility],
  );

  // Stagnation scanning is independent of the age filter — we always scan
  // the full rating history so items from earlier steps are never hidden.
  const allStagnantItems = useMemo(
    () => computeStagnantItems(childId, state.ratings, null),
    [childId, state.ratings],
  );

  // Split into active (still needs attention) and dismissed (marked reviewed).
  const { activeStagnantItems, dismissedStagnantItems } = useMemo(() => {
    const acked = state.acknowledgedStagnations ?? {};
    const active: StagnantItem[] = [];
    const dismissed: StagnantItem[] = [];
    for (const it of allStagnantItems) {
      const key = `${childId}::${it.areaName}::${it.strandName}::${it.stepNumber}::${it.itemKey}`;
      const entry = acked[key];
      if (entry) dismissed.push({ ...it, reviewNote: entry.note });
      else active.push(it);
    }
    return { activeStagnantItems: active, dismissedStagnantItems: dismissed };
  }, [allStagnantItems, state.acknowledgedStagnations, childId]);

  const acknowledgeItem = (it: StagnantItem, note: string) => {
    const key = `${childId}::${it.areaName}::${it.strandName}::${it.stepNumber}::${it.itemKey}`;
    setStagnationAcknowledged(key, true, note);
  };

  const unacknowledgeItem = (it: StagnantItem) => {
    const key = `${childId}::${it.areaName}::${it.strandName}::${it.stepNumber}::${it.itemKey}`;
    setStagnationAcknowledged(key, false);
  };

  // Keep the old name for backward-compat references in the rest of the file
  // (nav badge, print section). This only counts active items.
  const stagnantItems = activeStagnantItems;

  // Lookup set used to highlight stagnant dates in the journal tables.
  // Key format: "${areaName}::${strandName}::${stepNumber}::${itemKey}"
  // Only active (unacknowledged) items get highlighted.
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
      <ChildNav childId={childId} />

      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 no-print">
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

        <div id="sec-alerts">
          <StagnantItemsSection
            activeItems={activeStagnantItems}
            dismissedItems={dismissedStagnantItems}
            onAcknowledge={acknowledgeItem}
            onUnacknowledge={unacknowledgeItem}
          />
        </div>
      </article>

      <footer className="pt-4 mt-8 border-t border-border text-xs text-muted-foreground no-print">
        Adapted from EYIT Development Journal, September 2024 — Early Years Inclusion Team,
        Leeds City Council.
      </footer>
    </div>
  );
}
