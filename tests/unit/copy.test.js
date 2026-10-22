import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composingEnter } from "../../src/client/keyboard.js";
import { interfaceCopy, monthHeading, text } from "../../src/client/copy.js";

describe("interface copy", () => {
  it("shows the Chinese sentence by default and the English sentence when asked", () => {
    for (const [english, chinese] of interfaceCopy) {
      assert.equal(text("zh", english), chinese);
      assert.equal(text("en", english), english);
    }
    assert.equal(text("zh", "3 items were skipped."), "已跳过 3 项。");
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

  it("leaves an unknown sentence and an album name as received", () => {
    assert.equal(
      text("zh", "Could not create the album."),
      "Could not create the album.",
    );
    assert.equal(text("zh", "Trip"), "Trip");
    assert.equal(text("en", "Trip"), "Trip");
  });

  it("translates a month heading and keeps the stored year and month", () => {
    assert.equal(monthHeading("en", 2026, 10), "October 2026");
    assert.equal(monthHeading("zh", 2026, 10), "2026年10月");
    for (let month = 1; month <= 12; month += 1) {
      assert.match(monthHeading("zh", 2026, month), /^2026年\d{1,2}月$/);
      assert.match(monthHeading("en", 2026, month), /^[A-Z][a-z]+ 2026$/);
    }
  });
});
