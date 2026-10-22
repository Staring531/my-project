import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(
  new URL("../../src/client/styles.css", import.meta.url),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

function bareControlsOutsideAtRules(source) {
  const hits = [];
  const stack = [];
  let prelude = "";
  for (const ch of source) {
    if (ch === "{") {
      const text = prelude.trim();
      const isAt = text.startsWith("@");
      const insideAt = stack.includes("at");
      if (!isAt && !insideAt) {
        for (const item of text.split(",")) {
          const name = item.trim().replace(/\s+/g, " ");
          if (name === "button" || name === "a") hits.push(name);
        }
      }
      stack.push(isAt ? "at" : "rule");
      prelude = "";
    } else if (ch === "}") {
      stack.pop();
      prelude = "";
    } else {
      prelude += ch;
    }
  }
  return hits;
}

describe("control layer", () => {
  it("keeps a bare button or link rule inside @layer components", () => {
    assert.match(css, /@layer\s+components\b/);
    assert.deepEqual(bareControlsOutsideAtRules(css), []);
  });
});
