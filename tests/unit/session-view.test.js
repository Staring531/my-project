import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderAccountPanel } from "../../src/client/session-view.js";

describe("session view", () => {
  it("offers account creation and sign-in without an add control", () => {
    const markup = renderAccountPanel();
    assert.match(markup, /Create an account/);
    assert.match(markup, /Sign in/);
    assert.equal(markup.includes("Add photos"), false);
    assert.equal(markup.includes('id="file-input"'), false);
  });

  it("shows the sign-in failure", () => {
    const markup = renderAccountPanel({ signInError: "Could not sign in." });
    assert.match(markup, /Could not sign in\./);
  });
});
