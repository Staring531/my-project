import { createHash, randomUUID } from "node:crypto";
import { albumFieldsFromTaken, assignedAlbumDate, parts } from "./dates.js";
import { readDateTimeOriginal } from "./exif-date.js";
import {
  deleteImage,
  detectMediaType,
  extensionForMediaType,
  imageIsShowable,
  readStoredImage,
  removeImage,
  writeImage,
} from "./files.js";

const PHOTO_ORDER = "taken_at ASC, added_seq ASC";
const VISIBLE = `(
  (? IS NOT NULL AND photos.owner_id = ?)
  OR photos.is_public = 1
  OR EXISTS (
    SELECT 1 FROM album_publications
    WHERE album_publications.owner_id = photos.owner_id
      AND album_publications.album_date = photos.album_date
      AND album_publications.date_assigned = photos.date_assigned
  )
)`;

export function albumKey(ownerId, albumDate, dateAssigned) {
  if (!ownerId) return `unowned:${albumDate}:${dateAssigned}`;
  return `${ownerId}:${albumDate}:${dateAssigned}`;
}

export function parseNamedAlbumId(albumId) {
  const named =
    /^named:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
      albumId,
    );
  return named ? named[1] : null;
}

export function parseAlbumId(albumId) {
  const unowned = /^unowned:(\d{4}-\d{2}-\d{2}):([01])$/.exec(albumId);
  if (unowned) {
    return {
      ownerId: null,
      albumDate: unowned[1],
      dateAssigned: Number(unowned[2]),
    };
  }
  const owned =
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):(\d{4}-\d{2}-\d{2}):([01])$/i.exec(
      albumId,
    );
  if (!owned) return null;
  return {
    ownerId: owned[1],
    albumDate: owned[2],
    dateAssigned: Number(owned[3]),
  };
}

function sameOwner(left, right) {
  return left === right;
}

function publicationExists(db, ownerId, albumDate, dateAssigned) {
  if (!ownerId) return false;
  return Boolean(
    db
      .prepare(
        `SELECT 1 AS ok FROM album_publications
         WHERE owner_id = ? AND album_date = ? AND date_assigned = ?`,
      )
      .get(ownerId, albumDate, dateAssigned),
  );
}

function namedAlbumPublished(db, namedAlbumId) {
  return Boolean(
    db
      .prepare(
        "SELECT 1 AS ok FROM named_album_publications WHERE named_album_id = ?",
      )
      .get(namedAlbumId),
  );
}

function visibleInNamedAlbum(db, photoId, viewerId) {
  return Boolean(
    db
      .prepare(
        `SELECT 1 AS ok
         FROM named_album_photos
         JOIN named_albums
           ON named_albums.id = named_album_photos.named_album_id
         WHERE named_album_photos.photo_id = ?
           AND (
             (? IS NOT NULL AND named_albums.owner_id = ?)
             OR EXISTS (
               SELECT 1 FROM named_album_publications
               WHERE named_album_publications.named_album_id = named_albums.id
             )
           )`,
      )
      .get(photoId, viewerId, viewerId),
  );
}

export function canSee(db, row, viewerId) {
  if (!row) return false;
  if (viewerId && row.owner_id === viewerId) return true;
  if (row.is_public === 1) return true;
  if (publicationExists(db, row.owner_id, row.album_date, row.date_assigned)) {
    return true;
  }
  return visibleInNamedAlbum(db, row.id, viewerId);
}

function toPhoto(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    public: row.is_public === 1,
    albumId: albumKey(row.owner_id, row.album_date, row.date_assigned),
    albumDate: row.album_date,
    dateAssigned: row.date_assigned === 1,
    takenAt: row.taken_at,
    addedAt: row.added_at,
    imageUrl: `/images/${row.stored_name}`,
  };
}

function toAlbum(db, group, coverName) {
  const { year, month } = parts(group.album_date);
  const published =
    !group.owner_id ||
    publicationExists(
      db,
      group.owner_id,
      group.album_date,
      group.date_assigned,
    );
  return {
    id: albumKey(group.owner_id, group.album_date, group.date_assigned),
    ownerId: group.owner_id,
    albumDate: group.album_date,
    year,
    month,
    photoCount: group.photo_count,
    dateAssigned: group.date_assigned === 1,
    public: published,
    coverImageUrl: coverName ? `/images/${coverName}` : null,
  };
}

function showableCoverName(dataDir, names) {
  let missing = null;
  for (const name of names) {
    if (!dataDir) return name;
    const bytes = readStoredImage(dataDir, name);
    if (!bytes) {
      if (!missing) missing = name;
      continue;
    }
    if (imageIsShowable(bytes)) return name;
  }
  return missing;
}

function ownerClause(ownerId) {
  if (ownerId) return { sql: "photos.owner_id = ?", params: [ownerId] };
  return { sql: "photos.owner_id IS NULL", params: [] };
}

export function listAlbums(db, viewerId = null, dataDir = null) {
  const groups = db
    .prepare(
      `SELECT photos.owner_id AS owner_id, photos.album_date AS album_date,
              photos.date_assigned AS date_assigned, COUNT(*) AS photo_count
       FROM photos
       WHERE ${VISIBLE}
       GROUP BY photos.owner_id, photos.album_date, photos.date_assigned
       ORDER BY photos.album_date DESC, photos.date_assigned ASC,
                photos.owner_id IS NOT NULL, photos.owner_id ASC`,
    )
    .all(viewerId, viewerId);
  return groups.map((group) => {
    const owner = ownerClause(group.owner_id);
    const names = db
      .prepare(
        `SELECT stored_name FROM photos
         WHERE photos.album_date = ? AND photos.date_assigned = ?
           AND ${owner.sql}
           AND ${VISIBLE}
         ORDER BY ${PHOTO_ORDER}`,
      )
      .all(
        group.album_date,
        group.date_assigned,
        ...owner.params,
        viewerId,
        viewerId,
      )
      .map((row) => row.stored_name);
    return toAlbum(db, group, showableCoverName(dataDir, names));
  });
}

function namedAlbumView(db, row) {
  const count = db
    .prepare(
      "SELECT COUNT(*) AS count FROM named_album_photos WHERE named_album_id = ?",
    )
    .get(row.id).count;
  const cover = db
    .prepare(
      `SELECT photos.stored_name AS stored_name
       FROM named_album_photos
       JOIN photos ON photos.id = named_album_photos.photo_id
       WHERE named_album_photos.named_album_id = ?
       ORDER BY named_album_photos.member_seq ASC
       LIMIT 1`,
    )
    .get(row.id);
  return {
    id: `named:${row.id}`,
    ownerId: row.owner_id,
    name: row.name,
    photoCount: count,
    public: namedAlbumPublished(db, row.id),
    coverImageUrl: cover ? `/images/${cover.stored_name}` : null,
  };
}

function canViewNamedAlbum(db, row, viewerId) {
  if (!row) return false;
  if (viewerId && row.owner_id === viewerId) return true;
  return namedAlbumPublished(db, row.id);
}

export function listNamedAlbums(db, viewerId = null) {
  const rows = db
    .prepare(
      `SELECT id, owner_id, name, created_at
       FROM named_albums
       WHERE (? IS NOT NULL AND owner_id = ?)
          OR EXISTS (
            SELECT 1 FROM named_album_publications
            WHERE named_album_publications.named_album_id = named_albums.id
          )
       ORDER BY created_at DESC, id ASC`,
    )
    .all(viewerId, viewerId);
  return rows.map((row) => namedAlbumView(db, row));
}

function listNamedAlbumPhotos(db, albumId, viewerId) {
  const id = parseNamedAlbumId(albumId);
  if (!id) return { status: "missing" };
  const row = db.prepare("SELECT * FROM named_albums WHERE id = ?").get(id);
  if (!row || !canViewNamedAlbum(db, row, viewerId))
    return { status: "missing" };
  const photos = db
    .prepare(
      `SELECT photos.*
       FROM named_album_photos
       JOIN photos ON photos.id = named_album_photos.photo_id
       WHERE named_album_photos.named_album_id = ?
       ORDER BY named_album_photos.member_seq ASC`,
    )
    .all(id);
  return {
    status: "ok",
    album: namedAlbumView(db, row),
    photos: photos.map(toPhoto),
  };
}

export function listAlbumPhotos(db, albumId, viewerId = null) {
  if (String(albumId).startsWith("named:")) {
    const named = listNamedAlbumPhotos(db, albumId, viewerId);
    if (named.status !== "ok") return { missing: "named" };
    return { album: named.album, photos: named.photos };
  }
  const parsed = parseAlbumId(albumId);
  if (!parsed) return null;
  const owner = ownerClause(parsed.ownerId);
  const rows = db
    .prepare(
      `SELECT * FROM photos
       WHERE photos.album_date = ? AND photos.date_assigned = ?
         AND ${owner.sql}
         AND ${VISIBLE}
       ORDER BY ${PHOTO_ORDER}`,
    )
    .all(
      parsed.albumDate,
      parsed.dateAssigned,
      ...owner.params,
      viewerId,
      viewerId,
    );
  if (rows.length === 0) return null;
  const album = listAlbums(db, viewerId).find(
    (item) =>
      sameOwner(item.ownerId, parsed.ownerId) &&
      item.albumDate === parsed.albumDate &&
      item.dateAssigned === (parsed.dateAssigned === 1),
  );
  return { album, photos: rows.map(toPhoto) };
}

export function photoByStoredName(db, storedName) {
  return db
    .prepare("SELECT * FROM photos WHERE stored_name = ?")
    .get(storedName);
}

function markNamedAlbumPublic(db, viewerId, albumId) {
  const id = parseNamedAlbumId(albumId);
  if (!id) return { status: "missing", scope: "named" };
  const row = db.prepare("SELECT * FROM named_albums WHERE id = ?").get(id);
  if (!row) return { status: "missing", scope: "named" };
  if (row.owner_id !== viewerId) return { status: "forbidden" };
  db.prepare(
    `INSERT INTO named_album_publications (named_album_id, published_at)
     VALUES (?, ?)
     ON CONFLICT (named_album_id) DO NOTHING`,
  ).run(id, new Date().toISOString());
  return { status: "ok", album: namedAlbumView(db, row) };
}

export function markAlbumPublic(db, viewerId, albumId) {
  if (!viewerId) return { status: "unauthorized" };
  if (String(albumId).startsWith("named:")) {
    return markNamedAlbumPublic(db, viewerId, albumId);
  }
  const parsed = parseAlbumId(albumId);
  if (!parsed?.ownerId) return { status: "forbidden" };
  if (parsed.ownerId !== viewerId) return { status: "forbidden" };
  const owned = db
    .prepare(
      `SELECT 1 AS ok FROM photos
       WHERE owner_id = ? AND album_date = ? AND date_assigned = ?`,
    )
    .get(parsed.ownerId, parsed.albumDate, parsed.dateAssigned);
  if (!owned) return { status: "missing" };
  db.prepare(
    `INSERT INTO album_publications (owner_id, album_date, date_assigned, published_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (owner_id, album_date, date_assigned) DO NOTHING`,
  ).run(
    parsed.ownerId,
    parsed.albumDate,
    parsed.dateAssigned,
    new Date().toISOString(),
  );
  const album = listAlbums(db, viewerId).find((item) => item.id === albumId);
  return { status: "ok", album };
}

export function markPhotoPublic(db, viewerId, photoId) {
  if (!viewerId) return { status: "unauthorized" };
  const row = db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId);
  if (!row) return { status: "missing" };
  if (!row.owner_id || row.owner_id !== viewerId)
    return { status: "forbidden" };
  db.prepare("UPDATE photos SET is_public = 1 WHERE id = ?").run(photoId);
  const updated = db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId);
  return { status: "ok", photo: toPhoto(updated) };
}

export async function addPhoto(
  db,
  { dataDir, bytes, originalName, addedAt, timeZone, ownerId },
) {
  if (!bytes || bytes.length === 0) {
    return { status: "skipped", reason: "unreadable" };
  }
  const mediaType = detectMediaType(bytes);
  if (!mediaType) {
    return { status: "skipped", reason: "unsupported-type" };
  }
  if (!imageIsShowable(bytes)) {
    return { status: "skipped", reason: "unreadable" };
  }

  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const existing = db
    .prepare("SELECT * FROM photos WHERE content_hash = ?")
    .get(contentHash);
  if (existing) {
    if (!canSee(db, existing, ownerId ?? null)) return { status: "duplicate" };
    return { status: "duplicate", photo: toPhoto(existing) };
  }

  if (!ownerId) return { status: "unauthorized" };

  const rawTaken = await readDateTimeOriginal(bytes);
  const taken = rawTaken ? albumFieldsFromTaken(rawTaken) : null;
  const takenAt = taken ? taken.takenAt : null;
  const albumDate = taken
    ? taken.albumDate
    : assignedAlbumDate(addedAt, timeZone);
  const dateAssigned = taken ? 0 : 1;
  const id = randomUUID();
  const storedName = `${id}.${extensionForMediaType(mediaType)}`;

  const nextSeq = db
    .prepare("SELECT COALESCE(MAX(added_seq), 0) + 1 AS next_seq FROM photos")
    .get().next_seq;

  db.exec("BEGIN");
  try {
    db.prepare(
      `INSERT INTO photos (
        id, owner_id, is_public, content_hash, stored_name, media_type, original_name,
        taken_at, added_at, added_seq, album_date, date_assigned
      ) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      ownerId,
      contentHash,
      storedName,
      mediaType,
      originalName || "photo",
      takenAt,
      addedAt,
      nextSeq,
      albumDate,
      dateAssigned,
    );
    writeImage(dataDir, storedName, bytes);
    db.exec("COMMIT");
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // The original failure is the one the caller needs to see.
    }
    removeImage(dataDir, storedName);
    const detail = error instanceof Error ? error.message : "unknown failure";
    throw new Error(`Could not store the photo: ${detail}`);
  }

  const row = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
  return { status: "added", photo: toPhoto(row) };
}

export function createNamedAlbum(db, viewerId, rawName) {
  if (!viewerId) return { status: "unauthorized" };
  const name = typeof rawName === "string" ? rawName.trim() : "";
  if (name.length < 1 || name.length > 64) return { status: "invalid" };
  const duplicate = db
    .prepare("SELECT 1 AS ok FROM named_albums WHERE owner_id = ? AND name = ?")
    .get(viewerId, name);
  if (duplicate) return { status: "conflict" };
  const id = randomUUID();
  db.prepare(
    `INSERT INTO named_albums (id, owner_id, name, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(id, viewerId, name, new Date().toISOString());
  const row = db.prepare("SELECT * FROM named_albums WHERE id = ?").get(id);
  return { status: "created", album: namedAlbumView(db, row) };
}

export function addPhotoToNamedAlbum(db, viewerId, albumId, photoId) {
  if (!viewerId) return { status: "unauthorized" };
  const namedId = parseNamedAlbumId(albumId);
  if (!namedId) return { status: "missing" };
  const album = db
    .prepare("SELECT * FROM named_albums WHERE id = ?")
    .get(namedId);
  if (!album) return { status: "missing" };
  const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId);
  if (!photo) return { status: "missing-photo" };
  if (album.owner_id !== viewerId || photo.owner_id !== viewerId) {
    return { status: "forbidden" };
  }
  const existing = db
    .prepare(
      `SELECT member_seq FROM named_album_photos
       WHERE named_album_id = ? AND photo_id = ?`,
    )
    .get(namedId, photoId);
  if (existing) {
    return { status: "present", album: namedAlbumView(db, album) };
  }
  const nextSeq = db
    .prepare(
      `SELECT COALESCE(MAX(member_seq), 0) + 1 AS next_seq
       FROM named_album_photos
       WHERE named_album_id = ?`,
    )
    .get(namedId).next_seq;
  db.prepare(
    `INSERT INTO named_album_photos (named_album_id, photo_id, member_seq)
     VALUES (?, ?, ?)`,
  ).run(namedId, photoId, nextSeq);
  return { status: "added", album: namedAlbumView(db, album) };
}

export function deletePhoto(db, { dataDir, viewerId, photoId }) {
  if (!viewerId) return { status: "unauthorized" };
  const row = db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId);
  if (!row) return { status: "missing" };
  if (!row.owner_id || row.owner_id !== viewerId)
    return { status: "forbidden" };
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM named_album_photos WHERE photo_id = ?").run(
      photoId,
    );
    db.prepare("DELETE FROM photos WHERE id = ?").run(photoId);
    deleteImage(dataDir, row.stored_name);
    db.exec("COMMIT");
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // The original failure is the one the caller needs to see.
    }
    const detail = error instanceof Error ? error.message : "unknown failure";
    throw new Error(`Could not delete the picture: ${detail}`);
  }
  return { status: "deleted" };
}

function makeNamedAlbumPrivate(db, viewerId, albumId) {
  const id = parseNamedAlbumId(albumId);
  if (!id) return { status: "missing", scope: "named" };
  const row = db.prepare("SELECT * FROM named_albums WHERE id = ?").get(id);
  if (!row) return { status: "missing", scope: "named" };
  if (row.owner_id !== viewerId) return { status: "forbidden" };
  db.prepare(
    "DELETE FROM named_album_publications WHERE named_album_id = ?",
  ).run(id);
  return { status: "ok", album: namedAlbumView(db, row) };
}

export function makeAlbumPrivate(db, viewerId, albumId) {
  if (!viewerId) return { status: "unauthorized" };
  if (String(albumId).startsWith("named:")) {
    return makeNamedAlbumPrivate(db, viewerId, albumId);
  }
  const parsed = parseAlbumId(albumId);
  if (!parsed) return { status: "missing", scope: "date" };
  if (!parsed.ownerId || parsed.ownerId !== viewerId) {
    return { status: "forbidden" };
  }
  const owned = db
    .prepare(
      `SELECT 1 AS ok FROM photos
       WHERE owner_id = ? AND album_date = ? AND date_assigned = ?`,
    )
    .get(parsed.ownerId, parsed.albumDate, parsed.dateAssigned);
  if (!owned) return { status: "missing", scope: "date" };
  db.prepare(
    `DELETE FROM album_publications
     WHERE owner_id = ? AND album_date = ? AND date_assigned = ?`,
  ).run(parsed.ownerId, parsed.albumDate, parsed.dateAssigned);
  const album = listAlbums(db, viewerId).find((item) => item.id === albumId);
  return { status: "ok", album };
}
