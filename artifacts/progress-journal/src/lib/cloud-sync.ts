/**
 * Cloud sync helpers.
 *
 * When a user is signed in their journal data is read from and written to the
 * API server.  When signed out the existing localStorage path is used unchanged.
 *
 * Key design decisions:
 * - The cloud is the source of truth for signed-in users.
 * - On first sign-in we offer to upload existing local data.
 * - Every mutation is fired-and-forgotten in the background; failures are
 *   surfaced via the returned error state rather than blocking the UI.
 */

import { type Child, type Rating, type StoreState } from "./store";

const BASE = "/api";

// ── Low-level fetch helpers ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${options.method ?? "GET"} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Cloud read ────────────────────────────────────────────────────────────────

interface ApiChild {
  id: string;
  name: string;
  dob: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  archivedAt?: string | null;
  baselineStep?: number | null;
  isDemo?: boolean | null;
}

function apiChildToLocal(c: ApiChild): Child {
  return {
    id: c.id,
    name: c.name,
    dob: c.dob,
    startDate: c.startDate,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    status: (c.status as Child["status"]) ?? "active",
    archivedAt: c.archivedAt ?? undefined,
    baselineStep: c.baselineStep ?? undefined,
    isDemo: c.isDemo ?? undefined,
  };
}

export async function fetchCloudChildren(): Promise<Child[]> {
  const data = await apiFetch<ApiChild[]>("/children");
  return data.map(apiChildToLocal);
}

export async function fetchCloudRatings(
  childId: string,
): Promise<Record<string, Rating>> {
  return apiFetch<Record<string, Rating>>(`/children/${childId}/ratings`);
}

export async function fetchAllCloudData(): Promise<StoreState> {
  const children = await fetchCloudChildren();
  const ratings: Record<string, Rating> = {};
  await Promise.all(
    children.map(async (child) => {
      const childRatings = await fetchCloudRatings(child.id);
      Object.assign(ratings, childRatings);
    }),
  );
  return {
    children,
    ratings,
    stagnantNotes: {},
    acknowledgedStagnations: {},
  };
}

// ── Cloud write ───────────────────────────────────────────────────────────────

export async function cloudCreateChild(child: Child): Promise<Child> {
  const data = await apiFetch<ApiChild>("/children", {
    method: "POST",
    body: JSON.stringify({
      id: child.id,
      name: child.name,
      dob: child.dob,
      startDate: child.startDate,
      status: child.status ?? "active",
      archivedAt: child.archivedAt ?? null,
      baselineStep: child.baselineStep ?? null,
      isDemo: child.isDemo ?? null,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
    }),
  });
  return apiChildToLocal(data);
}

export async function cloudUpdateChild(
  id: string,
  data: Partial<Omit<Child, "id">>,
): Promise<void> {
  await apiFetch(`/children/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function cloudDeleteChild(id: string): Promise<void> {
  await apiFetch(`/children/${id}`, { method: "DELETE" });
}

export async function cloudUpsertRatings(
  childId: string,
  ratings: Record<string, Rating>,
): Promise<void> {
  await apiFetch(`/children/${childId}/ratings`, {
    method: "PUT",
    body: JSON.stringify(ratings),
  });
}

// ── Bulk upload (first sign-in) ───────────────────────────────────────────────

export async function uploadLocalDataToCloud(
  state: StoreState,
): Promise<void> {
  for (const child of state.children) {
    await cloudCreateChild(child);
    const childRatings = Object.fromEntries(
      Object.entries(state.ratings).filter(([k]) => k.startsWith(`${child.id}::`)),
    );
    if (Object.keys(childRatings).length > 0) {
      await cloudUpsertRatings(child.id, childRatings);
    }
  }
}
