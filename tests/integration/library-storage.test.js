import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { assignedAlbumDate } from "../../src/server/dates.js";
import {
  addPhoto,
  addPhotoToNamedAlbum,
  canSee,
  createNamedAlbum,
  deletePhoto,
  listAlbumPhotos,
  listAlbums,
  makeAlbumPrivate,
  markAlbumPublic,
} from "../../src/server/library.js";
import {
  exifJpeg,
  jpegBytes,
  openLibrary,
  openSession,
  postPhoto,
  removeDir,
  seedPhoto,
  signIn,
  tempDataDir,
  textBytes,
  withServer,
} from "../helpers.js";

describe("library storage", () => {
  it("groups seeded photos into date albums with a stable cover", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const earliest = seedPhoto(db, {
      albumDate: "2026-10-02",
      takenAt: "2026-10-02T08:00:00",
      addedSeq: 1,
    });
    seedPhoto(db, {
      albumDate: "2026-10-02",
      takenAt: "2026-10-02T20:00:00",
      addedSeq: 2,
    });
    const firstTie = seedPhoto(db, {
      albumDate: "2026-10-03",
      takenAt: "2026-10-03T12:00:00",
      addedSeq: 3,
    });
    seedPhoto(db, {
      albumDate: "2026-10-03",
      takenAt: "2026-10-03T12:00:00",
      addedSeq: 4,
    });
    seedPhoto(db, {
      albumDate: "2026-10-05",
      takenAt: "2026-10-05T09:00:00",
      addedSeq: 5,
    });
    seedPhoto(db, {
      albumDate: "2026-10-07",
      takenAt: "2026-10-07T09:00:00",
      addedSeq: 6,
    });
    seedPhoto(db, {
      albumDate: "2025-12-31",
      takenAt: "2025-12-31T09:00:00",
      addedSeq: 7,
    });
    seedPhoto(db, {
      albumDate: "2026-10-02",
      dateAssigned: 1,
      addedSeq: 8,
      addedAt: "2026-10-02T03:00:00.000Z",
    });
    db.close();

    try {
      await withServer(dataDir, async ({ base }) => {
        const body = await (await fetch(`${base}/api/albums`)).json();
        const ids = body.albums.map((album) => album.id);
        assert.deepEqual(ids, [
          "unowned:2026-10-07:0",
          "unowned:2026-10-05:0",
          "unowned:2026-10-03:0",
          "unowned:2026-10-02:0",
          "unowned:2026-10-02:1",
          "unowned:2025-12-31:0",
        ]);
        assert.equal(ids.includes("unowned:2026-10-04:0"), false);
        assert.equal(ids.includes("unowned:2026-10-06:0"), false);
        const second = body.albums.find(
          (album) => album.id === "unowned:2026-10-02:0",
        );
        assert.equal(second.photoCount, 2);
        assert.equal(second.coverImageUrl, `/images/${earliest.storedName}`);
        const tie = body.albums.find(
          (album) => album.id === "unowned:2026-10-03:0",
        );
        assert.equal(tie.coverImageUrl, `/images/${firstTie.storedName}`);
        const assignedAlbum = body.albums.find(
          (album) => album.id === "unowned:2026-10-02:1",
        );
        assert.equal(assignedAlbum.dateAssigned, true);
        assert.equal(assignedAlbum.year, 2026);
        assert.equal(assignedAlbum.month, 10);
        assert.equal(body.albums.at(-1).year, 2025);
        assert.equal(body.albums.at(-1).month, 12);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("returns only the opened album and keeps the library unchanged", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const early = seedPhoto(db, {
      albumDate: "2026-10-15",
      takenAt: "2026-10-15T07:00:00",
      addedSeq: 1,
    });
    const later = seedPhoto(db, {
      albumDate: "2026-10-15",
      takenAt: "2026-10-15T19:00:00",
      addedSeq: 2,
    });
    const other = seedPhoto(db, {
      albumDate: "2026-10-16",
      takenAt: "2026-10-16T07:00:00",
      addedSeq: 3,
    });
    db.close();
    try {
      await withServer(dataDir, async ({ base }) => {
        const before = await (await fetch(`${base}/api/albums`)).json();
        const opened = await (
          await fetch(`${base}/api/albums/unowned:2026-10-15:0/photos`)
        ).json();
        assert.deepEqual(
          opened.photos.map((photo) => photo.id),
          [early.id, later.id],
        );
        assert.equal(
          opened.photos.some((photo) => photo.id === other.id),
          false,
        );
        const after = await (await fetch(`${base}/api/albums`)).json();
        assert.deepEqual(after, before);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("stores a file and row, ignores duplicates, skips non-photos, and reloads", async () => {
    const dataDir = await tempDataDir();
    try {
      let addedId;
      await withServer(dataDir, async ({ base }) => {
        const session = await openSession(base, "Ada", "library-secret");
        const added = await postPhoto(
          base,
          exifJpeg("2026:10:15 23:30:00"),
          "night.jpg",
          session.cookie,
        );
        assert.equal(added.status, 201);
        assert.equal(added.body.photo.albumDate, "2026-10-15");
        addedId = added.body.photo.id;
        const storedName = added.body.photo.imageUrl.replace("/images/", "");
        assert.equal(
          existsSync(path.join(dataDir, "images", storedName)),
          true,
        );

        const duplicate = await postPhoto(
          base,
          exifJpeg("2026:10:15 23:30:00"),
          "night-copy.jpg",
          session.cookie,
        );
        assert.equal(duplicate.status, 200);
        const albums = await (
          await fetch(`${base}/api/albums`, {
            headers: { cookie: session.cookie },
          })
        ).json();
        assert.equal(albums.albums[0].photoCount, 1);

        const skipped = await postPhoto(
          base,
          textBytes(),
          "notes.jpg",
          session.cookie,
        );
        assert.equal(skipped.body.status, "skipped");
        const still = await (
          await fetch(`${base}/api/albums`, {
            headers: { cookie: session.cookie },
          })
        ).json();
        assert.equal(still.albums[0].photoCount, 1);

        const plain = await postPhoto(
          base,
          jpegBytes(),
          "no-date.jpg",
          session.cookie,
        );
        const expected = assignedAlbumDate(
          plain.body.photo.addedAt,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
        assert.equal(plain.body.photo.dateAssigned, true);
        assert.equal(plain.body.photo.albumDate, expected);
      });

      await withServer(dataDir, async ({ base }) => {
        const session = await signIn(base, "Ada", "library-secret");
        const albums = await (
          await fetch(`${base}/api/albums`, {
            headers: { cookie: session.cookie },
          })
        ).json();
        const taken = albums.albums.find(
          (album) => album.albumDate === "2026-10-15" && !album.dateAssigned,
        );
        assert.ok(taken);
        assert.equal(taken.photoCount, 1);
        assert.equal(taken.dateAssigned, false);
        const photos = await (
          await fetch(`${base}/api/albums/${taken.id}/photos`, {
            headers: { cookie: session.cookie },
          })
        ).json();
        assert.equal(photos.photos[0].id, addedId);
        const assigned = albums.albums.find((album) => album.dateAssigned);
        assert.equal(assigned.dateAssigned, true);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("leaves neither a row nor a file when the image cannot be written", async () => {
    const dataDir = await tempDataDir();
    const images = path.join(dataDir, "images");
    try {
      await withServer(dataDir, async ({ base }) => {
        const session = await openSession(base, "Ada", "library-secret");
        rmSync(images, { recursive: true, force: true });
        writeFileSync(images, "not a directory");
        const failed = await postPhoto(
          base,
          jpegBytes(),
          "blocked.jpg",
          session.cookie,
        );
        assert.equal(failed.status, 500);
        assert.match(failed.body.error, /store/i);
      });
      rmSync(images, { force: true });
      const db = openLibrary(dataDir);
      const count = db
        .prepare("SELECT COUNT(*) AS count FROM photos")
        .get().count;
      db.close();
      assert.equal(count, 0);
      assert.equal(
        existsSync(path.join(dataDir, "images", "blocked.jpg")),
        false,
      );
    } finally {
      await removeDir(dataDir);
    }
  });

  it("keeps another person's private photo hidden and leaves pre-existing photos unowned", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const existing = seedPhoto(db, {
      albumDate: "2026-10-01",
      takenAt: "2026-10-01T08:00:00",
      addedSeq: 1,
    });
    db.close();
    try {
      await withServer(dataDir, async ({ base }) => {
        const ada = await openSession(base, "Ada", "ada-secret");
        const added = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "ada.jpg",
          ada.cookie,
        );
        assert.equal(added.status, 201);
        const laterOnPublicDay = await postPhoto(
          base,
          exifJpeg("2026:10:01 18:00:00"),
          "later-private.jpg",
          ada.cookie,
        );
        assert.equal(laterOnPublicDay.status, 201);
        assert.equal(laterOnPublicDay.body.photo.public, false);
        const bea = await openSession(base, "Bea", "bea-secret");
        const beaSameDay = await postPhoto(
          base,
          exifJpeg("2026:10:15 11:00:00"),
          "bea.jpg",
          bea.cookie,
        );
        assert.equal(beaSameDay.status, 201);
        assert.notEqual(
          beaSameDay.body.photo.albumId,
          added.body.photo.albumId,
        );
        const beaAlbums = await (
          await fetch(`${base}/api/albums`, {
            headers: { cookie: bea.cookie },
          })
        ).json();
        assert.equal(
          beaAlbums.albums.some(
            (album) => album.id === added.body.photo.albumId,
          ),
          false,
        );
        assert.equal(
          beaAlbums.albums.some(
            (album) => album.id === laterOnPublicDay.body.photo.albumId,
          ),
          false,
        );
        assert.equal(
          beaAlbums.albums.filter((album) => album.albumDate === "2026-10-15")
            .length,
          1,
        );
        const publicAlbum = beaAlbums.albums.find(
          (album) => album.id === `unowned:${existing.albumDate}:0`,
        );
        assert.equal(publicAlbum.photoCount, 1);
        const publicPhotos = await (
          await fetch(`${base}/api/albums/${publicAlbum.id}/photos`)
        ).json();
        assert.equal(publicPhotos.photos.length, 1);
        assert.equal(publicPhotos.photos[0].id, existing.id);
        const opened = await fetch(
          `${base}/api/albums/${added.body.photo.albumId}/photos`,
          { headers: { cookie: bea.cookie } },
        );
        assert.equal(opened.status, 404);
        assert.deepEqual(await opened.json(), {
          error: "No album exists for that date.",
        });
        const stored = openLibrary(dataDir);
        const row = stored
          .prepare("SELECT owner_id, is_public FROM photos WHERE id = ?")
          .get(existing.id);
        stored.close();
        assert.equal(row.owner_id, null);
        assert.equal(row.is_public, 1);
        const beforeFiles = readdirSync(path.join(dataDir, "images"));
        const unsigned = await postPhoto(base, jpegBytes(), "later.jpg");
        assert.equal(unsigned.status, 401);
        assert.deepEqual(
          readdirSync(path.join(dataDir, "images")).sort(),
          beforeFiles.sort(),
        );
        const after = openLibrary(dataDir);
        const count = after
          .prepare("SELECT COUNT(*) AS count FROM photos")
          .get().count;
        after.close();
        assert.equal(count, 4);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("does not create an account when the library database is not writable", async () => {
    const dataDir = await tempDataDir();
    const databasePath = path.join(dataDir, "library.sqlite");
    const db = openLibrary(dataDir);
    db.close();
    chmodSync(databasePath, 0o444);
    try {
      await assert.rejects(
        () => withServer(dataDir, async () => {}),
        (error) => {
          assert.equal(error instanceof Error, true);
          assert.match(
            error.message,
            /Could not open the library database at /,
          );
          assert.ok(error.message.includes(databasePath));
          assert.notEqual(
            error.message,
            "attempt to write a readonly database",
          );
          return true;
        },
      );
      chmodSync(databasePath, 0o644);
      const stored = openLibrary(dataDir);
      const count = stored
        .prepare("SELECT COUNT(*) AS count FROM people")
        .get().count;
      stored.close();
      assert.equal(count, 0);
    } finally {
      chmodSync(databasePath, 0o644);
      await removeDir(dataDir);
    }
  });

  it("names the database path when a write is refused after startup", async () => {
    const dataDir = await tempDataDir();
    const databasePath = path.join(dataDir, "library.sqlite");
    try {
      await withServer(dataDir, async ({ base }) => {
        chmodSync(dataDir, 0o555);
        const response = await fetch(`${base}/api/accounts`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "ttt", secret: "ttt" }),
        });
        const body = await response.json();
        assert.notEqual(response.status, 201);
        assert.ok(body.error.includes(databasePath));
        assert.notEqual(body.error, "attempt to write a readonly database");
        chmodSync(dataDir, 0o755);
        const stored = openLibrary(dataDir);
        const count = stored
          .prepare("SELECT COUNT(*) AS count FROM people WHERE name = ?")
          .get("ttt").count;
        stored.close();
        assert.equal(count, 0);
      });
    } finally {
      chmodSync(dataDir, 0o755);
      await removeDir(dataDir);
    }
  });

  it("stores a trimmed named album and one membership without moving the day", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const ada = randomUUID();
    const bea = randomUUID();
    db.prepare(
      `INSERT INTO people (id, name, secret_hash, created_at)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
    ).run(
      ada,
      "Ada",
      "hash",
      "2026-10-15T00:00:00.000Z",
      bea,
      "Bea",
      "hash",
      "2026-10-15T00:00:00.000Z",
    );
    const photo = await addPhoto(db, {
      dataDir,
      bytes: jpegBytes(),
      originalName: "day.jpg",
      addedAt: "2026-10-15T02:30:00.000Z",
      timeZone: "UTC",
      ownerId: ada,
    });
    const unowned = seedPhoto(db, {
      albumDate: "2026-10-01",
      takenAt: "2026-10-01T08:00:00",
      addedSeq: 9,
    });
    try {
      assert.equal(
        createNamedAlbum(db, null, "Holiday").status,
        "unauthorized",
      );
      assert.equal(createNamedAlbum(db, ada, "   ").status, "invalid");
      assert.equal(createNamedAlbum(db, ada, "x".repeat(65)).status, "invalid");
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM named_albums").get().count,
        0,
      );
      const created = createNamedAlbum(db, ada, "  Holiday  ");
      assert.equal(created.status, "created");
      assert.equal(created.album.name, "Holiday");
      assert.equal(created.album.public, false);
      assert.equal(created.album.photoCount, 0);
      assert.equal(created.album.coverImageUrl, null);
      assert.equal(createNamedAlbum(db, ada, "Holiday").status, "conflict");
      const other = createNamedAlbum(db, bea, "Holiday");
      assert.equal(other.status, "created");
      const beforeDate = db
        .prepare("SELECT album_date FROM photos WHERE id = ?")
        .get(photo.photo.id).album_date;
      const linked = addPhotoToNamedAlbum(
        db,
        ada,
        created.album.id,
        photo.photo.id,
      );
      assert.equal(linked.status, "added");
      assert.equal(linked.album.photoCount, 1);
      assert.equal(linked.album.coverImageUrl, photo.photo.imageUrl);
      const again = addPhotoToNamedAlbum(
        db,
        ada,
        created.album.id,
        photo.photo.id,
      );
      assert.equal(again.status, "present");
      assert.equal(again.album.photoCount, 1);
      const seq = db
        .prepare("SELECT member_seq FROM named_album_photos WHERE photo_id = ?")
        .get(photo.photo.id).member_seq;
      assert.equal(
        db
          .prepare("SELECT album_date FROM photos WHERE id = ?")
          .get(photo.photo.id).album_date,
        beforeDate,
      );
      assert.equal(
        addPhotoToNamedAlbum(db, bea, created.album.id, photo.photo.id).status,
        "forbidden",
      );
      assert.equal(
        addPhotoToNamedAlbum(db, ada, created.album.id, unowned.id).status,
        "forbidden",
      );
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM named_album_photos").get()
          .count,
        1,
      );
      assert.equal(
        db
          .prepare(
            "SELECT member_seq FROM named_album_photos WHERE photo_id = ?",
          )
          .get(photo.photo.id).member_seq,
        seq,
      );
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });

  it("removes an owned picture from every album and leaves a failed delete in place", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const ada = randomUUID();
    const bea = randomUUID();
    db.prepare(
      `INSERT INTO people (id, name, secret_hash, created_at)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
    ).run(
      ada,
      "Ada",
      "hash",
      "2026-10-15T00:00:00.000Z",
      bea,
      "Bea",
      "hash",
      "2026-10-15T00:00:00.000Z",
    );
    const first = await addPhoto(db, {
      dataDir,
      bytes: jpegBytes(),
      originalName: "first.jpg",
      addedAt: "2026-10-15T02:30:00.000Z",
      timeZone: "UTC",
      ownerId: ada,
    });
    const secondBytes = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0xd9]);
    const second = await addPhoto(db, {
      dataDir,
      bytes: secondBytes,
      originalName: "second.jpg",
      addedAt: "2026-10-15T03:30:00.000Z",
      timeZone: "UTC",
      ownerId: ada,
    });
    const holiday = createNamedAlbum(db, ada, "Holiday");
    addPhotoToNamedAlbum(db, ada, holiday.album.id, first.photo.id);
    addPhotoToNamedAlbum(db, ada, holiday.album.id, second.photo.id);
    const unowned = seedPhoto(db, {
      albumDate: "2026-10-01",
      takenAt: "2026-10-01T08:00:00",
      addedSeq: 9,
    });
    try {
      assert.equal(
        deletePhoto(db, {
          dataDir,
          viewerId: bea,
          photoId: first.photo.id,
        }).status,
        "forbidden",
      );
      assert.equal(
        deletePhoto(db, {
          dataDir,
          viewerId: ada,
          photoId: unowned.id,
        }).status,
        "forbidden",
      );
      const storedName = first.photo.imageUrl.replace("/images/", "");
      rmSync(path.join(dataDir, "images", storedName));
      assert.throws(
        () =>
          deletePhoto(db, {
            dataDir,
            viewerId: ada,
            photoId: first.photo.id,
          }),
        /delete/i,
      );
      assert.equal(
        db
          .prepare("SELECT COUNT(*) AS count FROM photos WHERE id = ?")
          .get(first.photo.id).count,
        1,
      );
      writeFileSync(path.join(dataDir, "images", storedName), jpegBytes());
      assert.equal(
        deletePhoto(db, {
          dataDir,
          viewerId: ada,
          photoId: first.photo.id,
        }).status,
        "deleted",
      );
      assert.equal(
        db
          .prepare("SELECT COUNT(*) AS count FROM photos WHERE id = ?")
          .get(first.photo.id).count,
        0,
      );
      assert.equal(
        db
          .prepare(
            "SELECT COUNT(*) AS count FROM named_album_photos WHERE photo_id = ?",
          )
          .get(first.photo.id).count,
        0,
      );
      assert.equal(existsSync(path.join(dataDir, "images", storedName)), false);
      const cover = holiday.album.id;
      const viewed = db
        .prepare(
          `SELECT photos.id AS id
           FROM named_album_photos
           JOIN photos ON photos.id = named_album_photos.photo_id
           WHERE named_album_photos.named_album_id = ?
           ORDER BY member_seq ASC
           LIMIT 1`,
        )
        .get(cover.slice("named:".length));
      assert.equal(viewed.id, second.photo.id);
      assert.equal(
        deletePhoto(db, {
          dataDir,
          viewerId: ada,
          photoId: second.photo.id,
        }).status,
        "deleted",
      );
      const remaining = db
        .prepare("SELECT name FROM named_albums WHERE owner_id = ?")
        .get(ada);
      assert.equal(remaining.name, "Holiday");
      assert.equal(
        db
          .prepare(
            "SELECT COUNT(*) AS count FROM named_album_photos WHERE named_album_id = ?",
          )
          .get(cover.slice("named:".length)).count,
        0,
      );
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });

  it("drops only the publication row when an album is made private", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const ada = randomUUID();
    const bea = randomUUID();
    db.prepare(
      `INSERT INTO people (id, name, secret_hash, created_at)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
    ).run(
      ada,
      "Ada",
      "hash",
      "2026-10-15T00:00:00.000Z",
      bea,
      "Bea",
      "hash",
      "2026-10-15T00:00:00.000Z",
    );
    const photo = await addPhoto(db, {
      dataDir,
      bytes: jpegBytes(),
      originalName: "day.jpg",
      addedAt: "2026-10-15T02:30:00.000Z",
      timeZone: "UTC",
      ownerId: ada,
    });
    const holiday = createNamedAlbum(db, ada, "Holiday");
    addPhotoToNamedAlbum(db, ada, holiday.album.id, photo.photo.id);
    const empty = createNamedAlbum(db, ada, "Empty");
    markAlbumPublic(db, ada, photo.photo.albumId);
    markAlbumPublic(db, ada, holiday.album.id);
    markAlbumPublic(db, ada, empty.album.id);
    try {
      const datePrivate = makeAlbumPrivate(db, ada, photo.photo.albumId);
      assert.equal(datePrivate.status, "ok");
      assert.equal(datePrivate.album.public, false);
      assert.equal(
        db
          .prepare("SELECT album_date FROM photos WHERE id = ?")
          .get(photo.photo.id).album_date,
        "2026-10-15",
      );
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM album_publications").get()
          .count,
        0,
      );
      assert.equal(
        makeAlbumPrivate(db, bea, holiday.album.id).status,
        "forbidden",
      );
      assert.equal(
        db
          .prepare("SELECT COUNT(*) AS count FROM named_album_publications")
          .get().count,
        2,
      );
      const namedPrivate = makeAlbumPrivate(db, ada, holiday.album.id);
      assert.equal(namedPrivate.album.public, false);
      assert.equal(namedPrivate.album.photoCount, 1);
      const emptyPrivate = makeAlbumPrivate(db, ada, empty.album.id);
      assert.equal(emptyPrivate.album.public, false);
      assert.equal(emptyPrivate.album.photoCount, 0);
      assert.equal(
        db
          .prepare("SELECT COUNT(*) AS count FROM named_album_publications")
          .get().count,
        0,
      );
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM photos").get().count,
        1,
      );
      db.prepare("UPDATE photos SET is_public = 1 WHERE id = ?").run(
        photo.photo.id,
      );
      const publicRow = db
        .prepare("SELECT * FROM photos WHERE id = ?")
        .get(photo.photo.id);
      assert.equal(canSee(db, publicRow, bea), true);
      markAlbumPublic(db, ada, holiday.album.id);
      db.prepare("UPDATE photos SET is_public = 0 WHERE id = ?").run(
        photo.photo.id,
      );
      const namedRow = db
        .prepare("SELECT * FROM photos WHERE id = ?")
        .get(photo.photo.id);
      assert.equal(canSee(db, namedRow, bea), true);
      assert.equal(
        listAlbums(db, bea).some((album) => album.id === photo.photo.albumId),
        false,
      );
      assert.equal(
        listAlbumPhotos(db, holiday.album.id, bea).photos[0].id,
        photo.photo.id,
      );
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });

  it("keeps the original day when the same bytes are added later", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const ada = randomUUID();
    db.prepare(
      `INSERT INTO people (id, name, secret_hash, created_at) VALUES (?, ?, ?, ?)`,
    ).run(ada, "Ada", "hash", "2025-10-15T00:00:00.000Z");
    try {
      const first = await addPhoto(db, {
        dataDir,
        bytes: jpegBytes(),
        originalName: "a.png",
        addedAt: "2025-10-15T12:00:00.000Z",
        timeZone: "UTC",
        ownerId: ada,
      });
      assert.equal(first.photo.albumDate, "2025-10-15");
      const holiday = createNamedAlbum(db, ada, "Holiday");
      const duplicate = await addPhoto(db, {
        dataDir,
        bytes: jpegBytes(),
        originalName: "later.png",
        addedAt: "2026-10-16T12:00:00.000Z",
        timeZone: "UTC",
        ownerId: ada,
      });
      assert.equal(duplicate.status, "duplicate");
      assert.equal(
        db
          .prepare("SELECT album_date FROM photos WHERE id = ?")
          .get(first.photo.id).album_date,
        "2025-10-15",
      );
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM photos").get().count,
        1,
      );
      assert.equal(readdirSync(path.join(dataDir, "images")).length, 1);
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM named_album_photos").get()
          .count,
        0,
      );
      assert.equal(holiday.album.photoCount, 0);
      const different = await addPhoto(db, {
        dataDir,
        bytes: Buffer.from([0xff, 0xd8, 0xff, 0x11, 0xd9]),
        originalName: "a.png",
        addedAt: "2026-10-16T12:00:00.000Z",
        timeZone: "UTC",
        ownerId: ada,
      });
      assert.equal(different.status, "added");
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM photos").get().count,
        2,
      );
      assert.equal(
        db
          .prepare("SELECT album_date FROM photos WHERE id = ?")
          .get(first.photo.id).album_date,
        "2025-10-15",
      );
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });
});
