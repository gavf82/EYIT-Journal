import { useMemo, useState, useRef } from "react";
import { Link } from "wouter";
import { useStore } from "../lib/store";
import { parseSQLite } from "../lib/sqlite";
import { setImportHandle } from "../lib/filehandle-store";
import { buildStepVisibility, countAll } from "../lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronRight, Calendar, Sparkles, BookText, Upload, LogOut, Search, X, Download, Share } from "lucide-react";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";
import { useSaveAndClose } from "../hooks/use-save-and-close";
import { SaveAndCloseDialog } from "../components/save-and-close-dialog";
import { ageInMonths, formatAge } from "../lib/age";
import { useDirty } from "../hooks/use-dirty";
import { useInstallPrompt } from "../hooks/use-install-prompt";

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
    addChild({
      name: trimmed,
      dob,
      startDate: startDate || today,
    });
    setName("");
    setDob("");
    setStartDate("");
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
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amelia Carter"
                required
                autoFocus
                data-testid="input-child-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dob">
                  Date of birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={today}
                  required
                  data-testid="input-child-dob"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used to show only age-relevant steps in the journal.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Journal start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={today}
                  data-testid="input-child-start"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-child" disabled={!name.trim() || !dob}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Handles both single-child journals and full collection backups automatically. */
function ImportButton() {
  const ref = useRef<HTMLInputElement>(null);
  const { state, importData } = useStore();
  const { toast } = useToast();
  const [pending, setPending] = useState<{
    children: ReturnType<typeof useStore>["state"]["children"];
    ratings: ReturnType<typeof useStore>["state"]["ratings"];
    stagnantNotes: ReturnType<typeof useStore>["state"]["stagnantNotes"];
    handle: FileSystemFileHandle | null;
  } | null>(null);

  async function onFile(f: File, handle?: FileSystemFileHandle) {
    if (ref.current) ref.current.value = "";
    try {
      const data = await parseSQLite(f);
      // Store the handle alongside parsed data — only committed to the
      // module-level store if the user confirms the import dialog.
      setPending({ ...data, handle: handle ?? null });
    } catch (err: any) {
      toast({ title: "Import failed", description: err?.message ?? "Unable to read file.", variant: "destructive" });
    }
  }

  async function openPicker() {
    // Prefer showOpenFilePicker (Chrome/Edge 86+) so we capture a writable
    // file handle and can save back to the same location without a new dialog.
    if ("showOpenFilePicker" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [handle]: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
          types: [{ description: "EYIT Journal", accept: { "application/octet-stream": [".db"] } }],
          multiple: false,
        });
        const file = await handle.getFile();
        onFile(file, handle);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Unexpected error — fall through to the hidden file input.
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
    });
    // Only promote the file handle to the module-level store now that the
    // user has explicitly confirmed they want to import (and thus save back
    // to) this file.
    setImportHandle(pending.handle);
    toast({
      title: "Backup restored",
      description: `${pending.children.length} child${pending.children.length === 1 ? "" : "ren"} merged into your collection.`,
    });
    setPending(null);
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".db,application/octet-stream"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        data-testid="input-import-file"
      />
      <Button
        variant="outline"
        className="gap-2"
        onClick={openPicker}
        data-testid="button-import-home"
      >
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
              They will be merged with your current journals — existing children with
              matching IDs will be updated, and new ones will be added. No data will be
              deleted.
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


interface ChildCardProps {
  childId: string;
  name: string;
  dob: string;
  startDate: string;
  updatedAt: string;
  ratings: ReturnType<typeof useStore>["state"]["ratings"];
}

function ChildCard({ childId, name, dob, startDate, updatedAt, ratings }: ChildCardProps) {
  const childMonths = useMemo(() => ageInMonths(dob), [dob]);
  const visibility = useMemo(
    () => buildStepVisibility(childId, childMonths, ratings, childMonths !== null, true),
    [childId, childMonths, ratings],
  );
  const counts = useMemo(() => countAll(childId, ratings, visibility), [childId, ratings, visibility]);
  return (
    <Link href={`/child/${childId}`} className="block group" data-testid={`card-child-${childId}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{name}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {dob && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatAge(dob)}
                  </span>
                )}
                {startDate && <span>started {formatDate(startDate)}</span>}
              </CardDescription>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
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
    </Link>
  );
}

function InstallButton() {
  const { installState, install } = useInstallPrompt();
  const [iosOpen, setIosOpen] = useState(false);

  if (installState === "unavailable" || installState === "installed") return null;

  if (installState === "ios") {
    return (
      <>
        <Button variant="outline" className="gap-2" onClick={() => setIosOpen(true)}>
          <Download className="h-4 w-4" /> Install app
        </Button>
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
              <Button variant="outline" onClick={() => setIosOpen(false)}>Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // installState === "available"
  return (
    <Button variant="outline" className="gap-2" onClick={install}>
      <Download className="h-4 w-4" /> Install app
    </Button>
  );
}

export default function HomePage() {
  const { state } = useStore();
  const { openDialog, hasData, dialogProps } = useSaveAndClose();
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () => [...state.children].sort((a, b) => a.name.localeCompare(b.name)),
    [state.children],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [sorted, query]);

  const hasChildren = sorted.length > 0;

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Children
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            A calm, structured way to follow each child's early years development across
            the seven areas of learning.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InstallButton />
          <Button
            variant="outline"
            className="gap-2"
            disabled={!hasData}
            onClick={openDialog}
            data-testid="button-save-and-close"
          >
            <LogOut className="h-4 w-4" /> Save and close
          </Button>
          <SaveAndCloseDialog {...dialogProps} />
          <ImportButton />
          <AddChildDialog />
        </div>
      </div>

      {hasChildren && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search journals by name…"
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
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Search className="mx-auto h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">
            No journals match <span className="font-medium text-foreground">"{query}"</span>
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
          a skill is <span className="font-medium text-foreground">emerging</span>,
          <span className="font-medium text-foreground"> developing</span>, or
          <span className="font-medium text-foreground"> secure</span>. All information
          stays in your browser — nothing is sent anywhere.
        </p>
      </div>
    </div>
  );
}
