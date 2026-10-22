import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addPhotoBatch, summarizeBatch } from "../../src/client/api.js";
import {
  handoffBatchNotice,
  noticeFromBatch,
} from "../../src/client/notice.js";

describe("photo batch summary", () => {
  it("counts skips and keeps earlier successes when a later file fails", () => {
    const summary = summarizeBatch([
      { statusCode: 201, body: { status: "added" } },
      { statusCode: 200, body: { status: "duplicate" } },
      {
        statusCode: 422,
        body: { status: "skipped", reason: "unsupported-type" },
      },
      { statusCode: 422, body: { status: "skipped", reason: "unreadable" } },
      {
        statusCode: 500,
        body: { error: "Could not store the photo: disk full." },
      },
    ]);
    assert.equal(summary.added, 1);
    assert.equal(summary.duplicates, 1);
    assert.equal(summary.skipped, 2);
    assert.deepEqual(summary.errors, ["Could not store the photo: disk full."]);
  });

  it("does not post a file the decoder cannot display", async () => {
    const posted = [];
    const broken = {
      name: "broken.jpg",
      type: "image/jpeg",
      arrayBuffer: async () => new Uint8Array([0xff, 0xd8, 0xff]).buffer,
    };
    const whole = {
      name: "whole.jpg",
      type: "image/jpeg",
      arrayBuffer: async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9]).buffer,
    };
    const summary = await addPhotoBatch([broken, whole], {
      decode: async (file) => {
        if (file === broken) throw new Error("cannot display");
      },
      post: async (file) => {
        posted.push(file.name);
        return { statusCode: 201, body: { status: "added" } };
      },
    });
    assert.deepEqual(posted, ["whole.jpg"]);
    assert.equal(summary.skipped, 1);
    assert.equal(summary.added, 1);
    assert.deepEqual(summary.errors, []);
  });

  it("keeps a batch skip notice for the library and returns home from an album", () => {
    const handed = handoffBatchNotice("1 item was skipped.", {
      fromAlbum: true,
    });
    assert.equal(handed.nextHash, "#/");
    assert.match(handed.pendingNotice, /1 item was skipped/);
    const notice = noticeFromBatch({ skipped: 1, duplicates: 0, errors: [] });
    assert.equal(notice.skipped, 1);
  });
});
