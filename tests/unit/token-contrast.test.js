import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  semanticRoles,
  supportingAppearance,
} from "../../src/client/token-roles.js";

const tokensPath = new URL("../../src/client/tokens.css", import.meta.url);

function block(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing ${selector}`);
  return match[1];
}

function properties(body) {
  const values = new Map();
  for (const match of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    values.set(match[1], match[2].trim());
  }
  return values;
}

function oklchToSrgb(value) {
  const match = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  assert.ok(match, `${value} is not oklch()`);
  const L = Number(match[1]);
  const C = Number(match[2]);
  const hue = (Number(match[3]) * Math.PI) / 180;
  const a = C * Math.cos(hue);
  const b = C * Math.sin(hue);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((channel) => {
    const clipped = Math.min(1, Math.max(0, channel));
    return clipped <= 0.0031308
      ? 12.92 * clipped
      : 1.055 * clipped ** (1 / 2.4) - 0.055;
  });
}

function luminance(channels) {
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(surface, text) {
  const lighter = Math.max(luminance(surface), luminance(text));
  const darker = Math.min(luminance(surface), luminance(text));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("token contrast", () => {
  it("keeps every text pair at or above 4.5 to 1 in both appearances", () => {
    const css = readFileSync(tokensPath, "utf8");
    const appearances = {
      light: properties(block(css, ":root")),
      dark: properties(block(css, ".dark")),
    };
    const allowed = new Set([
      ...semanticRoles.flatMap((role) => [role.name, role.textName]),
      ...supportingAppearance.map((item) => item.name),
    ]);

    for (const [appearance, values] of Object.entries(appearances)) {
      for (const name of values.keys()) {
        assert.ok(allowed.has(name), `extra color property ${name}`);
      }
      for (const role of semanticRoles) {
        const surface = values.get(role.name);
        const text = values.get(role.textName);
        assert.ok(surface, `${role.name} missing in ${appearance}`);
        assert.ok(text, `${role.textName} missing in ${appearance}`);
        const ratio = contrast(oklchToSrgb(surface), oklchToSrgb(text));
        assert.ok(
          ratio >= 4.5,
          `${role.name} in ${appearance} is ${ratio.toFixed(2)} to 1`,
        );
      }
    }

    const light = appearances.light;
    assert.equal(light.get("radius"), "5px");
    assert.ok(supportingAppearance.some((item) => item.name === "shadow"));
    assert.ok(
      supportingAppearance.some((item) => item.name === "primary-hover"),
    );
    assert.equal(appearances.dark.has("radius"), false);
    for (const name of ["border", "input", "ring"]) {
      assert.match(light.get(name), /^oklch\(/);
      assert.match(appearances.dark.get(name), /^oklch\(/);
    }
  });
});
