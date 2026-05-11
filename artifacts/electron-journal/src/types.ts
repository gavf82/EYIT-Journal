// ── Shared types used by both main process and renderer ──────────────────────

export type Status = null | "emerging" | "developing" | "secure";

export interface Child {
  id: string;
  name: string;
  dob: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  status?: "active" | "archived";
  archivedAt?: string;
  isDemo?: boolean;
  baselineStep?: number;
}

export interface HistoryEntry {
  status: Status;
  date: string;
}

export interface Rating {
  status: Status;
  updatedAt: string;
  history?: HistoryEntry[];
}

export interface StagnantNote {
  text: string;
  date: string;
}

export interface AcknowledgedEntry {
  ackedAt: string;
  note: string;
}

export interface StoreState {
  children: Child[];
  ratings: Record<string, Rating>;
  stagnantNotes: Record<string, StagnantNote>;
  acknowledgedStagnations: Record<string, AcknowledgedEntry>;
}

export interface BackupEntry {
  filename: string;
  path: string;
  mtime: number;
}

// ── Auto-update status ────────────────────────────────────────────────────────

export type UpdatePhase =
  | "checking"
  | "not-available"
  | "available"
  | "downloading"
  | "downloaded"
  | "error";

export interface UpdateStatus {
  phase: UpdatePhase;
  version?: string;
  percent?: number;
  error?: string;
  releaseNotes?: string;
}

// ── Electron IPC API (exposed via contextBridge) ──────────────────────────────

export interface ElectronAPI {
  // Store operations
  loadAll(): Promise<StoreState>;
  upsertChild(child: Child): Promise<void>;
  deleteChild(childId: string): Promise<void>;
  setRating(key: string, rating: Rating | null): Promise<void>;
  setStagnantNote(key: string, note: StagnantNote | null): Promise<void>;
  setStagnationAcknowledged(key: string, entry: AcknowledgedEntry | null): Promise<void>;
  setFullStore(state: StoreState): Promise<void>;

  // File operations
  exportBackup(): Promise<boolean>;
  selectAndParseBackup(): Promise<StoreState | null>;
  moveJournalFile(): Promise<string | null>;
  getJournalPath(): Promise<string>;

  // Rolling backup management
  listBackups(): Promise<BackupEntry[]>;
  restoreBackup(filename: string): Promise<void>;

  // Auto-update
  onUpdateStatus(callback: (status: UpdateStatus) => void): () => void;
  installUpdate(): void;
}
