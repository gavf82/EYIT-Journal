import { useState, useEffect } from 'react';
import { Status } from '../data/journal';

// ── Public types ─────────────────────────────────────────────────────────────

export interface Child {
  id: string;
  name: string;
  dob: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  /** 'active' (default) or 'archived' — archived children are hidden from the main list. */
  status?: 'active' | 'archived';
  /** ISO timestamp when the child was archived. */
  archivedAt?: string;
  /** True for children added by the built-in demo data loader. */
  isDemo?: boolean;
  /**
   * Step index (0-based) at which the practitioner began their baseline assessment.
   * Progress bars count from this step upward to the child's current age.
   * When absent, the floor auto-detects as the lowest step that has any rating.
   */
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

// ── Storage keys ─────────────────────────────────────────────────────────────

/** Top-level record: children list + last-export timestamp. */
const ROOT_KEY = 'eyit-journal-root';
/** Per-child record: ratings, notes, acknowledgments. */
const childKey = (id: string) => `eyit-journal-child-${id}`;
/** Legacy single-key format (v1). Migrated automatically on first load. */
const LEGACY_KEY = 'eyit-journal-store';

// ── Internal shapes ───────────────────────────────────────────────────────────

interface RootData {
  children: Child[];
  lastExportedAt?: string;
}

interface ChildData {
  ratings: Record<string, Rating>;
  stagnantNotes: Record<string, StagnantNote>;
  acknowledgedStagnations: Record<string, AcknowledgedEntry>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeAckedEntry(v: unknown): AcknowledgedEntry {
  if (typeof v === 'string') return { ackedAt: v, note: '' };
  if (typeof v === 'object' && v !== null && 'ackedAt' in v) {
    const obj = v as Record<string, unknown>;
    return {
      ackedAt: typeof obj.ackedAt === 'string' ? obj.ackedAt : new Date().toISOString(),
      note: typeof obj.note === 'string' ? obj.note : '',
    };
  }
  return { ackedAt: new Date().toISOString(), note: '' };
}

// ── Low-level storage I/O ─────────────────────────────────────────────────────

function loadRoot(): RootData {
  try {
    const raw = localStorage.getItem(ROOT_KEY);
    if (raw) return JSON.parse(raw) as RootData;
  } catch { /* ignore */ }
  return { children: [] };
}

function saveRoot(data: RootData) {
  try {
    localStorage.setItem(ROOT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[EYIT] Failed to save root', e);
  }
}

function loadChildData(childId: string): ChildData {
  try {
    const raw = localStorage.getItem(childKey(childId));
    if (!raw) return { ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} };
    const parsed = JSON.parse(raw) as {
      ratings?: Record<string, Rating>;
      stagnantNotes?: Record<string, StagnantNote>;
      acknowledgedStagnations?: Record<string, unknown>;
    };
    const rawAcked = parsed.acknowledgedStagnations ?? {};
    return {
      ratings: parsed.ratings ?? {},
      stagnantNotes: parsed.stagnantNotes ?? {},
      acknowledgedStagnations: Object.fromEntries(
        Object.entries(rawAcked).map(([k, v]) => [k, normalizeAckedEntry(v)])
      ),
    };
  } catch {
    return { ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} };
  }
}

function saveChildData(id: string, data: ChildData) {
  try {
    localStorage.setItem(childKey(id), JSON.stringify(data));
  } catch (e) {
    console.error('[EYIT] Failed to save child data', e);
  }
}

function removeChildData(id: string) {
  localStorage.removeItem(childKey(id));
}

/** Aggregate all per-child keys into a single StoreState. Used for export. */
function loadAll(): StoreState {
  const root = loadRoot();
  const ratings: Record<string, Rating> = {};
  const stagnantNotes: Record<string, StagnantNote> = {};
  const acknowledgedStagnations: Record<string, AcknowledgedEntry> = {};
  for (const child of root.children) {
    const cd = loadChildData(child.id);
    Object.assign(ratings, cd.ratings);
    Object.assign(stagnantNotes, cd.stagnantNotes);
    Object.assign(acknowledgedStagnations, cd.acknowledgedStagnations);
  }
  return { children: root.children, ratings, stagnantNotes, acknowledgedStagnations };
}

// ── One-time migration from legacy single-key format ──────────────────────────

let _migrationRun = false;

function migrateIfNeeded() {
  if (_migrationRun) return;
  _migrationRun = true;

  if (localStorage.getItem(ROOT_KEY)) return; // already on new format

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as {
      children?: Child[];
      ratings?: Record<string, Rating>;
      stagnantNotes?: Record<string, StagnantNote>;
      acknowledgedStagnations?: Record<string, unknown>;
    };
    const children: Child[] = parsed.children ?? [];
    const rawRatings = parsed.ratings ?? {};
    const rawNotes = parsed.stagnantNotes ?? {};
    const rawAcked = parsed.acknowledgedStagnations ?? {};

    saveRoot({ children });

    for (const child of children) {
      const p = `${child.id}::`;
      saveChildData(child.id, {
        ratings: Object.fromEntries(Object.entries(rawRatings).filter(([k]) => k.startsWith(p))),
        stagnantNotes: Object.fromEntries(Object.entries(rawNotes).filter(([k]) => k.startsWith(p))),
        acknowledgedStagnations: Object.fromEntries(
          Object.entries(rawAcked)
            .filter(([k]) => k.startsWith(p))
            .map(([k, v]) => [k, normalizeAckedEntry(v)])
        ),
      });
    }

    localStorage.removeItem(LEGACY_KEY);
    console.info('[EYIT] Migrated to per-child storage.');
  } catch (e) {
    console.error('[EYIT] Migration failed:', e);
  }
}

// ── Public getStore / setStore (used by sqlite.ts and settings) ───────────────

export function getStore(): StoreState {
  migrateIfNeeded();
  return loadAll();
}

/**
 * Write a full StoreState — used by SQLite import.
 * Optimised: writes root + per-child keys, removes orphaned child keys.
 */
export function setStore(state: StoreState) {
  try {
    migrateIfNeeded();

    const root = loadRoot();
    saveRoot({ ...root, children: state.children });

    const newIds = new Set(state.children.map((c) => c.id));

    // Remove orphaned child keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('eyit-journal-child-')) {
        const id = k.slice('eyit-journal-child-'.length);
        if (!newIds.has(id)) localStorage.removeItem(k);
      }
    }

    // Write per-child data
    for (const child of state.children) {
      const p = `${child.id}::`;
      saveChildData(child.id, {
        ratings: Object.fromEntries(Object.entries(state.ratings).filter(([k]) => k.startsWith(p))),
        stagnantNotes: Object.fromEntries(Object.entries(state.stagnantNotes ?? {}).filter(([k]) => k.startsWith(p))),
        acknowledgedStagnations: Object.fromEntries(Object.entries(state.acknowledgedStagnations ?? {}).filter(([k]) => k.startsWith(p))),
      });
    }

    window.dispatchEvent(new Event('eyit-store-change'));
  } catch (e) {
    console.error('[EYIT] Failed to save store', e);
  }
}

// ── Backup tracking ───────────────────────────────────────────────────────────

export function getLastExportedAt(): string | null {
  migrateIfNeeded();
  return loadRoot().lastExportedAt ?? null;
}

export function recordExport() {
  migrateIfNeeded();
  const root = loadRoot();
  saveRoot({ ...root, lastExportedAt: new Date().toISOString() });
  window.dispatchEvent(new Event('eyit-store-change'));
}

// ── useStore hook ─────────────────────────────────────────────────────────────

export function useStore() {
  const [state, setState] = useState<StoreState>(() => {
    migrateIfNeeded();
    return loadAll();
  });

  useEffect(() => {
    const reload = () => setState(loadAll());
    window.addEventListener('eyit-store-change', reload);
    window.addEventListener('storage', reload); // cross-tab
    return () => {
      window.removeEventListener('eyit-store-change', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const notify = () => window.dispatchEvent(new Event('eyit-store-change'));

  // ── Children ──────────────────────────────────────────────────────────────

  const addChild = (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChild: Child = {
      ...child,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveChildData(newChild.id, { ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} });
    const root = loadRoot();
    saveRoot({ ...root, children: [...root.children, newChild] });
    setState((prev) => ({ ...prev, children: [...prev.children, newChild] }));
    notify();
    return newChild;
  };

  const updateChild = (id: string, data: Partial<Omit<Child, 'id'>>) => {
    const root = loadRoot();
    const newChildren = root.children.map((c) =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    );
    saveRoot({ ...root, children: newChildren });
    setState((prev) => ({ ...prev, children: newChildren }));
    notify();
  };

  const deleteChild = (id: string) => {
    const root = loadRoot();
    const newChildren = root.children.filter((c) => c.id !== id);
    saveRoot({ ...root, children: newChildren });
    removeChildData(id);
    const p = `${id}::`;
    setState((prev) => ({
      children: newChildren,
      ratings: Object.fromEntries(Object.entries(prev.ratings).filter(([k]) => !k.startsWith(p))),
      stagnantNotes: Object.fromEntries(Object.entries(prev.stagnantNotes).filter(([k]) => !k.startsWith(p))),
      acknowledgedStagnations: Object.fromEntries(Object.entries(prev.acknowledgedStagnations).filter(([k]) => !k.startsWith(p))),
    }));
    notify();
  };

  // ── Ratings ───────────────────────────────────────────────────────────────

  const setRating = (key: string, status: Status) => {
    const childId = key.split('::')[0];
    const cd = loadChildData(childId);
    const newRatings = { ...cd.ratings };

    if (status === null) {
      delete newRatings[key];
    } else {
      const existing = newRatings[key];
      let history = existing?.history ?? [];
      if (existing?.status && existing.status !== status) {
        history = [...history, { status: existing.status, date: existing.updatedAt }];
      }
      newRatings[key] = {
        status,
        updatedAt: new Date().toISOString(),
        ...(history.length > 0 ? { history } : {}),
      };
    }

    // ⚡ Only write the one child's key — 50× smaller than the old whole-store write
    saveChildData(childId, { ...cd, ratings: newRatings });

    setState((prev) => {
      const allRatings = { ...prev.ratings };
      if (status === null) delete allRatings[key];
      else allRatings[key] = newRatings[key];
      return { ...prev, ratings: allRatings };
    });

    notify();
  };

  // ── Stagnant notes ────────────────────────────────────────────────────────

  const setStagnantNote = (key: string, note: StagnantNote | null) => {
    const childId = key.split('::')[0];
    const cd = loadChildData(childId);
    const newNotes = { ...cd.stagnantNotes };
    if (!note || note.text.trim() === '') {
      delete newNotes[key];
    } else {
      newNotes[key] = note;
    }
    saveChildData(childId, { ...cd, stagnantNotes: newNotes });
    setState((prev) => {
      const allNotes = { ...prev.stagnantNotes };
      if (!note || note.text.trim() === '') delete allNotes[key];
      else allNotes[key] = note;
      return { ...prev, stagnantNotes: allNotes };
    });
    notify();
  };

  // ── Acknowledgments ───────────────────────────────────────────────────────

  const setStagnationAcknowledged = (key: string, acknowledged: boolean, note?: string) => {
    const childId = key.split('::')[0];
    const cd = loadChildData(childId);
    const newAcked = { ...cd.acknowledgedStagnations };
    if (acknowledged) {
      newAcked[key] = { ackedAt: new Date().toISOString(), note: note ?? '' };
    } else {
      delete newAcked[key];
    }
    saveChildData(childId, { ...cd, acknowledgedStagnations: newAcked });
    setState((prev) => {
      const allAcked = { ...prev.acknowledgedStagnations };
      if (acknowledged) allAcked[key] = newAcked[key];
      else delete allAcked[key];
      return { ...prev, acknowledgedStagnations: allAcked };
    });
    notify();
  };

  // ── Bulk ops ──────────────────────────────────────────────────────────────

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

// ── Utility ───────────────────────────────────────────────────────────────────

export function getRatingKey(
  childId: string,
  areaIdx: number,
  strandIdx: number,
  stepIdx: number,
  itemKey: string,
) {
  return `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`;
}
