import fs from "fs";
import path from "path";
import { app } from "electron";

const LOG_FILE = "eyit.log";
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB per file
const MAX_ROTATED = 4; // keep .1 through .4 alongside the current log

let _logPath: string | null = null;

export function getLogPath(): string {
  if (!_logPath) {
    _logPath = path.join(app.getPath("userData"), LOG_FILE);
  }
  return _logPath;
}

function rotateLogs(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_SIZE_BYTES) return;

    // Remove the oldest rotated file so we never exceed MAX_ROTATED copies
    const oldest = `${filePath}.${MAX_ROTATED}`;
    if (fs.existsSync(oldest)) fs.unlinkSync(oldest);

    // Shift .3 → .4, .2 → .3, .1 → .2
    for (let i = MAX_ROTATED - 1; i >= 1; i--) {
      const src = `${filePath}.${i}`;
      const dst = `${filePath}.${i + 1}`;
      if (fs.existsSync(src)) fs.renameSync(src, dst);
    }

    // Rotate the current log to .1
    fs.renameSync(filePath, `${filePath}.1`);
  } catch {
    // Rotation failures are non-fatal — continue writing to the original path
  }
}

function writeLine(line: string): void {
  try {
    const filePath = getLogPath();
    rotateLogs(filePath);
    fs.appendFileSync(filePath, line + "\n", "utf8");
  } catch {
    // Log writes must never crash the app
  }
}

function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Writes a startup banner on every launch: timestamp, app version, journal path.
 * Call this as early as possible in app.whenReady().
 */
export function logStartup(journalPath: string): void {
  writeLine("");
  writeLine(`[${timestamp()}] ── EYIT Journal starting ──────────────────────────`);
  writeLine(`[${timestamp()}] version      : ${app.getVersion()}`);
  writeLine(`[${timestamp()}] platform     : ${process.platform} ${process.arch}`);
  writeLine(`[${timestamp()}] journal path : ${journalPath || "(not yet resolved)"}`);
}

/**
 * Writes a "startup complete" confirmation line so the log shows clean launches.
 */
export function logStartupOk(): void {
  writeLine(`[${timestamp()}] startup OK`);
}

/**
 * Writes the full error (including stack trace) to the log file.
 */
export function logStartupError(error: unknown, journalPath: string): void {
  writeLine(`[${timestamp()}] STARTUP ERROR`);
  writeLine(`[${timestamp()}] journal path : ${journalPath || "(unknown)"}`);
  if (error instanceof Error) {
    writeLine(`[${timestamp()}] message      : ${error.message}`);
    if (error.stack) {
      const stackLines = error.stack.split("\n");
      for (const line of stackLines) {
        writeLine(`[${timestamp()}]   ${line}`);
      }
    }
  } else {
    writeLine(`[${timestamp()}] error        : ${String(error)}`);
  }
}
