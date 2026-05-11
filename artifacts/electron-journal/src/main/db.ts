import Database from "better-sqlite3";
import type { Child, Rating, StagnantNote, AcknowledgedEntry, StoreState } from "../types";
import path from "path";
import fs from "fs";

// ── Schema (identical to browser sqlite.ts) ───────────────────────────────────

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

// ── Open ──────────────────────────────────────────────────────────────────────

export function openDatabase(filePath: string): Database.Database {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.exec(DDL);
  return db;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function loadAll(db: Database.Database): StoreState {
  // Children
  const children = (db.prepare("SELECT * FROM children ORDER BY created_at").all() as Record<string, unknown>[]).map(
    (row) => ({
      id: row.id as string,
      name: row.name as string,
      dob: (row.dob ?? "") as string,
      startDate: (row.start_date ?? "") as string,
      createdAt: (row.created_at ?? new Date().toISOString()) as string,
      updatedAt: (row.updated_at ?? new Date().toISOString()) as string,
      status: (row.status ?? "active") as "active" | "archived",
      ...(row.archived_at ? { archivedAt: row.archived_at as string } : {}),
      ...(row.baseline_step != null ? { baselineStep: row.baseline_step as number } : {}),
    }),
  );

  // Ratings
  const ratings: Record<string, Rating> = {};
  const ratingRows = db
    .prepare("SELECT child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history FROM ratings")
    .all() as Record<string, unknown>[];
  for (const row of ratingRows) {
    const key = `${row.child_id}::${row.area_idx}::${row.strand_idx}::${row.step_idx}::${row.item_key}`;
    ratings[key] = {
      status: row.status as Rating["status"],
      updatedAt: row.updated_at as string,
      ...(row.history ? { history: JSON.parse(row.history as string) } : {}),
    };
  }

  // Stagnant notes
  const stagnantNotes: Record<string, StagnantNote> = {};
  const noteRows = db
    .prepare("SELECT child_id, area_name, strand_name, note_text, note_date FROM stagnant_notes")
    .all() as Record<string, unknown>[];
  for (const row of noteRows) {
    const key = `${row.child_id}::${row.area_name}::${row.strand_name}`;
    stagnantNotes[key] = { text: (row.note_text ?? "") as string, date: (row.note_date ?? "") as string };
  }

  // Acknowledged stagnations
  const acknowledgedStagnations: Record<string, AcknowledgedEntry> = {};
  const ackedRows = db
    .prepare(
      "SELECT child_id, area_name, strand_name, step_number, item_key, acked_at, note_text FROM acknowledged_stagnations",
    )
    .all() as Record<string, unknown>[];
  for (const row of ackedRows) {
    const key = `${row.child_id}::${row.area_name}::${row.strand_name}::${row.step_number}::${row.item_key}`;
    acknowledgedStagnations[key] = { ackedAt: row.acked_at as string, note: (row.note_text ?? "") as string };
  }

  return { children, ratings, stagnantNotes, acknowledgedStagnations };
}

// ── Children ──────────────────────────────────────────────────────────────────

const UPSERT_CHILD = `
  INSERT OR REPLACE INTO children
    (id, name, dob, start_date, created_at, updated_at, status, archived_at, baseline_step)
  VALUES (@id, @name, @dob, @startDate, @createdAt, @updatedAt, @status, @archivedAt, @baselineStep)
`;

export function upsertChild(db: Database.Database, child: Child): void {
  db.prepare(UPSERT_CHILD).run({
    id: child.id,
    name: child.name,
    dob: child.dob ?? null,
    startDate: child.startDate ?? null,
    createdAt: child.createdAt ?? null,
    updatedAt: child.updatedAt ?? null,
    status: child.status ?? "active",
    archivedAt: child.archivedAt ?? null,
    baselineStep: child.baselineStep ?? null,
  });
}

export function deleteChild(db: Database.Database, childId: string): void {
  db.prepare("DELETE FROM children WHERE id = ?").run(childId);
  db.prepare("DELETE FROM ratings WHERE child_id = ?").run(childId);
  db.prepare("DELETE FROM stagnant_notes WHERE child_id = ?").run(childId);
  db.prepare("DELETE FROM acknowledged_stagnations WHERE child_id = ?").run(childId);
}

// ── Ratings ───────────────────────────────────────────────────────────────────

export function upsertRating(db: Database.Database, key: string, rating: Rating): void {
  const parts = key.split("::");
  if (parts.length !== 5) return;
  const [childId, aIdx, sIdx, stIdx, itemKey] = parts;
  db.prepare(
    `INSERT OR REPLACE INTO ratings
       (child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    childId,
    parseInt(aIdx, 10),
    parseInt(sIdx, 10),
    parseInt(stIdx, 10),
    itemKey,
    rating.status,
    rating.updatedAt,
    rating.history?.length ? JSON.stringify(rating.history) : null,
  );
}

export function deleteRating(db: Database.Database, key: string): void {
  const parts = key.split("::");
  if (parts.length !== 5) return;
  const [childId, aIdx, sIdx, stIdx, itemKey] = parts;
  db.prepare(
    "DELETE FROM ratings WHERE child_id=? AND area_idx=? AND strand_idx=? AND step_idx=? AND item_key=?",
  ).run(childId, parseInt(aIdx, 10), parseInt(sIdx, 10), parseInt(stIdx, 10), itemKey);
}

// ── Stagnant notes ────────────────────────────────────────────────────────────

export function upsertStagnantNote(db: Database.Database, key: string, note: StagnantNote): void {
  const firstSep = key.indexOf("::");
  if (firstSep === -1) return;
  const childId = key.slice(0, firstSep);
  const rest = key.slice(firstSep + 2);
  const secondSep = rest.indexOf("::");
  if (secondSep === -1) return;
  const areaName = rest.slice(0, secondSep);
  const strandName = rest.slice(secondSep + 2);
  db.prepare(
    `INSERT OR REPLACE INTO stagnant_notes (child_id, area_name, strand_name, note_text, note_date)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(childId, areaName, strandName, note.text, note.date);
}

export function deleteStagnantNote(db: Database.Database, key: string): void {
  const firstSep = key.indexOf("::");
  if (firstSep === -1) return;
  const childId = key.slice(0, firstSep);
  const rest = key.slice(firstSep + 2);
  const secondSep = rest.indexOf("::");
  if (secondSep === -1) return;
  const areaName = rest.slice(0, secondSep);
  const strandName = rest.slice(secondSep + 2);
  db.prepare("DELETE FROM stagnant_notes WHERE child_id=? AND area_name=? AND strand_name=?").run(
    childId,
    areaName,
    strandName,
  );
}

// ── Acknowledged stagnations ──────────────────────────────────────────────────

export function upsertAcknowledged(db: Database.Database, key: string, entry: AcknowledgedEntry): void {
  const parts = key.split("::");
  if (parts.length < 5) return;
  const [childId, areaName, strandName, stepStr, ...itemParts] = parts;
  const itemKey = itemParts.join("::");
  const stepNumber = parseInt(stepStr, 10);
  if (isNaN(stepNumber)) return;
  db.prepare(
    `INSERT OR REPLACE INTO acknowledged_stagnations
       (child_id, area_name, strand_name, step_number, item_key, acked_at, note_text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(childId, areaName, strandName, stepNumber, itemKey, entry.ackedAt, entry.note);
}

export function deleteAcknowledged(db: Database.Database, key: string): void {
  const parts = key.split("::");
  if (parts.length < 5) return;
  const [childId, areaName, strandName, stepStr, ...itemParts] = parts;
  const itemKey = itemParts.join("::");
  const stepNumber = parseInt(stepStr, 10);
  if (isNaN(stepNumber)) return;
  db.prepare(
    "DELETE FROM acknowledged_stagnations WHERE child_id=? AND area_name=? AND strand_name=? AND step_number=? AND item_key=?",
  ).run(childId, areaName, strandName, stepNumber, itemKey);
}

// ── Bulk replace (import) ─────────────────────────────────────────────────────

export function setFullStore(db: Database.Database, state: StoreState): void {
  const run = db.transaction(() => {
    db.prepare("DELETE FROM acknowledged_stagnations").run();
    db.prepare("DELETE FROM stagnant_notes").run();
    db.prepare("DELETE FROM ratings").run();
    db.prepare("DELETE FROM children").run();
    for (const child of state.children) upsertChild(db, child);
    for (const [key, rating] of Object.entries(state.ratings)) upsertRating(db, key, rating);
    for (const [key, note] of Object.entries(state.stagnantNotes ?? {})) upsertStagnantNote(db, key, note);
    for (const [key, entry] of Object.entries(state.acknowledgedStagnations ?? {})) upsertAcknowledged(db, key, entry);
  });
  run();
}
