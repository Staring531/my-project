import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

describe("signed-out library", () => {
  it("shows the public library and keeps a failed sign-in inside the dialog", async () => {
    const opened = await openOrganizer({ signedIn: false, width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("heading", { name: "October 2026" }).waitFor();
      assert.equal(await page.getByLabel("Secret").count(), 0);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.getByLabel("Secret").fill("wrong");
      await page.getByRole("button", { name: "Sign in" }).last().click();
      await page.getByText("Could not sign in.").waitFor();
      assert.equal(await page.getByRole("dialog").count(), 1);
    } finally {
      await opened.close();
    }
  });

  it("says there are no public photos when nothing is public", async () => {
    const opened = await openOrganizer({
      signedIn: false,
      albums: [],
      namedAlbums: [],
      width: 960,
    });
    try {
      await opened.page.getByText("There are no public photos.").waitFor();
      assert.equal(
        await opened.page.getByRole("button", { name: "Add photos" }).count(),
        0,
      );
    } finally {
      await opened.close();
    }
  });
});
