import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderPreview } from "../../src/client/preview-view.js";

describe("enlarged picture", () => {
  it("fits the selected picture and leaves the album when dismissed", () => {
    assert.equal(renderPreview(null), "");
    const open = renderPreview({
      imageUrl: "/images/wide.jpg",
      failed: false,
    });
    assert.match(open, /data-preview-fit="contain"/);
    assert.match(open, /\/images\/wide\.jpg/);
    assert.equal(renderPreview(null), "");
    const failed = renderPreview({
      imageUrl: "/images/wide.jpg",
      failed: true,
    });
    assert.match(failed, /This picture cannot be shown\./);
    assert.match(failed, /data-preview-fit="contain"/);
  });
});
