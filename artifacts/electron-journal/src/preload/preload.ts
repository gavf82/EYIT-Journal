import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI, UpdateStatus } from "../types";

const api: ElectronAPI = {
  // Store
  loadAll: () => ipcRenderer.invoke("store:load-all"),
  upsertChild: (child) => ipcRenderer.invoke("store:upsert-child", child),
  deleteChild: (childId) => ipcRenderer.invoke("store:delete-child", childId),
  setRating: (key, rating) => ipcRenderer.invoke("store:set-rating", key, rating),
  setStagnantNote: (key, note) => ipcRenderer.invoke("store:set-stagnant-note", key, note),
  setStagnationAcknowledged: (key, entry) =>
    ipcRenderer.invoke("store:set-stagnation-acknowledged", key, entry),
  setFullStore: (state) => ipcRenderer.invoke("store:set-full", state),

  // File
  exportBackup: () => ipcRenderer.invoke("file:export-backup"),
  selectAndParseBackup: () => ipcRenderer.invoke("file:select-and-parse-backup"),
  moveJournalFile: () => ipcRenderer.invoke("file:move-journal"),
  getJournalPath: () => ipcRenderer.invoke("file:get-journal-path"),

  // Backups
  listBackups: () => ipcRenderer.invoke("backup:list"),
  restoreBackup: (filename) => ipcRenderer.invoke("backup:restore", filename),

  // Auto-update
  onUpdateStatus: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, status: UpdateStatus) =>
      callback(status);
    ipcRenderer.on("app:update-status", handler);
    return () => {
      ipcRenderer.off("app:update-status", handler);
    };
  },
  installUpdate: () => {
    ipcRenderer.send("app:install-update");
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
