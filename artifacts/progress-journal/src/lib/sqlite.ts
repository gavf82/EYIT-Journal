import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { getStore, setStore, type StoreState, type AcknowledgedEntry } from "./store";
import { saveBlob, todaySlug } from "./export";

// ── Singleton ────────────────────────────────────────────────────────────────

let _sqlPromise: Promise<initSqlJs.SqlJsStatic> | null = null;

function getSQLite(): Promise<initSqlJs.SqlJsStatic> {
  if (!_sqlPromise) {
    _sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
  }
  return _sqlPromise!;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const DDL = `
CREATE TABLE IF NOT EXISTS children (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  dob         TEXT,
  start_date  TEXT,
  created_at  TEXT,
  updated_at  TEXT
);

CREATE TABLE IF NOT EXISTS ratings (
  child_id    TEXT    NOT NULL,
  area_idx    INTEGER NOT NULL,
  strand_idx  INTEGER NOT NULL,
  step_idx    INTEGER NOT NULL,
  item_key    TEXT    NOT NULL,
  status      TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL,
  history     TEXT,
  PRIMARY KEY (child_id, area_idx, strand_idx, step_idx, item_key)
);

CREATE TABLE IF NOT EXISTS stagnant_notes (
  child_id    TEXT NOT NULL,
  area_name   TEXT NOT NULL,
  strand_name TEXT NOT NULL,
  note_text   TEXT NOT NULL DEFAULT '',
  note_date   TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (child_id, area_name, strand_name)
);

CREATE TABLE IF NOT EXISTS acknowledged_stagnations (
  child_id    TEXT    NOT NULL,
  area_name   TEXT    NOT NULL,
  strand_name TEXT    NOT NULL,
  step_number INTEGER NOT NULL,
  item_key    TEXT    NOT NULL,
  acked_at    TEXT    NOT NULL,
  note_text   TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (child_id, area_name, strand_name, step_number, item_key)
);
`;

// ── Export ───────────────────────────────────────────────────────────────────

export async function exportSQLite(): Promise<boolean> {
  const SQL = await getSQLite();
  const store = getStore();

  const db = new SQL.Database();
  db.run(DDL);

  const insertChild = db.prepare(
    `INSERT OR REPLACE INTO children
       (id, name, dob, start_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const child of store.children) {
    insertChild.run([
      child.id,
      child.name,
      child.dob ?? null,
      child.startDate ?? null,
      child.createdAt ?? null,
      child.updatedAt ?? null,
    ]);
  }
  insertChild.free();

  const insertRating = db.prepare(
    `INSERT OR REPLACE INTO ratings
       (child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const [key, rating] of Object.entries(store.ratings)) {
    const parts = key.split("::");
    if (parts.length !== 5) continue;
    const [childId, aIdx, sIdx, stIdx, itemKey] = parts;
    insertRating.run([
      childId,
      parseInt(aIdx, 10),
      parseInt(sIdx, 10),
      parseInt(stIdx, 10),
      itemKey,
      rating.status,
      rating.updatedAt,
      rating.history && rating.history.length > 0 ? JSON.stringify(rating.history) : null,
    ]);
  }
  insertRating.free();

  const insertNote = db.prepare(
    `INSERT OR REPLACE INTO stagnant_notes
       (child_id, area_name, strand_name, note_text, note_date)
     VALUES (?, ?, ?, ?, ?)`,
  );
  for (const [key, note] of Object.entries(store.stagnantNotes ?? {})) {
    // key = "${childId}::${areaName}::${strandName}"
    const firstSep = key.indexOf("::");
    if (firstSep === -1) continue;
    const childId = key.slice(0, firstSep);
    const rest = key.slice(firstSep + 2);
    const secondSep = rest.indexOf("::");
    if (secondSep === -1) continue;
    const areaName = rest.slice(0, secondSep);
    const strandName = rest.slice(secondSep + 2);
    insertNote.run([childId, areaName, strandName, note.text, note.date]);
  }
  insertNote.free();

  // Upsert: INSERT OR REPLACE includes note_text for full fidelity.
  const insertAcked = db.prepare(
    `INSERT OR REPLACE INTO acknowledged_stagnations
       (child_id, area_name, strand_name, step_number, item_key, acked_at, note_text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const [key, entry] of Object.entries(store.acknowledgedStagnations ?? {})) {
    // key = "${childId}::${areaName}::${strandName}::${stepNumber}::${itemKey}"
    const parts = key.split("::");
    if (parts.length < 5) continue;
    const [childId, areaName, strandName, stepStr, ...itemParts] = parts;
    const itemKey = itemParts.join("::");
    const stepNumber = parseInt(stepStr, 10);
    if (isNaN(stepNumber)) continue;
    insertAcked.run([childId, areaName, strandName, stepNumber, itemKey, entry.ackedAt, entry.note]);
  }
  insertAcked.free();

  const data = db.export();
  db.close();

  const blob = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
  return saveBlob(blob, `eyit-backup-${todaySlug()}.db`, [
    {
      description: "SQLite database",
      accept: { "application/octet-stream": [".db"] },
    },
  ]);
}

// ── Import ───────────────────────────────────────────────────────────────────

/** Maximum backup file size accepted (50 MB). */
const MAX_FILE_BYTES = 50 * 1024 * 1024;
/** Maximum number of child records accepted from a single backup. */
const MAX_CHILDREN = 500;
/** Maximum number of rating records accepted from a single backup. */
const MAX_RATINGS = 200_000;
/** Maximum character length for standard free-form string fields. */
const MAX_FIELD_LEN = 2_000;
/** Maximum character length for practitioner note text. */
const MAX_NOTE_LEN = 5_000;

/**
 * Open a .db file and return its children + ratings + notes without touching the store.
 * Useful for showing a confirmation preview before committing the import.
 */
export async function parseSQLite(
  file: File,
): Promise<Pick<StoreState, "children" | "ratings" | "stagnantNotes" | "acknowledgedStagnations">> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `Backup file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum accepted size is ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
    );
  }

  const SQL = await getSQLite();

  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  function assertFieldLen(value: string | null, field: string, maxLen = MAX_FIELD_LEN): void {
    if (value !== null && value.length > maxLen) {
      throw new Error(
        `Field "${field}" exceeds the maximum allowed length of ${maxLen} characters.`,
      );
    }
  }

  try {
    const tables = db
      .exec(
        `SELECT name FROM sqlite_master
         WHERE type='table' AND name IN ('children','ratings','stagnant_notes','acknowledged_stagnations')`,
      )
      .flatMap((r: initSqlJs.QueryExecResult) =>
        r.values.map((v: initSqlJs.SqlValue[]) => v[0] as string),
      );

    if (!tables.includes("children") || !tables.includes("ratings")) {
      throw new Error(
        "This file does not look like an EYIT journal backup. Expected tables: children, ratings.",
      );
    }

    // Guard: check row counts before materialising all data into JS memory.
    const childCount = (
      db.exec("SELECT COUNT(*) FROM children")[0]?.values[0]?.[0] as number ?? 0
    );
    if (childCount > MAX_CHILDREN) {
      throw new Error(
        `Backup contains too many children (${childCount}). Maximum accepted is ${MAX_CHILDREN}.`,
      );
    }

    const ratingCount = (
      db.exec("SELECT COUNT(*) FROM ratings")[0]?.values[0]?.[0] as number ?? 0
    );
    if (ratingCount > MAX_RATINGS) {
      throw new Error(
        `Backup contains too many rating rows (${ratingCount}). Maximum accepted is ${MAX_RATINGS.toLocaleString()}.`,
      );
    }

    const children: StoreState["children"] = [];
    const childRows = db.exec(
      "SELECT id, name, dob, start_date, created_at, updated_at FROM children",
    );
    if (childRows.length > 0) {
      for (const row of childRows[0].values) {
        const id = row[0] as string;
        const name = row[1] as string;
        const dob = (row[2] as string | null) ?? "";
        const startDate = (row[3] as string | null) ?? "";
        const createdAt = (row[4] as string | null) ?? new Date().toISOString();
        const updatedAt = (row[5] as string | null) ?? new Date().toISOString();
        assertFieldLen(id, "children.id");
        assertFieldLen(name, "children.name");
        assertFieldLen(dob, "children.dob");
        assertFieldLen(startDate, "children.start_date");
        children.push({ id, name, dob, startDate, createdAt, updatedAt });
      }
    }

    // Check whether the file has the history column (added in a later schema version).
    const hasHistoryCol =
      db
        .exec(`SELECT 1 FROM pragma_table_info('ratings') WHERE name='history'`)
        .flatMap((r: initSqlJs.QueryExecResult) => r.values)
        .length > 0;

    const ratings: StoreState["ratings"] = {};
    const ratingRows = db.exec(
      hasHistoryCol
        ? "SELECT child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history FROM ratings"
        : "SELECT child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, NULL FROM ratings",
    );
    if (ratingRows.length > 0) {
      for (const row of ratingRows[0].values) {
        const childId = row[0] as string;
        const itemKey = row[4] as string;
        const status = row[5] as string;
        const updatedAt = row[6] as string;
        const historyRaw = row[7] as string | null;
        assertFieldLen(childId, "ratings.child_id");
        assertFieldLen(itemKey, "ratings.item_key");
        assertFieldLen(status, "ratings.status");
        assertFieldLen(historyRaw, "ratings.history");
        const key = `${childId}::${row[1]}::${row[2]}::${row[3]}::${itemKey}`;
        ratings[key] = {
          status: status as "emerging" | "developing" | "secure",
          updatedAt,
          ...(historyRaw ? { history: JSON.parse(historyRaw) } : {}),
        };
      }
    }

    // Stagnant notes — optional table (backward compat with older backups).
    const stagnantNotes: StoreState["stagnantNotes"] = {};
    if (tables.includes("stagnant_notes")) {
      const noteRows = db.exec(
        "SELECT child_id, area_name, strand_name, note_text, note_date FROM stagnant_notes",
      );
      if (noteRows.length > 0) {
        for (const row of noteRows[0].values) {
          const childId = row[0] as string;
          const areaName = row[1] as string;
          const strandName = row[2] as string;
          const noteText = (row[3] as string | null) ?? "";
          const noteDate = (row[4] as string | null) ?? "";
          assertFieldLen(childId, "stagnant_notes.child_id");
          assertFieldLen(areaName, "stagnant_notes.area_name");
          assertFieldLen(strandName, "stagnant_notes.strand_name");
          assertFieldLen(noteText, "stagnant_notes.note_text", MAX_NOTE_LEN);
          assertFieldLen(noteDate, "stagnant_notes.note_date");
          const key = `${childId}::${areaName}::${strandName}`;
          stagnantNotes[key] = { text: noteText, date: noteDate };
        }
      }
    }

    // Acknowledged stagnations — optional table (backward compat with older backups).
    // The note_text column was added later; detect it before querying.
    const acknowledgedStagnations: StoreState["acknowledgedStagnations"] = {};
    if (tables.includes("acknowledged_stagnations")) {
      const hasNoteCol =
        db
          .exec(`SELECT 1 FROM pragma_table_info('acknowledged_stagnations') WHERE name='note_text'`)
          .flatMap((r: initSqlJs.QueryExecResult) => r.values)
          .length > 0;

      const ackedRows = db.exec(
        hasNoteCol
          ? "SELECT child_id, area_name, strand_name, step_number, item_key, acked_at, note_text FROM acknowledged_stagnations"
          : "SELECT child_id, area_name, strand_name, step_number, item_key, acked_at, '' FROM acknowledged_stagnations",
      );
      if (ackedRows.length > 0) {
        for (const row of ackedRows[0].values) {
          const childId = row[0] as string;
          const areaName = row[1] as string;
          const strandName = row[2] as string;
          const stepNumber = row[3] as number;
          const itemKey = row[4] as string;
          const ackedAt = (row[5] as string | null) ?? new Date().toISOString();
          const noteText = (row[6] as string | null) ?? "";
          assertFieldLen(childId, "acknowledged_stagnations.child_id");
          assertFieldLen(areaName, "acknowledged_stagnations.area_name");
          assertFieldLen(strandName, "acknowledged_stagnations.strand_name");
          assertFieldLen(itemKey, "acknowledged_stagnations.item_key");
          assertFieldLen(noteText, "acknowledged_stagnations.note_text", MAX_NOTE_LEN);
          const key = `${childId}::${areaName}::${strandName}::${stepNumber}::${itemKey}`;
          const entry: AcknowledgedEntry = { ackedAt, note: noteText };
          acknowledgedStagnations[key] = entry;
        }
      }
    }

    return { children, ratings, stagnantNotes, acknowledgedStagnations };
  } finally {
    db.close();
  }
}

/**
 * Parse a .db file and merge it into the current store.
 */
export async function importSQLite(file: File): Promise<void> {
  const { children, ratings, stagnantNotes, acknowledgedStagnations } = await parseSQLite(file);

  const current = getStore();
  const childMap = new Map(current.children.map((c) => [c.id, c]));
  children.forEach((c) => childMap.set(c.id, c));

  setStore({
    children: [...childMap.values()],
    ratings: { ...current.ratings, ...ratings },
    stagnantNotes: { ...(current.stagnantNotes ?? {}), ...stagnantNotes },
    acknowledgedStagnations: { ...(current.acknowledgedStagnations ?? {}), ...acknowledgedStagnations },
  });
}
