import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  exifJpeg,
  jpegBytes,
  openLibrary,
  openSession,
  pngBytes,
  postPhoto,
  signIn,
  removeDir,
  seedPhoto,
  tempDataDir,
  textBytes,
  withServer,
} from "../helpers.js";

const ALBUM_FIELDS = [
  "albumDate",
  "coverImageUrl",
  "dateAssigned",
  "id",
  "month",
  "ownerId",
  "photoCount",
  "public",
  "year",
];
const PHOTO_FIELDS = [
  "addedAt",
  "albumDate",
  "albumId",
  "dateAssigned",
  "id",
  "imageUrl",
  "ownerId",
  "public",
  "takenAt",
];

describe("library API contract", () => {
  it("returns an empty album list", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const response = await fetch(`${base}/api/albums`);
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.deepEqual(body, { albums: [], namedAlbums: [] });
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("returns album objects in newest-date order without image bytes", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const older = seedPhoto(db, {
      albumDate: "2026-10-01",
      takenAt: "2026-10-01T08:00:00",
      addedSeq: 1,
    });
    const newer = seedPhoto(db, {
      albumDate: "2026-10-17",
      takenAt: "2026-10-17T08:00:00",
      addedSeq: 2,
    });
    db.close();
    try {
      await withServer(dataDir, async ({ base }) => {
        const response = await fetch(`${base}/api/albums`);
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.deepEqual(
          body.albums.map((album) => album.id),
          [`unowned:2026-10-17:0`, `unowned:2026-10-01:0`],
        );
        assert.equal(
          body.albums[0].coverImageUrl,
          `/images/${newer.storedName}`,
        );
        assert.equal(
          body.albums[1].coverImageUrl,
          `/images/${older.storedName}`,
        );
        for (const album of body.albums) {
          assert.deepEqual(Object.keys(album).sort(), ALBUM_FIELDS);
          assert.equal(typeof album.photoCount, "number");
          assert.equal(JSON.stringify(album).includes("base64"), false);
        }
        assert.equal(body.albums[0].year, 2026);
        assert.equal(body.albums[0].month, 10);
        assert.equal(body.albums[0].dateAssigned, false);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("returns one album's photos or a not-found error", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const early = seedPhoto(db, {
      albumDate: "2026-10-15",
      takenAt: "2026-10-15T08:00:00",
      addedSeq: 1,
    });
    const later = seedPhoto(db, {
      albumDate: "2026-10-15",
      takenAt: "2026-10-15T18:00:00",
      addedSeq: 2,
    });
    seedPhoto(db, {
      albumDate: "2026-10-16",
      takenAt: "2026-10-16T08:00:00",
      addedSeq: 3,
    });
    db.close();
    try {
      await withServer(dataDir, async ({ base }) => {
        const response = await fetch(
          `${base}/api/albums/unowned:2026-10-15:0/photos`,
        );
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.equal(body.album.id, "unowned:2026-10-15:0");
        assert.deepEqual(Object.keys(body.album).sort(), ALBUM_FIELDS);
        assert.deepEqual(
          body.photos.map((photo) => photo.id),
          [early.id, later.id],
        );
        for (const photo of body.photos) {
          assert.equal(photo.albumId, "unowned:2026-10-15:0");
          assert.deepEqual(Object.keys(photo).sort(), PHOTO_FIELDS);
        }
        const missing = await fetch(`${base}/api/albums/1999-01-01:0/photos`);
        assert.equal(missing.status, 404);
        assert.deepEqual(await missing.json(), {
          error: "No album exists for that date.",
        });
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("adds, recognizes a duplicate, and skips a non-photo", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const session = await openSession(base, "Ada", "library-secret");
        const added = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "day.jpg",
          session.cookie,
        );
        assert.equal(added.status, 201);
        assert.equal(added.body.status, "added");
        assert.equal(added.body.photo.albumDate, "2026-10-15");
        assert.equal(added.body.photo.dateAssigned, false);
        assert.equal(added.body.photo.takenAt, "2026-10-15T09:30:00");
        assert.deepEqual(Object.keys(added.body.photo).sort(), PHOTO_FIELDS);

        const duplicate = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "copy.jpg",
          session.cookie,
        );
        assert.equal(duplicate.status, 200);
        assert.equal(duplicate.body.status, "duplicate");
        assert.equal(duplicate.body.photo.id, added.body.photo.id);

        const skipped = await postPhoto(
          base,
          textBytes(),
          "notes.jpg",
          session.cookie,
        );
        assert.equal(skipped.status, 422);
        assert.equal(skipped.body.status, "skipped");
        assert.equal(skipped.body.reason, "unsupported-type");

        const empty = await postPhoto(
          base,
          Buffer.alloc(0),
          "empty.jpg",
          session.cookie,
        );
        assert.equal(empty.status, 422);
        assert.equal(empty.body.reason, "unreadable");

        const plain = await postPhoto(
          base,
          jpegBytes(),
          "plain.jpg",
          session.cookie,
        );
        assert.equal(plain.status, 201);
        assert.equal(plain.body.photo.dateAssigned, true);
        assert.equal(plain.body.photo.takenAt, null);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("rejects an image name that is not a single stored file", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const missing = await fetch(`${base}/images/missing.jpg`);
        assert.equal(missing.status, 404);
        const body = await missing.json();
        assert.equal(typeof body.error, "string");
        assert.ok(body.error.length > 0);

        const traversal = await fetch(
          `${base}/images/${encodeURIComponent("../secret.jpg")}`,
        );
        assert.equal(traversal.status, 404);
        assert.equal(typeof (await traversal.json()).error, "string");
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("creates an account and signs in without accepting a wrong secret", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const fresh = await fetch(`${base}/api/accounts`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "Cara", secret: "cara-secret" }),
        });
        assert.equal(fresh.status, 201);
        assert.equal(fresh.headers.get("set-cookie"), null);
        assert.equal((await fresh.json()).person.name, "Cara");
        const created = await openSession(base, "Ada", "correct-secret");
        assert.equal(created.createdStatus, 201);
        assert.equal(created.status, 200);
        assert.equal(created.person.name, "Ada");
        assert.match(created.cookie, /^session=/);
        const raw = await fetch(`${base}/api/session`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "Ada", secret: "correct-secret" }),
        });
        const cookie = raw.headers.get("set-cookie") ?? "";
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /SameSite=Lax/);
        assert.match(cookie, /Path=\//);
        const current = await fetch(`${base}/api/session`, {
          headers: { cookie: created.cookie },
        });
        assert.equal(current.status, 200);
        assert.equal((await current.json()).person.name, "Ada");
        const wrong = await signIn(base, "Ada", "nope");
        assert.equal(wrong.status, 401);
        assert.deepEqual(wrong.body, { error: "Could not sign in." });
        const missing = await signIn(base, "Nobody", "correct-secret");
        assert.equal(missing.status, 401);
        assert.deepEqual(missing.body, { error: "Could not sign in." });
        const duplicate = await fetch(`${base}/api/accounts`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "Ada", secret: "correct-secret" }),
        });
        assert.equal(duplicate.status, 409);
        assert.deepEqual(await duplicate.json(), {
          error: "An account with that name already exists.",
        });
        const blank = await fetch(`${base}/api/accounts`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "", secret: "" }),
        });
        assert.equal(blank.status, 400);
        assert.deepEqual(await blank.json(), {
          error: "Enter an account name and a secret.",
        });
        const signedOut = await fetch(`${base}/api/session`);
        assert.equal(signedOut.status, 401);
        assert.deepEqual(await signedOut.json(), {
          error: "Sign in to continue.",
        });
        const removed = await fetch(`${base}/api/session`, {
          method: "DELETE",
          headers: { cookie: created.cookie },
        });
        assert.equal(removed.status, 204);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("hides a private photo and publishes only for the owner", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const ada = await openSession(base, "Ada", "ada-secret");
        const added = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "private.jpg",
          ada.cookie,
        );
        assert.equal(added.body.photo.public, false);
        assert.equal(added.body.photo.ownerId, ada.person.id);
        assert.equal(added.body.photo.albumId, `${ada.person.id}:2026-10-15:0`);
        const hidden = await fetch(`${base}/api/albums`);
        assert.deepEqual(await hidden.json(), { albums: [], namedAlbums: [] });
        const image = await fetch(`${base}${added.body.photo.imageUrl}`);
        assert.equal(image.status, 404);
        assert.deepEqual(await image.json(), {
          error: "That image is not available.",
        });
        const bea = await openSession(base, "Bea", "bea-secret");
        const closed = await fetch(
          `${base}/api/albums/${added.body.photo.albumId}/photos`,
          { headers: { cookie: bea.cookie } },
        );
        assert.equal(closed.status, 404);
        assert.deepEqual(await closed.json(), {
          error: "No album exists for that date.",
        });
        const hiddenDuplicate = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "copy.jpg",
          bea.cookie,
        );
        assert.equal(hiddenDuplicate.status, 200);
        assert.equal(hiddenDuplicate.body.status, "duplicate");
        assert.equal(hiddenDuplicate.body.photo, undefined);
        const forbiddenAlbum = await fetch(
          `${base}/api/albums/${added.body.photo.albumId}/publication`,
          { method: "POST", headers: { cookie: bea.cookie } },
        );
        assert.equal(forbiddenAlbum.status, 403);
        assert.deepEqual(await forbiddenAlbum.json(), {
          error: "Only the owner can mark that album public.",
        });
        const unowned = await fetch(
          `${base}/api/albums/unowned:2026-10-15:0/publication`,
          { method: "POST", headers: { cookie: ada.cookie } },
        );
        assert.equal(unowned.status, 403);
        assert.deepEqual(await unowned.json(), {
          error: "Only the owner can mark that album public.",
        });
        const forbidden = await fetch(
          `${base}/api/photos/${added.body.photo.id}/publication`,
          { method: "POST", headers: { cookie: bea.cookie } },
        );
        assert.equal(forbidden.status, 403);
        assert.deepEqual(await forbidden.json(), {
          error: "Only the owner can mark that photo public.",
        });
        const publishedAlbum = await fetch(
          `${base}/api/albums/${added.body.photo.albumId}/publication`,
          { method: "POST", headers: { cookie: ada.cookie } },
        );
        assert.equal(publishedAlbum.status, 200);
        assert.equal((await publishedAlbum.json()).album.public, true);
        const published = await fetch(
          `${base}/api/photos/${added.body.photo.id}/publication`,
          { method: "POST", headers: { cookie: ada.cookie } },
        );
        assert.equal(published.status, 200);
        assert.equal((await published.json()).photo.public, true);
        const visible = await fetch(`${base}/api/albums`);
        const body = await visible.json();
        assert.equal(body.albums.length, 1);
        assert.equal(body.albums[0].id, added.body.photo.albumId);
        const unsigned = await postPhoto(base, pngBytes(), "other.png");
        assert.equal(unsigned.status, 401);
        assert.deepEqual(unsigned.body, { error: "Sign in to add photos." });
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("creates a named album and places an owned picture once", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const unsigned = await fetch(`${base}/api/albums`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "Holiday" }),
        });
        assert.equal(unsigned.status, 401);
        assert.deepEqual(await unsigned.json(), {
          error: "Sign in to create an album.",
        });

        const ada = await openSession(base, "Ada", "ada-secret");
        const blank = await fetch(`${base}/api/albums`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: ada.cookie,
          },
          body: JSON.stringify({ name: "   " }),
        });
        assert.equal(blank.status, 400);
        assert.deepEqual(await blank.json(), {
          error: "Enter an album name of 1 to 64 characters.",
        });

        const created = await fetch(`${base}/api/albums`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: ada.cookie,
          },
          body: JSON.stringify({ name: "  Holiday  " }),
        });
        assert.equal(created.status, 201);
        const createdBody = await created.json();
        assert.equal(createdBody.album.name, "Holiday");
        assert.equal(createdBody.album.photoCount, 0);
        assert.equal(createdBody.album.public, false);
        assert.equal(createdBody.album.coverImageUrl, null);
        assert.equal(createdBody.album.ownerId, ada.person.id);

        const again = await fetch(`${base}/api/albums`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: ada.cookie,
          },
          body: JSON.stringify({ name: "Holiday" }),
        });
        assert.equal(again.status, 409);
        assert.deepEqual(await again.json(), {
          error: "An album with that name already exists.",
        });

        const bea = await openSession(base, "Bea", "bea-secret");
        const beaAlbum = await fetch(`${base}/api/albums`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: bea.cookie,
          },
          body: JSON.stringify({ name: "Holiday" }),
        });
        assert.equal(beaAlbum.status, 201);

        const listed = await fetch(`${base}/api/albums`, {
          headers: { cookie: ada.cookie },
        });
        const listedBody = await listed.json();
        assert.equal(listedBody.namedAlbums.length, 1);
        assert.equal(listedBody.namedAlbums[0].id, createdBody.album.id);
        assert.deepEqual(
          listedBody.albums.map((album) => Object.keys(album).sort()),
          listedBody.albums.map(() => [
            "albumDate",
            "coverImageUrl",
            "dateAssigned",
            "id",
            "month",
            "ownerId",
            "photoCount",
            "public",
            "year",
          ]),
        );

        const empty = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          { headers: { cookie: ada.cookie } },
        );
        assert.equal(empty.status, 200);
        assert.deepEqual((await empty.json()).photos, []);

        const hidden = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          { headers: { cookie: bea.cookie } },
        );
        assert.equal(hidden.status, 404);
        assert.deepEqual(await hidden.json(), {
          error: "No album exists for that id.",
        });

        const added = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "day.jpg",
          ada.cookie,
        );
        const placed = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: ada.cookie,
            },
            body: JSON.stringify({ photoId: added.body.photo.id }),
          },
        );
        assert.equal(placed.status, 201);
        const placedBody = await placed.json();
        assert.equal(placedBody.status, "added");
        assert.equal(placedBody.album.photoCount, 1);

        const present = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: ada.cookie,
            },
            body: JSON.stringify({ photoId: added.body.photo.id }),
          },
        );
        assert.equal(present.status, 200);
        const presentBody = await present.json();
        assert.equal(presentBody.status, "present");
        assert.equal(presentBody.album.photoCount, 1);

        const dateAdd = await fetch(
          `${base}/api/albums/${added.body.photo.albumId}/photos`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: ada.cookie,
            },
            body: JSON.stringify({ photoId: added.body.photo.id }),
          },
        );
        assert.equal(dateAdd.status, 404);
        assert.deepEqual(await dateAdd.json(), {
          error: "No album exists for that id.",
        });

        const forbidden = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: bea.cookie,
            },
            body: JSON.stringify({ photoId: added.body.photo.id }),
          },
        );
        assert.equal(forbidden.status, 403);
        assert.deepEqual(await forbidden.json(), {
          error: "Only the owner can add pictures to that album.",
        });

        const signedOutAdd = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ photoId: added.body.photo.id }),
          },
        );
        assert.equal(signedOutAdd.status, 401);
        assert.deepEqual(await signedOutAdd.json(), {
          error: "Sign in to add a picture to an album.",
        });

        const missingPhoto = await fetch(
          `${base}/api/albums/${createdBody.album.id}/photos`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: ada.cookie,
            },
            body: JSON.stringify({ photoId: "missing-photo" }),
          },
        );
        assert.equal(missingPhoto.status, 404);
        assert.deepEqual(await missingPhoto.json(), {
          error: "No photo exists for that id.",
        });
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("deletes only the owner's picture", async () => {
    const dataDir = await tempDataDir();
    const db = openLibrary(dataDir);
    const unowned = seedPhoto(db, {
      albumDate: "2026-10-01",
      takenAt: "2026-10-01T08:00:00",
      addedSeq: 9,
    });
    db.close();
    try {
      await withServer(dataDir, async ({ base }) => {
        const ada = await openSession(base, "Ada", "ada-secret");
        const added = await postPhoto(
          base,
          jpegBytes(),
          "plain.jpg",
          ada.cookie,
        );
        const signedOut = await fetch(
          `${base}/api/photos/${added.body.photo.id}`,
          { method: "DELETE" },
        );
        assert.equal(signedOut.status, 401);
        assert.deepEqual(await signedOut.json(), {
          error: "Sign in to delete a picture.",
        });
        const bea = await openSession(base, "Bea", "bea-secret");
        const forbidden = await fetch(
          `${base}/api/photos/${added.body.photo.id}`,
          { method: "DELETE", headers: { cookie: bea.cookie } },
        );
        assert.equal(forbidden.status, 403);
        assert.deepEqual(await forbidden.json(), {
          error: "Only the owner can delete that picture.",
        });
        const unownedDelete = await fetch(`${base}/api/photos/${unowned.id}`, {
          method: "DELETE",
          headers: { cookie: ada.cookie },
        });
        assert.equal(unownedDelete.status, 403);
        const missing = await fetch(`${base}/api/photos/missing-photo`, {
          method: "DELETE",
          headers: { cookie: ada.cookie },
        });
        assert.equal(missing.status, 404);
        assert.deepEqual(await missing.json(), {
          error: "No photo exists for that id.",
        });
        const removed = await fetch(
          `${base}/api/photos/${added.body.photo.id}`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(removed.status, 204);
        assert.equal(await removed.text(), "");
        const image = await fetch(`${base}${added.body.photo.imageUrl}`, {
          headers: { cookie: ada.cookie },
        });
        assert.equal(image.status, 404);
      });
    } finally {
      await removeDir(dataDir);
    }
  });

  it("makes a date album or named album private for the owner only", async () => {
    const dataDir = await tempDataDir();
    try {
      await withServer(dataDir, async ({ base }) => {
        const ada = await openSession(base, "Ada", "ada-secret");
        const added = await postPhoto(
          base,
          exifJpeg("2026:10:15 09:30:00"),
          "day.jpg",
          ada.cookie,
        );
        const albumId = added.body.photo.albumId;
        const created = await fetch(`${base}/api/albums`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: ada.cookie,
          },
          body: JSON.stringify({ name: "Holiday" }),
        });
        const named = (await created.json()).album;
        await fetch(`${base}/api/albums/${named.id}/photos`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: ada.cookie,
          },
          body: JSON.stringify({ photoId: added.body.photo.id }),
        });
        await fetch(`${base}/api/albums/${albumId}/publication`, {
          method: "POST",
          headers: { cookie: ada.cookie },
        });
        await fetch(`${base}/api/albums/${named.id}/publication`, {
          method: "POST",
          headers: { cookie: ada.cookie },
        });
        const bea = await openSession(base, "Bea", "bea-secret");
        const seen = await fetch(`${base}/api/albums`, {
          headers: { cookie: bea.cookie },
        });
        const seenBody = await seen.json();
        assert.equal(
          seenBody.namedAlbums.some((album) => album.id === named.id),
          true,
        );
        const image = await fetch(`${base}${added.body.photo.imageUrl}`, {
          headers: { cookie: bea.cookie },
        });
        assert.equal(image.status, 200);

        const signedOut = await fetch(
          `${base}/api/albums/${named.id}/publication`,
          { method: "DELETE" },
        );
        assert.equal(signedOut.status, 401);
        assert.deepEqual(await signedOut.json(), {
          error: "Sign in to change an album.",
        });
        const forbidden = await fetch(
          `${base}/api/albums/${named.id}/publication`,
          { method: "DELETE", headers: { cookie: bea.cookie } },
        );
        assert.equal(forbidden.status, 403);
        assert.deepEqual(await forbidden.json(), {
          error: "Only the owner can make that album private.",
        });
        const unowned = await fetch(
          `${base}/api/albums/unowned:2026-10-15:0/publication`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(unowned.status, 403);
        const missingDate = await fetch(
          `${base}/api/albums/${ada.person.id}:1999-01-01:0/publication`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(missingDate.status, 404);
        assert.deepEqual(await missingDate.json(), {
          error: "No album exists for that date.",
        });
        const missingNamed = await fetch(
          `${base}/api/albums/named:00000000-0000-4000-8000-000000000000/publication`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(missingNamed.status, 404);
        assert.deepEqual(await missingNamed.json(), {
          error: "No album exists for that id.",
        });

        const datePrivate = await fetch(
          `${base}/api/albums/${albumId}/publication`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(datePrivate.status, 200);
        assert.equal((await datePrivate.json()).album.public, false);
        const namedPrivate = await fetch(
          `${base}/api/albums/${named.id}/publication`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(namedPrivate.status, 200);
        assert.equal((await namedPrivate.json()).album.public, false);
        const already = await fetch(
          `${base}/api/albums/${named.id}/publication`,
          { method: "DELETE", headers: { cookie: ada.cookie } },
        );
        assert.equal(already.status, 200);
        assert.equal((await already.json()).album.public, false);

        const hiddenNamed = await fetch(`${base}/api/albums`, {
          headers: { cookie: bea.cookie },
        });
        const hiddenBody = await hiddenNamed.json();
        assert.equal(
          hiddenBody.namedAlbums.some((album) => album.id === named.id),
          false,
        );
        const stillThere = await fetch(`${base}${added.body.photo.imageUrl}`);
        assert.equal(stillThere.status, 404);
        await fetch(`${base}/api/photos/${added.body.photo.id}/publication`, {
          method: "POST",
          headers: { cookie: ada.cookie },
        });
        const ownPublic = await fetch(`${base}${added.body.photo.imageUrl}`, {
          headers: { cookie: bea.cookie },
        });
        assert.equal(ownPublic.status, 200);
        const namedStillHidden = await fetch(`${base}/api/albums`, {
          headers: { cookie: bea.cookie },
        });
        assert.equal(
          (await namedStillHidden.json()).namedAlbums.some(
            (album) => album.id === named.id,
          ),
          false,
        );
      });
    } finally {
      await removeDir(dataDir);
    }
  });
});
