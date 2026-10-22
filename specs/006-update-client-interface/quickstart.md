# Quickstart: Update Client Interface

Proves [contracts/interface-interaction.md](contracts/interface-interaction.md). Layout, visibility, and deletion stay the quickstarts in specs 001, 002, and 005.

## Prerequisites

- Node.js 24.20 or newer.
- Chromium for Playwright, already installed for spec 005: `npx playwright install chromium`.
- `DATA_DIR` left at `data`. No new environment variable.

## Automated

```sh
npm test
```

Expected:

- Server, account, and API tests still pass. A picture that cannot be shown remains in the album and in the count.
- The date-album cover test still expects the first picture that can be shown, not the first file.
- `tests/layout/keyboard-layout.test.js` passes a keyboard-only sign-in, a cancelled deletion, and an enlarged picture. After each close, focus is on the control that opened the layer. Switching appearance leaves that layer open.
- `tests/layout/library-layout.test.js` shows `This picture cannot be shown.` for a cover that fails, and the same sentence when a card has pictures and no cover URL.
- `tests/layout/album-layout.test.js` shows that sentence on the picture card and again on the enlarged layer.
- `tests/layout/header-layout.test.js` finds no Cancel row in More, and finds Close at the notice strip's right end.
- `tests/layout/narrow-layout.test.js` at 320 pixels wide finds no sideways scroll, no control smaller than 24 by 24 pixels, and a main action and close control at least 44 by 44 pixels.
- `tests/unit/screen-color.test.js` still passes. No new palette is introduced.

## Look at it

1. Open a public album whose earliest picture cannot be shown and whose next picture can. The library card shows the later picture. The count includes both.
2. Open that album. The picture that cannot be shown reads `This picture cannot be shown.` Enlarge it. The same sentence is centered, and the album is still underneath.
3. With only the keyboard, sign in, create an album, enlarge a picture, and cancel a deletion. Each close returns to the control that opened the layer.
4. Switch appearance while the enlarged picture is open. It stays open.
5. Point at a shortened album name, then tab to that card. The full name is available both times.
6. Narrow the window below 640 pixels. Tap Name in the sign-in dialog. The page does not zoom. More lists New album, the appearance switch, and Sign out, and no Cancel.

## Done when

- [contracts/interface-interaction.md](contracts/interface-interaction.md) holds on a rendered page.
- Specs 001 through 005 acceptance checks that this contract does not change still pass.
- Biome passes on the client files this feature touches.
