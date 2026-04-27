import { useState } from "react";
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
import { Trash2, Download, Upload } from "lucide-react";
import { useDirty } from "../hooks/use-dirty";
import { useRef } from "react";

export default function SettingsPage() {
  const { state, resetAll, importData } = useStore();
  const { toast } = useToast();
  const { isDirty, markClean } = useDirty();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function exportAll() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eyit-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    markClean();
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
