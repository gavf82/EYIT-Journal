import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useStore, setStore, getStore, type StoreState } from "@/lib/store";
import { isDemoLoaded, seedDemoData, removeDemoData } from "@/lib/seed";
import type { BackupEntry } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(mtime: number): string {
  return new Date(mtime).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsDesktop() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { state, resetAll } = useStore();

  // ── Journal file path ────────────────────────────────────────────────────────
  const [journalPath, setJournalPath] = useState<string>("");
  useEffect(() => {
    window.electronAPI.getJournalPath().then(setJournalPath).catch(console.error);
  }, []);

  // ── Backups ──────────────────────────────────────────────────────────────────
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);

  const refreshBackups = useCallback(async () => {
    setBackupsLoading(true);
    try {
      setBackups(await window.electronAPI.listBackups());
    } catch (e) {
      console.error("[EYIT] Failed to list backups:", e);
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBackups();
  }, [refreshBackups]);

  // ── Import state ─────────────────────────────────────────────────────────────
  const [pendingImport, setPendingImport] = useState<StoreState | null>(null);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalRated = Object.keys(state.ratings).length;
  const activeChildren = state.children.filter(c => !c.status || c.status === "active").length;
  const archivedChildren = state.children.filter(c => c.status === "archived").length;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleExportBackup = async () => {
    try {
      const saved = await window.electronAPI.exportBackup();
      if (saved) {
        toast({ title: "Backup exported", description: "Your journal backup was saved successfully." });
        refreshBackups();
      }
    } catch (e) {
      toast({ title: "Export failed", description: String(e), variant: "destructive" });
    }
  };

  const handleSelectImport = async () => {
    try {
      const parsed = await window.electronAPI.selectAndParseBackup();
      if (parsed) setPendingImport(parsed);
    } catch (e) {
      toast({ title: "Could not read backup", description: String(e), variant: "destructive" });
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    const current = getStore();
    const childMap = new Map(current.children.map(c => [c.id, c]));
    pendingImport.children.forEach(c => childMap.set(c.id, c));
    setStore({
      children: [...childMap.values()],
      ratings: { ...current.ratings, ...pendingImport.ratings },
      stagnantNotes: { ...(current.stagnantNotes ?? {}), ...(pendingImport.stagnantNotes ?? {}) },
      acknowledgedStagnations: {
        ...(current.acknowledgedStagnations ?? {}),
        ...(pendingImport.acknowledgedStagnations ?? {}),
      },
    });
    setPendingImport(null);
    toast({ title: "Import complete", description: `Merged ${pendingImport.children.length} child record(s).` });
  };

  const handleMoveJournal = async () => {
    try {
      const newPath = await window.electronAPI.moveJournalFile();
      if (newPath) {
        setJournalPath(newPath);
        toast({ title: "Journal moved", description: `Now saved at: ${newPath}` });
      }
    } catch (e) {
      toast({ title: "Move failed", description: String(e), variant: "destructive" });
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    try {
      await window.electronAPI.restoreBackup(filename);
      // Reload the store from the restored database
      const restored = await window.electronAPI.loadAll();
      setStore(restored);
      await refreshBackups();
      toast({ title: "Backup restored", description: `Restored from: ${filename}` });
    } catch (e) {
      toast({ title: "Restore failed", description: String(e), variant: "destructive" });
    }
  };

  const handleDemoData = () => {
    if (isDemoLoaded()) {
      removeDemoData();
      toast({ title: "Demo data removed" });
    } else {
      seedDemoData();
      navigate("/");
      toast({ title: "Demo data loaded", description: "Six sample children added." });
    }
  };

  const handleResetAll = () => {
    resetAll();
    navigate("/");
    toast({ title: "All data cleared" });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your journal file and backups.</p>
      </div>

      {/* ── Storage ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            All data is saved to a single SQLite file on your computer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Active children</dt>
              <dd className="font-medium">{activeChildren}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Archived children</dt>
              <dd className="font-medium">{archivedChildren}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total ratings</dt>
              <dd className="font-medium">{totalRated.toLocaleString()}</dd>
            </div>
          </dl>
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground font-medium">Journal file</p>
            <p className="font-mono text-xs break-all bg-muted rounded px-2 py-1">{journalPath || "Loading…"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleMoveJournal}>
            Move journal file…
          </Button>
        </CardContent>
      </Card>

      {/* ── Backup & Restore ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Backup &amp; Restore</CardTitle>
          <CardDescription>
            The app automatically saves a backup each time it opens (rolling 10 kept). You can
            also export a manual copy or restore from any backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportBackup}>
              Export backup…
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectImport}>
              Import from backup…
            </Button>
          </div>

          {/* Rolling backup history */}
          <div>
            <p className="text-sm font-medium mb-2">
              Automatic backups{" "}
              <span className="text-muted-foreground font-normal">({backups.length} saved)</span>
            </p>
            {backupsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : backups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No automatic backups yet.</p>
            ) : (
              <ul className="divide-y rounded border text-sm">
                {backups.map(b => (
                  <li key={b.filename} className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="truncate font-mono text-xs">{b.filename}</span>
                    <span className="shrink-0 text-muted-foreground text-xs">{formatDate(b.mtime)}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs">
                          Restore
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore this backup?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will replace all current journal data with the backup from{" "}
                            <strong>{formatDate(b.mtime)}</strong>. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRestoreBackup(b.filename)}>
                            Restore
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Import confirmation dialog ──────────────────────────────────────── */}
      {pendingImport && (
        <AlertDialog open onOpenChange={open => { if (!open) setPendingImport(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm import</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p>
                    This backup contains{" "}
                    <strong>{pendingImport.children.length}</strong> child record(s) and{" "}
                    <strong>{Object.keys(pendingImport.ratings).length.toLocaleString()}</strong> ratings.
                  </p>
                  <p>
                    Existing records with matching IDs will be <strong>overwritten</strong>. New records
                    will be added. No data will be deleted.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingImport(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmImport}>Import</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ── Demo data ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
          <CardDescription>
            Load six sample children to explore the journal before adding real records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={handleDemoData}>
            {isDemoLoaded() ? "Remove demo data" : "Load demo data"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Danger zone ────────────────────────────────────────────────────── */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone. Export a backup first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Clear all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all journal data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all children, ratings, and notes from the journal
                  file. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleResetAll}
                >
                  Clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
