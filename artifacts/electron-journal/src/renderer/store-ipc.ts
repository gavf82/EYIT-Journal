import { useState, useEffect } from "react";

// ── Types (same public surface as browser store.ts) ──────────────────────────

export type Status = null | "emerging" | "developing" | "secure";

export interface Child {
  id: string;
  name: string;
  dob: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  status?: "active" | "archived";
  archivedAt?: string;
  isDemo?: boolean;
  baselineStep?: number;
}

export interface HistoryEntry {
  status: Status;
  date: string;
}

export interface Rating {
  status: Status;
  updatedAt: string;
  history?: HistoryEntry[];
}

export interface StagnantNote {
  text: string;
  date: string;
}

export interface AcknowledgedEntry {
  ackedAt: string;
  note: string;
}

export interface StoreState {
  children: Child[];
  ratings: Record<string, Rating>;
  stagnantNotes: Record<string, StagnantNote>;
  acknowledgedStagnations: Record<string, AcknowledgedEntry>;
}

// ── In-memory cache ───────────────────────────────────────────────────────────

let _cache: StoreState | null = null;

/** Load initial state from the main process before rendering. */
export async function initFromElectron(): Promise<void> {
  const state = await window.electronAPI.loadAll();
  _cache = {
    children: state.children,
    ratings: state.ratings,
    stagnantNotes: state.stagnantNotes ?? {},
    acknowledgedStagnations: state.acknowledgedStagnations ?? {},
  };
}

/**
 * No-op: provided for API parity with the browser store.
 * Electron initialisation is done by initFromElectron() in main.tsx.
 */
export function initStore(): Promise<void> {
  return Promise.resolve();
}

export function getStore(): StoreState {
  return _cache ?? { children: [], ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} };
}

/** Bulk-replace the entire store (used by seed / import). */
export function setStore(state: StoreState): void {
  _cache = {
    children: state.children,
    ratings: state.ratings,
    stagnantNotes: state.stagnantNotes ?? {},
    acknowledgedStagnations: state.acknowledgedStagnations ?? {},
  };
  window.electronAPI
    .setFullStore(state)
    .catch(e => console.error("[EYIT] IPC setFullStore failed:", e));
  window.dispatchEvent(new Event("eyit-store-change"));
}

// ── Backup tracking (no-op in desktop — OS backups are managed by main) ───────

export function getLastExportedAt(): string | null {
  return null;
}

export function recordExport(): void {
  // The main process records exports; nothing to do in the renderer.
}

// ── Utility ───────────────────────────────────────────────────────────────────

export function getRatingKey(
  childId: string,
  areaIdx: number,
  strandIdx: number,
  stepIdx: number,
  itemKey: string,
): string {
  return `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`;
}

// ── useStore hook ─────────────────────────────────────────────────────────────

export function useStore() {
  const [state, setState] = useState<StoreState>(() => getStore());

  useEffect(() => {
    const reload = () => setState(getStore());
    window.addEventListener("eyit-store-change", reload);
    return () => window.removeEventListener("eyit-store-change", reload);
  }, []);

  const notify = () => window.dispatchEvent(new Event("eyit-store-change"));

  function childDataFromCache(childId: string): {
    ratings: Record<string, Rating>;
    stagnantNotes: Record<string, StagnantNote>;
    acknowledgedStagnations: Record<string, AcknowledgedEntry>;
  } {
    const p = `${childId}::`;
    return {
      ratings: Object.fromEntries(Object.entries(_cache!.ratings).filter(([k]) => k.startsWith(p))),
      stagnantNotes: Object.fromEntries(Object.entries(_cache!.stagnantNotes).filter(([k]) => k.startsWith(p))),
      acknowledgedStagnations: Object.fromEntries(
        Object.entries(_cache!.acknowledgedStagnations).filter(([k]) => k.startsWith(p)),
      ),
    };
  }

  // ── Children ────────────────────────────────────────────────────────────────

  const addChild = (child: Omit<Child, "id" | "createdAt" | "updatedAt">) => {
    const newChild: Child = {
      ...child,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _cache!.children = [..._cache!.children, newChild];
    window.electronAPI.upsertChild(newChild).catch(e => console.error("[EYIT] IPC upsertChild:", e));
    setState(prev => ({ ...prev, children: _cache!.children }));
    notify();
    return newChild;
  };

  const updateChild = (id: string, data: Partial<Omit<Child, "id">>) => {
    _cache!.children = _cache!.children.map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c,
    );
    const updated = _cache!.children.find(c => c.id === id)!;
    window.electronAPI.upsertChild(updated).catch(e => console.error("[EYIT] IPC upsertChild:", e));
    setState(prev => ({ ...prev, children: _cache!.children }));
    notify();
  };

  const deleteChild = (id: string) => {
    const p = `${id}::`;
    _cache!.children = _cache!.children.filter(c => c.id !== id);
    _cache!.ratings = Object.fromEntries(Object.entries(_cache!.ratings).filter(([k]) => !k.startsWith(p)));
    _cache!.stagnantNotes = Object.fromEntries(Object.entries(_cache!.stagnantNotes).filter(([k]) => !k.startsWith(p)));
    _cache!.acknowledgedStagnations = Object.fromEntries(
      Object.entries(_cache!.acknowledgedStagnations).filter(([k]) => !k.startsWith(p)),
    );
    window.electronAPI.deleteChild(id).catch(e => console.error("[EYIT] IPC deleteChild:", e));
    setState(() => ({ ..._cache! }));
    notify();
  };

  // ── Ratings ─────────────────────────────────────────────────────────────────

  const setRating = (key: string, status: Status) => {
    const childId = key.split("::")[0];

    let newRating: Rating | null = null;
    if (status !== null) {
      const existing = _cache!.ratings[key];
      let history = existing?.history ?? [];
      if (existing?.status && existing.status !== status) {
        history = [...history, { status: existing.status, date: existing.updatedAt }];
      }
      newRating = {
        status,
        updatedAt: new Date().toISOString(),
        ...(history.length > 0 ? { history } : {}),
      };
    }

    if (newRating === null) {
      delete _cache!.ratings[key];
    } else {
      _cache!.ratings[key] = newRating;
    }

    window.electronAPI
      .setRating(key, newRating)
      .catch(e => console.error("[EYIT] IPC setRating:", e));

    setState(prev => {
      const ratings = { ...prev.ratings };
      if (newRating === null) delete ratings[key];
      else ratings[key] = newRating;
      return { ...prev, ratings };
    });
    notify();
  };

  // ── Stagnant notes ──────────────────────────────────────────────────────────

  const setStagnantNote = (key: string, note: StagnantNote | null) => {
    if (!note || note.text.trim() === "") {
      delete _cache!.stagnantNotes[key];
    } else {
      _cache!.stagnantNotes[key] = note;
    }
    // Send null when empty so the main process runs DELETE instead of upsert
    const ipcNote = (!note || note.text.trim() === "") ? null : note;
    window.electronAPI
      .setStagnantNote(key, ipcNote)
      .catch(e => console.error("[EYIT] IPC setStagnantNote:", e));
    setState(prev => {
      const stagnantNotes = { ...prev.stagnantNotes };
      if (!note || note.text.trim() === "") delete stagnantNotes[key];
      else stagnantNotes[key] = note;
      return { ...prev, stagnantNotes };
    });
    notify();
  };

  // ── Acknowledged stagnations ────────────────────────────────────────────────

  const setStagnationAcknowledged = (key: string, acknowledged: boolean, note?: string) => {
    const entry = acknowledged ? { ackedAt: new Date().toISOString(), note: note ?? "" } : null;
    if (acknowledged && entry) {
      _cache!.acknowledgedStagnations[key] = entry;
    } else {
      delete _cache!.acknowledgedStagnations[key];
    }
    window.electronAPI
      .setStagnationAcknowledged(key, entry)
      .catch(e => console.error("[EYIT] IPC setStagnationAcknowledged:", e));
    setState(prev => {
      const acknowledgedStagnations = { ...prev.acknowledgedStagnations };
      if (acknowledged && entry) acknowledgedStagnations[key] = entry;
      else delete acknowledgedStagnations[key];
      return { ...prev, acknowledgedStagnations };
    });
    notify();
  };

  // ── Bulk ops ────────────────────────────────────────────────────────────────

  const importData = (data: StoreState) =>
    setStore({
      ...data,
      stagnantNotes: data.stagnantNotes ?? {},
      acknowledgedStagnations: data.acknowledgedStagnations ?? {},
    });

  const resetAll = () =>
    setStore({ children: [], ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} });

  return {
    state,
    addChild,
    updateChild,
    deleteChild,
    setRating,
    setStagnantNote,
    setStagnationAcknowledged,
    importData,
    resetAll,
  };
}
