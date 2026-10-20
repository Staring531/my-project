# Quickstart: Client Token Appearance

Validation guide for the photo library after it uses the shared color set. The appearance rules live in [data-model.md](data-model.md). The screen contract is [contracts/organizer-appearance.md](contracts/organizer-appearance.md). The checks are [contracts/organizer-color-check.md](contracts/organizer-color-check.md).

## Prerequisites

- Node.js 24.20 or newer.
- A current desktop browser.

## Setup

From the repository root:

```bash
npm install
npm test
npm run dev
```

`npm test` includes the existing album and account tests, the token contrast test, and the color checks. The organizer files are separate inputs from the sample page.

Open the library on the URL Vite prints:

```text
/
```

The sample page stays at `/token-preview.html`.

## Checks

Confirm each outcome after `npm test` is green.

1. **Light library.** The library opens in the light appearance. Account forms, empty states, album tiles, and actions use the shared colors. An enlarged picture uses the popover pair. A photograph is not recolored.
2. **Same tasks.** Create an account, sign in, add a photo, open an album, enlarge a picture, and close it. The outcomes match the current library. Existing automated tests cover this.
3. **Dark library.** Open an album. Use the header switch. The address, including the album hash, does not change. The same album is still open. Switch back. The light colors return. Reload. The light appearance is showing again.
4. **Work in progress.** With a delete confirmation or an enlarged picture showing, switch appearance. The confirmation or the picture is still there, and the person is still signed in.
5. **Readable pairs.** Text on each paired background can be read in both appearances. `npm test` already failed if a catalog pair is below 4.5 to 1. Borders and the focus emphasis are not part of that measurement.
6. **Organizer rejection.** The style-sheet test reports a finding for a fixture with a hexadecimal color and a fixture with a named color. `styles.css` itself has an empty finding list. That assertion is not the one that reads the sample page stylesheet.
7. **Screen rejection.** The screen test reports a finding for a fixture that sets a raw color on an element. Each organizer source file has an empty finding list. A passing sample-page result is not that evidence.
8. **Sample page remains.** Open `/token-preview.html`. Every semantic role is still listed, and its own switch still changes that page.

## What failure looks like

- A library screen still shows the old cream and ink colors.
- Switching appearance loads another page, closes the album, or drops a pending delete.
- The appearance is still dark after a reload.
- A photograph is tinted by the color set.
- `styles.css` contains a color literal, or a text color from one role sits on a surface from another.
- The sample page was removed or no longer lists every role.
- `npm test` fails. Do not treat the browser session as passing while tests are red.
