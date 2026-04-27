import { StoreState, getStore, setStore } from "./store";
import { JOURNAL } from "../data/journal";

// ── Shared helpers ──────────────────────────────────────────────────────────

function todaySlug() {
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

// Opens the native OS "Save As" dialog when the browser supports it
// (Chrome / Edge 86+). Falls back to an automatic download on Firefox / Safari.
// Returns false if the user cancelled the dialog, true on success.
async function saveBlob(
  blob: Blob,
  filename: string,
  types: { description: string; accept: Record<string, string[]> }[],
): Promise<boolean> {
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
  fallbackDownload(blob, filename);
  return true;
}

// ── Full-store JSON export (used by every Save button) ──────────────────────

export async function exportCollectionJSON(): Promise<boolean> {
  const store = getStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], {
    type: "application/json",
  });
  return saveBlob(blob, `eyit-backup-${todaySlug()}.json`, [
    { description: "JSON backup", accept: { "application/json": [".json"] } },
  ]);
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

// ── Import (unchanged) ──────────────────────────────────────────────────────

export async function importJournalJSON(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as StoreState & {
          child?: unknown;
          ratings?: unknown;
        };

        // Support both full-store format {children, ratings}
        // and legacy single-child format {child, ratings}
        const currentStore = getStore();

        if (data.children && Array.isArray(data.children)) {
          // Full store format — merge children and ratings
          const childMap = new Map(
            currentStore.children.map((c) => [c.id, c]),
          );
          (data.children as StoreState["children"]).forEach((c) => {
            childMap.set(c.id, c);
          });
          const newRatings = {
            ...currentStore.ratings,
            ...(data.ratings as StoreState["ratings"]),
          };
          setStore({ children: [...childMap.values()], ratings: newRatings });
          resolve(true);
        } else if (
          data.child &&
          typeof data.child === "object" &&
          data.ratings
        ) {
          // Legacy single-child format
          const child = data.child as StoreState["children"][0];
          if (!child.id) throw new Error("Invalid journal file format");
          const idx = currentStore.children.findIndex((c) => c.id === child.id);
          const newChildren = [...currentStore.children];
          if (idx >= 0) newChildren[idx] = child;
          else newChildren.push(child);
          const newRatings = {
            ...currentStore.ratings,
            ...(data.ratings as StoreState["ratings"]),
          };
          setStore({ children: newChildren, ratings: newRatings });
          resolve(true);
        } else {
          throw new Error("Invalid file format");
        }
      } catch (err) {
        console.error("Failed to parse JSON file", err);
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
