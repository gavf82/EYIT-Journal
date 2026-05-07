/**
 * useCloudSync
 *
 * Bridges the local store with the cloud API when a user is signed in.
 *
 * Responsibilities:
 * - On sign-in: show disclaimer if not yet acknowledged, then proceed.
 * - On sign-in with NO local data: loads cloud data into localStorage.
 * - On sign-in WITH local data: prompts to upload.
 *   - Upload confirmed: local data is pushed to cloud, then cloud data loaded (now same).
 *   - Upload skipped: local data stays intact; subsequent writes sync to cloud.
 * - On sign-out: localStorage-only mode resumes (local data is preserved as-is).
 *
 * Usage: mount once near the root of the app (inside ClerkProvider).
 * Cloud writes are triggered by the store's custom event system.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/react";
import {
  fetchAllCloudData,
  uploadLocalDataToCloud,
  cloudCreateChild,
  cloudUpdateChild,
  cloudDeleteChild,
  cloudUpsertRatings,
} from "../lib/cloud-sync";
import { getStore, setStore } from "../lib/store";
import type { Child, Rating } from "../lib/store";

export type SyncStatus = "idle" | "loading" | "synced" | "error";

export interface CloudSyncState {
  status: SyncStatus;
  error: string | null;
}

const DISCLAIMER_KEY = "eyit-cloud-disclaimer-acked";

export function isDisclaimerAcknowledged(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) === "true";
  } catch {
    return false;
  }
}

export function acknowledgeDisclaimer() {
  try {
    localStorage.setItem(DISCLAIMER_KEY, "true");
  } catch { /* ignore */ }
}

let _cloudSyncEnabled = false;

/** Whether cloud sync is currently active (user signed in). */
export function isCloudSyncEnabled() {
  return _cloudSyncEnabled;
}

/**
 * Queue a ratings upsert for a child in the background.
 * Called from store mutation helpers when cloud sync is active.
 */
export function queueRatingsSync(childId: string, ratings: Record<string, Rating>) {
  if (!_cloudSyncEnabled) return;
  cloudUpsertRatings(childId, ratings).catch((err) => {
    console.error("[EYIT] Background ratings sync failed:", err);
  });
}

/**
 * Queue a child create in the background.
 */
export function queueChildCreate(child: Child) {
  if (!_cloudSyncEnabled) return;
  cloudCreateChild(child).catch((err) => {
    console.error("[EYIT] Background child create failed:", err);
  });
}

/**
 * Queue a child update in the background.
 */
export function queueChildUpdate(id: string, data: Partial<Omit<Child, "id">>) {
  if (!_cloudSyncEnabled) return;
  cloudUpdateChild(id, data).catch((err) => {
    console.error("[EYIT] Background child update failed:", err);
  });
}

/**
 * Queue a child delete in the background.
 */
export function queueChildDelete(id: string) {
  if (!_cloudSyncEnabled) return;
  cloudDeleteChild(id).catch((err) => {
    console.error("[EYIT] Background child delete failed:", err);
  });
}

export function useCloudSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [syncState, setSyncState] = useState<CloudSyncState>({ status: "idle", error: null });
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  const localDataRef = useRef<ReturnType<typeof getStore> | null>(null);
  // What to do after the disclaimer is acknowledged
  const pendingActionRef = useRef<"load" | "upload" | null>(null);

  const loadCloudData = useCallback(async () => {
    setSyncState({ status: "loading", error: null });
    try {
      const cloudData = await fetchAllCloudData();
      setStore({
        ...cloudData,
        stagnantNotes: {},
        acknowledgedStagnations: {},
      });
      setSyncState({ status: "synced", error: null });
    } catch (err) {
      console.error("[EYIT] Failed to load cloud data:", err);
      setSyncState({ status: "error", error: String(err) });
    }
  }, []);

  const handleUploadConfirmed = useCallback(async () => {
    setShowUploadPrompt(false);
    if (!localDataRef.current) return;
    setSyncState({ status: "loading", error: null });
    try {
      await uploadLocalDataToCloud(localDataRef.current);
      await loadCloudData();
    } catch (err) {
      console.error("[EYIT] Failed to upload local data:", err);
      setSyncState({ status: "error", error: String(err) });
    }
  }, [loadCloudData]);

  const handleUploadSkipped = useCallback(() => {
    // Keep local data intact — do NOT overwrite localStorage with cloud data.
    // Cloud sync is already enabled, so future writes will propagate to the cloud.
    setShowUploadPrompt(false);
    setSyncState({ status: "synced", error: null });
  }, []);

  const handleDisclaimerAcknowledged = useCallback(() => {
    acknowledgeDisclaimer();
    setShowDisclaimer(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action === "upload") {
      setShowUploadPrompt(true);
    } else if (action === "load") {
      loadCloudData();
    }
  }, [loadCloudData]);

  useEffect(() => {
    if (!isLoaded) return;

    const currentUserId = user?.id ?? null;

    // Sign-in transition
    if (isSignedIn && currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      _cloudSyncEnabled = true;

      // Check if there's local data to offer uploading
      const local = getStore();
      const hasLocal = local.children.length > 0;

      if (!isDisclaimerAcknowledged()) {
        // Show disclaimer first; defer the next action until acknowledged
        pendingActionRef.current = hasLocal ? "upload" : "load";
        if (hasLocal) localDataRef.current = local;
        setShowDisclaimer(true);
      } else if (hasLocal) {
        localDataRef.current = local;
        setShowUploadPrompt(true);
      } else {
        loadCloudData();
      }
    }

    // Sign-out transition
    if (!isSignedIn && lastUserIdRef.current !== null && lastUserIdRef.current !== undefined) {
      lastUserIdRef.current = null;
      _cloudSyncEnabled = false;
      setSyncState({ status: "idle", error: null });
      setShowDisclaimer(false);
      setShowUploadPrompt(false);
      pendingActionRef.current = null;
    }
  }, [isSignedIn, isLoaded, user?.id, loadCloudData]);

  return {
    syncState,
    showUploadPrompt,
    handleUploadConfirmed,
    handleUploadSkipped,
    showDisclaimer,
    handleDisclaimerAcknowledged,
  };
}
