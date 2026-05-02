import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "../lib/store";
import type { Child, Rating } from "../lib/store";
import { parseSQLite } from "../lib/sqlite";
import { buildStepVisibility, countAll } from "../lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, ChevronRight, Calendar, Sparkles, BookText, Upload,
  Search, X, Download, Share, Archive, ArchiveRestore,
  MoreHorizontal, Trash2, AlertTriangle, FlaskConical,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";
import { ageInMonths, formatAge } from "../lib/age";
import { useInstallPrompt } from "../hooks/use-install-prompt";

// ── Stale-record constants ────────────────────────────────────────────────────

const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
const STALE_REMIND_KEY = "eyit-stale-remind-at";

/** Returns the latest activity timestamp across a child's profile + all their ratings. */
function getLastActivity(
  childId: string,
  childUpdatedAt: string,
  ratings: Record<string, Rating>,
): string {
  const prefix = `${childId}::`;
  let latest = childUpdatedAt;
  for (const [k, r] of Object.entries(ratings)) {
    if (k.startsWith(prefix) && r.updatedAt > latest) latest = r.updatedAt;
  }
  return latest;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

// ── AddChildDialog ────────────────────────────────────────────────────────────

function AddChildDialog() {
  const { addChild } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [startDate, setStartDate] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !dob) return;
    addChild({ name: trimmed, dob, startDate: startDate || today });
    setName(""); setDob(""); setStartDate("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-child" className="gap-2">
          <Plus className="h-4 w-4" /> Add child
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add a child</DialogTitle>
            <DialogDescription>
              Create a new development journal. Information stays only on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Child's name</Label>
              <Input
                id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amelia Carter" required autoFocus
                data-testid="input-child-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dob">
                  Date of birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  max={today} required data-testid="input-child-dob"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used to show only age-relevant steps in the journal.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Journal start date</Label>
                <Input
                  id="start" type="date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={today} data-testid="input-child-start"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" data-testid="button-save-child" disabled={!name.trim() || !dob}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── ImportButton ──────────────────────────────────────────────────────────────

function ImportButton() {
  const ref = useRef<HTMLInputElement>(null);
  const { state, importData } = useStore();
  const { toast } = useToast();
  const [pending, setPending] = useState<{
    children: ReturnType<typeof useStore>["state"]["children"];
    ratings: ReturnType<typeof useStore>["state"]["ratings"];
    stagnantNotes: ReturnType<typeof useStore>["state"]["stagnantNotes"];
    acknowledgedStagnations: ReturnType<typeof useStore>["state"]["acknowledgedStagnations"];
  } | null>(null);

  async function onFile(f: File) {
    if (ref.current) ref.current.value = "";
    try {
      const data = await parseSQLite(f);
      setPending(data);
    } catch (err: any) {
      toast({ title: "Import failed", description: err?.message ?? "Unable to read file.", variant: "destructive" });
    }
  }

  async function openPicker() {
    if ("showOpenFilePicker" in window) {
      try {
        const [handle]: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
          types: [{ description: "EYIT Journal", accept: { "application/octet-stream": [".db"] } }],
          multiple: false,
        });
        onFile(await handle.getFile());
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    ref.current?.click();
  }

  function confirmCollection() {
    if (!pending) return;
    const incomingIds = new Set(pending.children.map((c) => c.id));
    const kept = state.children.filter((c) => !incomingIds.has(c.id));
    importData({
      children: [...kept, ...pending.children],
      ratings: { ...state.ratings, ...pending.ratings },
      stagnantNotes: { ...(state.stagnantNotes ?? {}), ...(pending.stagnantNotes ?? {}) },
      acknowledgedStagnations: { ...(state.acknowledgedStagnations ?? {}), ...(pending.acknowledgedStagnations ?? {}) },
    });
    toast({
      title: "Backup restored",
      description: `${pending.children.length} child${pending.children.length === 1 ? "" : "ren"} merged into your collection.`,
    });
    setPending(null);
  }

  return (
    <>
      <input ref={ref} type="file" accept=".db,application/octet-stream" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        data-testid="input-import-file"
      />
      <Button variant="outline" className="gap-2" onClick={openPicker} data-testid="button-import-home">
        <Upload className="h-4 w-4" /> Import
      </Button>

      <AlertDialog open={!!pending} onOpenChange={(o) => { if (!o) setPending(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This file contains{" "}
              <strong>{pending?.children.length ?? 0} child{(pending?.children.length ?? 0) === 1 ? "" : "ren"}</strong>{" "}
              and{" "}
              <strong>{Object.keys(pending?.ratings ?? {}).length} rating{Object.keys(pending?.ratings ?? {}).length === 1 ? "" : "s"}</strong>.
              They will be merged with your current journals — existing children with matching IDs will
              be updated, and new ones added. No data will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCollection}>Import &amp; merge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── ChildCard ─────────────────────────────────────────────────────────────────

interface ChildCardProps {
  childId: string;
  name: string;
  dob: string;
  startDate: string;
  updatedAt: string;
  ratings: Record<string, Rating>;
  archived: boolean;
  isDemo?: boolean;
  baselineStep?: number;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}

function ChildCard({
  childId, name, dob, startDate, updatedAt, ratings,
  archived, isDemo, baselineStep, onArchive, onUnarchive, onDelete,
}: ChildCardProps) {
  const [, navigate] = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const childMonths = useMemo(() => ageInMonths(dob), [dob]);

  const isStale = useMemo(() => {
    const lastActivity = getLastActivity(childId, updatedAt, ratings);
    return Date.now() - new Date(lastActivity).getTime() > THREE_YEARS_MS;
  }, [childId, updatedAt, ratings]);

  const visibility = useMemo(
    () => buildStepVisibility(childId, childMonths, ratings, childMonths !== null, true, baselineStep),
    [childId, childMonths, ratings, baselineStep],
  );
  const counts = useMemo(
    () => countAll(childId, ratings, visibility),
    [childId, ratings, visibility],
  );

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all ratings and notes for{" "}
              <strong>{name}</strong>. This cannot be undone — consider archiving instead if you
              may need this record in future.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        className={cn(
          "h-full transition-all cursor-pointer hover:shadow-md",
          archived && !isStale && "opacity-65 hover:border-primary/40",
          archived && isStale
            ? "border-amber-400 dark:border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-500 dark:hover:border-amber-400"
            : "hover:border-primary/40",
        )}
        onClick={() => navigate(`/child/${childId}/summary`)}
        data-testid={`card-child-${childId}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">{name}</CardTitle>
                {isDemo && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide shrink-0 gap-1 border-amber-400/60 text-amber-700 bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:bg-amber-950/40 px-1.5">
                    <FlaskConical className="h-2.5 w-2.5" /> Demo
                  </Badge>
                )}
                {archived && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide shrink-0">
                    Archived
                  </Badge>
                )}
                {archived && isStale && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide shrink-0 gap-1 border-amber-400/70 text-amber-700 bg-amber-50 dark:border-amber-500/50 dark:text-amber-400 dark:bg-amber-950/40 px-1.5">
                    <AlertTriangle className="h-2.5 w-2.5" /> Due for deletion
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {dob && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatAge(dob)}
                  </span>
                )}
                {startDate && <span>started {formatDate(startDate)}</span>}
              </CardDescription>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Child options"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {archived ? (
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onUnarchive(); }}
                      className="gap-2"
                    >
                      <ArchiveRestore className="h-4 w-4" /> Restore to active
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onArchive(); }}
                      className="gap-2"
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{counts.rated} of {counts.total} items rated</span>
              <span className="font-medium text-foreground">{counts.percentRated}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
              {counts.total > 0 && (
                <>
                  <div className="h-full bg-[hsl(var(--status-emerging))]"
                    style={{ width: `${(counts.emerging / counts.total) * 100}%` }} />
                  <div className="h-full bg-[hsl(var(--status-developing))]"
                    style={{ width: `${(counts.developing / counts.total) * 100}%` }} />
                  <div className="h-full bg-[hsl(var(--status-secure))]"
                    style={{ width: `${(counts.secure / counts.total) * 100}%` }} />
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-border bg-[hsl(var(--status-emerging)/0.08)] px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Emerging</div>
              <div className="font-semibold text-base">{counts.emerging}</div>
            </div>
            <div className="rounded-md border border-border bg-[hsl(var(--status-developing)/0.08)] px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Developing</div>
              <div className="font-semibold text-base">{counts.developing}</div>
            </div>
            <div className="rounded-md border border-border bg-[hsl(var(--status-secure)/0.08)] px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Secure</div>
              <div className="font-semibold text-base">{counts.secure}</div>
            </div>
          </div>
          {updatedAt && (
            <div className="text-[11px] text-muted-foreground">
              Updated {formatDate(updatedAt)}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ── InstallBanner ─────────────────────────────────────────────────────────────

const DISMISS_KEY = "eyit-install-banner-dismissed";

function InstallBanner() {
  const { installState, install } = useInstallPrompt();
  const [iosOpen, setIosOpen] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1",
  );

  const effectiveState = import.meta.env.DEV && installState === "unavailable"
    ? "available"
    : installState;
  if (dismissed || effectiveState === "unavailable" || effectiveState === "installed") return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <>
      <div className="mb-6 rounded-xl bg-[#008264] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0 h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center">
            <Download className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-snug">Install the EYIT Journal app</p>
            <p className="text-white/80 text-xs mt-0.5 leading-snug">
              {effectiveState === "ios"
                ? "Add to your home screen — works fully offline, no internet needed."
                : "One click to install — works fully offline, no internet needed."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {effectiveState === "ios" ? (
            <Button size="sm" className="bg-white text-[#008264] hover:bg-white/90 gap-1.5 font-semibold"
              onClick={() => setIosOpen(true)}>
              <Share className="h-3.5 w-3.5" /> Add to Home Screen
            </Button>
          ) : (
            <Button size="sm" className="bg-white text-[#008264] hover:bg-white/90 gap-1.5 font-semibold"
              onClick={install}>
              <Download className="h-3.5 w-3.5" /> Install app
            </Button>
          )}
          <button onClick={dismiss} aria-label="Dismiss"
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Install on iPhone / iPad</DialogTitle>
            <DialogDescription>
              Add this journal to your home screen for instant offline access.
            </DialogDescription>
          </DialogHeader>
          <ol className="text-sm space-y-3 py-2">
            <li className="flex items-start gap-3">
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">1</span>
              <span>Tap the <Share className="inline h-4 w-4 align-text-bottom" /> <strong>Share</strong> button in Safari's toolbar (bottom centre or top right).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">2</span>
              <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">3</span>
              <span>Tap <strong>Add</strong> — the app icon will appear on your home screen and work offline.</span>
            </li>
          </ol>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIosOpen(false); dismiss(); }}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── StaleWarningDialog ────────────────────────────────────────────────────────

interface StaleWarningDialogProps {
  open: boolean;
  staleChildren: Child[];
  onDelete: (ids: string[]) => void;
  onRemind: () => void;
}

function StaleWarningDialog({ open, staleChildren, onDelete, onRemind }: StaleWarningDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const count = staleChildren.length;

  return (
    <>
      <AlertDialog open={open && !confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              Old records found
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {count === 1
                    ? "1 record hasn't"
                    : `${count} records haven't`}{" "}
                  been updated in over 3 years. Good data practice suggests reviewing and
                  removing records that are no longer needed.
                </p>
                <ul className="text-sm rounded-md border border-border bg-muted/50 divide-y divide-border overflow-hidden">
                  {staleChildren.map((c) => (
                    <li key={c.id} className="px-3 py-2 flex items-center justify-between gap-4">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        Last updated {formatDate(c.updatedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={onRemind}>Remind me in 30 days</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setConfirmOpen(true)}
            >
              Delete these records
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {count} child record{count === 1 ? "" : "s"}
              </strong>{" "}
              and all their associated ratings and notes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { setConfirmOpen(false); onDelete(staleChildren.map((c) => c.id)); }}
            >
              Yes, delete {count === 1 ? "this record" : "all " + count + " records"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { state, updateChild, deleteChild } = useStore();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "updated">("name");
  const [showArchived, setShowArchived] = useState(false);

  // Stale-record warning
  const [staleOpen, setStaleOpen] = useState(false);
  const [staleChildren, setStaleChildren] = useState<Child[]>([]);

  useEffect(() => {
    const remindAt = localStorage.getItem(STALE_REMIND_KEY);
    if (remindAt && Date.now() < new Date(remindAt).getTime()) return;

    const stale = state.children.filter((c) => {
      const lastActivity = getLastActivity(c.id, c.updatedAt, state.ratings);
      return Date.now() - new Date(lastActivity).getTime() > THREE_YEARS_MS;
    });

    if (stale.length > 0) {
      setStaleChildren(stale);
      setStaleOpen(true);
    }
  }, []); // intentionally runs once on mount

  // Archive helpers
  const archiveChild = (id: string) => {
    updateChild(id, { status: "archived", archivedAt: new Date().toISOString() });
    toast({ title: "Child archived", description: "Moved to the archive. Use the toggle below to view archived records." });
  };

  const unarchiveChild = (id: string) => {
    updateChild(id, { status: "active", archivedAt: undefined });
    toast({ title: "Restored to active" });
  };

  const handleDelete = (id: string) => {
    const name = state.children.find((c) => c.id === id)?.name ?? "Child";
    deleteChild(id);
    toast({ title: `${name} deleted` });
  };

  // Sort + filter
  const archivedCount = state.children.filter((c) => c.status === "archived").length;

  // If the last archived child is restored/deleted while the archive view is
  // open, flip back to active automatically so the user is never left stranded.
  useEffect(() => {
    if (archivedCount === 0 && showArchived) setShowArchived(false);
  }, [archivedCount, showArchived]);

  const sorted = useMemo(() => {
    const list = [...state.children];
    if (sortBy === "updated") return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [state.children, sortBy]);

  const visibleByArchive = useMemo(
    () => sorted.filter((c) => showArchived ? c.status === "archived" : c.status !== "archived"),
    [sorted, showArchived],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleByArchive;
    return visibleByArchive.filter((c) => c.name.toLowerCase().includes(q));
  }, [visibleByArchive, query]);

  const hasActive = state.children.some((c) => c.status !== "archived");
  const hasChildren = state.children.length > 0;

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <StaleWarningDialog
        open={staleOpen}
        staleChildren={staleChildren}
        onDelete={(ids) => {
          ids.forEach((id) => deleteChild(id));
          setStaleOpen(false);
          toast({
            title: "Records deleted",
            description: `${ids.length} stale record${ids.length === 1 ? "" : "s"} permanently removed.`,
          });
        }}
        onRemind={() => {
          const remind = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          localStorage.setItem(STALE_REMIND_KEY, remind);
          setStaleOpen(false);
        }}
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Children</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            A calm, structured way to follow each child's early years development across
            the seven areas of learning.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportButton />
          <AddChildDialog />
        </div>
      </div>

      <InstallBanner />

      {hasChildren && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative max-w-sm flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={showArchived ? "Search archived journals…" : "Search journals by name…"}
              className="pl-8 pr-8"
              data-testid="input-search"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground mr-1">Sort:</span>
            <button
              onClick={() => setSortBy("name")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                sortBy === "name" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
              data-testid="sort-name"
            >
              A–Z
            </button>
            <button
              onClick={() => setSortBy("updated")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                sortBy === "updated" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
              data-testid="sort-updated"
            >
              Recently updated
            </button>
          </div>

          {archivedCount > 0 && (
            <button
              onClick={() => { setShowArchived((s) => !s); setQuery(""); }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border shrink-0",
                showArchived
                  ? "bg-muted border-border text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
              data-testid="toggle-archived"
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
            </button>
          )}
        </div>
      )}

      {!hasChildren ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium">No children yet</h2>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
              Add a child to start logging progress against the seven areas of the
              EYIT Development Journal.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <AddChildDialog />
            </div>
          </CardContent>
        </Card>
      ) : showArchived && archivedCount === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Archive className="mx-auto h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">No archived records yet.</p>
        </div>
      ) : !showArchived && !hasActive ? (
        <div className="py-12 text-center text-muted-foreground">
          <Archive className="mx-auto h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">All children are archived.</p>
          <button
            onClick={() => setShowArchived(true)}
            className="mt-2 text-xs underline underline-offset-2 hover:text-foreground"
          >
            Show archived records
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Search className="mx-auto h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">
            No {showArchived ? "archived " : ""}journals match{" "}
            <span className="font-medium text-foreground">"{query}"</span>
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-2 text-xs underline underline-offset-2 hover:text-foreground"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ChildCard
              key={c.id}
              childId={c.id}
              name={c.name}
              dob={c.dob}
              startDate={c.startDate}
              updatedAt={c.updatedAt}
              ratings={state.ratings}
              archived={c.status === "archived"}
              isDemo={c.isDemo}
              baselineStep={c.baselineStep}
              onArchive={() => archiveChild(c.id)}
              onUnarchive={() => unarchiveChild(c.id)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-10 max-w-2xl">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <BookText className="h-4 w-4 text-primary" /> About this journal
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The EYIT Development Journal supports practitioners and parents to notice and
          celebrate small steps of progress. For every statement you can mark whether
          a skill is <span className="font-medium text-foreground">emerging</span>,{" "}
          <span className="font-medium text-foreground">developing</span>, or{" "}
          <span className="font-medium text-foreground">secure</span>. All information
          stays in your browser — nothing is sent anywhere.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="mt-1 h-auto p-0 text-sm text-muted-foreground underline-offset-4">
              More information
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Using this journal</DialogTitle>
              <DialogDescription>
                Guidance for practitioners on how the EYDJ is intended to be used.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm space-y-3 text-muted-foreground leading-relaxed py-1">
              <p>
                <span className="font-semibold text-foreground">Not a checklist.</span>{" "}
                It is not necessary or appropriate to record assessments for every statement.
                Outcomes in each step reflect expected developmental milestones and should be
                treated as a guide — each child will proceed at their own rate and may present
                attainments across a range of steps.
              </p>
              <p>
                <span className="font-semibold text-foreground">Use it as a conversation tool.</span>{" "}
                The journal is designed to support professional discussions between practitioners,
                and between practitioners and parents. It is not a summative assessment tool.
              </p>
              <p>
                <span className="font-semibold text-foreground">Keep it manageable.</span>{" "}
                Focus on what is most useful for each individual child. A small number of
                meaningful observations is more valuable than a completed grid.
              </p>
              <p>
                <span className="font-semibold text-foreground">Data stays on this device.</span>{" "}
                No information is sent to any server. Use the Save button to export a backup file
                at the end of each session — restore it at the start of your next session.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
