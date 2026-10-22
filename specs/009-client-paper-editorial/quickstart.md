# Quickstart: Client Paper Editorial

## Prerequisites

Node.js 24.20 or newer. Dependencies already installed. No new package.

## Run

```sh
npm test -- --test-concurrency=1
```

Playwright layout tests need the installed Chromium. The suite fails if a rendered screen breaks the paper page, the dark page, the corner, the lift, the flourish, or the header order.

## What to look for

| Outcome | Check |
| --- | --- |
| Warm paper page, not pure white | `tests/layout/visual-language.test.js` on the library |
| Warm near-black page, not pure black | The same file after choosing the dark appearance |
| 5-pixel corner, warm shadow, terracotta main action | The same file, on a card and on Add photos |
| Serif month heading and monospaced count | The same file |
| Card lifts about 2 pixels; a button does not | The same file |
| Empty flourish above the existing sentence | `tests/layout/library-layout.test.js` |
| Language switch still before the appearance switch | `tests/layout/header-layout.test.js` |
| Chinese first, English switch, album name unchanged | `tests/layout/language-layout.test.js` |
| Every text pair at least 4.5 to 1, radius `5px` | `tests/unit/token-contrast.test.js` |
| The role values from [research.md](research.md) | `tests/unit/token-values.test.js` |

The sentences, the confirmation, and the narrow hit sizes stay covered by the spec 008 layout tests. Those tests keep selecting English through the harness.

## Contracts

[contracts/visual-language.md](contracts/visual-language.md) is the rendered check. [data-model.md](data-model.md) names the two paper appearances, the mark, and the flourish. Spec 008 still names the stored preference fields.
