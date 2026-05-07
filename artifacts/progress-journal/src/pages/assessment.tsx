import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL, AREA_COLORS, type JournalArea, type JournalStrand, type Status } from "../data/journal";
import { useStore, getRatingKey, type Rating } from "../lib/store";
import { buildStepVisibility, type StepVisibility } from "../lib/progress";
import { Button } from "@/components/ui/button";
import { Printer, LogOut, CheckSquare, Square, Layers } from "lucide-react";
import { ChildNav } from "../components/child-nav";
import { ageInMonths, formatAge } from "../lib/age";
import { Switch } from "@/components/ui/switch";
import { cn } from "../lib/utils";

const ALL_AREA_NAMES = JOURNAL.map((a) => a.area);

// ── Types ────────────────────────────────────────────────────────────────────

interface AssessmentItem {
  key: string;
  text: string;
  status: Status;
  isStagnant: boolean;
}

interface AssessmentBlock {
  stepNumber: number;
  ageRange: string;
  items: AssessmentItem[];
  isPrev: boolean;
  hasStagnation: boolean;
  isAgeStep?: boolean;
}

interface AssessmentStrandEntry {
  area: JournalArea;
  strand: JournalStrand;
  blocks: AssessmentBlock[];
}

// ── Data helpers ─────────────────────────────────────────────────────────────

function collectBlocks(
  area: JournalArea,
  aIdx: number,
  strand: JournalStrand,
  sIdx: number,
  childId: string,
  ratings: Record<string, Rating>,
  visibility: StepVisibility,
  includeIncomplete: boolean,
  baselineSearch = false,
  baselineDepth = 3,
): AssessmentBlock[] {
  const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;
  const blocks: AssessmentBlock[] = [];

  function stagnant(r: Rating | undefined, s: Status): boolean {
    return !!(
      r?.history && r.history.length > 0 &&
      (s === "emerging" || s === "developing")
    );
  }

  if (baselineSearch) {
    // Baseline search: show steps from the age-appropriate step downward,
    // limited to baselineDepth steps below the focus (so focus + depth = depth+1 total).
    if (!visibleSet || visibleSet.size === 0) return [];
    const focusIdx = Math.max(...Array.from(visibleSet));
    const lowerBound = Math.max(0, focusIdx - baselineDepth);
    for (let stIdx = focusIdx; stIdx >= lowerBound; stIdx--) {
      const step = strand.steps[stIdx];
      if (!step || !step.items || step.note) continue;
      const items: AssessmentItem[] = step.items.map((item) => {
        const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
        const s = r?.status ?? null;
        return { key: item.key, text: item.text, status: s, isStagnant: stagnant(r, s) };
      });
      if (items.length === 0) continue;
      const hasStagnation = items.some((i) => i.isStagnant);
      blocks.push({
        stepNumber: step.number,
        ageRange: step.ageRange,
        items,
        isPrev: false,
        hasStagnation,
        isAgeStep: stIdx === focusIdx,
      });
    }
    return blocks;
  }

  if (visibleSet === null) {
    // No age filter — show all steps with all items
    strand.steps.forEach((step, stIdx) => {
      if (!step || !step.items || step.note) return;
      const items: AssessmentItem[] = step.items.map((item) => {
        const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
        const s = r?.status ?? null;
        return { key: item.key, text: item.text, status: s, isStagnant: stagnant(r, s) };
      });
      if (items.length === 0) return;
      const hasStagnation = items.some((i) => i.isStagnant);
      blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items, isPrev: false, hasStagnation });
    });
  } else {
    const currentMax = visibleSet.size > 0 ? Math.max(...Array.from(visibleSet)) : -1;
    if (currentMax < 0) return [];

    // Previous steps: only include items rated Emerging or Developing (not yet secure)
    if (includeIncomplete && currentMax > 0) {
      for (let stIdx = 0; stIdx < currentMax; stIdx++) {
        const step = strand.steps[stIdx];
        if (!step || !step.items || step.note) continue;
        const items: AssessmentItem[] = step.items.flatMap((item) => {
          const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
          const s = r?.status ?? null;
          if (s !== "emerging" && s !== "developing") return [];
          return [{ key: item.key, text: item.text, status: s, isStagnant: stagnant(r, s) }];
        });
        if (items.length === 0) continue;
        const hasStagnation = items.some((i) => i.isStagnant);
        blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items, isPrev: true, hasStagnation });
      }
    }

    // Current step — all items regardless of rating
    const currentStep = strand.steps[currentMax];
    if (currentStep && currentStep.items && !currentStep.note) {
      const items: AssessmentItem[] = currentStep.items.map((item) => {
        const r = ratings[getRatingKey(childId, aIdx, sIdx, currentMax, item.key)];
        const s = r?.status ?? null;
        return { key: item.key, text: item.text, status: s, isStagnant: stagnant(r, s) };
      });
      if (items.length > 0) {
        const hasStagnation = items.some((i) => i.isStagnant);
        blocks.push({ stepNumber: currentStep.number, ageRange: currentStep.ageRange, items, isPrev: false, hasStagnation });
      }
    }
  }

  // Always ascending by step number
  blocks.sort((a, b) => a.stepNumber - b.stepNumber);
  return blocks;
}

// ── Status indicator (filled dot if rated, hollow ring if not) ───────────────

function StatusDot({
  status,
  target,
}: {
  status: Status;
  target: "emerging" | "developing" | "secure";
}) {
  const filled = status === target;
  const colorMap: Record<string, string> = {
    emerging: "bg-[hsl(var(--status-emerging))]",
    developing: "bg-[hsl(var(--status-developing))]",
    secure: "bg-[hsl(var(--status-secure))]",
  };
  return (
    <span
      aria-label={filled ? target : undefined}
      className={cn(
        "inline-block h-3.5 w-3.5 rounded-full border-2",
        filled
          ? `${colorMap[target]} border-transparent`
          : "border-muted-foreground/30",
      )}
    />
  );
}

// ── Assessment table for one step ─────────────────────────────────────────────

function AssessmentTable({
  area,
  strand,
  block,
}: {
  area: JournalArea;
  strand: JournalStrand;
  block: AssessmentBlock;
}) {
  return (
    <section
      className="journal-strand"
      style={{ "--area-color": AREA_COLORS[area.area] ?? "#f6c344" } as React.CSSProperties}
    >
      <div
        className={cn(
          "journal-strand-header flex items-center justify-between gap-2",
          block.isPrev && "opacity-70",
        )}
      >
        <div className="flex flex-wrap items-baseline gap-x-1 min-w-0">
          {block.isPrev && (
            <span className="text-[10px] font-normal mr-1 opacity-80 tracking-normal normal-case">[previous step]</span>
          )}
          <span className="font-semibold">{area.area}:</span>
          <span className="uppercase tracking-wide">{strand.name}</span>
          <span className="ml-1 font-normal normal-case tracking-normal">
            — Step {block.stepNumber} ({block.ageRange})
          </span>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {block.isAgeStep && (
            <span className="age-step-badge">● Chronological age</span>
          )}
          {block.hasStagnation && (
            <span className="stagnation-badge">⚑ No recent progress</span>
          )}
        </div>
      </div>
      <table className="journal-step-table w-full">
        <colgroup>
          <col className="journal-col-text" />
          <col className="journal-col-status" />
          <col className="journal-col-status" />
          <col className="journal-col-status" />
        </colgroup>
        <thead>
          <tr className="journal-step-row">
            <th scope="col" className="text-left">Developmental statement</th>
            <th scope="col" className="text-center">Emerging</th>
            <th scope="col" className="text-center">Developing</th>
            <th scope="col" className="text-center">Secure</th>
          </tr>
        </thead>
        <tbody>
          {block.items.map((item) => (
            <tr key={item.key} className={cn(item.isStagnant && "stagnation-row")}>
              <td>
                <span className="font-semibold mr-1">{item.key})</span>
                {item.text}
              </td>
              <td className="text-center">
                <StatusDot status={item.status} target="emerging" />
              </td>
              <td className="text-center">
                <StatusDot status={item.status} target="developing" />
              </td>
              <td className="text-center">
                <StatusDot status={item.status} target="secure" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id ?? "";
  const { state } = useStore();
  const child = state.children.find((c) => c.id === childId);

  const childMonths = child ? ageInMonths(child.dob) : null;
  const childAgeLabel = child ? formatAge(child.dob) : "";
  const [includeIncomplete, setIncludeIncomplete] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set(ALL_AREA_NAMES));
  const [baselineSearch, setBaselineSearch] = useState(false);
  const [baselineDepth, setBaselineDepth] = useState(3);

  function handleBaselineToggle(on: boolean) {
    setBaselineSearch(on);
    if (!on) setBaselineDepth(3); // reset when toggled off
  }

  const allSelected = selectedAreas.size === ALL_AREA_NAMES.length;

  function toggleArea(area: string) {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        if (next.size === 1) return prev; // always keep at least one
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedAreas(new Set(ALL_AREA_NAMES));
  }

  // Inject a portrait @page override while this component is mounted so that
  // printing from the assessment route uses A4 portrait instead of landscape.
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "assessment-print-style";
    el.textContent =
      "@media print { @page { size: A4 portrait; margin: 1cm 1.5cm; } }";
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);

  const visibility: StepVisibility = useMemo(
    () =>
      buildStepVisibility(
        childId,
        childMonths,
        state.ratings,
        childMonths !== null,
        false,
      ),
    [childId, childMonths, state.ratings],
  );

  // Baseline search needs all steps from 0 → chronological age step included.
  const baselineVisibility: StepVisibility = useMemo(
    () =>
      baselineSearch && childMonths !== null
        ? buildStepVisibility(childId, childMonths, state.ratings, true, true)
        : null,
    [childId, childMonths, state.ratings, baselineSearch],
  );

  const strands = useMemo((): AssessmentStrandEntry[] => {
    if (!childId) return [];
    const out: AssessmentStrandEntry[] = [];
    const vis = baselineSearch ? baselineVisibility : visibility;
    JOURNAL.forEach((area, aIdx) => {
      if (!selectedAreas.has(area.area)) return;
      area.strands.forEach((strand, sIdx) => {
        const blocks = collectBlocks(
          area,
          aIdx,
          strand,
          sIdx,
          childId,
          state.ratings,
          vis,
          includeIncomplete,
          baselineSearch,
          baselineDepth,
        );
        if (blocks.length > 0) out.push({ area, strand, blocks });
      });
    });
    return out;
  }, [childId, state.ratings, visibility, baselineVisibility, includeIncomplete, selectedAreas, baselineSearch, baselineDepth]);

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

  const printDate = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
    <div className="no-print container max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-8">
      <ChildNav childId={childId} />
    </div>
    <div className="assessment-print container max-w-4xl px-4 sm:px-6 lg:px-8 py-4 pb-20 print:py-0 print:px-0 print:max-w-none print:pb-0">

      {/* ── Toolbar (screen only) ── */}
      <div className="no-print space-y-3 mb-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {childMonths !== null && (
              <>
                <label
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs cursor-pointer select-none hover:bg-muted/40"
                  data-testid="toggle-baseline-label"
                >
                  <Switch
                    checked={baselineSearch}
                    onCheckedChange={handleBaselineToggle}
                    data-testid="toggle-baseline-search"
                  />
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">Find baseline</span>
                </label>
                {!baselineSearch && (
                  <label
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs cursor-pointer select-none hover:bg-muted/40"
                    data-testid="toggle-include-prev-label"
                  >
                    <Switch
                      checked={includeIncomplete}
                      onCheckedChange={setIncludeIncomplete}
                      data-testid="toggle-include-incomplete"
                    />
                    <span className="font-medium">Include incomplete from earlier steps</span>
                  </label>
                )}
              </>
            )}
            <Button
              className="gap-2"
              onClick={() => window.print()}
              data-testid="button-print-assessment"
            >
              <Printer className="h-4 w-4" /> Print assessment
            </Button>
          </div>
        </div>

        {/* ── Area filter ── */}
        <div className="rounded-lg border border-border bg-card p-3" data-testid="area-filter-panel">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1 shrink-0">
              Areas to print:
            </span>
            <button
              onClick={selectAll}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
                allSelected
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/40",
              )}
              data-testid="area-filter-all"
            >
              {allSelected ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
              All
            </button>
            {JOURNAL.map((area) => {
              const selected = selectedAreas.has(area.area);
              const color = AREA_COLORS[area.area] ?? "#e5e5e5";
              return (
                <button
                  key={area.area}
                  onClick={() => toggleArea(area.area)}
                  data-testid={`area-filter-${area.area}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all",
                    selected
                      ? "border-transparent opacity-100"
                      : "bg-transparent border-border opacity-40 hover:opacity-60",
                  )}
                  style={selected ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  {selected ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                  {area.area}
                </button>
              );
            })}
          </div>
          {!allSelected && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Printing {selectedAreas.size} of {ALL_AREA_NAMES.length} areas.{" "}
              <button className="underline hover:text-foreground" onClick={selectAll}>
                Select all
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Print-only cover page ── */}
      <section className="hidden print:flex print-cover">
        <div className="print-corner">EYIT September 2024</div>
        <div className="print-cover-inner">
          <div className="text-center pt-24">
            <h1 className="text-4xl font-semibold tracking-tight">
              Early Years Inclusion Team
            </h1>
            <h2 className="text-3xl font-semibold mt-3">
              {baselineSearch ? "Baseline Assessment" : "Assessment Sheet"}
            </h2>
            {baselineSearch && (
              <p className="mt-2 text-sm text-gray-600">
                All steps from chronological age downward — rate items to locate the developmental baseline.
              </p>
            )}
          </div>
          <p className="text-right mt-8 text-sm">September 2024</p>
          <dl className="mt-20 space-y-10 text-base">
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Child's Name</dt>
              <dd className="flex-1">{child.name}</dd>
            </div>
            {child.dob && (
              <div className="flex items-end gap-6 border-b border-black pb-2">
                <dt className="font-medium w-48">Date of Birth</dt>
                <dd className="flex-1">
                  {new Date(child.dob).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            )}
            {childMonths !== null && (
              <div className="flex items-end gap-6 border-b border-black pb-2">
                <dt className="font-medium w-48">Age at Assessment</dt>
                <dd className="flex-1">{childAgeLabel}</dd>
              </div>
            )}
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Assessment Date</dt>
              <dd className="flex-1">{printDate}</dd>
            </div>
            <div className="flex items-end gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48">Practitioner</dt>
              <dd className="flex-1"> </dd>
            </div>
            <div className="flex items-start gap-6 border-b border-black pb-2">
              <dt className="font-medium w-48 pt-0.5">Areas assessed</dt>
              <dd className="flex-1">
                {allSelected
                  ? "All areas"
                  : Array.from(selectedAreas).join(", ")}
              </dd>
            </div>
          </dl>
        </div>
        <div className="print-footnote text-xs text-gray-500">
          Assessment Sheet — {child.name} — {printDate}
        </div>
      </section>

      {/* ── Screen header ── */}
      <div className="no-print mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {child.name} — Assessment
          {childAgeLabel && (
            <span className="ml-2.5 text-lg md:text-xl font-normal text-muted-foreground">
              {childAgeLabel}
            </span>
          )}
        </h1>
        {childMonths !== null ? (
          <p className="text-sm text-muted-foreground mt-1">
            {baselineSearch
              ? `Baseline search — all steps from the age-appropriate step (${childAgeLabel}) downward. Work top to bottom to find the child's developmental level.`
              : `Showing age-appropriate step${includeIncomplete ? ", plus incomplete items from earlier stages" : ""}`}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            Set a date of birth to filter by age-appropriate step.
          </p>
        )}
      </div>

      {/* ── Assessment tables ── */}
      {strands.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          {childMonths === null
            ? "No date of birth set — add one on the journal page to see age-appropriate content."
            : "No assessment content available for the current age range."}
        </p>
      ) : (
        <>
          <div className="print-pages space-y-1">
            {strands.flatMap(({ area, strand, blocks }) =>
              blocks.map((block) => (
                <div
                  key={`${area.area}-${strand.name}-${block.stepNumber}`}
                  className="journal-page"
                >
                  <AssessmentTable area={area} strand={strand} block={block} />
                </div>
              )),
            )}
          </div>
        </>
      )}
      {/* ── Floating "show more steps" button (baseline mode only) ── */}
      {baselineSearch && strands.some(({ blocks }) => blocks.length > 0 && blocks[blocks.length - 1].stepNumber > 1) && (
        <button
          type="button"
          onClick={() => setBaselineDepth((d) => d + 3)}
          className="print:hidden fixed right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 rounded-l-xl border border-r-0 border-border bg-card px-2.5 py-4 shadow-md text-xs font-medium text-foreground hover:bg-muted transition-colors"
          aria-label="Show 3 more steps"
        >
          <Layers className="h-4 w-4 shrink-0" />
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            Show 3 more steps
          </span>
        </button>
      )}
    </div>
    </>
  );
}
