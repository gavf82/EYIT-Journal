import { useState, useRef } from "react";
import { useStore } from "../lib/store";
import { cn } from "../lib/utils";
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
import { Trash2, Download, Upload, FlaskConical, X, LogOut } from "lucide-react";
import { useDirty } from "../hooks/use-dirty";
import { useLocation } from "wouter";
import { seedDemoData, removeDemoData, isDemoLoaded, DEMO_CHILD_ID } from "../lib/seed";
import { exportCollectionJSON } from "../lib/export";

export default function SettingsPage() {
  const { state, resetAll, importData } = useStore();
  const { toast } = useToast();
  const { isDirty, markClean } = useDirty();
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(isDemoLoaded);

  async function exportAll() {
    if (await exportCollectionJSON()) markClean();
  }

  async function saveAndClose() {
    const saved = await exportCollectionJSON();
    if (!saved) return; // user cancelled the file picker
    resetAll();
    window.close();
    // window.close() only works when the tab was opened programmatically.
    // If the browser ignores it, let the user know the data has been cleared.
    toast({
      title: "Session ended",
      description: "Your backup is saved and all local data has been cleared. You can close this tab.",
    });
  }

  async function importAll(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.children) || typeof data.ratings !== "object") {
        throw new Error("File does not look like a journal backup.");
      }
      importData({ children: data.children, ratings: data.ratings });
      toast({ title: "Backup restored", description: "Your journals have been imported." });
    } catch (e: any) {
      toast({
        title: "Import failed",
        description: e?.message ?? "Could not read backup file.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
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
            Download a JSON file containing every child and every rating. Keep it safe —
            anyone with the file can restore your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            onClick={exportAll}
            className={cn("gap-2", isDirty && "bg-destructive/10 border border-destructive text-destructive hover:bg-destructive/20")}
            variant={isDirty ? "outline" : "default"}
            data-testid="button-export-all"
          >
            <Download className="h-4 w-4" /> Save all data
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importAll(f);
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            data-testid="button-import-all"
          >
            <Upload className="h-4 w-4" /> Restore from backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>End session</CardTitle>
          <CardDescription>
            Save a backup of all your data, clear everything from this browser, then close the
            tab. Use this at the end of each working session to ensure no personal data
            remains on the device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2"
            disabled={state.children.length === 0}
            onClick={saveAndClose}
            data-testid="button-save-and-close"
          >
            <LogOut className="h-4 w-4" /> Save and close
          </Button>
          {state.children.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              No data to save — add a child first.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
          <CardDescription>
            Load a sample child — Amelia Thompson, 18 months — with realistic ratings spanning
            from 8 months old, including stagnant entries to demonstrate the progression alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {demoLoaded ? (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(`/child/${DEMO_CHILD_ID}/summary`)}
              >
                <FlaskConical className="h-4 w-4" /> View Amelia's summary
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
                navigate(`/child/${DEMO_CHILD_ID}/summary`);
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
