import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(
  new URL("../../src/client/styles.css", import.meta.url),
  "utf8",
);
const button = readFileSync(
  new URL("../../src/client/components/ui/button.jsx", import.meta.url),
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
    hasPair(/\.album-card/, "card", "card-foreground");
    hasPair(/\.picture-card/, "card", "card-foreground");
    hasPair(/\.preview(?![^\n{]*img)/, "popover", "popover-foreground");
    assert.match(button, /default:\s*"bg-primary text-primary-foreground/);
    assert.match(
      button,
      /secondary:\s*"bg-secondary text-secondary-foreground/,
    );
    hasPair(/\.empty/, "muted", "muted-foreground");
    hasPair(/\.count/, "muted", "muted-foreground");
    hasPair(/\.notice-skip/, "muted", "muted-foreground");
    hasPair(/\.error/, "destructive", "destructive-foreground");
    hasPair(/\.confirm-delete/, "destructive", "destructive-foreground");
    const image = rules(css).find((rule) =>
      /\.album-card img|\.picture-card img/.test(rule.selector),
    );
    assert.match(image.body, /background:\s*var\(--muted\)/);
    assert.doesNotMatch(
      image.body,
      /var\(--foreground\)|var\(--card-foreground\)/,
    );
  });

  it("stacks album cards and keeps the page width off the inner main", () => {
    const card = rules(css).find((rule) => /\.album-card/.test(rule.selector));
    assert.match(card.body, /flex-direction:\s*column/);
    assert.doesNotMatch(css, /button\s*,\s*a\s*\{/);
    const width = rules(css).find((rule) => /min\(960px/.test(rule.body));
    assert.match(width.selector, /header/);
    assert.match(width.selector, /\.page/);
    assert.doesNotMatch(width.selector, /\bmain\b/);
  });
});
