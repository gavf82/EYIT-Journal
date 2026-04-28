import { getStore } from "./store";
import { JOURNAL } from "../data/journal";
import { getImportHandle } from "./filehandle-store";

// ── Shared helpers ──────────────────────────────────────────────────────────

export function todaySlug() {
  return new Date().toISOString().slice(0, 10);
}

function fallbackDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Saves a blob, preferring the following approaches in order:
//   1. Write back to the file handle captured at import time (no dialog).
//   2. Show the native "Save As" picker (Chrome / Edge 86+).
//   3. Trigger an automatic download (Firefox / Safari fallback).
// Returns false only if the user explicitly cancelled a picker dialog.
export async function saveBlob(
  blob: Blob,
  filename: string,
  types: { description: string; accept: Record<string, string[]> }[],
): Promise<boolean> {
  // ── 1. Write back to the original imported file ──────────────────────────
  const importHandle = getImportHandle();
  if (importHandle) {
    try {
      const writable = await importHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch {
      // Permission may have been revoked or the file moved — fall through.
    }
  }

  // ── 2. "Save As" picker ──────────────────────────────────────────────────
  if ("showSaveFilePicker" in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types,
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return false;
      // Unexpected error — fall through to the download fallback
    }
  }

  // ── 3. Automatic download fallback ──────────────────────────────────────
  fallbackDownload(blob, filename);
  return true;
}

// ── Full-store CSV export ───────────────────────────────────────────────────
// One row per rated item, with Child Name as the first column so data from
// multiple children can be filtered in a spreadsheet.

export async function exportAllCSV(): Promise<boolean> {
  const store = getStore();

  const rows: string[][] = [
    [
      "Child Name",
      "Area",
      "Strand",
      "Step",
      "Age Range",
      "Item Key",
      "Statement",
      "Status",
      "Last Updated",
    ],
  ];

  store.children.forEach((child) => {
    JOURNAL.forEach((area, aIdx) => {
      area.strands.forEach((strand, sIdx) => {
        strand.steps.forEach((step, stIdx) => {
          if (!step.items || step.note) return;
          step.items.forEach((item) => {
            const key = `${child.id}::${aIdx}::${sIdx}::${stIdx}::${item.key}`;
            const rating = store.ratings[key];
            if (!rating) return;
            rows.push([
              `"${child.name}"`,
              `"${area.area}"`,
              `"${strand.name}"`,
              `"${step.title}"`,
              `"${step.ageRange}"`,
              `"${item.key}"`,
              `"${item.text.replace(/"/g, '""')}"`,
              `"${rating.status}"`,
              `"${new Date(rating.updatedAt).toLocaleDateString()}"`,
            ]);
          });
        });
      });
    });
  });

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  return saveBlob(blob, `eyit-backup-${todaySlug()}.csv`, [
    { description: "CSV spreadsheet", accept: { "text/csv": [".csv"] } },
  ]);
}

