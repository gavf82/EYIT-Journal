import { StoreState, getStore, setStore } from "./store";
import { JOURNAL } from "../data/journal";

// ── Shared helper ───────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todaySlug() {
  return new Date().toISOString().slice(0, 10);
}

// ── Full-store JSON export (used by every Save button) ──────────────────────

export function exportCollectionJSON() {
  const store = getStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `eyit-backup-${todaySlug()}.json`);
}

// ── Full-store CSV export ───────────────────────────────────────────────────
// One row per rated item, with Child Name as the first column so data from
// multiple children can be filtered in a spreadsheet.

export function exportAllCSV() {
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
  triggerDownload(blob, `eyit-backup-${todaySlug()}.csv`);
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
