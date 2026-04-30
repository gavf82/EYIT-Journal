import { useState, useEffect } from 'react';
import { Status } from '../data/journal';

export interface Child {
  id: string;
  name: string;
  dob: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  status: Status;
  date: string;
}

export interface Rating {
  status: Status;
  updatedAt: string;
  /** Prior states in chronological order, oldest first. The current state is
   *  represented by `status` + `updatedAt`; history holds everything before it. */
  history?: HistoryEntry[];
}

/** Per-strand practitioner note attached to a stagnation alert. */
export interface StagnantNote {
  text: string;
  /** ISO date string "YYYY-MM-DD" — the date of entry written by the practitioner. */
  date: string;
}

export interface StoreState {
  children: Child[];
  ratings: Record<string, Rating>;
  /** key: `${childId}::${areaName}::${strandName}` */
  stagnantNotes: Record<string, StagnantNote>;
}

const STORE_KEY = 'eyit-journal-store';

const initialState: StoreState = {
  children: [],
  ratings: {},
  stagnantNotes: {},
};

export function getStore(): StoreState {
  try {
    const data = localStorage.getItem(STORE_KEY);
    const parsed = data ? JSON.parse(data) : initialState;
    // Backward compat: stagnantNotes was added after initial release.
    return { ...initialState, ...parsed, stagnantNotes: parsed.stagnantNotes ?? {} };
  } catch (e) {
    console.error('Failed to load store', e);
    return initialState;
  }
}

export function setStore(state: StoreState) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('eyit-store-change'));
  } catch (e) {
    console.error('Failed to save store', e);
  }
}

export function useStore() {
  const [state, setState] = useState<StoreState>(getStore());

  useEffect(() => {
    const handleStorage = () => {
      setState(getStore());
    };
    window.addEventListener('eyit-store-change', handleStorage);
    window.addEventListener('storage', handleStorage); // Handle cross-tab
    return () => {
      window.removeEventListener('eyit-store-change', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const addChild = (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => {
    const current = getStore();
    const newChild: Child = {
      ...child,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStore({
      ...current,
      children: [...current.children, newChild],
    });
    return newChild;
  };

  const updateChild = (id: string, data: Partial<Omit<Child, 'id'>>) => {
    const current = getStore();
    setStore({
      ...current,
      children: current.children.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c),
    });
  };

  const deleteChild = (id: string) => {
    const current = getStore();
    const prefix = `${id}::`;
    const newRatings = Object.fromEntries(
      Object.entries(current.ratings).filter(([k]) => !k.startsWith(prefix))
    );
    const newNotes = Object.fromEntries(
      Object.entries(current.stagnantNotes ?? {}).filter(([k]) => !k.startsWith(prefix))
    );
    setStore({
      children: current.children.filter(c => c.id !== id),
      ratings: newRatings,
      stagnantNotes: newNotes,
    });
  };

  const setRating = (key: string, status: Status) => {
    const current = getStore();
    const newRatings = { ...current.ratings };

    if (status === null) {
      delete newRatings[key];
    } else {
      const existing = newRatings[key];
      let history = existing?.history ?? [];
      if (existing && existing.status && existing.status !== status) {
        history = [...history, { status: existing.status, date: existing.updatedAt }];
      }
      newRatings[key] = {
        status,
        updatedAt: new Date().toISOString(),
        ...(history.length > 0 ? { history } : {}),
      };
    }
    
    setStore({
      ...current,
      ratings: newRatings,
    });
  };

  const setStagnantNote = (key: string, note: StagnantNote | null) => {
    const current = getStore();
    const notes = { ...(current.stagnantNotes ?? {}) };
    if (note === null || note.text.trim() === "") {
      delete notes[key];
    } else {
      notes[key] = note;
    }
    setStore({ ...current, stagnantNotes: notes });
  };

  return {
    state,
    addChild,
    updateChild,
    deleteChild,
    setRating,
    setStagnantNote,
    importData: (data: StoreState) => setStore({ ...initialState, ...data, stagnantNotes: data.stagnantNotes ?? {} }),
    resetAll: () => setStore(initialState),
  };
}

export function getRatingKey(childId: string, areaIdx: number, strandIdx: number, stepIdx: number, itemKey: string) {
  return `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`;
}
