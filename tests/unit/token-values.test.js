import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const tokens = readFileSync(
  new URL("../../src/client/tokens.css", import.meta.url),
  "utf8",
);
const button = readFileSync(
  new URL("../../src/client/components/ui/button.jsx", import.meta.url),
  "utf8",
);
const input = readFileSync(
  new URL("../../src/client/components/ui/input.jsx", import.meta.url),
  "utf8",
);
const card = readFileSync(
  new URL("../../src/client/components/ui/card.jsx", import.meta.url),
  "utf8",
);

function block(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, selector);
  return match[1];
}

describe("token values", () => {
  it("uses warm paper, a terracotta main action, and a 5 pixel corner", () => {
    const light = block(tokens, ":root");
    const dark = block(tokens, ".dark");
    assert.match(light, /--background:\s*oklch\(0\.968 0\.009 84\.6\)/);
    assert.match(light, /--primary:\s*oklch\(0\.504 0\.124 37\.6\)/);
    assert.match(light, /--accent:\s*oklch\(0\.94 0\.01 87\.5\)/);
    assert.match(light, /--info:\s*oklch\(0\.504 0\.124 37\.6\)/);
    assert.match(light, /--ring:\s*oklch\(0\.55 0\.015 70\)/);
    assert.match(light, /--radius:\s*5px/);
    assert.match(dark, /--background:\s*oklch\(0\.22 0\.012 70\)/);
    assert.match(dark, /--primary:\s*oklch\(0\.78 0\.11 40\)/);
    assert.doesNotMatch(light, /--primary:\s*oklch\(0\.2 0 0\)/);
    assert.doesNotMatch(dark, /--background:\s*oklch\(0 0 0\)/);
    assert.match(button, /rounded-\[5px\]/);
    assert.doesNotMatch(button, /shadow/);
    assert.match(button, /hover:bg-\[var\(--primary-hover\)\]/);
    assert.match(
      button,
      /secondary:\s*"bg-secondary text-secondary-foreground border/,
    );
    assert.match(input, /rounded-\[5px\]/);
    assert.doesNotMatch(input, /shadow/);
    assert.doesNotMatch(card, /shadow/);
  });
});
