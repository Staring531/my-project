import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { findScreenColors } from "../../src/client/screen-color.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("screen color check", () => {
  it("finds five direct colors without calling the style-sheet check", () => {
    const fixtures = [
      [`<div style="color:#ff0000"></div>`, "hex", "#ff0000"],
      [`<div style="color:#00ff00"></div>`, "hex", "#00ff00"],
      [`<div style="color: red"></div>`, "named", "red"],
      [`<div style="color: blue"></div>`, "named", "blue"],
      [`<div style="color: rgb(1, 0, 0)"></div>`, "function", "rgb(1, 0, 0)"],
    ];
    for (const [source, kind, text] of fixtures) {
      assert.deepEqual(findScreenColors(source), [{ kind, text }]);
    }
    const stylesheetModule = ["color", "check"].join("-");
    const implementation = read("../../src/client/screen-color.js");
    assert.equal(implementation.includes(stylesheetModule), false);
    assert.equal(read(import.meta.url).includes(stylesheetModule), false);
  });

  it("ignores catalog names and passes the sample page", () => {
    assert.deepEqual(
      findScreenColors(
        `<div data-role="primary">primary</div><span>foreground</span>`,
      ),
      [],
    );
    assert.deepEqual(
      findScreenColors(read("../../src/client/token-preview.html")),
      [],
    );
    assert.deepEqual(
      findScreenColors(read("../../src/client/token-preview.js")),
      [],
    );
  });

  it("checks each organizer source file on its own", () => {
    const files = [
      "../../src/client/index.html",
      "../../src/client/main.js",
      "../../src/client/components/ui/dialog.jsx",
      "../../src/client/components/ui/dropdown-menu.jsx",
      "../../src/client/components/ui/popover.jsx",
      "../../src/client/screens/notice-strip.jsx",
      "../../src/client/screens/library.jsx",
      "../../src/client/screens/album.jsx",
      "../../src/client/screens/preview.jsx",
      "../../src/client/screens/account-dialog.jsx",
      "../../src/client/screens/header.jsx",
    ];
    for (const path of files) {
      assert.deepEqual(findScreenColors(read(path)), [], path);
    }
  });
});
