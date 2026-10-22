import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

describe("quiet loading and focus", () => {
  it("shows blocks instead of the empty sentence until the library arrives", async () => {
    const opened = await openOrganizer({
      pauseAlbums: true,
      albums: [],
      namedAlbums: [],
      width: 960,
    });
    try {
      const page = opened.page;
      await page.locator(".skeleton").first().waitFor();
      assert.equal(
        await page
          .getByText("Add photos to organize them by the day they were taken.")
          .count(),
        0,
      );
      opened.releaseAlbums();
      await page
        .getByText("Add photos to organize them by the day they were taken.")
        .waitFor();
      assert.equal(await page.locator(".skeleton").count(), 0);
    } finally {
      await opened.close();
    }
  });

  it("draws a 3 pixel focus ring and ignores a composing Enter", async () => {
    const opened = await openOrganizer({ signedIn: false, width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "Sign in" }).waitFor();
      await page.locator("#sign-in").focus();
      const width = await page.locator("#sign-in").evaluate((node) => {
        node.focus();
        return getComputedStyle(node).outlineWidth;
      });
      assert.equal(width, "3px");
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.getByLabel("Name").waitFor();
      const submitted = await page.evaluate(() => {
        const input = document.querySelector("#account-name");
        let submitted = false;
        input.form.addEventListener("submit", () => {
          submitted = true;
        });
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
            isComposing: true,
          }),
        );
        return submitted;
      });
      assert.equal(submitted, false);
      assert.equal(await page.getByRole("dialog").count(), 1);
    } finally {
      await opened.close();
    }
  });
});
