import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { openDatabase } from "./db";
import { createStartupBackup } from "./backups";
import { registerIpcHandlers } from "./ipc-handlers";
import type Database from "better-sqlite3";

// ── Journal path management ───────────────────────────────────────────────────

function getDefaultJournalPath(): string {
  return path.join(app.getPath("documents"), "EYIT Journal", "journal.db");
}

function getConfigPath(): string {
  return path.join(app.getPath("userData"), "journal-path.txt");
}

function loadJournalPath(): string {
  try {
    const saved = fs.readFileSync(getConfigPath(), "utf8").trim();
    if (saved && fs.existsSync(saved)) return saved;
  } catch {
    // No config yet — use default
  }
  return getDefaultJournalPath();
}

function saveJournalPath(p: string): void {
  fs.writeFileSync(getConfigPath(), p, "utf8");
}

// ── Global state ──────────────────────────────────────────────────────────────

let mainWindow: BrowserWindow | null = null;
let journalDb: Database.Database | null = null;
let journalPath: string = "";

// ── Window ────────────────────────────────────────────────────────────────────

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 820,
    minHeight: 600,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Resolve journal path
  journalPath = loadJournalPath();
  fs.mkdirSync(path.dirname(journalPath), { recursive: true });

  // Open (or create) the database
  journalDb = openDatabase(journalPath);

  // Create rolling startup backup (WAL-aware via db.backup())
  await createStartupBackup(journalDb, journalPath);

  // Register IPC handlers with mutable context
  registerIpcHandlers({
    getJournalPath: () => journalPath,
    setJournalPath: (newPath: string) => {
      journalPath = newPath;
      saveJournalPath(newPath);
    },
    getDb: () => journalDb!,
    reopenDb: (newPath: string) => {
      // Guard against double-close: only close if the connection is still open
      if (journalDb?.open) journalDb.close();
      journalDb = openDatabase(newPath);
    },
  });

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  journalDb?.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  journalDb?.close();
});
