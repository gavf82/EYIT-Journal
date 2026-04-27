import { Child, Rating, StoreState, getStore } from "./store";
import { JOURNAL } from "../data/journal";

// ── Collection export ──────────────────────────────────────────────────────

export function exportCollectionJSON() {
  const store = getStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `eyit-collection-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJournalJSON(childId: string) {
  const store = getStore();
  const child = store.children.find(c => c.id === childId);
  if (!child) return;

  const prefix = `${childId}::`;
  const ratings = Object.fromEntries(
    Object.entries(store.ratings).filter(([k]) => k.startsWith(prefix))
  );

  const data = { child, ratings };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `eyit-journal-${child.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJournalCSV(childId: string) {
  const store = getStore();
  const child = store.children.find(c => c.id === childId);
  if (!child) return;

  const prefix = `${childId}::`;
  
  const rows = [
    ["Area", "Strand", "Step", "Age Range", "Item Key", "Statement", "Status", "Last Updated"]
  ];

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      strand.steps.forEach((step, stIdx) => {
        if (!step.items) return;
        step.items.forEach(item => {
          const key = `${childId}::${aIdx}::${sIdx}::${stIdx}::${item.key}`;
          const rating = store.ratings[key];
          if (rating) {
             rows.push([
               `"${area.area}"`,
               `"${strand.name}"`,
               `"${step.title}"`,
               `"${step.ageRange}"`,
               `"${item.key}"`,
               `"${item.text.replace(/"/g, '""')}"`,
               `"${rating.status}"`,
               `"${new Date(rating.updatedAt).toLocaleDateString()}"`
             ]);
          }
        });
      });
    });
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `eyit-journal-${child.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJournalJSON(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.child || !data.child.id || !data.ratings) {
          throw new Error("Invalid journal file format");
        }
        
        const currentStore = getStore();
        
        // Add or update child
        const childIndex = currentStore.children.findIndex(c => c.id === data.child.id);
        let newChildren = [...currentStore.children];
        if (childIndex >= 0) {
          newChildren[childIndex] = data.child;
        } else {
          newChildren.push(data.child);
        }

        // Merge ratings
        const newRatings = { ...currentStore.ratings, ...data.ratings };
        
        localStorage.setItem('eyit-journal-store', JSON.stringify({
          children: newChildren,
          ratings: newRatings
        }));
        
        window.dispatchEvent(new Event('eyit-store-change'));
        resolve(true);
      } catch (err) {
        console.error("Failed to parse JSON file", err);
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
