# Quickstart: Client Web Design

## Prerequisites

Node.js 24.20 or newer. Dependencies already installed. No new package.

## Checks

```bash
npm test -- --test-concurrency=1
```

The suite must pass. These files carry the new outcomes:

| Outcome | Check |
| --- | --- |
| Text pairs stay at or above 4.5 to 1 after the role values change | `tests/unit/token-contrast.test.js` |
| Screen style sheets still have no raw color | `tests/unit/organizer-colors.test.js`, `tests/unit/color-check.test.js` |
| First visit is Chinese and light; a later visit keeps each choice | `tests/unit/preferences.test.js` |
| Every Interface copy row and the month heading | `tests/unit/copy.test.js` |
| Enter during composition does not submit | `tests/unit/copy.test.js` for the predicate, and `tests/layout/language-layout.test.js` on Name |
| Chinese title, switch to English, album name unchanged, open dialog stays | `tests/layout/language-layout.test.js` |
| Header order, More on a narrow signed-out window | `tests/layout/header-layout.test.js`, `tests/layout/narrow-layout.test.js` |
| 40-pixel controls at 320 pixels, no sideways scroll | `tests/layout/narrow-layout.test.js` |
| Card hairline, 12-pixel corner, main action is not blue | `tests/layout/library-layout.test.js` |
| Confirmation after a created album | `tests/layout/header-layout.test.js` |

Layout checks use the existing Playwright harness. They do not read `data/library.sqlite`.

## What staying green means

With English selected, the acceptance scenarios from specs 001 through 006 that are not about the old blue main action still pass. With Chinese selected, those flows show the Chinese sentences from [spec.md](spec.md). A failed picture still shows `这张照片无法显示。` or `This picture cannot be shown.`
