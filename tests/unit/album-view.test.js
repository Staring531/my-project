import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderAlbum } from "../../src/client/album-view.js";

describe("album view", () => {
  it("lists photo ids in the given order and no others", () => {
    const markup = renderAlbum([
      { id: "early", imageUrl: "/images/early.jpg" },
      { id: "later", imageUrl: "/images/later.jpg" },
    ]);
    const ids = [...markup.matchAll(/data-photo-id="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.deepEqual(ids, ["early", "later"]);
    assert.equal(markup.includes("other-day"), false);
  });

  it("offers publication only for the signed-in owner's private photo", () => {
    const photos = [
      {
        id: "mine-private",
        imageUrl: "/images/mine-private.jpg",
        ownerId: "owner-1",
        public: false,
      },
      {
        id: "mine-public",
        imageUrl: "/images/mine-public.jpg",
        ownerId: "owner-1",
        public: true,
      },
      {
        id: "theirs-private",
        imageUrl: "/images/theirs-private.jpg",
        ownerId: "owner-2",
        public: false,
      },
    ];
    const markup = renderAlbum(photos, { person: { id: "owner-1" } });
    assert.match(markup, /data-publish-photo="mine-private"/);
    assert.equal(markup.includes('data-publish-photo="mine-public"'), false);
    assert.equal(markup.includes('data-publish-photo="theirs-private"'), false);
    const unsigned = renderAlbum(photos);
    assert.equal(unsigned.includes("data-publish-photo"), false);
  });

  it("lets the owner add an existing picture to a named album", () => {
    const photos = [
      {
        id: "kept",
        imageUrl: "/images/kept.jpg",
        ownerId: "owner-1",
        public: true,
      },
    ];
    const markup = renderAlbum(photos, {
      person: { id: "owner-1" },
      album: {
        id: "named:holiday",
        name: "Holiday",
        photoCount: 1,
        ownerId: "owner-1",
      },
      ownedPhotos: [
        { id: "spare", imageUrl: "/images/spare.jpg", ownerId: "owner-1" },
      ],
    });
    assert.match(markup, /Holiday/);
    assert.match(markup, />1</);
    assert.match(markup, /data-add-existing="spare"/);
    const stranger = renderAlbum(photos, {
      person: { id: "owner-2" },
      album: {
        id: "named:holiday",
        name: "Holiday",
        photoCount: 1,
        ownerId: "owner-1",
      },
      ownedPhotos: [
        { id: "spare", imageUrl: "/images/spare.jpg", ownerId: "owner-1" },
      ],
    });
    assert.equal(stranger.includes("data-add-existing"), false);
  });

  it("lets the owner place a date-album picture into a named album", () => {
    const photos = [
      {
        id: "kept",
        imageUrl: "/images/kept.jpg",
        ownerId: "owner-1",
        public: true,
      },
    ];
    const markup = renderAlbum(photos, {
      person: { id: "owner-1" },
      album: {
        id: "owner-1:2026-10-15:0",
        ownerId: "owner-1",
        photoCount: 1,
      },
      namedAlbums: [
        { id: "named:holiday", name: "Holiday", ownerId: "owner-1" },
      ],
    });
    assert.match(markup, /data-place-photo="kept"/);
    assert.match(markup, /data-place-album="named:holiday"/);
    const stranger = renderAlbum(photos, {
      person: { id: "owner-2" },
      album: {
        id: "owner-1:2026-10-15:0",
        ownerId: "owner-1",
        photoCount: 1,
      },
      namedAlbums: [
        { id: "named:holiday", name: "Holiday", ownerId: "owner-1" },
      ],
    });
    assert.equal(stranger.includes("data-place-photo"), false);
  });

  it("asks the owner to confirm before deleting and leaves the picture on cancel", () => {
    const photos = [
      {
        id: "mine",
        imageUrl: "/images/mine.jpg",
        ownerId: "owner-1",
        public: true,
      },
      {
        id: "theirs",
        imageUrl: "/images/theirs.jpg",
        ownerId: "owner-2",
        public: true,
      },
    ];
    const idle = renderAlbum(photos, { person: { id: "owner-1" } });
    assert.match(idle, /data-delete-photo="mine"/);
    assert.equal(idle.includes('data-delete-photo="theirs"'), false);
    assert.equal(idle.includes("data-confirm-delete"), false);
    const armed = renderAlbum(photos, {
      person: { id: "owner-1" },
      confirmingId: "mine",
    });
    assert.match(armed, /data-confirm-delete="mine"/);
    assert.match(armed, /data-cancel-delete="mine"/);
    assert.match(armed, /data-photo-id="mine"/);
    assert.equal(armed.includes('data-delete-photo="mine"'), false);
    assert.match(idle, /data-select-photo="mine"/);
  });
});
