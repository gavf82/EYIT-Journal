import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL, type JournalArea, type JournalStrand, type Status } from "../data/journal";
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
import { ArrowLeft, Printer, Download } from "lucide-react";
import { exportJournalJSON } from "../lib/export";
import { cn } from "../lib/utils";
import { ageInMonths, formatAge } from "../lib/age";
import { Switch } from "@/components/ui/switch";

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

interface RatedItemRow {
  key: string;
  text: string;
  status: Exclude<Status, null>;
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
        items.push({ key: item.key, text: item.text, status: r.status });
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
    <table className="journal-table" data-testid={`strand-table-${strand.name}`}>
      <colgroup>
        <col className="journal-col-text" />
        <col className="journal-col-status" />
        <col className="journal-col-status" />
        <col className="journal-col-status" />
      </colgroup>
      <thead>
        <tr className="journal-strand-row">
          <th colSpan={4} className="text-left">
            <span className="font-semibold">{area.area}: </span>
            <span className="uppercase tracking-wide">{strand.name}</span>
          </th>
        </tr>
      </thead>
      {blocks.map((block) => (
        <tbody key={block.stepNumber} className="journal-step-block">
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
          {block.items.map((it) => (
            <tr key={it.key}>
              <td>
                <span className="font-semibold mr-1">{it.key})</span>
                {it.text}
              </td>
              <td className="text-center">
                {it.status === "emerging" ? <span aria-label="Emerging">✓</span> : null}
              </td>
              <td className="text-center">
                {it.status === "developing" ? <span aria-label="Developing">✓</span> : null}
              </td>
              <td className="text-center">
                {it.status === "secure" ? <span aria-label="Secure">✓</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id ?? "";
  const { state } = useStore();
  const child = state.children.find((c) => c.id === childId);

  const childMonths = child ? ageInMonths(child.dob) : null;
  const childAgeLabel = child ? formatAge(child.dob) : "";
  const [ageFilterOn, setAgeFilterOn] = useState<boolean>(childMonths !== null);

  const visibility: StepVisibility = useMemo(
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn),
    [childId, childMonths, state.ratings, ageFilterOn],
  );

  const overall = useMemo(
    () =>
      childId ? countAll(childId, state.ratings, visibility) : countAll("", {}),
    [childId, state.ratings, visibility],
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
    <div className="container max-w-4xl px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:px-0 print:max-w-none">
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
                onCheckedChange={setAgeFilterOn}
                data-testid="toggle-age-filter-summary"
              />
              <span className="font-medium">Age relevant only</span>
            </label>
          )}
          <Button variant="outline" className="gap-2" onClick={() => exportJournalJSON(childId)}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button className="gap-2" onClick={() => window.print()} data-testid="button-print">
            <Printer className="h-4 w-4" /> Print summary
          </Button>
        </div>
      </div>

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
                  ? ` — current step only (${childAgeLabel})`
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
        <header className="border-b border-border pb-5">
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
              Age filter on — showing the current step only ({childAgeLabel}). Progress totals
              and printed pages reflect the current step.
            </p>
          )}
        </header>

        <section>
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

        <section>
          <h2 className="text-lg font-semibold mb-3">By area</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {JOURNAL.map((area, aIdx) => {
              const ac = countArea(childId, aIdx, area, state.ratings, visibility);
              return (
                <Card key={aIdx}>
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
      </article>

      {/* Journal pages — PDF-style tables, shown on screen and printed */}
      <section className="mt-8 print:mt-0">
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
