import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composingEnter } from "../../src/client/keyboard.js";

describe("composing enter", () => {
  it("recognizes an IME enter and a later plain enter", () => {
    assert.equal(
      composingEnter({ key: "Enter", isComposing: true, keyCode: 0 }),
      true,
    );
    assert.equal(
      composingEnter({ key: "Enter", isComposing: false, keyCode: 229 }),
      true,
    );
    assert.equal(
      composingEnter({ key: "Enter", isComposing: false, keyCode: 13 }),
      false,
    );
  });
});
