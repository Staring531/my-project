import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(
  new URL("../../src/client/styles.css", import.meta.url),
  "utf8",
);

function rules(source) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1],
    body: match[2],
  }));
}

function hasPair(selectorPattern, surface, text) {
  const found = rules(css).some(
    (rule) =>
      selectorPattern.test(rule.selector) &&
      new RegExp(`background:\\s*var\\(--${surface}\\)`).test(rule.body) &&
      new RegExp(`color:\\s*var\\(--${text}\\)`).test(rule.body),
  );
  assert.equal(
    found,
    true,
    `${selectorPattern} should use ${surface} with ${text}`,
  );
}

describe("organizer colors", () => {
  it("paints each surface with its own paired text", () => {
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
    assert.doesNotMatch(css, /\b(?:oklch|rgb|hsl)\(/);
    assert.doesNotMatch(css, /border-radius:\s*999px/);
    assert.doesNotMatch(css, /border-radius:\s*0\.75rem/);
    assert.doesNotMatch(css, /filter\s*:/);
    assert.match(css, /var\(--radius\)/);
    assert.match(css, /var\(--border\)/);
    assert.match(css, /var\(--input\)/);
    assert.match(css, /var\(--ring\)/);

    hasPair(/:root/, "background", "foreground");
    hasPair(/\.tile/, "card", "card-foreground");
    hasPair(/\.album-photos figure/, "card", "card-foreground");
    hasPair(/\.account form/, "card", "card-foreground");
    hasPair(/\.create-album/, "card", "card-foreground");
    hasPair(/\.preview(?![^\n{]*img)/, "popover", "popover-foreground");
    hasPair(/add-photos/, "primary", "primary-foreground");
    hasPair(/\.account button/, "primary", "primary-foreground");
    hasPair(/\.create-album button/, "primary", "primary-foreground");
    hasPair(/sign-out/, "secondary", "secondary-foreground");
    hasPair(/data-cancel-delete/, "secondary", "secondary-foreground");
    hasPair(/data-select-photo/, "secondary", "secondary-foreground");
    hasPair(/data-place-photo/, "secondary", "secondary-foreground");
    hasPair(/data-publish-photo/, "secondary", "secondary-foreground");
    hasPair(/\.empty/, "muted", "muted-foreground");
    hasPair(/\.count/, "muted", "muted-foreground");
    hasPair(/\.skip/, "info", "info-foreground");
    hasPair(/\.error/, "destructive", "destructive-foreground");
    hasPair(/\.confirm-delete/, "destructive", "destructive-foreground");
    const image = rules(css).find((rule) =>
      /\.tile img|\.album-photos img/.test(rule.selector),
    );
    assert.match(image.body, /background:\s*var\(--muted\)/);
    assert.doesNotMatch(
      image.body,
      /var\(--foreground\)|var\(--card-foreground\)/,
    );
  });

  it("stacks album cards and keeps the tile out of the inline control padding", () => {
    const tile = rules(css).find(
      (rule) =>
        /^\s*\.tile\s*$/.test(rule.selector) &&
        /display:\s*block/.test(rule.body),
    );
    assert.ok(tile, ".tile should be a block");
    const tileBox = rules(css).find(
      (rule) => /\.tile/.test(rule.selector) && /padding:\s*0/.test(rule.body),
    );
    assert.ok(tileBox, ".tile should clear the shared link padding");
    const wrap = rules(css).find((rule) => /\.tile-wrap/.test(rule.selector));
    assert.match(wrap.body, /flex-direction:\s*column/);
    const width = rules(css).find((rule) => /min\(960px/.test(rule.body));
    assert.match(width.selector, /\.shell/);
    assert.doesNotMatch(width.selector, /\bmain\b/);
  });
});
