import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  failedDeletion,
  renderDeletionAlert,
} from "../../src/client/photo-app.js";

describe("confirm delete failure", () => {
  it("keeps the picture id and shows the server error when delete is rejected", () => {
    const failure = failedDeletion(
      "mine",
      new Error("No route exists for that request."),
    );
    const markup = renderDeletionAlert(failure.deleteError);
    assert.equal(failure.confirmingId, "mine");
    assert.match(markup, /<p class="error" role="alert">/);
    assert.match(markup, /No route exists for that request\./);
  });

  it("uses a fallback message when the rejection has none", () => {
    const failure = failedDeletion("mine", "not-an-error");
    assert.equal(failure.deleteError, "Could not delete the picture.");
    assert.match(
      renderDeletionAlert(failure.deleteError),
      /Could not delete the picture\./,
    );
  });
});
