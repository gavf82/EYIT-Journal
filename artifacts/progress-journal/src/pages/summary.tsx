import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { JOURNAL } from "../data/journal";
import { useStore, getRatingKey } from "../lib/store";
import {
  buildStepVisibility,
  countAll,
  countArea,
  countStrand,
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

function statusBadgeClass(status: "emerging" | "developing" | "secure") {
  if (status === "emerging")
    return "border-[hsl(var(--status-emerging)/0.5)] bg-[hsl(var(--status-emerging)/0.15)] text-[hsl(35_70%_30%)]";
  if (status === "developing")
    return "border-[hsl(var(--status-developing)/0.5)] bg-[hsl(var(--status-developing)/0.15)] text-[hsl(175_45%_22%)]";
  return "border-[hsl(var(--status-secure)/0.5)] bg-[hsl(var(--status-secure)/0.18)] text-[hsl(135_45%_22%)]";
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
      childId
        ? countAll(childId, state.ratings, visibility)
        : countAll("", {}),
    [childId, state.ratings, visibility],
  );

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

      <article className="space-y-8 print:space-y-6">
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
              reflect the current step.
            </p>
          )}
        </header>

        <section>
          <h2 className="text-lg font-semibold mb-3">Overall progress</h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
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
                <Card key={aIdx} className="break-inside-avoid">
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

        <section>
          <h2 className="text-lg font-semibold mb-3">Detailed breakdown</h2>
          <div className="space-y-6">
            {JOURNAL.map((area, aIdx) => {
              const ac = countArea(childId, aIdx, area, state.ratings, visibility);
              return (
                <div key={aIdx} className="break-inside-avoid">
                  <div className="flex flex-wrap items-end justify-between gap-2 mb-2 pb-1.5 border-b border-border">
                    <h3 className="font-semibold">{area.area}</h3>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ac.rated} / {ac.total} rated
                    </span>
                  </div>
                  <div className="space-y-3">
                    {area.strands.map((strand, sIdx) => {
                      const sc = countStrand(
                        childId,
                        aIdx,
                        sIdx,
                        strand,
                        state.ratings,
                        visibility,
                      );
                      const visibleSet =
                        visibility?.get(`${aIdx}::${sIdx}`) ?? null;
                      const ratedItems: {
                        step: number;
                        ageRange: string;
                        itemKey: string;
                        text: string;
                        status: "emerging" | "developing" | "secure";
                      }[] = [];
                      let hiddenRatedSteps = 0;
                      const seenHiddenSteps = new Set<number>();
                      strand.steps.forEach((step, stIdx) => {
                        if (!step.items || step.note) return;
                        const inAgeRange = visibleSet ? visibleSet.has(stIdx) : true;
                        step.items.forEach((item) => {
                          const key = getRatingKey(childId, aIdx, sIdx, stIdx, item.key);
                          const r = state.ratings[key];
                          if (r && r.status) {
                            if (inAgeRange) {
                              ratedItems.push({
                                step: step.number,
                                ageRange: step.ageRange,
                                itemKey: item.key,
                                text: item.text,
                                status: r.status,
                              });
                            } else if (!seenHiddenSteps.has(stIdx)) {
                              seenHiddenSteps.add(stIdx);
                              hiddenRatedSteps += 1;
                            }
                          }
                        });
                      });
                      // Highest step first so the latest age sits at the top.
                      ratedItems.sort(
                        (a, b) => b.step - a.step || a.itemKey.localeCompare(b.itemKey),
                      );

                      return (
                        <div key={sIdx} className="break-inside-avoid">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                              {strand.name}
                            </h4>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              E {sc.emerging} · D {sc.developing} · S {sc.secure}
                            </span>
                          </div>
                          {ratedItems.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              {ageFilterOn && hiddenRatedSteps > 0
                                ? "No ratings within current step."
                                : "No ratings yet."}
                            </p>
                          ) : (
                            <ul className="space-y-1.5">
                              {ratedItems.map((it, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm leading-snug"
                                >
                                  <span
                                    className={cn(
                                      "shrink-0 mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                      statusBadgeClass(it.status),
                                    )}
                                  >
                                    {it.status[0]}
                                  </span>
                                  <span>
                                    <span className="text-muted-foreground text-xs mr-1">
                                      Step {it.step} ({it.ageRange}) · {it.itemKey}.
                                    </span>
                                    {it.text}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {ageFilterOn && hiddenRatedSteps > 0 && (
                            <p className="mt-1.5 text-[11px] text-muted-foreground italic" data-testid={`hidden-note-${aIdx}-${sIdx}`}>
                              {hiddenRatedSteps} other step
                              {hiddenRatedSteps === 1 ? "" : "s"} with ratings hidden by age
                              filter.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="pt-4 border-t border-border text-xs text-muted-foreground">
          Adapted from EYIT Development Journal, September 2024 — Early Years Inclusion Team,
          Leeds City Council.
        </footer>
      </article>
    </div>
  );
}
