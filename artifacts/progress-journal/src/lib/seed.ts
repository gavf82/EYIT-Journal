import { JOURNAL } from "../data/journal";
import { getStore, setStore, getRatingKey, type Rating } from "./store";

export const DEMO_CHILD_ID = "demo-amelia-thompson-001";

function iso(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day, 10, 0, 0).toISOString();
}

export function isDemoLoaded(): boolean {
  return getStore().children.some((c) => c.id === DEMO_CHILD_ID);
}

export function removeDemoData(): void {
  const store = getStore();
  const children = store.children.filter((c) => c.id !== DEMO_CHILD_ID);
  const ratings: Record<string, Rating> = {};
  Object.entries(store.ratings).forEach(([k, v]) => {
    if (!k.startsWith(DEMO_CHILD_ID + "::")) ratings[k] = v;
  });
  setStore({ children, ratings });
}

export function seedDemoData(): void {
  removeDemoData();

  const store = getStore();
  const ratings: Record<string, Rating> = { ...store.ratings };

  function rate(
    aIdx: number,
    sIdx: number,
    stIdx: number,
    itemKey: string,
    status: "emerging" | "developing" | "secure",
    date: string,
  ) {
    ratings[getRatingKey(DEMO_CHILD_ID, aIdx, sIdx, stIdx, itemKey)] = {
      status,
      updatedAt: date,
    };
  }

  // For each strand we apply a pattern across four step windows:
  //   stIdx 3  →  Step 4  (6-10 months)   — rated late 2025, mostly Secure
  //   stIdx 4  →  Step 5  (9-13 months)   — some still Emerging/Developing from Jul-Aug 2025
  //                                          (8-9 months ago → STAGNANT)
  //   stIdx 5  →  Step 6  (12-16 months)  — rated Nov-Jan, mix of all statuses
  //   stIdx 6  →  Step 7  (15-19 months)  — sparse, Emerging, recent
  //   stIdx 7  →  Step 8  (18-22 months)  — barely started (current step)
  //
  // Dates chosen so that stagnation (>6 months, still E/D) fires for stIdx 4 items.

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      // ── stIdx 3 (6-10 months) — established history, mostly Secure ──────
      const s3 = strand.steps[3];
      if (s3?.items && !s3.note) {
        const items = s3.items;
        items.forEach((item, i) => {
          if (i < Math.ceil(items.length * 0.75))
            rate(aIdx, sIdx, 3, item.key, "secure", iso(2025, 11, 10));
          else
            rate(aIdx, sIdx, 3, item.key, "developing", iso(2025, 11, 10));
        });
      }

      // ── stIdx 4 (9-13 months) — STAGNATION ZONE ─────────────────────────
      // 25% Secure (progressed), 35% Developing (stale Jul 2025), 20% Emerging
      // (stale Aug 2025), 20% unrated
      const s4 = strand.steps[4];
      if (s4?.items && !s4.note) {
        const items = s4.items;
        const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.25))
            rate(aIdx, sIdx, 4, item.key, "secure", iso(2025, 12, 1));
          else if (i < Math.floor(n * 0.60))
            rate(aIdx, sIdx, 4, item.key, "developing", iso(2025, 7, 20)); // 9 mo ago
          else if (i < Math.floor(n * 0.80))
            rate(aIdx, sIdx, 4, item.key, "emerging", iso(2025, 8, 5));  // 8 mo ago
          // rest unrated
        });
      }

      // ── stIdx 5 (12-16 months) — progressing, recent dates ───────────────
      const s5 = strand.steps[5];
      if (s5?.items && !s5.note) {
        const items = s5.items;
        const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.35))
            rate(aIdx, sIdx, 5, item.key, "secure", iso(2026, 2, 8));
          else if (i < Math.floor(n * 0.65))
            rate(aIdx, sIdx, 5, item.key, "developing", iso(2026, 1, 14));
          else if (i < Math.floor(n * 0.80))
            rate(aIdx, sIdx, 5, item.key, "emerging", iso(2025, 12, 5));
        });
      }

      // ── stIdx 6 (15-19 months) — sparse, starting to engage ─────────────
      const s6 = strand.steps[6];
      if (s6?.items && !s6.note) {
        const items = s6.items;
        const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.30))
            rate(aIdx, sIdx, 6, item.key, "emerging", iso(2026, 2, 25));
          else if (i < Math.floor(n * 0.45))
            rate(aIdx, sIdx, 6, item.key, "developing", iso(2026, 3, 10));
        });
      }

      // ── stIdx 7 (18-22 months) — just beginning, 1-2 items ──────────────
      const s7 = strand.steps[7];
      if (s7?.items && !s7.note) {
        const items = s7.items;
        if (items.length > 0)
          rate(aIdx, sIdx, 7, items[0].key, "emerging", iso(2026, 4, 1));
      }
    });
  });

  // ── Area-specific overrides to add variety ──────────────────────────────

  // PSED / BUILDING RELATIONSHIPS (aIdx 0, sIdx 2): strong — no stagnation
  const brStrand = JOURNAL[0]?.strands[2];
  if (brStrand) {
    [4, 5, 6].forEach((stIdx) => {
      brStrand.steps[stIdx]?.items?.forEach((item) => {
        rate(0, 2, stIdx, item.key, "secure", iso(2026, 1, 20));
      });
    });
  }

  // Communication / LISTENING AND ATTENTION (aIdx 1, sIdx 0): very good progress
  const listenStrand = JOURNAL[1]?.strands[0];
  if (listenStrand) {
    [3, 4, 5, 6].forEach((stIdx) => {
      listenStrand.steps[stIdx]?.items?.forEach((item, i) => {
        const status = stIdx < 5 ? "secure" : i < 2 ? "developing" : "emerging";
        rate(1, 0, stIdx, item.key, status as "secure" | "developing" | "emerging", iso(2026, 2, 14));
      });
    });
  }

  // Mathematics (aIdx 4): minimal engagement — only 1-2 items rated at current step
  JOURNAL[4]?.strands.forEach((strand, sIdx) => {
    [3, 4, 5].forEach((stIdx) => {
      // Clear generic ratings for this area
      strand.steps[stIdx]?.items?.forEach((item) => {
        delete ratings[getRatingKey(DEMO_CHILD_ID, 4, sIdx, stIdx, item.key)];
      });
    });
    // Rate just a couple at step 5 (12-16 months)
    const items = strand.steps[5]?.items;
    if (items && items.length > 0) {
      rate(4, sIdx, 5, items[0].key, "emerging", iso(2026, 3, 20));
    }
  });

  // Literacy / WORD READING (aIdx 3, sIdx 1): has a gap (0-3 then 21-25+)
  // An 18-month-old has no current step — clear any accidental ratings
  JOURNAL[3]?.strands[1]?.steps.forEach((step, stIdx) => {
    step.items?.forEach((item) => {
      delete ratings[getRatingKey(DEMO_CHILD_ID, 3, 1, stIdx, item.key)];
    });
  });

  setStore({
    children: [
      ...store.children,
      {
        id: DEMO_CHILD_ID,
        name: "Amelia Thompson",
        dob: "2024-10-15",
        startDate: "2025-06-01",
        createdAt: iso(2025, 6, 1),
        updatedAt: iso(2026, 4, 1),
      },
    ],
    ratings,
  });
}
