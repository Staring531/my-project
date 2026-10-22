import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { openDatabase } from "../src/server/db.js";
import { startServer } from "../src/server/server.js";

export async function tempDataDir() {
  return mkdtemp(path.join(tmpdir(), "photo-albums-"));
}

export async function removeDir(dataDir) {
  await rm(dataDir, { recursive: true, force: true });
}

export async function withServer(dataDir, fn) {
  const started = await startServer({ dataDir, port: 0 });
  const base = `http://127.0.0.1:${started.port}`;
  try {
    await fn({ ...started, dataDir, base });
  } finally {
    await started.close();
  }
}

const SHOWABLE_JPEG = [
  Buffer.from(
    "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+L6KKK/lM/38P//Z",
    "base64",
  ),
  Buffer.from(
    "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A/HOiiiv9/D8rP//Z",
    "base64",
  ),
];

export function jpegBytes(variant = 0) {
  return Buffer.from(SHOWABLE_JPEG[variant] ?? SHOWABLE_JPEG[0]);
}

export function textBytes() {
  return Buffer.from("not a photo");
}

export function pngBytes() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

export function gifBytes() {
  return Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
}

export function webpBytes() {
  return Buffer.from(
    "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
    "base64",
  );
}

export function exifJpeg(dateTimeOriginal) {
  const value = Buffer.from(`${dateTimeOriginal}\0`, "ascii");
  const tiff = Buffer.alloc(44 + value.length);
  tiff.write("II", 0, "ascii");
  tiff.writeUInt16LE(42, 2);
  tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(1, 8);
  tiff.writeUInt16LE(0x8769, 10);
  tiff.writeUInt16LE(4, 12);
  tiff.writeUInt32LE(1, 14);
  tiff.writeUInt32LE(26, 18);
  tiff.writeUInt32LE(0, 22);
  tiff.writeUInt16LE(1, 26);
  tiff.writeUInt16LE(0x9003, 28);
  tiff.writeUInt16LE(2, 30);
  tiff.writeUInt32LE(value.length, 32);
  tiff.writeUInt32LE(44, 36);
  tiff.writeUInt32LE(0, 40);
  value.copy(tiff, 44);

  const payload = Buffer.concat([Buffer.from("Exif\0\0", "ascii"), tiff]);
  const marker = Buffer.alloc(4);
  marker[0] = 0xff;
  marker[1] = 0xe1;
  marker.writeUInt16BE(payload.length + 2, 2);
  const picture = jpegBytes();
  return Buffer.concat([
    picture.subarray(0, 2),
    marker,
    payload,
    picture.subarray(2),
  ]);
}

export function seedPhoto(db, overrides = {}) {
  const row = {
    id: overrides.id ?? crypto.randomUUID(),
    contentHash:
      overrides.contentHash ?? crypto.randomUUID().replaceAll("-", ""),
    storedName: overrides.storedName,
    mediaType: overrides.mediaType ?? "image/jpeg",
    originalName: overrides.originalName ?? "photo.jpg",
    takenAt:
      overrides.takenAt === undefined
        ? "2026-10-15T09:30:00"
        : overrides.takenAt,
    addedAt: overrides.addedAt ?? "2026-10-15T01:02:03.000Z",
    addedSeq: overrides.addedSeq ?? 1,
    albumDate: overrides.albumDate ?? "2026-10-15",
    dateAssigned: overrides.dateAssigned ?? 0,
  };
  if (row.dateAssigned === 1) row.takenAt = null;
  row.storedName ??= `${row.id}.jpg`;
  db.prepare(
    `INSERT INTO photos (
      id, content_hash, stored_name, media_type, original_name,
      taken_at, added_at, added_seq, album_date, date_assigned
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    row.id,
    row.contentHash,
    row.storedName,
    row.mediaType,
    row.originalName,
    row.takenAt,
    row.addedAt,
    row.addedSeq,
    row.albumDate,
    row.dateAssigned,
  );
  return row;
}

export async function postPhoto(
  base,
  bytes,
  originalName = "photo.jpg",
  cookie,
) {
  const headers = {
    "content-type": "application/octet-stream",
    "x-original-name": encodeURIComponent(originalName),
  };
  if (cookie) headers.cookie = cookie;
  const response = await fetch(`${base}/api/photos`, {
    method: "POST",
    headers,
    body: bytes,
  });
  const body = await response.json();
  return { status: response.status, body };
}

export async function signIn(base, name, secret) {
  const signed = await fetch(`${base}/api/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, secret }),
  });
  const setCookie = signed.headers.get("set-cookie") ?? "";
  const token = /session=([^;]+)/.exec(setCookie)?.[1];
  return {
    status: signed.status,
    cookie: token ? `session=${token}` : "",
    body: await signed.json(),
  };
}

export async function openSession(base, name, secret) {
  const created = await fetch(`${base}/api/accounts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, secret }),
  });
  const createdBody = await created.json();
  const signed = await signIn(base, name, secret);
  return {
    status: signed.status,
    createdStatus: created.status,
    person: createdBody.person,
    cookie: signed.cookie,
    body: signed.body,
  };
}

export function openLibrary(dataDir) {
  return openDatabase(dataDir);
}
