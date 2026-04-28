import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL, AREA_COLORS, type JournalArea, type JournalStrand, type Status } from "../data/journal";
import { useStore, getRatingKey, type Rating } from "../lib/store";
import { buildStepVisibility, type StepVisibility } from "../lib/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, LogOut } from "lucide-react";
import { useSaveAndClose } from "../hooks/use-save-and-close";
import { SaveAndCloseDialog } from "../components/save-and-close-dialog";
import { ageInMonths, formatAge } from "../lib/age";
import { Switch } from "@/components/ui/switch";
import { cn } from "../lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface AssessmentItem {
  key: string;
  text: string;
  status: Status;
}

interface AssessmentBlock {
  stepNumber: number;
  ageRange: string;
  items: AssessmentItem[];
  isPrev: boolean;
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
): AssessmentBlock[] {
  const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;
  const blocks: AssessmentBlock[] = [];

  if (visibleSet === null) {
    // No age filter — show all steps with all items
    strand.steps.forEach((step, stIdx) => {
      if (!step || !step.items || step.note) return;
      const items: AssessmentItem[] = step.items.map((item) => {
        const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
        return { key: item.key, text: item.text, status: r?.status ?? null };
      });
      if (items.length === 0) return;
      blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items, isPrev: false });
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
          return [{ key: item.key, text: item.text, status: s }];
        });
        if (items.length === 0) continue;
        blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items, isPrev: true });
      }
    }

    // Current step — all items regardless of rating
    const currentStep = strand.steps[currentMax];
    if (currentStep && currentStep.items && !currentStep.note) {
      const items: AssessmentItem[] = currentStep.items.map((item) => {
        const r = ratings[getRatingKey(childId, aIdx, sIdx, currentMax, item.key)];
        return { key: item.key, text: item.text, status: r?.status ?? null };
      });
      if (items.length > 0) {
        blocks.push({ stepNumber: currentStep.number, ageRange: currentStep.ageRange, items, isPrev: false });
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
      <div className={cn("journal-strand-header flex flex-wrap items-baseline gap-x-1", block.isPrev && "opacity-70")}>
        {block.isPrev && (
          <span className="text-[10px] font-normal mr-1 opacity-80 tracking-normal normal-case">[previous step]</span>
        )}
        <span className="font-semibold">{area.area}:</span>
        <span className="uppercase tracking-wide">{strand.name}</span>
        <span className="ml-1 font-normal normal-case tracking-normal">
          — Step {block.stepNumber} ({block.ageRange})
        </span>
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
            <tr key={item.key}>
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
  const { openDialog, hasData, dialogProps } = useSaveAndClose();

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

  const strands = useMemo((): AssessmentStrandEntry[] => {
    if (!childId) return [];
    const out: AssessmentStrandEntry[] = [];
    JOURNAL.forEach((area, aIdx) => {
      area.strands.forEach((strand, sIdx) => {
        const blocks = collectBlocks(
          area,
          aIdx,
          strand,
          sIdx,
          childId,
          state.ratings,
          visibility,
          includeIncomplete,
        );
        if (blocks.length > 0) out.push({ area, strand, blocks });
      });
    });
    return out;
  }, [childId, state.ratings, visibility, includeIncomplete]);

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
    <div className="assessment-print container max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pb-20 print:py-0 print:px-0 print:max-w-none print:pb-0">

      {/* ── Toolbar (screen only) ── */}
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
          <Button
            variant="outline"
            className="gap-2"
            disabled={!hasData}
            onClick={openDialog}
          >
            <LogOut className="h-4 w-4" /> Save and close
          </Button>
          <SaveAndCloseDialog {...dialogProps} />
          <Button
            className="gap-2"
            onClick={() => window.print()}
            data-testid="button-print-assessment"
          >
            <Printer className="h-4 w-4" /> Print assessment
          </Button>
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
            <h2 className="text-3xl font-semibold mt-3">Assessment Sheet</h2>
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
        </h1>
        {childMonths !== null ? (
          <p className="text-sm text-muted-foreground mt-1">
            Age: {childAgeLabel} · Showing age-appropriate step
            {includeIncomplete ? ", plus incomplete items from earlier stages" : ""}
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
      )}
    </div>
  );
}
