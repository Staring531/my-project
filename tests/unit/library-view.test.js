import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  renderDuplicateMessage,
  renderLibrary,
  renderSignedOutLibrary,
  renderSkipMessage,
} from "../../src/client/library-view.js";

const october = {
  id: "2026-10-15:0",
  albumDate: "2026-10-15",
  year: 2026,
  month: 10,
  photoCount: 2,
  dateAssigned: false,
  coverImageUrl: "/images/cover.jpg",
};
const assigned = {
  id: "2026-10-15:1",
  albumDate: "2026-10-15",
  year: 2026,
  month: 10,
  photoCount: 1,
  dateAssigned: true,
  coverImageUrl: "/images/assigned.jpg",
};
const previousYear = {
  id: "2025-12-31:0",
  albumDate: "2025-12-31",
  year: 2025,
  month: 12,
  photoCount: 4,
  dateAssigned: false,
  coverImageUrl: "/images/old.jpg",
};

describe("library view", () => {
  it("explains how to add photos when the library is empty", () => {
    const markup = renderLibrary([]);
    assert.match(markup, /add photos/i);
    assert.equal(markup.includes("data-album-id"), false);
    assert.equal(markup.includes('class="tile"'), false);
  });

  it("renders each album tile without sorting ahead of the response", () => {
    const markup = renderLibrary([october, assigned, previousYear]);
    const octoberAt = markup.indexOf("2026-10-15:0");
    const assignedAt = markup.indexOf("2026-10-15:1");
    const previousAt = markup.indexOf("2025-12-31:0");
    assert.ok(octoberAt < assignedAt && assignedAt < previousAt);
    assert.match(markup, /data-album-id="2026-10-15:0"/);
    assert.match(markup, /2026-10-15/);
    assert.match(markup, />2</);
    assert.match(markup, /\/images\/cover\.jpg/);
    assert.match(markup, /Date assigned/);
    assert.equal(markup.split("Date assigned").length - 1, 1);
    const headings = [
      ...markup.matchAll(/data-year="(\d+)" data-month="(\d+)"/g),
    ].map((match) => `${match[1]}-${match[2]}`);
    assert.deepEqual(headings, ["2026-10", "2025-12"]);
  });

  it("states how many items were skipped", () => {
    assert.equal(renderSkipMessage(0), "");
    assert.match(renderSkipMessage(1), /1 item was skipped/);
    assert.match(renderSkipMessage(3), /3 items were skipped/);
  });

  it("offers publication only for the signed-in owner's private album", () => {
    const owner = { id: "owner-1" };
    const mine = {
      ...october,
      ownerId: "owner-1",
      public: false,
    };
    const theirs = {
      ...assigned,
      ownerId: "owner-2",
      public: false,
    };
    const alreadyPublic = {
      ...previousYear,
      ownerId: "owner-1",
      public: true,
    };
    const markup = renderLibrary([mine, theirs, alreadyPublic], {
      person: owner,
    });
    assert.match(markup, /data-publish-album="2026-10-15:0"/);
    assert.equal(markup.includes('data-publish-album="2026-10-15:1"'), false);
    assert.equal(markup.includes('data-publish-album="2025-12-31:0"'), false);
    const signedOut = renderSignedOutLibrary([]);
    assert.match(signedOut, /no public photos/i);
    assert.equal(signedOut.includes('class="tile"'), false);
    assert.equal(signedOut.includes("Add photos"), false);
    assert.equal(signedOut.includes("create-album"), false);
  });

  it("shows a create form and named albums apart from the months", () => {
    const owner = { id: "owner-1" };
    const holiday = {
      id: "named:holiday",
      ownerId: "owner-1",
      name: "Holiday",
      photoCount: 2,
      public: false,
      coverImageUrl: "/images/holiday.jpg",
    };
    const empty = {
      id: "named:empty",
      ownerId: "owner-1",
      name: "Empty",
      photoCount: 0,
      public: true,
      coverImageUrl: null,
    };
    const markup = renderLibrary([october], {
      person: owner,
      namedAlbums: [holiday, empty],
    });
    assert.match(markup, /id="create-album"/);
    assert.match(markup, /data-album-id="named:holiday"/);
    assert.match(markup, /Holiday/);
    assert.match(markup, /\/images\/holiday\.jpg/);
    assert.match(markup, /data-album-id="named:empty"/);
    assert.match(markup, /Empty/);
    assert.equal(markup.includes("/images/empty"), false);
    const emptyCount = markup.slice(markup.indexOf("named:empty"));
    assert.match(emptyCount, />0</);
    const headings = [
      ...markup.matchAll(/data-year="(\d+)" data-month="(\d+)"/g),
    ].map((match) => `${match[1]}-${match[2]}`);
    assert.deepEqual(headings, ["2026-10"]);
    assert.equal(markup.includes('data-year="named:holiday"'), false);
    const signedOut = renderSignedOutLibrary([], {});
    assert.equal(signedOut.includes("create-album"), false);
    const visitor = renderSignedOutLibrary([], { namedAlbums: [holiday] });
    assert.match(visitor, /Holiday/);
    assert.equal(visitor.includes("create-album"), false);
    assert.equal(visitor.includes("Add photos"), false);
  });

  it("offers a private control only for the owner's public album", () => {
    const owner = { id: "owner-1" };
    const mine = { ...october, ownerId: "owner-1", public: true };
    const stillPrivate = {
      ...assigned,
      id: "private-day",
      ownerId: "owner-1",
      public: false,
    };
    const markup = renderLibrary([mine, stillPrivate], { person: owner });
    assert.match(markup, /data-private-album="2026-10-15:0"/);
    assert.match(markup, /data-publish-album="private-day"/);
    assert.equal(markup.includes('data-private-album="private-day"'), false);
    assert.equal(markup.includes('data-publish-album="2026-10-15:0"'), false);
  });

  it("says a duplicate picture is already in the library without changing the count", () => {
    assert.equal(renderDuplicateMessage(0), "");
    const notice = renderDuplicateMessage(1);
    assert.match(notice, /This picture is already in the library\./);
    const library = notice + renderLibrary([october]);
    assert.match(library, />2</);
    assert.equal(library.includes(">3<"), false);
  });
});
