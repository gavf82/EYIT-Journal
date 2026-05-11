import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { openDatabase } from "./db";
import { createStartupBackup } from "./backups";
import { registerIpcHandlers } from "./ipc-handlers";
import type Database from "better-sqlite3";
import type { UpdateStatus } from "../types";

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

// ── Auto-updater ──────────────────────────────────────────────────────────────

// Names baked in by electron-builder from electron-builder.yml at build time.
// If they are still placeholders the publish feed has not been configured yet,
// so silently skip update checks rather than showing an error to the user.
const UPDATER_OWNER: string = "PLACEHOLDER_OWNER";
const UPDATER_REPO: string = "PLACEHOLDER_REPO";

function isUpdaterConfigured(): boolean {
  return UPDATER_OWNER !== "PLACEHOLDER_OWNER" && UPDATER_REPO !== "PLACEHOLDER_REPO";
}

function setupAutoUpdater(): void {
  // Only run the updater in packaged builds — dev has no feed URL to check.
  if (!app.isPackaged) return;

  // Skip silently when the publish target has not been configured yet.
  // Replace PLACEHOLDER_OWNER / PLACEHOLDER_REPO in electron-builder.yml
  // with real values once a GitHub repository exists for distribution.
  if (!isUpdaterConfigured()) return;

  // Dynamic require so the module is resolved at runtime in the packaged app.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { autoUpdater } = require("electron-updater") as typeof import("electron-updater");

  const send = (status: UpdateStatus): void => {
    mainWindow?.webContents.send("app:update-status", status);
  };

  autoUpdater.on("checking-for-update", () => {
    send({ phase: "checking" });
  });

  autoUpdater.on("update-not-available", () => {
    send({ phase: "not-available" });
  });

  autoUpdater.on("update-available", (info) => {
    send({ phase: "available", version: info.version });
  });

  autoUpdater.on("download-progress", (progress) => {
    send({ phase: "downloading", percent: Math.round(progress.percent) });
  });

  autoUpdater.on("update-downloaded", (info) => {
    send({ phase: "downloaded", version: info.version });
  });

  autoUpdater.on("error", (err) => {
    send({ phase: "error", error: err.message });
  });

  ipcMain.on("app:install-update", () => {
    autoUpdater.quitAndInstall();
  });

  // Delay the first check so the window has time to fully load
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err: Error) => {
      send({ phase: "error", error: err.message });
    });
  }, 3000);
}

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

  // Start silent auto-update check after the window loads
  setupAutoUpdater();

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
