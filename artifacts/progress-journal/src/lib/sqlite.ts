import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { getStore, setStore, type StoreState } from "./store";
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
  PRIMARY KEY (child_id, area_idx, strand_idx, step_idx, item_key)
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
       (child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    ]);
  }
  insertRating.free();

  const data = db.export();
  db.close();

  // db.export() returns Uint8Array<ArrayBufferLike>; copy into a guaranteed
  // plain ArrayBuffer so Blob constructor accepts it without a type cast.
  const blob = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
  return saveBlob(blob, `eyit-backup-${todaySlug()}.db`, [
    {
      description: "SQLite database",
      accept: { "application/octet-stream": [".db"] },
    },
  ]);
}

// ── Import ───────────────────────────────────────────────────────────────────

export async function importSQLite(file: File): Promise<void> {
  const SQL = await getSQLite();

  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  // Verify expected tables exist
  const tables = db
    .exec(
      `SELECT name FROM sqlite_master
       WHERE type='table' AND name IN ('children','ratings')`,
    )
    .flatMap((r: initSqlJs.QueryExecResult) =>
      r.values.map((v: initSqlJs.SqlValue[]) => v[0] as string),
    );

  if (!tables.includes("children") || !tables.includes("ratings")) {
    db.close();
    throw new Error(
      "This file does not look like an EYIT journal backup. Expected tables: children, ratings.",
    );
  }

  const children: StoreState["children"] = [];
  const childRows = db.exec(
    "SELECT id, name, dob, start_date, created_at, updated_at FROM children",
  );
  if (childRows.length > 0) {
    for (const row of childRows[0].values) {
      children.push({
        id: row[0] as string,
        name: row[1] as string,
        dob: (row[2] as string | null) ?? "",
        startDate: (row[3] as string | null) ?? "",
        createdAt: (row[4] as string | null) ?? new Date().toISOString(),
        updatedAt: (row[5] as string | null) ?? new Date().toISOString(),
      });
    }
  }

  const ratings: StoreState["ratings"] = {};
  const ratingRows = db.exec(
    "SELECT child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at FROM ratings",
  );
  if (ratingRows.length > 0) {
    for (const row of ratingRows[0].values) {
      const key = `${row[0]}::${row[1]}::${row[2]}::${row[3]}::${row[4]}`;
      ratings[key] = {
        status: row[5] as "emerging" | "developing" | "secure",
        updatedAt: row[6] as string,
      };
    }
  }

  db.close();

  const current = getStore();
  const childMap = new Map(current.children.map((c) => [c.id, c]));
  children.forEach((c) => childMap.set(c.id, c));

  setStore({
    children: [...childMap.values()],
    ratings: { ...current.ratings, ...ratings },
  });
}
