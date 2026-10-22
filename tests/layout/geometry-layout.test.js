import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openOrganizer } from "./harness.js";

const widths = [320, 375, 640, 960, 1440];

describe("screen geometry", () => {
  for (const width of widths) {
    it(`does not scroll sideways at ${width} pixels`, async () => {
      const opened = await openOrganizer({ width, height: 800 });
      try {
        await opened.page
          .getByRole("heading", { name: "Photo Date Albums" })
          .waitFor();
        const fits = await opened.page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        );
        assert.equal(fits, true);
      } finally {
        await opened.close();
      }
    });
  }
});
