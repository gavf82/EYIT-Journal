import { app, BrowserWindow, ipcMain, shell } from "electron";
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

function setupAutoUpdater(): void {
  // Only run the updater in packaged builds — dev has no feed URL to check.
  if (!app.isPackaged) return;

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
    const notes =
      typeof info.releaseNotes === "string"
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
          ? info.releaseNotes.map((n) =>
              typeof n === "string" ? n : (n.note ?? "")
            ).join("\n")
          : undefined;
    send({ phase: "downloaded", version: info.version, releaseNotes: notes });
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Shows a minimal self-contained error window when startup fails.
 * Loads a data: URL so it never depends on the app's built assets.
 * Buttons navigate to custom eyit-error:// URLs which are intercepted
 * by will-navigate in main — no nodeIntegration or preload required.
 */
function showErrorWindow(error: unknown, jPath: string): void {
  const errText = error instanceof Error ? error.message : String(error);
  const folderPath = jPath ? path.dirname(jPath) : app.getPath("documents");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>EYIT Journal \u2013 Startup Error</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #1a1a1a; color: #e5e5e5;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; padding: 24px;
    }
    .card {
      background: #262626; border: 1px solid #404040;
      border-radius: 12px; padding: 32px; max-width: 580px; width: 100%;
    }
    h1 { color: #f87171; margin: 0 0 12px; font-size: 18px; font-weight: 600; }
    p { color: #a3a3a3; margin: 0 0 16px; line-height: 1.55; font-size: 14px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #737373; margin-bottom: 4px; }
    .box {
      border-radius: 6px; padding: 10px 14px;
      font-family: ui-monospace, 'Cascadia Code', monospace;
      font-size: 12px; word-break: break-all; margin-bottom: 20px; line-height: 1.5;
    }
    .path-box { background: #171717; color: #fbbf24; }
    .error-box { background: #3f1515; color: #fca5a5; margin-bottom: 28px; }
    .buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    button {
      padding: 9px 22px; border-radius: 8px; border: none;
      cursor: pointer; font-size: 14px; font-weight: 500; transition: opacity .15s;
    }
    button:hover { opacity: .85; }
    .btn-folder { background: #3b82f6; color: #fff; }
    .btn-quit { background: #374151; color: #e5e5e5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>&#x26A0;&#xFE0F; EYIT Journal could not start</h1>
    <p>
      An error occurred while opening your journal database.
      Your data has not been lost \u2014 try opening the journal folder
      to inspect the files or restore a backup.
    </p>
    <div class="label">Journal file</div>
    <div class="box path-box">${escapeHtml(jPath || "(unknown)")}</div>
    <div class="label">Error detail</div>
    <div class="box error-box">${escapeHtml(errText)}</div>
    <div class="buttons">
      <button class="btn-folder" onclick="location.href='eyit-error://open-folder'">Open journal folder</button>
      <button class="btn-quit" onclick="location.href='eyit-error://quit'">Quit</button>
    </div>
  </div>
</body>
</html>`;

  const win = new BrowserWindow({
    width: 680,
    height: 520,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Intercept button actions via navigation to custom eyit-error:// URLs.
  // This keeps the renderer fully sandboxed — no preload or Node access needed.
  win.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    if (url.startsWith("eyit-error://open-folder")) {
      shell.openPath(folderPath).catch(() => undefined);
    } else if (url.startsWith("eyit-error://quit")) {
      app.quit();
    }
  });

  win.setMenuBarVisibility(false);
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 820,
    minHeight: 600,
    show: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
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
  try {
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
  } catch (err) {
    console.error("[EYIT] Fatal startup error:", err);
    showErrorWindow(err, journalPath);
  }
});

app.on("window-all-closed", () => {
  journalDb?.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  journalDb?.close();
});
