import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL, AREA_COLORS, type JournalArea, type JournalStrand, type Status } from "../data/journal";
import { useStore, getRatingKey, type Rating } from "../lib/store";
import {
  buildStepVisibility,
  countAll,
  countArea,
  STATUS_LABELS,
  type StepVisibility,
} from "../lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, LogOut, AlertTriangle, Info } from "lucide-react";
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
  const blocks: StepBlock[] = [];
  strand.steps.forEach((step, stIdx) => {
    if (!step.items || step.note) return;
    const inAgeRange = visibleSet ? visibleSet.has(stIdx) : true;
    if (!inAgeRange) return;
    const items: RatedItemRow[] = [];
    step.items.forEach((item) => {
      const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
      if (r && r.status) {
        items.push({ key: item.key, text: item.text, status: r.status, updatedAt: r.updatedAt });
      }
    });
    if (items.length === 0) return;
    items.sort((a, b) => a.key.localeCompare(b.key));
    blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items });
  });
  // Highest step first so latest age sits at the top of each strand.
  blocks.sort((a, b) => b.stepNumber - a.stepNumber);
  return blocks;
}

function StrandTable({
  area,
  strand,
  blocks,
}: {
  area: JournalArea;
  strand: JournalStrand;
  blocks: StepBlock[];
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
              <th scope="col" className="text-center">
                Emerging
              </th>
              <th scope="col" className="text-center">
                Developing
              </th>
              <th scope="col" className="text-center">
                Secure
              </th>
            </tr>
          </thead>
          <tbody>
            {block.items.map((it) => (
              <tr key={it.key}>
                <td>
                  <span className="font-semibold mr-1">{it.key})</span>
                  {it.text}
                </td>
                <td className="text-center text-xs tabular-nums">
                  {it.status === "emerging" ? formatEntryDate(it.updatedAt) : null}
                </td>
                <td className="text-center text-xs tabular-nums">
                  {it.status === "developing" ? formatEntryDate(it.updatedAt) : null}
                </td>
                <td className="text-center text-xs tabular-nums">
                  {it.status === "secure" ? formatEntryDate(it.updatedAt) : null}
                </td>
              </tr>
            ))}
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
      if (ac.rated === 0) return [];
      // Weighted score: Emerging=1, Developing=2, Secure=3 out of max 3 per item.
      const raw = ac.emerging * 1 + ac.developing * 2 + ac.secure * 3;
      const score = Math.round((raw / (ac.rated * 3)) * 100);
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
            stroke="hsl(130 45% 45%)"
            fill="hsl(130 45% 55%)"
            fillOpacity={0.35}
            dot={{ r: 3, fill: "hsl(130 45% 45%)" }}
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
          <span className="inline-block w-2 h-2 rounded-full bg-[hsl(5_72%_66%)] mr-1" />
          Low (mainly Emerging)
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[hsl(38_88%_62%)] mr-1" />
          Mid (mainly Developing)
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[hsl(130_45%_55%)] mr-1" />
          High (mainly Secure)
        </span>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "sec-overview", label: "Overview" },
  { id: "sec-progress", label: "Progress" },
  { id: "sec-radar", label: "Radar" },
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
          <Button className="gap-2" onClick={() => window.print()} data-testid="button-print">
            <Printer className="h-4 w-4" /> Print summary
          </Button>
        </div>
      </div>

      {/* Quick-jump nav — fixed at viewport bottom (screen only) */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s) =>
            s.id === "sec-alerts" && stagnantItems.length === 0 ? null : (
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

      {/* Print-only cover page (matches PDF cover format) */}
      <section className="hidden print:flex print-cover">
        <div className="print-corner">EYIT September 2024</div>
        <div className="print-cover-inner">
          <div className="text-center pt-24">
            <h1 className="text-4xl font-semibold tracking-tight">Early Years Inclusion Team</h1>
            <h2 className="text-3xl font-semibold mt-3">Development Journal</h2>
          </div>
          <p className="text-right mt-8 text-sm">September 2024</p>
          <dl className="mt-20 space-y-10 text-base">
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Child's Name</dt>
              <dd className="flex-1">{child.name}</dd>
            </div>
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Date of Birth</dt>
              <dd className="flex-1">{formatDate(child.dob)}</dd>
            </div>
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Journal Start-Date</dt>
              <dd className="flex-1">{formatDate(child.startDate)}</dd>
            </div>
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Summary generated</dt>
              <dd className="flex-1">{formatDate(new Date().toISOString())}</dd>
            </div>
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Statements rated</dt>
              <dd className="flex-1 tabular-nums">
                {overall.rated} of {overall.total} ({overall.percentRated}%)
                {ageFilterOn && childMonths !== null
                  ? includeHistory
                    ? ` — history up to current step (${childAgeLabel})`
                    : ` — current step only (${childAgeLabel})`
                  : ""}
              </dd>
            </div>
          </dl>
        </div>
        <p className="print-footnote">
          Early Years Inclusion Team adapted from Special Educational Needs &amp; Inclusion Team,
          Learning Inclusion Service, Leeds City Council.
        </p>
      </section>

      {/* Screen-only dashboard */}
      <article className="space-y-8 no-print">
        <header id="sec-overview" className="border-b border-border pb-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            EYIT Development Journal — Summary
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">{child.name}</h1>
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
                <StrandTable area={area} strand={strand} blocks={blocks} />
                <p className="hidden print:block print-footnote">
                  Early Years Inclusion Team adapted from Special Educational Needs &amp;
                  Inclusion Team, Learning Inclusion Service, Leeds City Council.
                </p>
              </div>
            ))}
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
