import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

describe("narrow organizer", () => {
  it("uses two columns, one header line, and a bottom picture menu", async () => {
    const opened = await openOrganizer({ width: 375, height: 800 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      const columns = await page
        .locator(".album-grid")
        .first()
        .evaluate(
          (node) =>
            getComputedStyle(node).gridTemplateColumns.split(" ").length,
        );
      assert.equal(columns, 2);
      const header = await page.locator("header").boundingBox();
      const title = await page.locator("h1").boundingBox();
      assert.ok(title.y + title.height <= header.y + header.height + 1);
      assert.equal(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
        true,
      );
      await page.getByRole("button", { name: "More" }).waitFor();
      await page.getByRole("button", { name: "More" }).click();
      await page.getByRole("button", { name: "New album" }).waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Cancel" }).count(),
        0,
      );
      const moreLabels = await page
        .getByRole("dialog")
        .getByRole("button")
        .allInnerTexts();
      assert.deepEqual(moreLabels, [
        "New album",
        "中文",
        "Dark appearance",
        "Sign out",
      ]);
    } finally {
      await opened.close();
    }
  });

  it("keeps controls tappable and fields at 16 pixels at 320 pixels wide", async () => {
    const opened = await openOrganizer({
      signedIn: false,
      width: 320,
      height: 700,
    });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      const scroll = await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      );
      assert.equal(scroll, true);
      const signIn = await page.locator("#sign-in").boundingBox();
      assert.ok(signIn.width >= 44 && signIn.height >= 44);
      const small = await page.evaluate(
        () =>
          [...document.querySelectorAll("button, a, input")].filter((node) => {
            const style = getComputedStyle(node);
            if (style.display === "none" || style.visibility === "hidden") {
              return false;
            }
            const box = node.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) return false;
            return box.width < 40 || box.height < 40;
          }).length,
      );
      assert.equal(small, 0);
      await page.locator("#sign-in").click();
      await page.getByLabel("Name").waitFor();
      const fontSize = await page
        .locator("#account-name")
        .evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
      assert.ok(fontSize >= 16);
      const close = await page.locator(".dialog-close").boundingBox();
      assert.ok(close.width >= 44 && close.height >= 44);
    } finally {
      await opened.close();
    }
  });
});
