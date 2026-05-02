import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ChildNav } from "../components/child-nav";
import { JOURNAL, AREA_COLORS, JournalArea, JournalStep, JournalStrand, Status } from "../data/journal";
import { useStore, getRatingKey, type Rating } from "../lib/store";
import { importSQLite } from "../lib/sqlite";
import { setImportHandle } from "../lib/filehandle-store";
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
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { cn } from "../lib/utils";
import { useDirty } from "../hooks/use-dirty";
import { ageInMonths, formatAge } from "../lib/age";
import { Switch } from "@/components/ui/switch";

type FilterValue = "all" | "rated" | "unrated" | "emerging" | "developing" | "secure";

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
            <CountChip label="Emerging" value={counts.emerging} variant="emerging" />
            <CountChip label="Developing" value={counts.developing} variant="developing" />
            <CountChip label="Secure" value={counts.secure} variant="secure" />
            <CountChip label="Unset" value={counts.unset} variant="muted" />
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

function EditChildDialog({
  childId,
  initial,
  open,
  onOpenChange,
}: {
  childId: string;
  initial: { name: string; dob: string; startDate: string };
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { updateChild } = useStore();
  const [name, setName] = useState(initial.name);
  const [dob, setDob] = useState(initial.dob);
  const [startDate, setStartDate] = useState(initial.startDate);

  useEffect(() => {
    if (open) {
      setName(initial.name);
      setDob(initial.dob);
      setStartDate(initial.startDate);
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !dob) return;
            updateChild(childId, { name: name.trim(), dob, startDate });
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
  const { state, deleteChild, setRating } = useStore();
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
          // Only store the file handle after a successful import so that a
          // failed or inspected-then-rejected file never becomes the implicit
          // save destination for future exports.
          setImportHandle(handle);
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
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn, true),
    [childId, childMonths, state.ratings, ageFilterOn],
  );

  const visibilityForStats: StepVisibility = useMemo(
    () => buildStepVisibility(childId, childMonths, state.ratings, ageFilterOn, true),
    [childId, childMonths, state.ratings, ageFilterOn],
  );

  const overall = useMemo(
    () =>
      childId
        ? countAll(childId, state.ratings, visibilityForStats)
        : countAll("", {}),
    [childId, state.ratings, visibilityForStats],
  );

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
    <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
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

        <div className="flex flex-wrap gap-2">
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

        {/* Overall progress */}
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Overall progress</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {overall.percentRated}%
                  </span>
                </div>
                <ProgressBar counts={overall} />
              </div>
              <CountChip label="Emerging" value={overall.emerging} variant="emerging" />
              <CountChip label="Developing" value={overall.developing} variant="developing" />
              <CountChip label="Secure" value={overall.secure} variant="secure" />
            </div>
          </CardContent>
        </Card>

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
            open={openStrands[`${areaIdx}::${sIdx}`] ?? true}
            onOpenChange={(open) => toggleStrand(areaIdx, sIdx, open)}
            childMonths={childMonths}
            ageFilterOn={ageFilterOn}
            visibility={visibility}
            visibilityForStats={visibilityForStats}
          />
        ))}
      </div>

      <EditChildDialog
        childId={childId}
        initial={{ name: child.name, dob: child.dob, startDate: child.startDate }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
