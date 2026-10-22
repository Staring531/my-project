import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

describe("language", () => {
  it("opens in Chinese, switches to English, and keeps the album name", async () => {
    const opened = await openOrganizer({ language: null, width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "照片日期相册" }).waitFor();
      await page.getByRole("heading", { name: "2026年10月" }).waitFor();
      await page.getByText("Trip", { exact: true }).waitFor();
      await page.getByRole("button", { name: "English" }).click();
      await page.getByRole("heading", { name: "Photo Date Albums" }).waitFor();
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      await page.getByText("Trip", { exact: true }).waitFor();
      assert.equal(await page.getByRole("button", { name: "中文" }).count(), 1);
      await page.reload();
      await page.getByRole("heading", { name: "Photo Date Albums" }).waitFor();
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
    } finally {
      await opened.close();
    }
  });

  it("keeps the new album panel open while the language changes", async () => {
    const opened = await openOrganizer({ language: null, width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "新建相册" }).click();
      await page.getByLabel("姓名").waitFor();
      await page.getByRole("button", { name: "English" }).click();
      await page.getByLabel("Name").waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Create" }).count(),
        1,
      );
    } finally {
      await opened.close();
    }
  });

  it("puts language and appearance in More when signed out on a narrow screen", async () => {
    const opened = await openOrganizer({
      signedIn: false,
      language: "en",
      width: 320,
      height: 700,
    });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      await page.getByRole("button", { name: "More" }).click();
      const labels = await page
        .getByRole("dialog")
        .getByRole("button")
        .allInnerTexts();
      assert.deepEqual(labels, ["中文", "Dark appearance"]);
      assert.equal(await page.locator("#sign-in").count(), 1);
    } finally {
      await opened.close();
    }
  });
});
