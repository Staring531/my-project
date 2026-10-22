import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { describe, it } from "node:test";
import { dateAlbum } from "./fixtures.js";
import { openOrganizer } from "./harness.js";

async function tabTo(page, match) {
  for (let step = 0; step < 20; step += 1) {
    if (await match()) return;
    await page.keyboard.press("Tab");
  }
  assert.fail("keyboard did not reach the control");
}

describe("keyboard overlays", () => {
  it("returns focus to Picture actions when Escape closes the delete dialog", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(dateAlbum.id)}`,
      );
      const menu = page.getByRole("button", { name: "Picture actions" });
      await menu.waitFor();
      await menu.click();
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await page
        .getByRole("heading", { name: "Delete this picture?" })
        .waitFor();
      const focused = await page.evaluate(
        () => document.activeElement?.textContent,
      );
      assert.equal(focused, "Cancel");
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () =>
          document.activeElement?.getAttribute("aria-label") ===
          "Picture actions",
      );
    } finally {
      await opened.close();
    }
  });

  it("signs in from the keyboard and keeps a failed sign-in open", async () => {
    const opened = await openOrganizer({ signedIn: false, width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      await tabTo(page, () =>
        page.evaluate(() => document.activeElement?.id === "sign-in"),
      );
      await page.keyboard.press("Enter");
      await page.getByLabel("Name").waitFor();
      await page.keyboard.type("Ada");
      await page.keyboard.press("Tab");
      await page.keyboard.type("nope");
      await page.keyboard.press("Enter");
      await page.getByText("Could not sign in.").waitFor();
      assert.equal(await page.getByRole("dialog").count(), 1);
      await page.getByLabel("Secret").fill("");
      await page.keyboard.type("secret");
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: "Add photos" }).waitFor();
    } finally {
      await opened.close();
    }
  });

  it("returns focus to the enlarged picture and ignores appearance", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(dateAlbum.id)}`,
      );
      const opener = page.locator(".picture-open");
      await opener.waitFor();
      await opener.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("dialog", { name: "Enlarged picture" }).waitFor();
      await page.locator("#appearance-switch").focus();
      await page.keyboard.press("Enter");
      await page.getByRole("dialog", { name: "Enlarged picture" }).waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Light appearance" }).count(),
        1,
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction(() =>
        document.activeElement?.classList.contains("picture-open"),
      );
    } finally {
      await opened.close();
    }
  });

  it("returns focus to New album when Escape closes the panel", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "New album" }).focus();
      await page.keyboard.press("Enter");
      await page.getByLabel("Name").waitFor();
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () => document.activeElement?.textContent === "New album",
      );
    } finally {
      await opened.close();
    }
  });

  it("moves focus to Add photos when the notice is closed", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "Add photos" }).waitFor();
      await page.locator("#file-input").setInputFiles({
        name: "note.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("not a picture"),
      });
      await page.getByText("1 item was skipped.").waitFor();
      await page.getByRole("button", { name: "Close" }).focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        () => document.activeElement?.id === "add-photos",
      );
    } finally {
      await opened.close();
    }
  });
});
