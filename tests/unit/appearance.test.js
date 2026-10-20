import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyAppearance,
  nextAppearance,
} from "../../src/client/appearance.js";

function rootElement() {
  const classes = new Set();
  return {
    dataset: {},
    classList: {
      toggle(name, on) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
  };
}

describe("appearance switch", () => {
  it("toggles the document class without rendering a library or album", () => {
    assert.equal(nextAppearance("light"), "dark");
    assert.equal(nextAppearance("dark"), "light");

    const root = rootElement();
    const light = applyAppearance(root, "light");
    assert.equal(light, "light");
    assert.equal(root.classList.contains("dark"), false);
    assert.equal(root.dataset.appearance, "light");

    const dark = applyAppearance(root, "dark");
    assert.equal(dark, "dark");
    assert.equal(root.classList.contains("dark"), true);
    assert.equal(root.dataset.appearance, "dark");

    applyAppearance(root, "light");
    assert.equal(root.classList.contains("dark"), false);
    assert.equal(root.dataset.appearance, "light");
    assert.doesNotMatch(String(light), /album|library|<section/);
    assert.doesNotMatch(String(dark), /album|library|<section/);
  });
});
