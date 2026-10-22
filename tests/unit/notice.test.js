import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  closeNotice,
  noticeFromBatch,
  replaceNotice,
} from "../../src/client/notice.js";

describe("batch notice lifetime", () => {
  it("keeps a notice through another render until it is closed or replaced", () => {
    const first = noticeFromBatch({ duplicates: 0, skipped: 1, errors: [] });
    assert.equal(first.skipped, 1);
    const stillThere = first;
    assert.equal(stillThere.skipped, 1);
    assert.equal(closeNotice(), null);
    const replaced = replaceNotice({
      duplicates: 1,
      skipped: 0,
      errors: ["Could not store the photo: disk full."],
    });
    assert.equal(replaced.duplicates, 1);
    assert.deepEqual(replaced.errors, [
      "Could not store the photo: disk full.",
    ]);
    assert.equal(
      noticeFromBatch({ duplicates: 0, skipped: 0, errors: [] }),
      null,
    );
  });
});
