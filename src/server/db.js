import { accessSync, constants, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  secret_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (length(trim(name)) BETWEEN 1 AND 64)
) STRICT;

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id),
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS album_publications (
  owner_id TEXT NOT NULL REFERENCES people(id),
  album_date TEXT NOT NULL,
  date_assigned INTEGER NOT NULL CHECK (date_assigned IN (0, 1)),
  published_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, album_date, date_assigned),
  CHECK (date(album_date) = album_date)
) STRICT;

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES people(id),
  is_public INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),
  content_hash TEXT NOT NULL UNIQUE,
  stored_name TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL CHECK (
    media_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp')
  ),
  original_name TEXT NOT NULL,
  taken_at TEXT,
  added_at TEXT NOT NULL,
  added_seq INTEGER NOT NULL UNIQUE,
  album_date TEXT NOT NULL,
  date_assigned INTEGER NOT NULL CHECK (date_assigned IN (0, 1)),
  CHECK (date(album_date) = album_date),
  CHECK (
    (
      date_assigned = 0
      AND taken_at IS NOT NULL
      AND substr(taken_at, 1, 10) = album_date
    )
    OR (date_assigned = 1 AND taken_at IS NULL)
  ),
  CHECK (
    instr(stored_name, '/') = 0
    AND instr(stored_name, char(92)) = 0
  ),
  CHECK (owner_id IS NOT NULL OR is_public = 1)
) STRICT;

CREATE TABLE IF NOT EXISTS named_albums (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES people(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (owner_id, name),
  CHECK (length(name) BETWEEN 1 AND 64),
  CHECK (name = trim(name))
) STRICT;

CREATE TABLE IF NOT EXISTS named_album_photos (
  named_album_id TEXT NOT NULL REFERENCES named_albums(id),
  photo_id TEXT NOT NULL REFERENCES photos(id),
  member_seq INTEGER NOT NULL,
  PRIMARY KEY (named_album_id, photo_id),
  UNIQUE (named_album_id, member_seq)
) STRICT;

CREATE TABLE IF NOT EXISTS named_album_publications (
  named_album_id TEXT PRIMARY KEY REFERENCES named_albums(id),
  published_at TEXT NOT NULL
) STRICT;
`;

function columnNames(db, table) {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((column) => column.name);
}

function migratePhotos(db) {
  const names = columnNames(db, "photos");
  if (names.length === 0 || names.includes("owner_id")) return;
  db.exec("ALTER TABLE photos ADD COLUMN owner_id TEXT REFERENCES people(id)");
  db.exec(
    "ALTER TABLE photos ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1))",
  );
  db.exec("UPDATE photos SET is_public = 1 WHERE owner_id IS NULL");
}

function refuseUnwritable(databasePath, reason) {
  throw new Error(
    `Could not open the library database at ${databasePath}: ${reason}`,
  );
}

export function openDatabase(dataDir) {
  const databasePath = path.join(dataDir, "library.sqlite");
  try {
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(path.join(dataDir, "images"), { recursive: true });
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "the database directory is not writable.";
    refuseUnwritable(databasePath, detail);
  }
  try {
    accessSync(dataDir, constants.W_OK);
  } catch {
    refuseUnwritable(databasePath, "the database directory is not writable.");
  }
  if (existsSync(databasePath)) {
    try {
      accessSync(databasePath, constants.W_OK);
    } catch {
      refuseUnwritable(databasePath, "the database file is not writable.");
    }
  }
  const db = new DatabaseSync(databasePath);
  try {
    db.exec("BEGIN IMMEDIATE");
    db.exec("ROLLBACK");
  } catch (error) {
    db.close();
    const detail = error instanceof Error ? error.message : "unknown failure";
    refuseUnwritable(databasePath, detail);
  }
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);
  migratePhotos(db);
  return db;
}
