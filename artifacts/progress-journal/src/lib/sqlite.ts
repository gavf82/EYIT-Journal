import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { getStore, setStore, recordExport, type StoreState, type AcknowledgedEntry } from "./store";
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
  updated_at  TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  archived_at   TEXT,
  baseline_step INTEGER
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
       (id, name, dob, start_date, created_at, updated_at, status, archived_at, baseline_step)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const child of store.children) {
    insertChild.run([
      child.id,
      child.name,
      child.dob ?? null,
      child.startDate ?? null,
      child.createdAt ?? null,
      child.updatedAt ?? null,
      child.status ?? 'active',
      child.archivedAt ?? null,
      child.baselineStep ?? null,
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
  const saved = await saveBlob(blob, `eyit-backup-${todaySlug()}.db`, [
    {
      description: "SQLite database",
      accept: { "application/octet-stream": [".db"] },
    },
  ]);
  if (saved) recordExport();
  return saved;
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

  /**
   * Assert that a raw SQLite value is a string. SQLite's dynamic typing allows
   * any column to hold any type regardless of its declared affinity, so this
   * check is a genuine runtime boundary, not a redundant cast.
   */
  function requireString(value: unknown, field: string): string {
    if (typeof value !== "string") {
      throw new Error(
        `Field "${field}" must be a text value but got ${value === null ? "null" : typeof value}.`,
      );
    }
    return value;
  }

  /**
   * Like requireString, but accepts null/undefined and returns null.
   */
  function optionalString(value: unknown, field: string): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string") {
      throw new Error(
        `Field "${field}" must be a text value or null but got ${typeof value}.`,
      );
    }
    return value;
  }

  /**
   * Assert that a raw SQLite value is an integer (whole number). SQLite INTEGER
   * columns can still receive text from a crafted .db file.
   */
  function requireInt(value: unknown, field: string): number {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new Error(
        `Field "${field}" must be an integer but got ${value === null ? "null" : typeof value} (${String(value)}).`,
      );
    }
    return value;
  }

  /**
   * Like requireInt, but accepts null/undefined and returns null.
   */
  function optionalInt(value: unknown, field: string): number | null {
    if (value === null || value === undefined) return null;
    return requireInt(value, field);
  }

  function assertFieldLen(value: string | null, field: string, maxLen = MAX_FIELD_LEN): void {
    if (value !== null && value.length > maxLen) {
      throw new Error(
        `Field "${field}" exceeds the maximum allowed length of ${maxLen} characters.`,
      );
    }
  }

  const VALID_CHILD_STATUSES = new Set(["active", "archived"]);
  const VALID_RATING_STATUSES = new Set(["emerging", "developing", "secure"]);

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

    // Check for optional columns added in later schema versions.
    function hasPragmaCol(table: string, col: string): boolean {
      return (
        db
          .exec(`SELECT 1 FROM pragma_table_info('${table}') WHERE name='${col}'`)
          .flatMap((r: initSqlJs.QueryExecResult) => r.values)
          .length > 0
      );
    }
    const hasStatusCol = hasPragmaCol("children", "status");
    const hasBaselineStepCol = hasStatusCol && hasPragmaCol("children", "baseline_step");

    const children: StoreState["children"] = [];
    const childRows = db.exec(
      hasStatusCol && hasBaselineStepCol
        ? "SELECT id, name, dob, start_date, created_at, updated_at, status, archived_at, baseline_step FROM children"
        : hasStatusCol
          ? "SELECT id, name, dob, start_date, created_at, updated_at, status, archived_at, NULL FROM children"
          : "SELECT id, name, dob, start_date, created_at, updated_at, 'active', NULL, NULL FROM children",
    );
    if (childRows.length > 0) {
      for (const row of childRows[0].values) {
        const id = requireString(row[0], "children.id");
        const name = requireString(row[1], "children.name");
        const dob = optionalString(row[2], "children.dob") ?? "";
        const startDate = optionalString(row[3], "children.start_date") ?? "";
        const createdAt = optionalString(row[4], "children.created_at") ?? new Date().toISOString();
        const updatedAt = optionalString(row[5], "children.updated_at") ?? new Date().toISOString();
        const rawStatus = optionalString(row[6], "children.status") ?? "active";
        if (!VALID_CHILD_STATUSES.has(rawStatus)) {
          throw new Error(
            `Field "children.status" has invalid value "${rawStatus}". Expected "active" or "archived".`,
          );
        }
        const status = rawStatus as "active" | "archived";
        const archivedAt = optionalString(row[7], "children.archived_at") ?? undefined;
        const baselineStep = optionalInt(row[8], "children.baseline_step") ?? undefined;
        if (baselineStep !== undefined && (baselineStep < 0 || baselineStep > 999)) {
          throw new Error(
            `Field "children.baseline_step" value ${baselineStep} is out of the accepted range (0–999).`,
          );
        }
        assertFieldLen(id, "children.id");
        assertFieldLen(name, "children.name");
        assertFieldLen(dob, "children.dob");
        assertFieldLen(startDate, "children.start_date");
        children.push({ id, name, dob, startDate, createdAt, updatedAt, status, archivedAt, baselineStep });
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
        const childId = requireString(row[0], "ratings.child_id");
        const areaIdx = requireInt(row[1], "ratings.area_idx");
        const strandIdx = requireInt(row[2], "ratings.strand_idx");
        const stepIdx = requireInt(row[3], "ratings.step_idx");
        const itemKey = requireString(row[4], "ratings.item_key");
        const status = requireString(row[5], "ratings.status");
        const updatedAt = requireString(row[6], "ratings.updated_at");
        const historyRaw = optionalString(row[7], "ratings.history");
        if (!VALID_RATING_STATUSES.has(status)) {
          throw new Error(
            `Field "ratings.status" has invalid value "${status}". Expected "emerging", "developing", or "secure".`,
          );
        }
        if (areaIdx < 0 || strandIdx < 0 || stepIdx < 0) {
          throw new Error(
            `Rating index fields must be non-negative integers (area_idx=${areaIdx}, strand_idx=${strandIdx}, step_idx=${stepIdx}).`,
          );
        }
        assertFieldLen(childId, "ratings.child_id");
        assertFieldLen(itemKey, "ratings.item_key");
        assertFieldLen(updatedAt, "ratings.updated_at");
        assertFieldLen(historyRaw, "ratings.history");
        let history: import("./store").HistoryEntry[] | undefined;
        if (historyRaw) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(historyRaw);
          } catch {
            throw new Error(`Field "ratings.history" contains invalid JSON.`);
          }
          if (!Array.isArray(parsed)) {
            throw new Error(
              `Field "ratings.history" must be a JSON array but got ${typeof parsed}.`,
            );
          }
          history = [];
          for (let i = 0; i < parsed.length; i++) {
            const entry = parsed[i] as Record<string, unknown>;
            if (typeof entry !== "object" || entry === null) {
              throw new Error(`ratings.history[${i}] is not an object.`);
            }
            const entryStatus = entry.status;
            const entryDate = entry.date;
            if (!VALID_RATING_STATUSES.has(entryStatus as string)) {
              throw new Error(
                `ratings.history[${i}].status has invalid value "${String(entryStatus)}".`,
              );
            }
            if (typeof entryDate !== "string") {
              throw new Error(
                `ratings.history[${i}].date must be a string but got ${typeof entryDate}.`,
              );
            }
            history.push({ status: entryStatus as "emerging" | "developing" | "secure", date: entryDate });
          }
        }
        const key = `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`;
        ratings[key] = {
          status: status as "emerging" | "developing" | "secure",
          updatedAt,
          ...(history && history.length > 0 ? { history } : {}),
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
          const childId = requireString(row[0], "stagnant_notes.child_id");
          const areaName = requireString(row[1], "stagnant_notes.area_name");
          const strandName = requireString(row[2], "stagnant_notes.strand_name");
          const noteText = optionalString(row[3], "stagnant_notes.note_text") ?? "";
          const noteDate = optionalString(row[4], "stagnant_notes.note_date") ?? "";
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
          const childId = requireString(row[0], "acknowledged_stagnations.child_id");
          const areaName = requireString(row[1], "acknowledged_stagnations.area_name");
          const strandName = requireString(row[2], "acknowledged_stagnations.strand_name");
          const stepNumber = requireInt(row[3], "acknowledged_stagnations.step_number");
          const itemKey = requireString(row[4], "acknowledged_stagnations.item_key");
          const ackedAt = optionalString(row[5], "acknowledged_stagnations.acked_at") ?? new Date().toISOString();
          const noteText = optionalString(row[6], "acknowledged_stagnations.note_text") ?? "";
          if (stepNumber < 0 || stepNumber > 999) {
            throw new Error(
              `Field "acknowledged_stagnations.step_number" value ${stepNumber} is out of the accepted range (0–999).`,
            );
          }
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
