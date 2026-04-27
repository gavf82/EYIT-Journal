import { useMemo, useState, useRef } from "react";
import { Link } from "wouter";
import { useStore, type StoreState } from "../lib/store";
import { countAll } from "../lib/progress";
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
import { Plus, ChevronRight, Calendar, Sparkles, BookText, Upload, Download, Search, X } from "lucide-react";
import { exportCollectionJSON } from "../lib/export";
import { useToast } from "../hooks/use-toast";
import { formatAge } from "../lib/age";

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
  const [pending, setPending] = useState<{ data: StoreState; childCount: number; ratingCount: number } | null>(null);

  async function onFile(f: File) {
    if (ref.current) ref.current.value = "";
    try {
      const text = await f.text();
      const data = JSON.parse(text);

      // Full collection backup: { children: [...], ratings: {...} }
      if (Array.isArray(data.children) && typeof data.ratings === "object") {
        setPending({
          data,
          childCount: data.children.length,
          ratingCount: Object.keys(data.ratings).length,
        });
        return;
      }

      // Single-child journal: { child: {...}, ratings: {...} }
      if (data.child && data.child.id && typeof data.ratings === "object") {
        const kept = state.children.filter((c) => c.id !== data.child.id);
        importData({
          children: [...kept, data.child],
          ratings: { ...state.ratings, ...data.ratings },
        });
        toast({ title: "Journal imported", description: `${data.child.name} added.` });
        return;
      }

      throw new Error("Unrecognised file format.");
    } catch (err: any) {
      toast({ title: "Import failed", description: err?.message ?? "Unable to read file.", variant: "destructive" });
    }
  }

  function confirmCollection() {
    if (!pending) return;
    // Merge: keep existing children not in backup; update/add those in backup.
    const incoming = pending.data;
    const incomingIds = new Set(incoming.children.map((c) => c.id));
    const kept = state.children.filter((c) => !incomingIds.has(c.id));
    importData({
      children: [...kept, ...incoming.children],
      ratings: { ...state.ratings, ...incoming.ratings },
    });
    toast({
      title: "Collection imported",
      description: `${incoming.children.length} child${incoming.children.length === 1 ? "" : "ren"} merged into your collection.`,
    });
    setPending(null);
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        data-testid="input-import-file"
      />
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => ref.current?.click()}
        data-testid="button-import-home"
      >
        <Upload className="h-4 w-4" /> Import
      </Button>

      <AlertDialog open={!!pending} onOpenChange={(o) => { if (!o) setPending(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import collection backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This file contains{" "}
              <strong>{pending?.childCount ?? 0} child{(pending?.childCount ?? 0) === 1 ? "" : "ren"}</strong>{" "}
              and{" "}
              <strong>{pending?.ratingCount ?? 0} rating{(pending?.ratingCount ?? 0) === 1 ? "" : "s"}</strong>.
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

function ExportCollectionButton() {
  const { state } = useStore();
  const total = Object.keys(state.ratings).length;
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={exportCollectionJSON}
      disabled={state.children.length === 0}
      title={state.children.length === 0 ? "No journals to export" : `Export ${state.children.length} child${state.children.length === 1 ? "" : "ren"} and ${total} ratings`}
      data-testid="button-export-collection"
    >
      <Download className="h-4 w-4" /> Export collection
    </Button>
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
  const counts = useMemo(() => countAll(childId, ratings), [childId, ratings]);
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

export default function HomePage() {
  const { state } = useStore();
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
          <ExportCollectionButton />
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
