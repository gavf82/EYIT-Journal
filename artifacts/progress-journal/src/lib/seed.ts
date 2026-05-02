import { JOURNAL } from "../data/journal";
import { getStore, setStore, getRatingKey, type Child, type Rating, type HistoryEntry } from "./store";

// ── IDs ───────────────────────────────────────────────────────────────────────

export const DEMO_CHILD_ID = "demo-amelia-thompson-001";

// ── Helpers ───────────────────────────────────────────────────────────────────

function iso(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day, 10, 0, 0).toISOString();
}

// ── Public API ────────────────────────────────────────────────────────────────

/** True if a child record is from the demo data loader (current or legacy format). */
function isDemoChild(c: { id: string; isDemo?: boolean }): boolean {
  return !!c.isDemo || c.id.startsWith("demo-");
}

export function isDemoLoaded(): boolean {
  return getStore().children.some(isDemoChild);
}

export function removeDemoData(): void {
  const store = getStore();
  const demoIds = new Set(store.children.filter(isDemoChild).map((c) => c.id));
  // Nothing to remove — return without touching the store.
  if (demoIds.size === 0) return;

  const children = store.children.filter((c) => !isDemoChild(c));

  const stripDemo = (record: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(record).filter(
        ([k]) => !Array.from(demoIds).some((id) => k.startsWith(id + "::"))
      )
    );

  setStore({
    children,
    ratings: stripDemo(store.ratings) as Record<string, Rating>,
    stagnantNotes: stripDemo(store.stagnantNotes ?? {}) as Record<string, never>,
    acknowledgedStagnations: stripDemo(store.acknowledgedStagnations ?? {}) as Record<string, never>,
  });
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export function seedDemoData(): void {
  removeDemoData();

  const store = getStore();
  const ratings: Record<string, Rating> = { ...store.ratings };

  function rate(
    childId: string,
    aIdx: number,
    sIdx: number,
    stIdx: number,
    itemKey: string,
    status: "emerging" | "developing" | "secure",
    date: string,
    history?: HistoryEntry[],
  ) {
    ratings[getRatingKey(childId, aIdx, sIdx, stIdx, itemKey)] = {
      status,
      updatedAt: date,
      ...(history && history.length > 0 ? { history } : {}),
    };
  }

  // ── Child 1: Amelia Thompson ─────────────────────────────────────────────
  // Active · DOB 15 Oct 2024 · started Jun 2025 · ~18 months
  // Rich data with stagnation alerts at step 4.

  const A = DEMO_CHILD_ID;
  const AE1 = iso(2025, 7, 20);  const AD3 = iso(2025, 9, 15);
  const AD4 = iso(2025, 10, 5);  const AS3 = iso(2025, 11, 10);
  const AS4 = iso(2025, 12, 1);  const AE2 = iso(2025, 12, 5);
  const AD5 = iso(2026, 1, 14);  const AS5 = iso(2026, 2, 8);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      const s3 = strand.steps[3];
      if (s3?.items && !s3.note) {
        const n = s3.items.length; const sc = Math.ceil(n * 0.75);
        s3.items.forEach((item, i) => {
          if (i < sc) {
            rate(A, aIdx, sIdx, 3, item.key, "secure", AS3,
              i % 2 === 0 ? [{ status: "emerging", date: AE1 }, { status: "developing", date: AD3 }] : []);
          } else { rate(A, aIdx, sIdx, 3, item.key, "developing", AS3); }
        });
      }
      const s4 = strand.steps[4];
      if (s4?.items && !s4.note) {
        const items = s4.items; const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.25)) {
            rate(A, aIdx, sIdx, 4, item.key, "secure", AS4,
              [{ status: "emerging", date: AE1 }, { status: "developing", date: AD4 }]);
          } else if (i < Math.floor(n * 0.60)) {
            rate(A, aIdx, sIdx, 4, item.key, "developing", iso(2025, 7, 20));
          } else if (i < Math.floor(n * 0.80)) {
            rate(A, aIdx, sIdx, 4, item.key, "emerging", iso(2025, 8, 5));
          }
        });
      }
      const s5 = strand.steps[5];
      if (s5?.items && !s5.note) {
        const items = s5.items; const n = items.length;
        items.forEach((item, i) => {
          if (i < Math.floor(n * 0.35)) {
            rate(A, aIdx, sIdx, 5, item.key, "secure", AS5,
              [{ status: "emerging", date: AE2 }, { status: "developing", date: AD5 }]);
          } else if (i < Math.floor(n * 0.65)) {
            rate(A, aIdx, sIdx, 5, item.key, "developing", AD5,
              i < Math.floor(n * 0.50) ? [{ status: "emerging", date: AE2 }] : []);
          } else if (i < Math.floor(n * 0.80)) {
            rate(A, aIdx, sIdx, 5, item.key, "emerging", AE2);
          }
        });
      }
      const s6 = strand.steps[6];
      if (s6?.items && !s6.note) {
        const n = s6.items.length;
        s6.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.30)) rate(A, aIdx, sIdx, 6, item.key, "emerging",   iso(2026, 2, 25));
          else if (i < Math.floor(n * 0.45)) rate(A, aIdx, sIdx, 6, item.key, "developing", iso(2026, 3, 10));
        });
      }
      const s7 = strand.steps[7];
      if (s7?.items && !s7.note && s7.items.length > 0) {
        rate(A, aIdx, sIdx, 7, s7.items[0].key, "emerging", iso(2026, 4, 1));
      }
    });
  });
  // Area overrides for Amelia
  const ameliaBR = JOURNAL[0]?.strands[2];
  if (ameliaBR) {
    [4, 5, 6].forEach((stIdx) => {
      ameliaBR.steps[stIdx]?.items?.forEach((item, i) => {
        let hist: HistoryEntry[] = [];
        if (stIdx === 4) hist = [{ status: "emerging", date: AE1 }, { status: "developing", date: AD4 }];
        else if (stIdx === 5) hist = [{ status: "emerging", date: AE2 }, { status: "developing", date: AD5 }];
        else if (stIdx === 6 && i % 2 === 0) hist = [{ status: "emerging", date: iso(2026, 2, 25) }];
        rate(A, 0, 2, stIdx, item.key, "secure", iso(2026, 1, 20), hist);
      });
    });
  }
  const ameliaLA = JOURNAL[1]?.strands[0];
  if (ameliaLA) {
    [3, 4, 5, 6].forEach((stIdx) => {
      ameliaLA.steps[stIdx]?.items?.forEach((item, i) => {
        if (stIdx < 5) {
          rate(A, 1, 0, stIdx, item.key, "secure", iso(2026, 2, 14),
            [{ status: "emerging", date: AE1 }, { status: "developing", date: AD3 }]);
        } else {
          const st = i < 2 ? "developing" : "emerging";
          rate(A, 1, 0, stIdx, item.key, st as "developing" | "emerging", iso(2026, 2, 14),
            st === "developing" ? [{ status: "emerging", date: AE2 }] : []);
        }
      });
    });
  }
  JOURNAL[4]?.strands.forEach((strand, sIdx) => {
    [3, 4, 5].forEach((stIdx) => strand.steps[stIdx]?.items?.forEach((item) => {
      delete ratings[getRatingKey(A, 4, sIdx, stIdx, item.key)];
    }));
    const items = strand.steps[5]?.items;
    if (items && items.length > 0) rate(A, 4, sIdx, 5, items[0].key, "emerging", iso(2026, 3, 20));
  });
  JOURNAL[3]?.strands[1]?.steps.forEach((step, stIdx) => {
    step.items?.forEach((item) => { delete ratings[getRatingKey(A, 3, 1, stIdx, item.key)]; });
  });

  // ── Child 2: Oliver Patel ────────────────────────────────────────────────
  // Active · DOB 5 Jan 2023 · ~3 yrs 4 months · broad, confident progress

  const O = "demo-oliver-patel-001";
  const OE1 = iso(2025, 3, 10); const OD1 = iso(2025, 5, 15); const OS1 = iso(2025, 8, 20);
  const OE2 = iso(2025, 9, 1);  const OD2 = iso(2025, 11, 12); const OS2 = iso(2026, 1, 8);
  const OE3 = iso(2026, 2, 15); const OD3 = iso(2026, 4, 10);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      [8, 9].forEach((stIdx) => {
        const step = strand.steps[stIdx];
        if (!step?.items || step.note) return;
        const n = step.items.length;
        step.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.8)) {
            rate(O, aIdx, sIdx, stIdx, item.key, "secure", OS1,
              [{ status: "emerging", date: OE1 }, { status: "developing", date: OD1 }]);
          } else {
            rate(O, aIdx, sIdx, stIdx, item.key, "developing", OD1,
              [{ status: "emerging", date: OE1 }]);
          }
        });
      });
      const s10 = strand.steps[10];
      if (s10?.items && !s10.note) {
        const n = s10.items.length;
        s10.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.5)) {
            rate(O, aIdx, sIdx, 10, item.key, "secure", OS2,
              [{ status: "emerging", date: OE2 }, { status: "developing", date: OD2 }]);
          } else if (i < Math.floor(n * 0.75)) {
            rate(O, aIdx, sIdx, 10, item.key, "developing", OD2,
              [{ status: "emerging", date: OE2 }]);
          } else if (i < Math.floor(n * 0.9)) {
            rate(O, aIdx, sIdx, 10, item.key, "emerging", OE3);
          }
        });
      }
      const s11 = strand.steps[11];
      if (s11?.items && !s11.note) {
        const n = s11.items.length;
        s11.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.35)) {
            rate(O, aIdx, sIdx, 11, item.key, "developing", OD3,
              [{ status: "emerging", date: OE3 }]);
          } else if (i < Math.floor(n * 0.55)) {
            rate(O, aIdx, sIdx, 11, item.key, "emerging", OE3);
          }
        });
      }
    });
  });

  // ── Child 3: Sofia Okafor ────────────────────────────────────────────────
  // Active · DOB 20 Aug 2024 · ~20 months · early journal, gentle progress

  const S = "demo-sofia-okafor-001";
  const SE1 = iso(2025, 3, 5);  const SD1 = iso(2025, 6, 20); const SS1 = iso(2025, 9, 10);
  const SE2 = iso(2025, 10, 15); const SD2 = iso(2026, 1, 8);  const SE3 = iso(2026, 3, 20);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      const s5 = strand.steps[5];
      if (s5?.items && !s5.note) {
        const n = s5.items.length;
        s5.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.7)) {
            rate(S, aIdx, sIdx, 5, item.key, "secure", SS1,
              [{ status: "emerging", date: SE1 }, { status: "developing", date: SD1 }]);
          } else { rate(S, aIdx, sIdx, 5, item.key, "developing", SD1); }
        });
      }
      const s6 = strand.steps[6];
      if (s6?.items && !s6.note) {
        const n = s6.items.length;
        s6.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.4)) {
            rate(S, aIdx, sIdx, 6, item.key, "secure", SD2,
              [{ status: "emerging", date: SE2 }, { status: "developing", date: SD2 }]);
          } else if (i < Math.floor(n * 0.7)) {
            rate(S, aIdx, sIdx, 6, item.key, "developing", SD2,
              [{ status: "emerging", date: SE2 }]);
          } else if (i < Math.floor(n * 0.9)) {
            rate(S, aIdx, sIdx, 6, item.key, "emerging", SE3);
          }
        });
      }
      const s7 = strand.steps[7];
      if (s7?.items && !s7.note && s7.items.length > 0) {
        rate(S, aIdx, sIdx, 7, s7.items[0].key, "emerging", SE3);
      }
    });
  });

  // ── Child 4: Jacob Williams ──────────────────────────────────────────────
  // Archived · DOB 10 Mar 2021 · left the setting Jan 2025 · not stale

  const J = "demo-jacob-williams-001";
  const JE1 = iso(2023, 4, 12); const JD1 = iso(2023, 7, 20); const JS1 = iso(2023, 10, 5);
  const JE2 = iso(2024, 1, 15); const JD2 = iso(2024, 4, 18); const JS2 = iso(2024, 8, 22);
  const JLAST = iso(2024, 12, 10);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      [9, 10, 11].forEach((stIdx) => {
        const step = strand.steps[stIdx];
        if (!step?.items || step.note) return;
        const n = step.items.length;
        step.items.forEach((item, i) => {
          if (stIdx === 9) {
            if (i < Math.floor(n * 0.85)) {
              rate(J, aIdx, sIdx, 9, item.key, "secure", JS1,
                [{ status: "emerging", date: JE1 }, { status: "developing", date: JD1 }]);
            }
          } else if (stIdx === 10) {
            if (i < Math.floor(n * 0.6)) {
              rate(J, aIdx, sIdx, 10, item.key, "secure", JS2,
                [{ status: "emerging", date: JE2 }, { status: "developing", date: JD2 }]);
            } else if (i < Math.floor(n * 0.85)) {
              rate(J, aIdx, sIdx, 10, item.key, "developing", JD2);
            }
          } else if (stIdx === 11) {
            if (i < Math.floor(n * 0.4)) {
              rate(J, aIdx, sIdx, 11, item.key, "developing", JLAST,
                [{ status: "emerging", date: JE2 }]);
            } else if (i < Math.floor(n * 0.6)) {
              rate(J, aIdx, sIdx, 11, item.key, "emerging", JLAST);
            }
          }
        });
      });
    });
  });

  // ── Child 5: Emma Chen ───────────────────────────────────────────────────
  // Archived · STALE · DOB 15 Sep 2018 · last updated Mar 2021 (5 yrs ago)

  const E = "demo-emma-chen-001";
  const EE1 = iso(2020, 9, 10); const ED1 = iso(2020, 11, 15);
  const ES1 = iso(2021, 1, 20);  const ELAST = iso(2021, 3, 5);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      [8, 9].forEach((stIdx) => {
        const step = strand.steps[stIdx];
        if (!step?.items || step.note) return;
        const n = step.items.length;
        step.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.6)) {
            rate(E, aIdx, sIdx, stIdx, item.key, "secure", ES1,
              [{ status: "emerging", date: EE1 }, { status: "developing", date: ED1 }]);
          } else if (i < Math.floor(n * 0.85)) {
            rate(E, aIdx, sIdx, stIdx, item.key, "developing", ELAST);
          }
        });
      });
    });
  });

  // ── Child 6: Lucas Brown ─────────────────────────────────────────────────
  // Archived · STALE · DOB 2 May 2019 · last updated Oct 2020 (5+ yrs ago)

  const L = "demo-lucas-brown-001";
  const LE1 = iso(2020, 4, 8); const LD1 = iso(2020, 6, 15);
  const LLAST = iso(2020, 10, 3);

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      [5, 6].forEach((stIdx) => {
        const step = strand.steps[stIdx];
        if (!step?.items || step.note) return;
        const n = step.items.length;
        step.items.forEach((item, i) => {
          if (i < Math.floor(n * 0.5)) {
            rate(L, aIdx, sIdx, stIdx, item.key, "secure", LD1,
              [{ status: "emerging", date: LE1 }]);
          } else if (i < Math.floor(n * 0.75)) {
            rate(L, aIdx, sIdx, stIdx, item.key, "developing", LLAST);
          }
        });
      });
    });
  });

  // ── Commit ────────────────────────────────────────────────────────────────

  const demoChildren: Child[] = [
    {
      id: DEMO_CHILD_ID,
      name: "Amelia Thompson",
      dob: "2024-10-15",
      startDate: "2025-06-01",
      createdAt: iso(2025, 6, 1),
      updatedAt: iso(2026, 4, 1),
      isDemo: true,
    },
    {
      id: O,
      name: "Oliver Patel",
      dob: "2023-01-05",
      startDate: "2023-01-10",
      createdAt: iso(2023, 1, 10),
      updatedAt: iso(2026, 4, 10),
      isDemo: true,
    },
    {
      id: S,
      name: "Sofia Okafor",
      dob: "2024-08-20",
      startDate: "2025-01-06",
      createdAt: iso(2025, 1, 6),
      updatedAt: iso(2026, 3, 20),
      isDemo: true,
    },
    {
      id: J,
      name: "Jacob Williams",
      dob: "2021-03-10",
      startDate: "2021-09-01",
      createdAt: iso(2021, 9, 1),
      updatedAt: iso(2025, 1, 8),
      status: "archived",
      archivedAt: iso(2025, 1, 8),
      isDemo: true,
    },
    {
      id: E,
      name: "Emma Chen",
      dob: "2018-09-15",
      startDate: "2018-09-24",
      createdAt: iso(2018, 9, 24),
      updatedAt: iso(2021, 3, 5),
      status: "archived",
      archivedAt: iso(2021, 3, 5),
      isDemo: true,
    },
    {
      id: L,
      name: "Lucas Brown",
      dob: "2019-05-02",
      startDate: "2019-05-10",
      createdAt: iso(2019, 5, 10),
      updatedAt: iso(2020, 10, 3),
      status: "archived",
      archivedAt: iso(2020, 10, 3),
      isDemo: true,
    },
  ];

  setStore({
    children: [...store.children, ...demoChildren],
    ratings,
    stagnantNotes: store.stagnantNotes ?? {},
    acknowledgedStagnations: store.acknowledgedStagnations ?? {},
  });
}
