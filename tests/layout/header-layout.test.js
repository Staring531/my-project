import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

describe("wide header", () => {
  it("shows the signed-in controls in order and keeps a refused album name in the panel", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "New album" }).waitFor();
      const labels = await page
        .locator("header")
        .getByRole("button")
        .allInnerTexts();
      assert.deepEqual(labels, [
        "New album",
        "Add photos",
        "中文",
        "Dark appearance",
        "Sign out",
      ]);
      await page.getByRole("button", { name: "New album" }).click();
      await page.getByLabel("Name").fill("Trip");
      await page.getByRole("button", { name: "Create" }).click();
      await page.getByText("An album with that name already exists.").waitFor();
      const duplicateFollowsName = await page.evaluate(() => {
        const field = document.getElementById("album-name");
        const alert = document.querySelector("[role='alert']");
        return Boolean(
          field &&
            alert &&
            field.compareDocumentPosition(alert) &
              Node.DOCUMENT_POSITION_FOLLOWING,
        );
      });
      assert.equal(duplicateFollowsName, true);
      await page.getByLabel("Name").fill("");
      await page.getByRole("button", { name: "Create" }).click();
      await page
        .getByText("Enter an album name of 1 to 64 characters.")
        .waitFor();
      await page.getByRole("button", { name: "Create" }).waitFor();
    } finally {
      await opened.close();
    }
  });

  it("keeps the light appearance when the language switch is chosen", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "中文" }).click();
      await page.getByRole("heading", { name: "照片日期相册" }).waitFor();
      const appearance = await page.evaluate(() => ({
        dark: document.documentElement.classList.contains("dark"),
        value: document.documentElement.dataset.appearance,
      }));
      assert.equal(appearance.dark, false);
      assert.equal(appearance.value, "light");
    } finally {
      await opened.close();
    }
  });
});
