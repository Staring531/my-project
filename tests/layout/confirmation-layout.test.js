import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

async function armClock(page) {
  await page.evaluate(() => {
    let pending = null;
    window.__confirmationClock = {
      setTimeout(fn) {
        pending = fn;
        return 1;
      },
      clearTimeout() {
        pending = null;
      },
    };
    window.__runConfirmation = () => {
      const fn = pending;
      pending = null;
      fn?.();
    };
  });
}

describe("confirmation", () => {
  it("shows Album created and clears it from the injected clock", async () => {
    const opened = await openOrganizer({ allowCreate: true, width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "New album" }).waitFor();
      await armClock(page);
      await page.getByRole("button", { name: "New album" }).click();
      await page.getByLabel("Name").fill("Seaside");
      await page.getByRole("button", { name: "Create" }).click();
      await page.getByText("Album created.").waitFor();
      await page.getByText("Seaside", { exact: true }).waitFor();
      await page.evaluate(() => window.__runConfirmation());
      await page.getByText("Album created.").waitFor({ state: "hidden" });
    } finally {
      await opened.close();
    }
  });

  it("replaces a confirmation with the newer one", async () => {
    const opened = await openOrganizer({ width: 960 });
    try {
      const page = opened.page;
      await page.getByRole("button", { name: "Make album private" }).waitFor();
      await armClock(page);
      await page.getByRole("button", { name: "Make album private" }).click();
      await page.getByText("Album is now private.").waitFor();
      await page.getByRole("button", { name: "Mark album public" }).click();
      await page.getByText("Album is now public.").waitFor();
      assert.equal(await page.getByText("Album is now private.").count(), 0);
    } finally {
      await opened.close();
    }
  });
});
