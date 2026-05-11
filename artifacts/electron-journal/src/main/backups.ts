import fs from "fs";
import path from "path";

const MAX_BACKUPS = 10;

export interface BackupEntry {
  filename: string;
  path: string;
  mtime: number;
}

function getBackupsDir(journalPath: string): string {
  return path.join(path.dirname(journalPath), "backups");
}

function timestampSlug(): string {
  // e.g. "2026-05-11T14-30-00"
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Called at app startup to snapshot the current journal file. */
export function createStartupBackup(journalPath: string): void {
  try {
    if (!fs.existsSync(journalPath)) return; // nothing to back up yet
    const backupsDir = getBackupsDir(journalPath);
    fs.mkdirSync(backupsDir, { recursive: true });
    const filename = `journal-${timestampSlug()}.db`;
    fs.copyFileSync(journalPath, path.join(backupsDir, filename));
    pruneBackups(journalPath);
  } catch (e) {
    console.error("[EYIT] Failed to create startup backup:", e);
  }
}

/** Returns backups sorted newest-first. */
export function listBackups(journalPath: string): BackupEntry[] {
  const backupsDir = getBackupsDir(journalPath);
  try {
    if (!fs.existsSync(backupsDir)) return [];
    return fs
      .readdirSync(backupsDir)
      .filter(f => f.endsWith(".db"))
      .map(f => {
        const full = path.join(backupsDir, f);
        const stat = fs.statSync(full);
        return { filename: f, path: full, mtime: stat.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);
  } catch {
    return [];
  }
}

/** Copies a backup file over the live journal. */
export function restoreBackup(backupPath: string, journalPath: string): void {
  fs.copyFileSync(backupPath, journalPath);
}

/** Keeps only the N most recent backups. */
function pruneBackups(journalPath: string): void {
  const backups = listBackups(journalPath);
  const toDelete = backups.slice(MAX_BACKUPS);
  for (const b of toDelete) {
    try {
      fs.unlinkSync(b.path);
    } catch {
      // ignore
    }
  }
}
