import { JOURNAL } from "../data/journal";
import { getStore, setStore, getRatingKey, type Rating, type HistoryEntry } from "./store";

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
    history?: HistoryEntry[],
  ) {
    ratings[getRatingKey(DEMO_CHILD_ID, aIdx, sIdx, stIdx, itemKey)] = {
      status,
      updatedAt: date,
      ...(history && history.length > 0 ? { history } : {}),
    };
  }

  // ── Timeline for Amelia Thompson (DOB 15 Oct 2024, started June 2025) ──────
  //
  // stIdx 3  Step 4  (6-10 months)   — well established; ~half the Secure items
  //                                    show a full E → D → S trail.
  // stIdx 4  Step 5  (9-13 months)   — stagnation zone; all Secure items carry
  //                                    E → D → S history, the stuck Developing
  //                                    items have no history (first observation
  //                                    still Developing).
  // stIdx 5  Step 6  (12-16 months)  — active progress; Secure items get E→D→S,
  //                                    first half of Developing items get E→D.
  // stIdx 6  Step 7  (15-19 months)  — sparse / recent; no history yet.
  // stIdx 7  Step 8  (18-22 months)  — just beginning.
  //
  // Progressive history dates used below:
  //   E_EARLY = Jul 20 2025  (first observation at ~9 months)
  //   D_MID3  = Sep 15 2025  (stIdx 3 developing milestone)
  //   D_MID4  = Oct 05 2025  (stIdx 4 developing milestone)
  //   S_3     = Nov 10 2025  (stIdx 3 secure)
  //   S_4     = Dec 01 2025  (stIdx 4 secure)
  //   E_LATE  = Dec 05 2025  (stIdx 5 first observation at ~14 months)
  //   D_LATE  = Jan 14 2026  (stIdx 5 developing milestone)
  //   S_5     = Feb 08 2026  (stIdx 5 secure)

  const E_EARLY = iso(2025, 7, 20);
  const D_MID3  = iso(2025, 9, 15);
  const D_MID4  = iso(2025, 10, 5);
  const S_3     = iso(2025, 11, 10);
  const S_4     = iso(2025, 12, 1);
  const E_LATE  = iso(2025, 12, 5);
  const D_LATE  = iso(2026, 1, 14);
  const S_5     = iso(2026, 2, 8);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {

      // ── stIdx 3 (6-10 months) — mostly Secure, ~half with E→D→S trail ────
      const s3 = strand.steps[3];
      if (s3?.items && !s3.note) {
        const items = s3.items;
        const secureCount = Math.ceil(items.length * 0.75);
        items.forEach((item, i) => {
          if (i < secureCount) {
            // Alternate: even indices carry the full progression trail
            const hist: HistoryEntry[] = i % 2 === 0
              ? [{ status: "emerging", date: E_EARLY }, { status: "developing", date: D_MID3 }]
              : [];
            rate(aIdx, sIdx, 3, item.key, "secure", S_3, hist);
          } else {
            rate(aIdx, sIdx, 3, item.key, "developing", S_3);
          }
        });
      }

      // ── stIdx 4 (9-13 months) — STAGNATION ZONE ─────────────────────────
      // Secure items (25%) all carry E→D→S — they made it through.
      // Developing items (35%) are stale since Jul 2025 — first observation was
      // already Developing, no prior emerging observation recorded.
      // Emerging items (20%) stale since Aug 2025.
      const s4 = strand.steps[4];
      if (s4?.items && !s4.note) {
        const items = s4.items;
        const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.25)) {
            rate(aIdx, sIdx, 4, item.key, "secure", S_4, [
              { status: "emerging",   date: E_EARLY },
              { status: "developing", date: D_MID4  },
            ]);
          } else if (i < Math.floor(n * 0.60)) {
            // Stuck at Developing since July — no prior emerging noted
            rate(aIdx, sIdx, 4, item.key, "developing", iso(2025, 7, 20));
          } else if (i < Math.floor(n * 0.80)) {
            rate(aIdx, sIdx, 4, item.key, "emerging", iso(2025, 8, 5));
          }
          // rest unrated
        });
      }

      // ── stIdx 5 (12-16 months) — progressing with clear trail ────────────
      // Secure items all show E(Dec) → D(Jan) → S(Feb).
      // First half of Developing items show E(Dec) → D(Jan) progression.
      const s5 = strand.steps[5];
      if (s5?.items && !s5.note) {
        const items = s5.items;
        const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.35)) {
            rate(aIdx, sIdx, 5, item.key, "secure", S_5, [
              { status: "emerging",   date: E_LATE },
              { status: "developing", date: D_LATE },
            ]);
          } else if (i < Math.floor(n * 0.65)) {
            const hist: HistoryEntry[] = i < Math.floor(n * 0.50)
              ? [{ status: "emerging", date: E_LATE }]
              : [];
            rate(aIdx, sIdx, 5, item.key, "developing", D_LATE, hist);
          } else if (i < Math.floor(n * 0.80)) {
            rate(aIdx, sIdx, 5, item.key, "emerging", E_LATE);
          }
        });
      }

      // ── stIdx 6 (15-19 months) — sparse, recent, no history yet ─────────
      const s6 = strand.steps[6];
      if (s6?.items && !s6.note) {
        const items = s6.items;
        const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.30))
            rate(aIdx, sIdx, 6, item.key, "emerging",   iso(2026, 2, 25));
          else if (i < Math.floor(n * 0.45))
            rate(aIdx, sIdx, 6, item.key, "developing", iso(2026, 3, 10));
        });
      }

      // ── stIdx 7 (18-22 months) — just beginning ──────────────────────────
      const s7 = strand.steps[7];
      if (s7?.items && !s7.note) {
        const items = s7.items;
        if (items.length > 0)
          rate(aIdx, sIdx, 7, items[0].key, "emerging", iso(2026, 4, 1));
      }
    });
  });

  // ── Area-specific overrides ──────────────────────────────────────────────

  // PSED / BUILDING RELATIONSHIPS (aIdx 0, sIdx 2): strong progress — all
  // Secure across steps 4-6, with full E→D→S trails on earlier steps.
  const brStrand = JOURNAL[0]?.strands[2];
  if (brStrand) {
    [4, 5, 6].forEach((stIdx) => {
      brStrand.steps[stIdx]?.items?.forEach((item, i) => {
        let hist: HistoryEntry[] = [];
        if (stIdx === 4) {
          hist = [{ status: "emerging", date: E_EARLY }, { status: "developing", date: D_MID4 }];
        } else if (stIdx === 5) {
          hist = [{ status: "emerging", date: E_LATE }, { status: "developing", date: D_LATE }];
        } else if (stIdx === 6 && i % 2 === 0) {
          hist = [{ status: "emerging", date: iso(2026, 2, 25) }];
        }
        rate(0, 2, stIdx, item.key, "secure", iso(2026, 1, 20), hist);
      });
    });
  }

  // Communication / LISTENING AND ATTENTION (aIdx 1, sIdx 0): excellent —
  // steps 3-4 all Secure with full trail, steps 5-6 still in progress.
  const listenStrand = JOURNAL[1]?.strands[0];
  if (listenStrand) {
    [3, 4, 5, 6].forEach((stIdx) => {
      listenStrand.steps[stIdx]?.items?.forEach((item, i) => {
        if (stIdx < 5) {
          rate(1, 0, stIdx, item.key, "secure", iso(2026, 2, 14), [
            { status: "emerging",   date: E_EARLY },
            { status: "developing", date: D_MID3  },
          ]);
        } else {
          const status = i < 2 ? "developing" : "emerging";
          const hist: HistoryEntry[] = status === "developing"
            ? [{ status: "emerging", date: E_LATE }]
            : [];
          rate(1, 0, stIdx, item.key, status as "developing" | "emerging", iso(2026, 2, 14), hist);
        }
      });
    });
  }

  // Mathematics (aIdx 4): minimal engagement — only 1-2 items at step 5.
  JOURNAL[4]?.strands.forEach((strand, sIdx) => {
    [3, 4, 5].forEach((stIdx) => {
      strand.steps[stIdx]?.items?.forEach((item) => {
        delete ratings[getRatingKey(DEMO_CHILD_ID, 4, sIdx, stIdx, item.key)];
      });
    });
    const items = strand.steps[5]?.items;
    if (items && items.length > 0) {
      rate(4, sIdx, 5, items[0].key, "emerging", iso(2026, 3, 20));
    }
  });

  // Literacy / WORD READING (aIdx 3, sIdx 1): no current step for 18 months.
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
