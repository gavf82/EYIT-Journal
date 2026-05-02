import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ChildNav } from "../components/child-nav";
import { JOURNAL, AREA_COLORS, JournalArea, JournalStep, JournalStrand, Status } from "../data/journal";
import { useStore, getRatingKey, type Rating, type HistoryEntry } from "../lib/store";
import { importSQLite } from "../lib/sqlite";
import {
  buildStepVisibility,
  countAll,
  countArea,
  countStep,
  countStrand,
  STATUS_LABELS,
  type StepVisibility,
} from "../lib/progress";
import { StatusSelector } from "../components/status-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Filter,
  LogOut,
  MoreVertical,
  Trash2,
  Upload,
  RotateCcw,
  CheckCircle2,
  Pencil,
  Save,
  Info,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Printer,
  FileText,
  BookOpen,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { useDirty } from "../hooks/use-dirty";
import { ageInMonths, formatAge } from "../lib/age";
import { Switch } from "@/components/ui/switch";

type FilterValue = "all" | "rated" | "unrated" | "emerging" | "developing" | "secure";

// ---------------------------------------------------------------------------
// Print helpers — date formatters, table builders, stagnation detection
// ---------------------------------------------------------------------------

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
  allBlocks.sort((a, b) => a.stepNumber - b.stepNumber);
  const withItems = allBlocks.filter((b) => b.items.length > 0);
  if (withItems.length === 0) return [];
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
  reviewNote?: string;
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
  visibility: StepVisibility | null,
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
  result.sort(
    (a, b) =>
      b.monthsStale - a.monthsStale ||
      a.areaName.localeCompare(b.areaName) ||
      a.strandName.localeCompare(b.strandName),
  );
  return result;
}

function ProgressBar({ counts }: { counts: ReturnType<typeof countAll> }) {
  if (counts.total === 0) return null;
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
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

function CountChip({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "emerging" | "developing" | "secure" | "muted";
}) {
  const map = {
    emerging:
      "bg-[hsl(var(--status-emerging)/0.15)] text-[hsl(5_60%_32%)] border-[hsl(var(--status-emerging)/0.4)]",
    developing:
      "bg-[hsl(var(--status-developing)/0.18)] text-[hsl(30_70%_28%)] border-[hsl(var(--status-developing)/0.4)]",
    secure:
      "bg-[hsl(var(--status-secure)/0.18)] text-[hsl(130_55%_22%)] border-[hsl(var(--status-secure)/0.4)]",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        map[variant],
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

interface ItemRowProps {
  childId: string;
  aIdx: number;
  sIdx: number;
  stIdx: number;
  itemKey: string;
  text: string;
  value: Status;
  rating?: Rating;
  onChange: (next: Status) => void;
}

const STATUS_INITIAL: Record<string, string> = { emerging: "E", developing: "D", secure: "S" };
const STATUS_TRAIL_CLASS: Record<string, string> = {
  emerging:   "text-[hsl(5_72%_45%)]",
  developing: "text-[hsl(38_88%_38%)]",
  secure:     "text-[hsl(120_35%_38%)]",
};

function fmtTrailDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}`;
}

function ItemRow({ itemKey, text, value, rating, onChange }: Omit<ItemRowProps, "childId" | "aIdx" | "sIdx" | "stIdx">) {
  // Build full trail: history entries + current
  const trail = rating
    ? [...(rating.history ?? []), { status: rating.status, date: rating.updatedAt }]
    : [];

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-3 md:gap-6 py-3 border-t border-border first:border-t-0"
      data-testid={`row-item-${itemKey}`}
    >
      <div className="flex gap-3 items-start">
        <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {itemKey}
        </span>
        <div>
          <p className="text-sm leading-relaxed text-foreground">{text}</p>
          {trail.length > 1 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {trail.map((h, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    <span className={cn("font-semibold", STATUS_TRAIL_CLASS[h.status ?? ""] ?? "")}>
                      {STATUS_INITIAL[h.status ?? ""] ?? "?"}
                    </span>
                    {" "}{fmtTrailDate(h.date)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="md:pl-2">
        <StatusSelector value={value} onChange={onChange} size="sm" />
      </div>
    </div>
  );
}

interface StepCardProps {
  childId: string;
  aIdx: number;
  sIdx: number;
  stIdx: number;
  step: JournalStep;
  filter: FilterValue;
  ratings: ReturnType<typeof useStore>["state"]["ratings"];
  setRating: ReturnType<typeof useStore>["setRating"];
}

function passesFilter(filter: FilterValue, status: Status): boolean {
  if (filter === "all") return true;
  if (filter === "rated") return status !== null;
  if (filter === "unrated") return status === null;
  return status === filter;
}

function StepCard({ childId, aIdx, sIdx, stIdx, step, filter, ratings, setRating }: StepCardProps) {
  const counts = useMemo(
    () => countStep(childId, aIdx, sIdx, stIdx, step, ratings),
    [childId, aIdx, sIdx, stIdx, step, ratings],
  );

  if (step.note || !step.items) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-sm">
                Step {step.number} <span className="text-muted-foreground font-normal">({step.ageRange})</span>
              </h4>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {step.description ?? "Refer to the published EYIT guidance for this step."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleItems = step.items.filter((item) => {
    const key = getRatingKey(childId, aIdx, sIdx, stIdx, item.key);
    const status = ratings[key]?.status ?? null;
    return passesFilter(filter, status);
  });

  return (
    <Card data-testid={`step-${aIdx}-${sIdx}-${stIdx}`}>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-xs text-muted-foreground">
            {counts.rated} of {counts.total} rated · {counts.percentRated}%
          </p>
          <div className="flex flex-wrap gap-1.5">
            <CountChip label="E" value={counts.emerging} variant="emerging" />
            <CountChip label="D" value={counts.developing} variant="developing" />
            <CountChip label="S" value={counts.secure} variant="secure" />
          </div>
        </div>
        <div className="mb-4">
          <ProgressBar counts={counts} />
        </div>

        {visibleItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-3">
            No items match the current filter.
          </p>
        ) : (
          <div>
            {visibleItems.map((item) => {
              const key = getRatingKey(childId, aIdx, sIdx, stIdx, item.key);
              const ratingObj = ratings[key];
              const status = ratingObj?.status ?? null;
              return (
                <ItemRow
                  key={item.key}
                  itemKey={item.key}
                  text={item.text}
                  value={status}
                  rating={ratingObj}
                  onChange={(next) => setRating(key, next)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StrandSectionProps {
  childId: string;
  aIdx: number;
  sIdx: number;
  strand: JournalStrand;
  filter: FilterValue;
  ratings: ReturnType<typeof useStore>["state"]["ratings"];
  setRating: ReturnType<typeof useStore>["setRating"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childMonths: number | null;
  ageFilterOn: boolean;
  visibility: StepVisibility;
  visibilityForStats: StepVisibility;
}

function StrandSection({
  childId,
  aIdx,
  sIdx,
  strand,
  filter,
  ratings,
  setRating,
  open,
  onOpenChange,
  childMonths,
  ageFilterOn,
  visibility,
  visibilityForStats,
}: StrandSectionProps) {
  const counts = useMemo(
    () => countStrand(childId, aIdx, sIdx, strand, ratings, visibilityForStats),
    [childId, aIdx, sIdx, strand, ratings, visibilityForStats],
  );

  // Visible steps for this strand, sorted highest → lowest by step.number so
  // the most age-relevant content sits at the top for ergonomic access.
  const visibleSteps = useMemo(() => {
    const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;
    return strand.steps
      .map((step, stIdx) => ({ step, stIdx }))
      .filter(({ stIdx }) => (visibleSet ? visibleSet.has(stIdx) : true))
      .sort((a, b) => b.step.number - a.step.number);
  }, [strand.steps, visibility, aIdx, sIdx]);

  const hiddenCount = strand.steps.length - visibleSteps.length;

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-xl border border-border bg-card overflow-hidden data-[state=open]:shadow-sm"
      data-testid={`strand-${aIdx}-${sIdx}`}
    >
      <CollapsibleTrigger
        className="w-full text-left px-4 sm:px-5 py-4 hover:bg-muted/40 data-[state=open]:bg-muted/30 transition-colors"
        data-testid={`strand-toggle-${aIdx}-${sIdx}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <ChevronDown
              className={cn(
                "h-4 w-4 mt-1 text-muted-foreground shrink-0 transition-transform",
                open ? "rotate-0" : "-rotate-90",
              )}
            />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight">{strand.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {counts.rated} of {counts.total} statements rated · {counts.percentRated}%
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:justify-end pl-6 sm:pl-0">
            <CountChip label="Unset" value={counts.unset} variant="muted" />
            <CountChip label="Emerging" value={counts.emerging} variant="emerging" />
            <CountChip label="Developing" value={counts.developing} variant="developing" />
            <CountChip label="Secure" value={counts.secure} variant="secure" />
          </div>
        </div>
        <div className="mt-3 pl-6">
          <ProgressBar counts={counts} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 sm:px-5 pb-5 pt-1">
        {visibleSteps.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-3">
            No steps in this strand match the child's age yet — toggle "All steps" above to see
            every step.
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {visibleSteps.map(({ step, stIdx }) => {
              const sc = countStep(childId, aIdx, sIdx, stIdx, step, ratings);
              return (
                <AccordionItem
                  key={stIdx}
                  value={`s-${stIdx}`}
                  className="border border-border rounded-lg bg-card overflow-hidden data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/40">
                    <div className="flex flex-1 items-center justify-between gap-3 mr-2">
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          Step {step.number}{" "}
                          <span className="text-muted-foreground font-normal">({step.ageRange})</span>
                        </div>
                        {!step.note && step.items && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {sc.rated}/{sc.total} rated
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {!step.note && step.items && (
                          <div className="hidden sm:block w-28">
                            <ProgressBar counts={sc} />
                          </div>
                        )}
                        {sc.percentRated === 100 && sc.total > 0 && (
                          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-secure))]" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <StepCard
                      childId={childId}
                      aIdx={aIdx}
                      sIdx={sIdx}
                      stIdx={stIdx}
                      step={step}
                      filter={filter}
                      ratings={ratings}
                      setRating={setRating}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
        {hiddenCount > 0 && (
          <p className="mt-3 text-[11px] text-muted-foreground italic">
            {hiddenCount} step{hiddenCount === 1 ? "" : "s"} above child's age hidden — toggle
            "All steps" above to view.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Step labels derived from the first strand — shared across all strands.
const STEP_OPTIONS = JOURNAL[0].strands[0].steps.map((step, i) => ({
  idx: i,
  label: `Step ${step.number} (${step.ageRange})`,
}));

function EditChildDialog({
  childId,
  initial,
  open,
  onOpenChange,
}: {
  childId: string;
  initial: { name: string; dob: string; startDate: string; baselineStep?: number };
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { updateChild } = useStore();
  const [name, setName] = useState(initial.name);
  const [dob, setDob] = useState(initial.dob);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [baselineStep, setBaselineStep] = useState<number | undefined>(initial.baselineStep);

  useEffect(() => {
    if (open) {
      setName(initial.name);
      setDob(initial.dob);
      setStartDate(initial.startDate);
      setBaselineStep(initial.baselineStep);
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !dob) return;
            updateChild(childId, { name: name.trim(), dob, startDate, baselineStep });
            onOpenChange(false);
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Edit child</DialogTitle>
            <DialogDescription>Update the basic details for this journal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="e-dob">
                  Date of birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="e-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                  data-testid="input-edit-child-dob"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used to show only age-relevant steps.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-start">Journal start</Label>
                <Input
                  id="e-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            {dob && (
              <p className="text-xs text-muted-foreground">
                Age today: <span className="font-medium text-foreground">{formatAge(dob)}</span>
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Baseline assessment step</Label>
              <Select
                value={baselineStep !== undefined ? String(baselineStep) : "auto"}
                onValueChange={(v) => setBaselineStep(v === "auto" ? undefined : Number(v))}
              >
                <SelectTrigger data-testid="select-baseline-step">
                  <SelectValue placeholder="Auto — use first rated step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto — use first rated step</SelectItem>
                  {STEP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.idx} value={String(opt.idx)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                The step where the baseline assessment began. Progress bars count from here to the
                child's current age. Leave as 'Auto' to use the first step where a rating is recorded.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={!name.trim() || !dob}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ChildJournalPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id ?? "";
  const [, navigate] = useLocation();
  const { state, deleteChild, setRating, setStagnationAcknowledged } = useStore();
  const child = state.children.find((c) => c.id === childId);
  const { toast } = useToast();
  const { isDirty } = useDirty();

  const [areaIdx, setAreaIdx] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [editOpen, setEditOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  async function openImportPicker() {
    if ("showOpenFilePicker" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [handle]: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
          types: [{ description: "EYIT Journal", accept: { "application/octet-stream": [".db"] } }],
          multiple: false,
        });
        const file = await handle.getFile();
        try {
          await importSQLite(file);
          toast({ title: "Journal imported" });
        } catch (err: any) {
          toast({ title: "Import failed", description: err?.message ?? "Could not parse file.", variant: "destructive" });
        }
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    importRef.current?.click();
  }

  // Track which strands are open, keyed as `${areaIdx}::${strandIdx}`.
  // Default: all collapsed for a clean overview.
  const [openStrands, setOpenStrands] = useState<Record<string, boolean>>({});

  const childMonths = child ? ageInMonths(child.dob) : null;
  const childAgeLabel = child ? formatAge(child.dob) : "";
  // Age filter is on by default whenever we know the child's age.
  const [ageFilterOn, setAgeFilterOn] = useState<boolean>(childMonths !== null);

  // When switching between children (different DOBs), reset the age filter to its default.
  useEffect(() => {
    setAgeFilterOn(childMonths !== null);
    setOpenStrands({});
    setAreaIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  function toggleStrand(aIdx: number, sIdx: number, open: boolean) {
    setOpenStrands((prev) => ({ ...prev, [`${aIdx}::${sIdx}`]: open }));
  }

  function setAllStrandsInArea(aIdx: number, open: boolean) {
    setOpenStrands((prev) => {
      const next = { ...prev };
      JOURNAL[aIdx].strands.forEach((_, sIdx) => {
        next[`${aIdx}::${sIdx}`] = open;
      });
      return next;
    });
  }

  const visibility: StepVisibility = useMemo(
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn, true, child?.baselineStep),
    [childId, childMonths, state.ratings, ageFilterOn, child?.baselineStep],
  );

  const visibilityForStats: StepVisibility = useMemo(
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn, true, child?.baselineStep),
    [childId, childMonths, state.ratings, ageFilterOn, child?.baselineStep],
  );

  const overall = useMemo(
    () =>
      childId
        ? countAll(childId, state.ratings, visibilityForStats)
        : countAll("", {}),
    [childId, state.ratings, visibilityForStats],
  );

  // ── Print infrastructure ──────────────────────────────────────────────────
  const [fullDJPrint, setFullDJPrint] = useState(false);

  function handleFullDJPrint() {
    setFullDJPrint(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setFullDJPrint(false);
      });
    });
  }

  const allStagnantItems = useMemo(
    () => computeStagnantItems(childId, state.ratings, null),
    [childId, state.ratings],
  );

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

  const stagnantItems = activeStagnantItems;

  const stagnantKeys = useMemo(
    () => new Set(activeStagnantItems.map((it) => `${it.areaName}::${it.strandName}::${it.stepNumber}::${it.itemKey}`)),
    [activeStagnantItems],
  );

  const strandTables = useMemo(() => {
    if (!childId) return [];
    const out: { area: JournalArea; strand: JournalStrand; blocks: StepBlock[] }[] = [];
    JOURNAL.forEach((area, aIdx) => {
      area.strands.forEach((strand, sIdx) => {
        const blocks = collectStrandBlocks(area, aIdx, strand, sIdx, childId, state.ratings, visibility);
        if (blocks.length > 0) out.push({ area, strand, blocks });
      });
    });
    return out;
  }, [childId, state.ratings, visibility]);

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
  // ─────────────────────────────────────────────────────────────────────────

  if (!child) {
    return (
      <div className="container max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Child not found</h1>
        <p className="text-muted-foreground mt-2">
          This journal may have been deleted on this device.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to children</Link>
        </Button>
      </div>
    );
  }

  const area: JournalArea = JOURNAL[areaIdx];
  const areaCounts = countArea(childId, areaIdx, area, state.ratings, visibilityForStats);

  function clearChildRatings() {
    Object.keys(state.ratings)
      .filter((k) => k.startsWith(`${childId}::`))
      .forEach((k) => setRating(k, null));
    toast({ title: "Ratings cleared", description: `All ratings reset for ${child!.name}.` });
  }

  function handleDelete() {
    deleteChild(childId);
    toast({ title: "Journal deleted" });
    navigate("/");
  }

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 print:py-0 print:px-0 print:max-w-none print:pb-0">
      <div className="no-print">
      {/* Child navigation */}
      <ChildNav childId={childId} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" data-testid="text-child-name">
            {child.name}
            {childAgeLabel && (
              <span className="ml-2.5 text-lg md:text-xl font-normal text-muted-foreground">
                {childAgeLabel}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {overall.rated} of {overall.total} statements rated · {overall.percentRated}% complete
          </p>
        </div>

        <div className="flex flex-wrap gap-2 no-print">
          {/* Print dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-print">
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
          {/* Options menu */}
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-child-menu" className="relative">
                  <MoreVertical className="h-4 w-4" />
                  {isDirty && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Journal</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Data</DropdownMenuLabel>
                <DropdownMenuItem onSelect={openImportPicker}>
                  <Upload className="h-4 w-4 mr-2" /> Import JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Reset</DropdownMenuLabel>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <RotateCcw className="h-4 w-4 mr-2" /> Clear all ratings
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all ratings?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes every rating for {child.name}. The child entry stays. This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearChildRatings}>Clear ratings</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete journal
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this journal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Permanently removes {child.name} and every rating from this device. This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              ref={importRef}
              type="file"
              accept=".db,application/octet-stream"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  await importSQLite(f);
                  toast({ title: "Journal imported" });
                } catch (err: any) {
                  toast({
                    title: "Import failed",
                    description: err?.message ?? "Could not parse file.",
                    variant: "destructive",
                  });
                } finally {
                  if (importRef.current) importRef.current.value = "";
                }
              }}
            />
          </div>
        </div>

      {/* Missing DOB notice */}
      {childMonths === null && (
        <div className="mb-5 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-medium">Add a date of birth to filter age-relevant steps.</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Without it, every step from birth to 60+ months is shown.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditOpen(true)}
            data-testid="button-set-dob"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Set date of birth
          </Button>
        </div>
      )}

      {/* Area tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5 border-b border-border pb-3">
        {JOURNAL.map((a, idx) => {
          const ac = countArea(childId, idx, a, state.ratings, visibilityForStats);
          const active = idx === areaIdx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setAreaIdx(idx)}
              style={active ? { backgroundColor: AREA_COLORS[a.area] ?? undefined, borderColor: AREA_COLORS[a.area] ?? undefined, color: "#111" } : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs md:text-sm font-medium transition-colors border",
                active
                  ? "shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
              )}
              data-testid={`tab-area-${idx}`}
            >
              <span>{a.area}</span>
              <span
                className={cn(
                  "ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  active ? "bg-black/10" : "bg-muted",
                )}
              >
                {ac.percentRated}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Area body */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{area.area}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {area.strands.length} strand{area.strands.length === 1 ? "" : "s"} ·{" "}
            {areaCounts.rated} of {areaCounts.total} statements rated
            {ageFilterOn && childMonths !== null && (
              <> · up to {childAgeLabel}</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {childMonths !== null && (
            <label
              className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs cursor-pointer select-none hover:bg-muted/40"
              data-testid="toggle-age-filter-label"
            >
              <Switch
                checked={!ageFilterOn}
                onCheckedChange={(v) => setAgeFilterOn(!v)}
                data-testid="toggle-age-filter"
              />
              <span className="font-medium">
                {ageFilterOn
                  ? <>Steps up to <span className="text-[#008264]">{childAgeLabel}</span></>
                  : "All steps"}
              </span>
            </label>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAllStrandsInArea(areaIdx, true)}
              data-testid="button-expand-all"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" /> Expand all
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAllStrandsInArea(areaIdx, false)}
              data-testid="button-collapse-all"
            >
              <ChevronsDownUp className="h-3.5 w-3.5" /> Collapse all
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show all items</SelectItem>
                <SelectItem value="rated">Rated only</SelectItem>
                <SelectItem value="unrated">Not yet rated</SelectItem>
                <SelectItem value="emerging">{STATUS_LABELS.emerging}</SelectItem>
                <SelectItem value="developing">{STATUS_LABELS.developing}</SelectItem>
                <SelectItem value="secure">{STATUS_LABELS.secure}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {area.strands.map((strand, sIdx) => (
          <StrandSection
            key={sIdx}
            childId={childId}
            aIdx={areaIdx}
            sIdx={sIdx}
            strand={strand}
            filter={filter}
            ratings={state.ratings}
            setRating={setRating}
            open={openStrands[`${areaIdx}::${sIdx}`] ?? false}
            onOpenChange={(open) => toggleStrand(areaIdx, sIdx, open)}
            childMonths={childMonths}
            ageFilterOn={ageFilterOn}
            visibility={visibility}
            visibilityForStats={visibilityForStats}
          />
        ))}
      </div>
      </div>{/* end no-print */}

      {/* ── Print-only content — hidden on screen ── */}

      {/* Cover page */}
      <section className="hidden print:flex print-cover eyit-cover">
        <div className="eyit-cover-logo-row">
          <img
            src={`${import.meta.env.BASE_URL}eyit-logo.png`}
            alt="Early Years Inclusion Team"
            className="eyit-cover-logo"
          />
        </div>
        <div className="eyit-cover-titles">
          <div className="eyit-cover-h1">Early Years Inclusion Team</div>
          <div className="eyit-cover-h1">Development Journal</div>
          <div className="eyit-cover-h2">
            {fullDJPrint ? "Full Journal Record" : "Summary"} — September 2024
          </div>
        </div>
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
        <p className="print-footnote">
          Early Years Inclusion Team adapted from Special Educational Needs &amp; Inclusion Team,
          Learning Inclusion Service, Leeds City Council.
        </p>
      </section>

      {/* Areas without progression — page 2 */}
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
        </section>
      )}

      {/* Journal tables */}
      <div className="hidden print:block print:mt-0">
        {/* Stagnation review notes */}
        {dismissedStagnantItems.length > 0 && (
          <div style={{ marginBottom: "0.5cm", pageBreakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3cm", marginBottom: "0.2cm" }}>
              <ClipboardCheck style={{ width: "0.4cm", height: "0.4cm", color: "#008264" }} />
              <h3 style={{ fontSize: "11pt", fontWeight: 700, margin: 0 }}>Stagnation review notes</h3>
              <span style={{ fontSize: "9pt", color: "#555" }}>
                {dismissedStagnantItems.length} item{dismissedStagnantItems.length !== 1 ? "s" : ""} reviewed
              </span>
            </div>
            <div>
              {dismissedStagnantItems.map((it) => {
                const entry = (state.acknowledgedStagnations ?? {})[
                  `${childId}::${it.areaName}::${it.strandName}::${it.stepNumber}::${it.itemKey}`
                ];
                return (
                  <div
                    key={`${it.strandName}::${it.stepNumber}::${it.itemKey}`}
                    style={{ borderLeft: "2px solid #008264", paddingLeft: "0.25cm", marginBottom: "0.2cm" }}
                  >
                    <p style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: "#555", margin: 0 }}>
                      {it.areaName}
                    </p>
                    <p style={{ fontSize: "9pt", fontWeight: 600, margin: "1px 0" }}>
                      {it.strandName} · Step {it.stepNumber} ({it.ageRange})
                    </p>
                    <p style={{ fontSize: "9pt", color: "#444", margin: "1px 0" }}>{it.itemText}</p>
                    {it.reviewNote ? (
                      <p style={{ fontSize: "9pt", margin: "2px 0" }}>{it.reviewNote}</p>
                    ) : (
                      <p style={{ fontSize: "9pt", fontStyle: "italic", color: "#888", margin: "2px 0" }}>No note recorded.</p>
                    )}
                    {entry?.ackedAt && (
                      <p style={{ fontSize: "8pt", color: "#888", margin: "1px 0" }}>
                        Reviewed {new Date(entry.ackedAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard summary journal */}
        {!fullDJPrint && (
          <div>
            {strandTables.length > 0 && (
              <div className="print-journal-title">
                Journal Record — {child.name}
                <span style={{ fontSize: "9pt", fontWeight: 400, marginLeft: "1cm", color: "#444" }}>
                  {ageFilterOn && childMonths !== null
                    ? `History up to current step (${childAgeLabel})`
                    : "All steps"}
                </span>
              </div>
            )}
            <div className="print-pages">
              {strandTables.map(({ area, strand, blocks }, idx) => (
                <div
                  key={`${area.area}::${strand.name}`}
                  className="journal-page"
                  data-testid={`journal-page-${idx}`}
                >
                  <div className="print-corner">EYIT September 2024</div>
                  <StrandTable area={area} strand={strand} blocks={blocks} stagnantKeys={stagnantKeys} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full DJ journal */}
        {fullDJPrint && (
          <div>
            <div className="print-journal-title">
              Full Development Journal — {child.name}
              <span style={{ fontSize: "9pt", fontWeight: 400, marginLeft: "1cm", color: "#444" }}>
                All steps and statements
                {childAgeLabel ? ` · Age ${childAgeLabel}` : ""}
              </span>
            </div>
            <div className="print-pages">
              {fullDJStrandTables.map(({ area, strand, blocks }, idx) => (
                <div
                  key={`fulldj-${area.area}::${strand.name}`}
                  className="journal-page"
                  data-testid={`full-dj-page-${idx}`}
                >
                  <div className="print-corner">EYIT September 2024</div>
                  <FullDJStrandTable area={area} strand={strand} blocks={blocks} stagnantKeys={stagnantKeys} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditChildDialog
        childId={childId}
        initial={{ name: child.name, dob: child.dob, startDate: child.startDate, baselineStep: child.baselineStep }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
