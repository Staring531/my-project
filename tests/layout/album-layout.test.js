import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dateAlbum, namedAlbum, photo } from "./fixtures.js";
import { openOrganizer } from "./harness.js";

describe("album picture menu", () => {
  it("keeps picture actions in one menu and cancel leaves the picture", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(dateAlbum.id)}`,
      );
      await page.getByRole("button", { name: "Picture actions" }).waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Place in Trip" }).count(),
        0,
      );
      await page.getByRole("button", { name: "Picture actions" }).click();
      const items = await page.getByRole("menuitem").allInnerTexts();
      assert.deepEqual(items, [
        "Mark picture public",
        "Add to album",
        "Delete",
      ]);
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await page
        .getByRole("heading", { name: "Delete this picture?" })
        .waitFor();
      await page.getByRole("button", { name: "Cancel" }).click();
      await page.getByRole("button", { name: "Picture actions" }).waitFor();
      await page.locator(".picture-open").click();
      await page.locator("[data-preview-fit='contain']").waitFor();
      const fit = await page
        .locator("[data-preview-fit='contain']")
        .evaluate((node) => getComputedStyle(node).objectFit);
      assert.equal(fit, "contain");
      await page.getByRole("button", { name: "Close", exact: true }).click();
      assert.equal(await page.locator(".preview").count(), 0);
    } finally {
      await opened.close();
    }
  });

  it("says a listed picture cannot be shown when its image fails", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.route("**/images/**", (route) =>
        route.fulfill({ status: 404, body: "" }),
      );
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(dateAlbum.id)}`,
      );
      const message = page.getByText("This picture cannot be shown.");
      await message.waitFor();
      assert.equal(await message.count(), 1);
      await page.locator(".picture-open").click();
      await page
        .locator(".preview")
        .getByText("This picture cannot be shown.")
        .waitFor();
      assert.equal(await message.count(), 2);
    } finally {
      await opened.close();
    }
  });

  it("shows the full date when the album title is focused", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(dateAlbum.id)}`,
      );
      const title = page.getByRole("heading", { name: dateAlbum.albumDate });
      const name = title.getByRole("link");
      await name.focus();
      const shown = await name.evaluate(
        (node) => getComputedStyle(node, "::after").content,
      );
      assert.equal(shown, `"${dateAlbum.albumDate}"`);
    } finally {
      await opened.close();
    }
  });

  it("says there are no pictures to add, and keeps an added picture marked", async () => {
    const opened = await openOrganizer({
      albums: [],
      namedAlbums: [{ ...namedAlbum, photoCount: 0 }],
      width: 960,
    });
    try {
      const page = opened.page;
      await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url());
        if (
          url.pathname.includes("/albums/named") &&
          route.request().method() === "GET"
        ) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              album: { ...namedAlbum, photoCount: 0 },
              photos: [],
            }),
          });
        }
        return route.fallback();
      });
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(namedAlbum.id)}`,
      );
      await page.getByText("This album has no pictures.").waitFor();
      const flourishLeads = await page.evaluate(() => {
        const flourish = document.querySelector(".empty .flourish");
        const sentence = [...document.querySelectorAll(".empty p")].find(
          (node) => node.textContent.includes("This album has no pictures."),
        );
        return Boolean(
          flourish &&
            sentence &&
            flourish.compareDocumentPosition(sentence) &
              Node.DOCUMENT_POSITION_FOLLOWING,
        );
      });
      assert.equal(flourishLeads, true);
      await page.locator(".add-pictures").click();
      await page.getByText("No pictures to add.").waitFor();
      assert.equal(
        await page.getByRole("dialog").locator(".flourish").count(),
        0,
      );
      await page.getByRole("button", { name: "Done" }).waitFor();
      await page.getByRole("button", { name: "Close", exact: true }).click();
    } finally {
      await opened.close();
    }

    const marked = await openOrganizer({ width: 960 });
    try {
      const page = marked.page;
      await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url());
        if (
          url.pathname.includes("/albums/named") &&
          route.request().method() === "GET"
        ) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              album: { ...namedAlbum, photoCount: 1 },
              photos: [photo],
            }),
          });
        }
        return route.fallback();
      });
      await page.goto(
        `${page.url()}#/albums/${encodeURIComponent(namedAlbum.id)}`,
      );
      await page.getByRole("button", { name: "Add pictures" }).click();
      await page.getByRole("button", { name: "Already added" }).waitFor();
    } finally {
      await marked.close();
    }
  });
});
