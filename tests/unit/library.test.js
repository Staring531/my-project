import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../../src/server/db.js";
import {
  addPhoto,
  addPhotoToNamedAlbum,
  createNamedAlbum,
} from "../../src/server/library.js";
import {
  exifJpeg,
  gifBytes,
  jpegBytes,
  pngBytes,
  removeDir,
  tempDataDir,
  textBytes,
  webpBytes,
} from "../helpers.js";

function ownerId(db) {
  const existing = db.prepare("SELECT id FROM people LIMIT 1").get();
  if (existing) return existing.id;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO people (id, name, secret_hash, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(id, `owner-${id.slice(0, 8)}`, "test-hash", "2026-10-15T00:00:00.000Z");
  return id;
}

async function add(dataDir, bytes, name = "photo.jpg") {
  const db = openDatabase(dataDir);
  try {
    return await addPhoto(db, {
      dataDir,
      bytes,
      originalName: name,
      addedAt: "2026-10-15T02:30:00.000Z",
      timeZone: "UTC",
      ownerId: ownerId(db),
    });
  } finally {
    db.close();
  }
}

describe("addPhoto", () => {
  it("stores one photo and returns the same row for the same bytes", async () => {
    const dataDir = await tempDataDir();
    try {
      const first = await add(dataDir, exifJpeg("2026:10:15 09:30:00"));
      const second = await add(
        dataDir,
        exifJpeg("2026:10:15 09:30:00"),
        "again.jpg",
      );
      assert.equal(first.status, "added");
      assert.equal(first.photo.public, false);
      assert.equal(typeof first.photo.ownerId, "string");
      assert.equal(second.status, "duplicate");
      assert.equal(second.photo.ownerId, first.photo.ownerId);
      assert.equal(second.photo.public, false);
      assert.equal(second.photo.id, first.photo.id);
      const db = openDatabase(dataDir);
      const count = db
        .prepare("SELECT COUNT(*) AS count FROM photos")
        .get().count;
      db.close();
      assert.equal(count, 1);
    } finally {
      await removeDir(dataDir);
    }
  });

  it("skips empty and non-image files", async () => {
    const dataDir = await tempDataDir();
    try {
      assert.deepEqual(await add(dataDir, Buffer.alloc(0)), {
        status: "skipped",
        reason: "unreadable",
      });
      assert.deepEqual(await add(dataDir, textBytes(), "notes.jpg"), {
        status: "skipped",
        reason: "unsupported-type",
      });
      assert.equal(
        (await add(dataDir, pngBytes(), "plain.png")).photo.dateAssigned,
        true,
      );
      assert.equal(
        (await add(dataDir, gifBytes(), "anim.gif")).status,
        "added",
      );
      assert.equal(
        (await add(dataDir, webpBytes(), "still.webp")).status,
        "added",
      );
      assert.equal(
        (await add(dataDir, jpegBytes(), "plain.jpg")).photo.albumDate,
        "2026-10-15",
      );
    } finally {
      await removeDir(dataDir);
    }
  });

  it("leaves neither a row nor a file when writing fails", async () => {
    const dataDir = await tempDataDir();
    const db = openDatabase(dataDir);
    const images = path.join(dataDir, "images");
    rmSync(images, { recursive: true, force: true });
    writeFileSync(images, "blocked");
    try {
      await assert.rejects(
        () =>
          addPhoto(db, {
            dataDir,
            bytes: jpegBytes(),
            originalName: "blocked.jpg",
            addedAt: "2026-10-15T02:30:00.000Z",
            timeZone: "UTC",
            ownerId: ownerId(db),
          }),
        /store/i,
      );
      const count = db
        .prepare("SELECT COUNT(*) AS count FROM photos")
        .get().count;
      assert.equal(count, 0);
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });
});

describe("named album names", () => {
  it("stores the trimmed name and uses the first picture as the cover", async () => {
    const dataDir = await tempDataDir();
    const db = openDatabase(dataDir);
    const owner = ownerId(db);
    const other = randomUUID();
    db.prepare(
      `INSERT INTO people (id, name, secret_hash, created_at) VALUES (?, ?, ?, ?)`,
    ).run(other, "Other", "hash", "2026-10-15T00:00:00.000Z");
    try {
      const holiday = createNamedAlbum(db, owner, "  Holiday  ");
      assert.equal(holiday.album.name, "Holiday");
      assert.equal(createNamedAlbum(db, owner, "holiday").status, "created");
      const first = await addPhoto(db, {
        dataDir,
        bytes: jpegBytes(),
        originalName: "first.jpg",
        addedAt: "2026-10-15T02:30:00.000Z",
        timeZone: "UTC",
        ownerId: owner,
      });
      const second = await addPhoto(db, {
        dataDir,
        bytes: pngBytes(),
        originalName: "second.png",
        addedAt: "2026-10-15T03:30:00.000Z",
        timeZone: "UTC",
        ownerId: owner,
      });
      addPhotoToNamedAlbum(db, owner, holiday.album.id, first.photo.id);
      const withSecond = addPhotoToNamedAlbum(
        db,
        owner,
        holiday.album.id,
        second.photo.id,
      );
      assert.equal(withSecond.album.coverImageUrl, first.photo.imageUrl);
      assert.equal(withSecond.album.photoCount, 2);
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });
});
