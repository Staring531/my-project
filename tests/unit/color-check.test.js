import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { checkStylesheet } from "../../src/client/color-check.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("style sheet color check", () => {
  it("reports five raw or named colors and passes once they are gone", () => {
    const fixtures = [
      ["a { color: #ff0000; }", "hex", "#ff0000"],
      ["a { color: #00ff00; }", "hex", "#00ff00"],
      ["a { color: #0000ff; }", "hex", "#0000ff"],
      ["a { color: red; }", "named", "red"],
      ["a { color: blue; }", "named", "blue"],
    ];
    for (const [source, kind, text] of fixtures) {
      assert.deepEqual(checkStylesheet(source, "tokens"), [{ kind, text }]);
      assert.deepEqual(
        checkStylesheet(source.replace(text, "var(--primary)"), "screen"),
        [],
      );
    }
  });

  it("allows oklch only in the tokens profile", () => {
    assert.deepEqual(
      checkStylesheet(":root { --primary: oklch(0.5 0.19 262); }", "tokens"),
      [],
    );
    assert.deepEqual(checkStylesheet(".a { color: oklch(1 0 0); }", "screen"), [
      { kind: "function", text: "oklch(1 0 0)" },
    ]);
    assert.equal(
      checkStylesheet("a { color: rgb(255, 0, 0); }", "tokens")[0].kind,
      "function",
    );
    assert.equal(
      checkStylesheet("a { color: hsl(0 100% 50%); }", "tokens")[0].kind,
      "function",
    );
  });

  it("passes the token files and checks the organizer stylesheet on its own", () => {
    assert.deepEqual(
      checkStylesheet(read("../../src/client/tokens.css"), "tokens"),
      [],
    );
    assert.deepEqual(
      checkStylesheet(read("../../src/client/token-preview.css"), "screen"),
      [],
    );
    assert.deepEqual(
      checkStylesheet(read("../../src/client/styles.css"), "screen"),
      [],
    );
    const implementation = read("../../src/client/color-check.js");
    assert.doesNotMatch(implementation, /styles\.css/);
  });
});
