import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dateAlbum, namedAlbum } from "./fixtures.js";
import { openOrganizer } from "./harness.js";

describe("signed-in library layout", () => {
  it("shows month groups, then Albums, with privacy inside the owned card", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      await page
        .getByRole("heading", { name: "Albums", exact: true })
        .waitFor();
      assert.equal(await page.getByLabel("Album name").count(), 0);
      const privacy = page.getByRole("button", { name: "Make album private" });
      await privacy.waitFor();
      assert.equal(await privacy.innerText(), "Public");
      const card = page.locator(".album-card").first();
      const cardBox = await card.boundingBox();
      const privacyBox = await privacy.boundingBox();
      assert.ok(
        privacyBox.x >= cardBox.x && privacyBox.x < cardBox.x + cardBox.width,
      );
      assert.ok(
        privacyBox.y >= cardBox.y &&
          privacyBox.y < cardBox.y + cardBox.height / 2,
      );
      const line = card.locator(".album-line");
      const lineBox = await line.boundingBox();
      assert.equal(Math.round(lineBox.height) < 48, true);
      assert.equal(await page.locator(".flourish").count(), 0);
    } finally {
      await opened.close();
    }
  });

  it("explains how to add photos when the signed-in library is empty", async () => {
    const opened = await openOrganizer({
      albums: [],
      namedAlbums: [],
      width: 960,
    });
    try {
      await opened.page
        .getByText("Add photos to organize them by the day they were taken.")
        .waitFor();
      const flourishLeads = await opened.page.evaluate(() => {
        const flourish = document.querySelector(".empty .flourish");
        const sentence = document.querySelector(".empty p");
        return Boolean(
          flourish &&
            sentence &&
            flourish.compareDocumentPosition(sentence) &
              Node.DOCUMENT_POSITION_FOLLOWING,
        );
      });
      assert.equal(flourishLeads, true);
      assert.equal(
        await opened.page
          .getByRole("heading", { name: "Albums", exact: true })
          .count(),
        0,
      );
    } finally {
      await opened.close();
    }
  });

  it("says the cover cannot be shown when its image fails", async () => {
    const opened = await openOrganizer({
      signedIn: false,
      albums: [{ ...dateAlbum, coverImageUrl: "/images/missing-cover.jpg" }],
      namedAlbums: [],
      width: 960,
    });
    try {
      await opened.page.getByText("This picture cannot be shown.").waitFor();
      assert.equal(
        await opened.page.getByText("This picture cannot be shown.").count(),
        1,
      );
    } finally {
      await opened.close();
    }
  });

  it("says the cover cannot be shown when pictures have no cover url", async () => {
    const opened = await openOrganizer({
      signedIn: false,
      albums: [{ ...dateAlbum, coverImageUrl: null, photoCount: 2 }],
      namedAlbums: [],
      width: 960,
    });
    try {
      await opened.page.getByText("This picture cannot be shown.").waitFor();
      assert.equal(await opened.page.locator(".album-placeholder").count(), 0);
    } finally {
      await opened.close();
    }
  });

  it("keeps the full album name available on point and on focus", async () => {
    const fullName = "North coast pictures from the October trip";
    const opened = await openOrganizer({
      namedAlbums: [{ ...namedAlbum, name: fullName, photoCount: 1 }],
      width: 960,
    });
    try {
      const page = opened.page;
      const link = page.getByRole("link", { name: fullName });
      await link.waitFor();
      const line = link.locator(".album-line");
      const resting = await line.evaluate(
        (node) => node.getBoundingClientRect().height,
      );
      assert.ok(resting < 48);
      await link.hover();
      const hovered = await link
        .locator(".full-name")
        .evaluate((node) => getComputedStyle(node, "::after").content);
      assert.equal(hovered, `"${fullName}"`);
      await link.focus();
      const focused = await link
        .locator(".full-name")
        .evaluate((node) => getComputedStyle(node, "::after").content);
      assert.equal(focused, `"${fullName}"`);
    } finally {
      await opened.close();
    }
  });

  it("paints a warm near-black page in the dark appearance and keeps it when the language changes", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "Dark appearance" }).click();
      await page.locator("html.dark").waitFor();
      const background = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--background")
          .trim(),
      );
      const channels = background.match(/[\d.]+/g).map(Number);
      assert.deepEqual(channels, [0.22, 0.012, 70]);
      await page.getByRole("button", { name: "中文" }).click();
      await page.getByRole("heading", { name: "照片日期相册" }).waitFor();
      const stillDark = await page.evaluate(() =>
        document.documentElement.classList.contains("dark"),
      );
      assert.equal(stillDark, true);
    } finally {
      await opened.close();
    }
  });
});
