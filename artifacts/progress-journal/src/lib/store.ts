import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import { useState, useEffect } from 'react';
import { Status } from '../data/journal';

// ── Public types ──────────────────────────────────────────────────────────────

export interface Child {
  id: string;
  name: string;
  dob: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'archived';
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

// ── Storage keys ──────────────────────────────────────────────────────────────

const ROOT_KEY = 'eyit-journal-root';
const childKey = (id: string) => `eyit-journal-child-${id}`;
const LEGACY_KEY = 'eyit-journal-store';
const IDB_NAME = 'eyit-journal';
const IDB_KV = 'kv' as const;

// ── IndexedDB schema ──────────────────────────────────────────────────────────

interface EyitJournalDB extends DBSchema {
  kv: {
    key: string;
    value: string;
  };
}

// ── IndexedDB helpers ─────────────────────────────────────────────────────────

let _idb: Promise<IDBPDatabase<EyitJournalDB>> | null = null;

function getIDB(): Promise<IDBPDatabase<EyitJournalDB>> {
  if (!_idb) {
    _idb = openDB<EyitJournalDB>(IDB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(IDB_KV);
      },
    });
  }
  return _idb;
}

async function kvGet(key: string): Promise<string | undefined> {
  const db = await getIDB();
  return db.get(IDB_KV, key);
}

async function kvSet(key: string, value: string): Promise<void> {
  const db = await getIDB();
  await db.put(IDB_KV, value, key);
}

async function kvDelete(key: string): Promise<void> {
  const db = await getIDB();
  await db.delete(IDB_KV, key);
}

async function kvGetAllKeys(): Promise<string[]> {
  const db = await getIDB();
  return db.getAllKeys(IDB_KV);
}

// ── In-memory cache ───────────────────────────────────────────────────────────

let _cache: StoreState | null = null;
let _lastExportedAt: string | undefined;

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

function parseRootData(raw: string | undefined): RootData {
  if (!raw) return { children: [] };
  try { return JSON.parse(raw) as RootData; } catch { return { children: [] }; }
}

function parseChildData(raw: string | undefined): ChildData {
  if (!raw) return { ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} };
  try {
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

// ── Fire-and-forget IDB writes ─────────────────────────────────────────────────

function saveRootAsync(data: RootData): void {
  kvSet(ROOT_KEY, JSON.stringify(data)).catch(e =>
    console.error('[EYIT] Failed to save root to IDB', e)
  );
}

function saveChildAsync(id: string, data: ChildData): void {
  kvSet(childKey(id), JSON.stringify(data)).catch(e =>
    console.error('[EYIT] Failed to save child data to IDB', e)
  );
}

function deleteChildAsync(id: string): void {
  kvDelete(childKey(id)).catch(e =>
    console.error('[EYIT] Failed to delete child from IDB', e)
  );
}

// ── One-time migration from localStorage ───────────────────────────────────────

async function migrateFromLocalStorageIfNeeded(): Promise<void> {
  // If IDB already has root data, migration is already done.
  const existing = await kvGet(ROOT_KEY);
  if (existing) return;

  // Current per-child localStorage format
  const rootRaw = localStorage.getItem(ROOT_KEY);
  if (rootRaw) {
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('eyit-journal')) keysToMigrate.push(k);
    }
    const db = await getIDB();
    const tx = db.transaction(IDB_KV, 'readwrite');
    for (const k of keysToMigrate) {
      const v = localStorage.getItem(k);
      if (v) tx.store.put(v, k);
    }
    await tx.done;
    keysToMigrate.forEach(k => localStorage.removeItem(k));
    console.info('[EYIT] Migrated existing data to IndexedDB.');
    return;
  }

  // Legacy single-key format (v1)
  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return;

  try {
    const parsed = JSON.parse(legacyRaw) as {
      children?: Child[];
      ratings?: Record<string, Rating>;
      stagnantNotes?: Record<string, StagnantNote>;
      acknowledgedStagnations?: Record<string, unknown>;
    };
    const children: Child[] = parsed.children ?? [];
    const rawRatings = parsed.ratings ?? {};
    const rawNotes = parsed.stagnantNotes ?? {};
    const rawAcked = parsed.acknowledgedStagnations ?? {};

    const db = await getIDB();
    const tx = db.transaction(IDB_KV, 'readwrite');
    tx.store.put(JSON.stringify({ children }), ROOT_KEY);
    for (const child of children) {
      const p = `${child.id}::`;
      const childData: ChildData = {
        ratings: Object.fromEntries(Object.entries(rawRatings).filter(([k]) => k.startsWith(p))),
        stagnantNotes: Object.fromEntries(Object.entries(rawNotes).filter(([k]) => k.startsWith(p))),
        acknowledgedStagnations: Object.fromEntries(
          Object.entries(rawAcked)
            .filter(([k]) => k.startsWith(p))
            .map(([k, v]) => [k, normalizeAckedEntry(v)])
        ),
      };
      tx.store.put(JSON.stringify(childData), childKey(child.id));
    }
    await tx.done;
    localStorage.removeItem(LEGACY_KEY);
    console.info('[EYIT] Migrated legacy format to IndexedDB.');
  } catch (e) {
    console.error('[EYIT] Legacy migration failed:', e);
  }
}

// ── Async initialisation ──────────────────────────────────────────────────────

let _initPromise: Promise<void> | null = null;

export async function initStore(): Promise<void> {
  if (_cache !== null) return;
  if (_initPromise) return _initPromise;
  _initPromise = _doInit();
  return _initPromise;
}

async function _doInit(): Promise<void> {
  await migrateFromLocalStorageIfNeeded();

  const rootRaw = await kvGet(ROOT_KEY);
  const root = parseRootData(rootRaw);
  _lastExportedAt = root.lastExportedAt;

  const ratings: Record<string, Rating> = {};
  const stagnantNotes: Record<string, StagnantNote> = {};
  const acknowledgedStagnations: Record<string, AcknowledgedEntry> = {};

  for (const child of root.children) {
    const raw = await kvGet(childKey(child.id));
    const cd = parseChildData(raw);
    Object.assign(ratings, cd.ratings);
    Object.assign(stagnantNotes, cd.stagnantNotes);
    Object.assign(acknowledgedStagnations, cd.acknowledgedStagnations);
  }

  _cache = { children: root.children, ratings, stagnantNotes, acknowledgedStagnations };
}

// ── Public getStore / setStore ─────────────────────────────────────────────────

export function getStore(): StoreState {
  return _cache ?? { children: [], ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} };
}

export function setStore(state: StoreState) {
  _cache = {
    children: state.children,
    ratings: state.ratings,
    stagnantNotes: state.stagnantNotes ?? {},
    acknowledgedStagnations: state.acknowledgedStagnations ?? {},
  };
  _writeFullStoreAsync(state).catch(e =>
    console.error('[EYIT] Failed to write full store to IDB', e)
  );
  window.dispatchEvent(new Event('eyit-store-change'));
}

async function _writeFullStoreAsync(state: StoreState): Promise<void> {
  await kvSet(ROOT_KEY, JSON.stringify({
    children: state.children,
    lastExportedAt: _lastExportedAt,
  }));

  // Remove orphaned child keys
  const newIds = new Set(state.children.map(c => c.id));
  const allKeys = await kvGetAllKeys();
  const PREFIX = 'eyit-journal-child-';
  const orphaned = allKeys.filter(k => k.startsWith(PREFIX) && !newIds.has(k.slice(PREFIX.length)));
  await Promise.all(orphaned.map(k => kvDelete(k)));

  // Write per-child data
  await Promise.all(state.children.map(child => {
    const p = `${child.id}::`;
    const childData: ChildData = {
      ratings: Object.fromEntries(Object.entries(state.ratings).filter(([k]) => k.startsWith(p))),
      stagnantNotes: Object.fromEntries(Object.entries(state.stagnantNotes ?? {}).filter(([k]) => k.startsWith(p))),
      acknowledgedStagnations: Object.fromEntries(Object.entries(state.acknowledgedStagnations ?? {}).filter(([k]) => k.startsWith(p))),
    };
    return kvSet(childKey(child.id), JSON.stringify(childData));
  }));
}

// ── Backup tracking ───────────────────────────────────────────────────────────

export function getLastExportedAt(): string | null {
  return _lastExportedAt ?? null;
}

export function recordExport(): void {
  _lastExportedAt = new Date().toISOString();
  kvSet(ROOT_KEY, JSON.stringify({
    children: _cache?.children ?? [],
    lastExportedAt: _lastExportedAt,
  })).catch(e => console.error('[EYIT] Failed to record export in IDB', e));
  window.dispatchEvent(new Event('eyit-store-change'));
}

// ── useStore hook ──────────────────────────────────────────────────────────────

export function useStore() {
  // By the time any component renders, initStore() has been awaited in App.tsx,
  // so _cache is guaranteed to be non-null.
  const [state, setState] = useState<StoreState>(() => getStore());

  useEffect(() => {
    const reload = () => setState(getStore());
    window.addEventListener('eyit-store-change', reload);
    window.addEventListener('storage', reload); // cross-tab
    return () => {
      window.removeEventListener('eyit-store-change', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const notify = () => window.dispatchEvent(new Event('eyit-store-change'));

  // Returns all data for a given child from the cache
  function childDataFromCache(childId: string): ChildData {
    const p = `${childId}::`;
    return {
      ratings: Object.fromEntries(Object.entries(_cache!.ratings).filter(([k]) => k.startsWith(p))),
      stagnantNotes: Object.fromEntries(Object.entries(_cache!.stagnantNotes).filter(([k]) => k.startsWith(p))),
      acknowledgedStagnations: Object.fromEntries(Object.entries(_cache!.acknowledgedStagnations).filter(([k]) => k.startsWith(p))),
    };
  }

  // ── Children ──────────────────────────────────────────────────────────────

  const addChild = (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChild: Child = {
      ...child,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _cache!.children = [..._cache!.children, newChild];
    saveRootAsync({ children: _cache!.children, lastExportedAt: _lastExportedAt });
    saveChildAsync(newChild.id, { ratings: {}, stagnantNotes: {}, acknowledgedStagnations: {} });
    setState(prev => ({ ...prev, children: _cache!.children }));
    notify();
    return newChild;
  };

  const updateChild = (id: string, data: Partial<Omit<Child, 'id'>>) => {
    _cache!.children = _cache!.children.map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    );
    saveRootAsync({ children: _cache!.children, lastExportedAt: _lastExportedAt });
    setState(prev => ({ ...prev, children: _cache!.children }));
    notify();
  };

  const deleteChild = (id: string) => {
    const p = `${id}::`;
    _cache!.children = _cache!.children.filter(c => c.id !== id);
    _cache!.ratings = Object.fromEntries(Object.entries(_cache!.ratings).filter(([k]) => !k.startsWith(p)));
    _cache!.stagnantNotes = Object.fromEntries(Object.entries(_cache!.stagnantNotes).filter(([k]) => !k.startsWith(p)));
    _cache!.acknowledgedStagnations = Object.fromEntries(Object.entries(_cache!.acknowledgedStagnations).filter(([k]) => !k.startsWith(p)));
    saveRootAsync({ children: _cache!.children, lastExportedAt: _lastExportedAt });
    deleteChildAsync(id);
    setState(() => ({ ..._cache! }));
    notify();
  };

  // ── Ratings ───────────────────────────────────────────────────────────────

  const setRating = (key: string, status: Status) => {
    const childId = key.split('::')[0];

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

    saveChildAsync(childId, childDataFromCache(childId));

    setState(prev => {
      const ratings = { ...prev.ratings };
      if (newRating === null) delete ratings[key];
      else ratings[key] = newRating;
      return { ...prev, ratings };
    });
    notify();
  };

  // ── Stagnant notes ────────────────────────────────────────────────────────

  const setStagnantNote = (key: string, note: StagnantNote | null) => {
    const childId = key.split('::')[0];
    if (!note || note.text.trim() === '') {
      delete _cache!.stagnantNotes[key];
    } else {
      _cache!.stagnantNotes[key] = note;
    }
    saveChildAsync(childId, childDataFromCache(childId));
    setState(prev => {
      const stagnantNotes = { ...prev.stagnantNotes };
      if (!note || note.text.trim() === '') delete stagnantNotes[key];
      else stagnantNotes[key] = note;
      return { ...prev, stagnantNotes };
    });
    notify();
  };

  // ── Acknowledgments ───────────────────────────────────────────────────────

  const setStagnationAcknowledged = (key: string, acknowledged: boolean, note?: string) => {
    const childId = key.split('::')[0];
    if (acknowledged) {
      _cache!.acknowledgedStagnations[key] = { ackedAt: new Date().toISOString(), note: note ?? '' };
    } else {
      delete _cache!.acknowledgedStagnations[key];
    }
    saveChildAsync(childId, childDataFromCache(childId));
    setState(prev => {
      const acknowledgedStagnations = { ...prev.acknowledgedStagnations };
      if (acknowledged) acknowledgedStagnations[key] = _cache!.acknowledgedStagnations[key];
      else delete acknowledgedStagnations[key];
      return { ...prev, acknowledgedStagnations };
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
): string {
  return `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`;
}
