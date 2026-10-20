import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { semanticRoles } from "../../src/client/token-roles.js";
import {
  nextAppearance,
  renderTokenPreview,
} from "../../src/client/token-preview.js";

const html = readFileSync(
  new URL("../../src/client/token-preview.html", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../../src/client/token-preview.css", import.meta.url),
  "utf8",
);

describe("token preview", () => {
  it("lists every role with its text and a switch in both appearances", () => {
    assert.equal(nextAppearance("light"), "dark");
    assert.equal(nextAppearance("dark"), "light");

    for (const appearance of ["light", "dark"]) {
      const markup = renderTokenPreview(appearance);
      assert.match(markup, new RegExp(`data-appearance="${appearance}"`));
      assert.match(markup, /data-appearance-switch/);
      assert.match(markup, new RegExp(`>${appearance}<`));
      for (const role of semanticRoles) {
        assert.match(markup, new RegExp(`data-role="${role.name}"`));
        assert.match(markup, new RegExp(`>${role.name}<`));
        assert.match(markup, new RegExp(`>${role.textName}<`));
        assert.match(markup, new RegExp(`var\\(--${role.name}\\)`));
        assert.match(markup, new RegExp(`var\\(--${role.textName}\\)`));
      }
      for (const name of ["border", "input", "ring", "radius"]) {
        assert.match(markup, new RegExp(`data-support="${name}"`));
      }
      assert.doesNotMatch(markup, /#[0-9a-fA-F]{3,8}\b/);
      assert.doesNotMatch(markup, /\b(?:oklch|rgb|hsl|hwb)\(/);
      assert.doesNotMatch(markup, /album|sign-in|Sign in/i);
    }
  });

  it("loads only the token page and references catalog properties", () => {
    assert.match(html, /tokens\.css/);
    assert.match(html, /token-preview\.css/);
    assert.match(html, /token-preview\.js/);
    assert.doesNotMatch(html, /styles\.css/);
    assert.doesNotMatch(html, /main\.js/);
    assert.doesNotMatch(html, /\bdark\b/);
    for (const role of semanticRoles) {
      assert.match(css, new RegExp(`var\\(--${role.name}\\)`));
      assert.match(css, new RegExp(`var\\(--${role.textName}\\)`));
    }
    assert.match(css, /var\(--border\)/);
    assert.match(css, /var\(--input\)/);
    assert.match(css, /var\(--ring\)/);
    assert.match(css, /var\(--radius\)/);
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
    assert.doesNotMatch(css, /\b(?:oklch|rgb|hsl|hwb)\(/);
  });
});
