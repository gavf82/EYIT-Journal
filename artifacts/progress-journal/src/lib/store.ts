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

export interface Rating {
  status: Status;
  updatedAt: string;
}

export interface StoreState {
  children: Child[];
  ratings: Record<string, Rating>;
}

const STORE_KEY = 'eyit-journal-store';

const initialState: StoreState = {
  children: [],
  ratings: {},
};

export function getStore(): StoreState {
  try {
    const data = localStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : initialState;
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
    setStore({
      children: current.children.filter(c => c.id !== id),
      ratings: newRatings,
    });
  };

  const setRating = (key: string, status: Status) => {
    const current = getStore();
    const newRatings = { ...current.ratings };
    
    if (status === null) {
      delete newRatings[key];
    } else {
      newRatings[key] = {
        status,
        updatedAt: new Date().toISOString(),
      };
    }
    
    setStore({
      ...current,
      ratings: newRatings,
    });
  };

  return {
    state,
    addChild,
    updateChild,
    deleteChild,
    setRating,
    importData: (data: StoreState) => setStore(data),
    resetAll: () => setStore(initialState),
  };
}

export function getRatingKey(childId: string, areaIdx: number, strandIdx: number, stepIdx: number, itemKey: string) {
  return `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`;
}
