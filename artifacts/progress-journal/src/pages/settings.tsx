import { useState, useRef } from "react";
import { useStore, getStore, setStore, type StoreState } from "../lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useToast } from "../hooks/use-toast";
import { Trash2, Upload, FlaskConical, X, Database } from "lucide-react";
import { useLocation } from "wouter";
import { seedDemoData, removeDemoData, isDemoLoaded } from "../lib/seed";
import { exportSQLite, parseSQLite } from "../lib/sqlite";

interface PendingImport {
  parsed: Pick<StoreState, "children" | "ratings" | "stagnantNotes" | "acknowledgedStagnations">;
  overlappingChildCount: number;
  replacedRatingCount: number;
  totalIncomingRatings: number;
}

export default function SettingsPage() {
  const { state, resetAll } = useStore();
  const hasData = state.children.length > 0;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const sqliteFileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(isDemoLoaded);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  async function handleExportSQLite() {
    setBusy(true);
    try {
      await exportSQLite();
    } catch (e: any) {
      toast({
        title: "Export failed",
        description: e?.message ?? "Could not create SQLite file.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleImportSQLite(file: File) {
    setBusy(true);
    try {
      const parsed = await parseSQLite(file);

      const current = getStore();
      const existingChildIds = new Set(current.children.map((c) => c.id));
      const existingRatingKeys = new Set(Object.keys(current.ratings));

      const overlappingChildren = parsed.children.filter((c) => existingChildIds.has(c.id));
      const overlappingChildIds = new Set(overlappingChildren.map((c) => c.id));

      const incomingRatingKeys = Object.keys(parsed.ratings);
      const totalIncomingRatings = incomingRatingKeys.length;
      const replacedRatingCount = incomingRatingKeys.filter(
        (k) => existingRatingKeys.has(k) && overlappingChildIds.has(k.split("::")[0]),
      ).length;

      setPendingImport({
        parsed,
        overlappingChildCount: overlappingChildren.length,
        replacedRatingCount,
        totalIncomingRatings,
      });
    } catch (e: any) {
      toast({
        title: "Import failed",
        description: e?.message ?? "Could not read SQLite file.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      if (sqliteFileRef.current) sqliteFileRef.current.value = "";
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    try {
      const { parsed } = pendingImport;
      const current = getStore();
      const childMap = new Map(current.children.map((c) => [c.id, c]));
      parsed.children.forEach((c) => childMap.set(c.id, c));

      setStore({
        children: [...childMap.values()],
        ratings: { ...current.ratings, ...parsed.ratings },
        stagnantNotes: { ...(current.stagnantNotes ?? {}), ...parsed.stagnantNotes },
        acknowledgedStagnations: {
          ...(current.acknowledgedStagnations ?? {}),
          ...parsed.acknowledgedStagnations,
        },
      });

      toast({ title: "Backup restored", description: "Your journals have been imported." });
    } catch (e: any) {
      toast({
        title: "Import failed",
        description: e?.message ?? "Could not apply backup.",
        variant: "destructive",
      });
    } finally {
      setPendingImport(null);
    }
  }

  const totalRatings = Object.keys(state.ratings).length;

  return (
    <div className="container max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Backup, restore, or clear all data stored in this browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            All data is stored only on this device, in your browser's local storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Children</dt>
              <dd className="font-medium text-lg">{state.children.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ratings</dt>
              <dd className="font-medium text-lg">{totalRatings}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
          <CardDescription>
            Changes are saved automatically. Export a backup file to keep a portable copy
            you can restore on any device, or to clear this browser's storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Files open in DB Browser for SQLite, Python, Excel, and more.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              disabled={busy || !hasData}
              onClick={handleExportSQLite}
              data-testid="button-export-sqlite"
            >
              <Database className="h-4 w-4" /> Export as SQLite (.db)
            </Button>
            <input
              ref={sqliteFileRef}
              type="file"
              accept=".db,application/octet-stream"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportSQLite(f);
              }}
            />
            <Button
              variant="outline"
              className="gap-2"
              disabled={busy}
              onClick={() => sqliteFileRef.current?.click()}
              data-testid="button-import-sqlite"
            >
              <Upload className="h-4 w-4" /> Restore from backup (.db)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import confirmation dialog */}
      <AlertDialog open={!!pendingImport} onOpenChange={(open) => { if (!open) setPendingImport(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import this backup?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This backup contains{" "}
                  <strong className="text-foreground">
                    {pendingImport?.parsed.children.length ?? 0}{" "}
                    {(pendingImport?.parsed.children.length ?? 0) === 1 ? "child" : "children"}
                  </strong>{" "}
                  and{" "}
                  <strong className="text-foreground">
                    {pendingImport?.totalIncomingRatings ?? 0}{" "}
                    {(pendingImport?.totalIncomingRatings ?? 0) === 1 ? "rating" : "ratings"}
                  </strong>
                  .
                </p>
                {(pendingImport?.overlappingChildCount ?? 0) > 0 && (
                  <p>
                    {pendingImport!.overlappingChildCount}{" "}
                    {pendingImport!.overlappingChildCount === 1
                      ? "child already exists"
                      : "children already exist"}{" "}
                    in your journal.{" "}
                    {pendingImport!.replacedRatingCount > 0 ? (
                      <>
                        Importing will overwrite{" "}
                        <strong className="text-foreground">
                          {pendingImport!.replacedRatingCount}{" "}
                          {pendingImport!.replacedRatingCount === 1 ? "rating" : "ratings"}
                        </strong>{" "}
                        for{" "}
                        {pendingImport!.overlappingChildCount === 1 ? "that child" : "those children"}.
                      </>
                    ) : (
                      "No existing ratings will be overwritten."
                    )}
                  </p>
                )}
                <p>New children and ratings will be merged in alongside any existing data.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} data-testid="button-confirm-import">
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
          <CardDescription>
            Load six sample children — three active, three archived (two of those overdue for
            deletion) — with realistic ratings to demonstrate the full range of journal features.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {demoLoaded ? (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/")}
              >
                <FlaskConical className="h-4 w-4" /> View demo children
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-muted-foreground"
                onClick={() => {
                  removeDemoData();
                  setDemoLoaded(false);
                  toast({ title: "Demo data removed" });
                }}
              >
                <X className="h-4 w-4" /> Remove demo data
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                seedDemoData();
                setDemoLoaded(true);
                toast({ title: "Demo data loaded", description: "Amelia Thompson added." });
                navigate("/");
              }}
            >
              <FlaskConical className="h-4 w-4" /> Load demo data
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete every child and every rating from this browser. This cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2" data-testid="button-reset-all">
                <Trash2 className="h-4 w-4" /> Reset everything
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all {state.children.length} child
                  {state.children.length === 1 ? "" : "ren"} and {totalRatings} rating
                  {totalRatings === 1 ? "" : "s"} from this browser. Consider saving a
                  backup first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    resetAll();
                    toast({ title: "All data cleared" });
                  }}
                >
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
