import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

describe("visual language", () => {
  it("gives a card a warm shadow and a 5 pixel corner, and paints the main action terracotta", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      const card = await page
        .locator(".album-card")
        .first()
        .evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            radius: style.borderRadius,
            border: style.borderTopWidth,
            shadow: style.boxShadow,
          };
        });
      assert.equal(card.radius, "5px");
      assert.equal(card.border, "1px");
      assert.notEqual(card.shadow, "none");
      const action = await page.locator("#add-photos").evaluate((node) => {
        const style = getComputedStyle(node);
        const probe = document.createElement("div");
        probe.style.background = "var(--primary)";
        document.body.append(probe);
        const primary = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return {
          radius: style.borderRadius,
          shadow: style.boxShadow,
          background: style.backgroundColor,
          primary,
        };
      });
      assert.equal(action.radius, "5px");
      assert.equal(action.shadow, "none");
      assert.equal(action.background, action.primary);
      const terracotta = action.background.match(
        /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
      );
      assert.ok(terracotta);
      const chroma = Number(terracotta[2]);
      const hue = Number(terracotta[3]);
      assert.ok(chroma > 0.05);
      assert.ok(hue > 20 && hue < 60);
      const title = await page.locator("h1").evaluate((node) => {
        const style = getComputedStyle(node);
        return { size: style.fontSize, weight: style.fontWeight };
      });
      assert.equal(title.size, "15px");
      assert.equal(String(title.weight), "500");
      const month = await page
        .getByRole("heading", { name: "October 2026" })
        .evaluate((node) => getComputedStyle(node).fontFamily);
      assert.match(month, /Georgia|Times New Roman|serif/i);
      const header = await page
        .locator("header")
        .evaluate((node) => getComputedStyle(node).height);
      assert.equal(header, "56px");
      assert.equal(await page.locator("header .mark").innerText(), "P");
    } finally {
      await opened.close();
    }
  });

  it("lifts an album card on hover and leaves the main action in place", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      const card = page.locator(".album-card").first();
      await card.hover();
      await page.waitForTimeout(250);
      const cardLift = await card.evaluate((node) => {
        const transform = getComputedStyle(node).transform;
        if (transform === "none") return 0;
        const parts = transform
          .match(/matrix\(([^)]+)\)/)[1]
          .split(",")
          .map((part) => Number(part.trim()));
        return parts[5];
      });
      assert.ok(Math.abs(cardLift + 2) < 0.6);
      const actionLift = await page.locator("#add-photos").evaluate((node) => {
        return getComputedStyle(node).transform;
      });
      assert.equal(actionLift, "none");
    } finally {
      await opened.close();
    }
  });
});
