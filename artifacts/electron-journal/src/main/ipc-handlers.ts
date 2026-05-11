import { ipcMain, dialog } from "electron";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Child, Rating, StagnantNote, AcknowledgedEntry, StoreState } from "../types";
import * as db from "./db";
import { openDatabaseReadOnly } from "./db";
import { listBackups, restoreBackup } from "./backups";

export interface IpcContext {
  getJournalPath(): string;
  setJournalPath(p: string): void;
  getDb(): Database.Database;
  reopenDb(newPath: string): void;
}

export function registerIpcHandlers(ctx: IpcContext): void {
  // ── Store: read ─────────────────────────────────────────────────────────────
  ipcMain.handle("store:load-all", (): StoreState => {
    return db.loadAll(ctx.getDb());
  });

  // ── Store: children ──────────────────────────────────────────────────────────
  ipcMain.handle("store:upsert-child", (_event, child: Child): void => {
    db.upsertChild(ctx.getDb(), child);
  });

  ipcMain.handle("store:delete-child", (_event, childId: string): void => {
    db.deleteChild(ctx.getDb(), childId);
  });

  // ── Store: ratings ───────────────────────────────────────────────────────────
  ipcMain.handle("store:set-rating", (_event, key: string, rating: Rating | null): void => {
    if (rating === null) db.deleteRating(ctx.getDb(), key);
    else db.upsertRating(ctx.getDb(), key, rating);
  });

  // ── Store: stagnant notes ────────────────────────────────────────────────────
  ipcMain.handle("store:set-stagnant-note", (_event, key: string, note: StagnantNote | null): void => {
    if (note === null) db.deleteStagnantNote(ctx.getDb(), key);
    else db.upsertStagnantNote(ctx.getDb(), key, note);
  });

  // ── Store: acknowledged stagnations ─────────────────────────────────────────
  ipcMain.handle(
    "store:set-stagnation-acknowledged",
    (_event, key: string, entry: AcknowledgedEntry | null): void => {
      if (entry === null) db.deleteAcknowledged(ctx.getDb(), key);
      else db.upsertAcknowledged(ctx.getDb(), key, entry);
    },
  );

  // ── Store: bulk replace (import) ─────────────────────────────────────────────
  ipcMain.handle("store:set-full", (_event, state: StoreState): void => {
    db.setFullStore(ctx.getDb(), state);
  });

  // ── File: export backup ──────────────────────────────────────────────────────
  ipcMain.handle("file:export-backup", async (): Promise<boolean> => {
    const today = new Date().toISOString().slice(0, 10);
    const result = await dialog.showSaveDialog({
      title: "Export journal backup",
      defaultPath: `eyit-backup-${today}.db`,
      filters: [{ name: "SQLite database", extensions: ["db"] }],
    });
    if (result.canceled || !result.filePath) return false;
    // Use db.backup() so WAL content is checkpointed into the exported file
    await ctx.getDb().backup(result.filePath);
    return true;
  });

  // ── File: import from backup ─────────────────────────────────────────────────
  ipcMain.handle("file:select-and-parse-backup", async (): Promise<StoreState | null> => {
    const result = await dialog.showOpenDialog({
      title: "Select backup to import",
      filters: [{ name: "SQLite database", extensions: ["db"] }],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    // Open read-only so we never mutate the selected file
    const tmp = openDatabaseReadOnly(result.filePaths[0]);
    try {
      return db.loadAll(tmp);
    } finally {
      tmp.close();
    }
  });

  // ── File: move journal ───────────────────────────────────────────────────────
  ipcMain.handle("file:move-journal", async (): Promise<string | null> => {
    const currentPath = ctx.getJournalPath();
    const result = await dialog.showSaveDialog({
      title: "Move journal file to…",
      defaultPath: currentPath,
      filters: [{ name: "SQLite database", extensions: ["db"] }],
    });
    if (result.canceled || !result.filePath) return null;
    const newPath = result.filePath;
    // No-op if the user confirmed the same location — never unlink in that case
    if (path.resolve(newPath) === path.resolve(currentPath)) return currentPath;
    // Checkpoint WAL into the destination via db.backup(), then reopen, then
    // delete the original and its sidecars. This order ensures we never lose data.
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    await ctx.getDb().backup(newPath);
    ctx.reopenDb(newPath);
    ctx.setJournalPath(newPath);
    for (const target of [currentPath, currentPath + "-wal", currentPath + "-shm"]) {
      try {
        fs.unlinkSync(target);
      } catch {
        // non-fatal: file may already be gone
      }
    }
    return newPath;
  });

  // ── File: get journal path ───────────────────────────────────────────────────
  ipcMain.handle("file:get-journal-path", (): string => {
    return ctx.getJournalPath();
  });

  // ── Backups: list ────────────────────────────────────────────────────────────
  ipcMain.handle("backup:list", () => {
    return listBackups(ctx.getJournalPath());
  });

  // ── Backups: restore ─────────────────────────────────────────────────────────
  ipcMain.handle("backup:restore", (_event, filename: string): void => {
    const backupsDir = path.join(path.dirname(ctx.getJournalPath()), "backups");
    const backupPath = path.join(backupsDir, filename);
    const journalPath = ctx.getJournalPath();
    // Close the live connection so we can safely overwrite the file
    ctx.getDb().close();
    // Copy backup over the journal path and clean any stale WAL/SHM sidecars
    restoreBackup(backupPath, journalPath);
    // Reopen — reopenDb guards against double-close via db.open check
    ctx.reopenDb(journalPath);
  });
}
