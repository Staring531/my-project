# Quickstart: Design Token Foundation

Validation guide for the sample page, the two appearances, and the two color checks. Role meanings live in [data-model.md](data-model.md). The page contract is [contracts/token-preview.md](contracts/token-preview.md). The checks are [contracts/color-check.md](contracts/color-check.md).

The photo organizer is unchanged. Its screens are not part of this guide.

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

`npm test` includes the style-sheet check, the screen check, and the contrast check. Those tests read source files. They do not use `data/`.

`npm run dev` starts the existing local server and the Vite client. Open the token preview path on the URL Vite prints:

```text
/token-preview.html
```

## Checks

Confirm each outcome after `npm test` is green.

1. **Light catalog.** The page opens in the light appearance. Every semantic role is labeled, and each one shows paired text. Border, input outline, focus emphasis, and the shared corner are visible. No album or sign-in control is on the page.
2. **Dark catalog.** Use the switch on the page. The same role names remain, the address does not change, and the colors are the dark set. Switch back. The light set returns.
3. **Readable pairs.** Text on each paired background can be read in both appearances. `npm test` already failed if any pair is below 4.5 to 1. Borders and the focus emphasis are not part of that measurement.
4. **Style-sheet rejection.** The style-sheet test feeds a fixture that contains a hexadecimal color and a fixture that contains a named color. Both are reported as findings. The real token file and the preview stylesheet do not contain those fixtures.
5. **Screen rejection.** The screen test feeds a fixture that sets a raw color directly on an element. It reports a finding. That test does not call the style-sheet check. A style-sheet pass is not the evidence for this step.
6. **Organizer left alone.** Open the photo library URL. It still uses its existing appearance. This feature does not retokenize that screen.

## What failure looks like

- A semantic role is missing in one appearance.
- Switching appearance loads a different page.
- A paired text color is hard to read, or `npm test` reports a contrast failure.
- The preview stylesheet contains a color literal instead of a catalog reference.
- A direct color on the sample page is excused because the style-sheet check passed.
- The photo library's colors changed as part of this feature.
- `npm test` fails. Do not treat the browser session as passing while tests are red.
