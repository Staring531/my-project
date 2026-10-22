# Quickstart: Organizer Screen Layout

Proves the layout contract in [contracts/screen-layout.md](contracts/screen-layout.md). It does not re-prove date grouping, visibility, or deletion. Those stay the quickstarts in specs 001 and 002, and they must still pass.

## Prerequisites

- Node.js 24.20 or newer.
- One-time browser setup: `npx playwright install chromium`.
- The library API and the Vite server from `npm run dev`, with `DATA_DIR` left at `data`.

## Automated

```sh
npm test
```

Expected:

- Existing server, account, and API tests still pass.
- `tests/unit/notice.test.js` shows a batch notice surviving a library render and clearing when closed.
- `tests/unit/screen-color.test.js` passes with the new screen modules in its file list.
- `tests/layout/screen-layout.test.js` passes at viewport widths 320, 375, 640, 960, and 1440. A control that overlaps, a third column below 640 pixels, or sideways scrolling fails this test.
- Owner-only privacy, owner-only delete, and the empty-library sentences are asserted from the rendered page in that layout test.

## Look at it

1. Sign in. The first row of album cards is visible without scrolling at a 1280 by 800 window. No form is above the cards.
2. On an album you own, Private or Public is inside the card at the top-right of the picture. Nothing sits under the card.
3. Open a date album. Each picture shows the picture, one line, and one menu. Delete opens a dialog. Cancel leaves the picture.
4. Narrow the window below 640 pixels. The grid has two columns, the header stays one line, and the picture menu opens from the bottom.
5. Sign out. Public albums are the first thing under the header. Sign in opens a dialog. A wrong secret shows `Could not sign in.` inside it.
6. Switch appearance while a dialog is open. The dialog stays, and the screen stays on the same album.

## Done when

- [contracts/screen-layout.md](contracts/screen-layout.md) geometry section holds at all five widths.
- Specs 001 through 004 acceptance checks still pass.
- Biome passes on the client files this feature touches.
