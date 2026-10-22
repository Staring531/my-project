import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isNarrow,
  openSurface,
  overlayAfterResize,
} from "../../src/client/screen-state.js";

describe("organizer screen state", () => {
  it("keeps exactly one open surface and leaves the album mounted under an enlarged picture", () => {
    assert.equal(
      openSurface({ sessionUnauthorized: true, route: "library" }),
      "Signed-out library",
    );
    assert.equal(
      openSurface({ sessionUnauthorized: false, route: "library" }),
      "Signed-in library",
    );
    assert.equal(
      openSurface({ sessionUnauthorized: false, route: "album", album: {} }),
      "Date album",
    );
    assert.equal(
      openSurface({
        sessionUnauthorized: false,
        route: "album",
        album: { name: "Trip" },
      }),
      "Named album",
    );
    assert.equal(
      openSurface({
        sessionUnauthorized: false,
        route: "album",
        album: { name: "Trip" },
        picture: { imageUrl: "/images/a.jpg" },
      }),
      "Enlarged picture",
    );
  });

  it("closes a menu when the width crosses 640 and keeps a dialog", () => {
    assert.equal(isNarrow(639), true);
    assert.equal(isNarrow(640), false);
    assert.equal(overlayAfterResize({ type: "picture-menu" }, 800, 375), null);
    assert.deepEqual(overlayAfterResize({ type: "delete" }, 800, 375), {
      type: "delete",
    });
    assert.deepEqual(overlayAfterResize({ type: "delete" }, 800, 960), {
      type: "delete",
    });
  });
});
