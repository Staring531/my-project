# Implementation Plan: Design Token Foundation

**Branch**: `003-design-token-foundation` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-design-token-foundation/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

A reviewer opens one sample page and sees every semantic color with its paired text, then switches that same page between a light appearance and a dark appearance. Text on each paired background stays at or above a 4.5 to 1 contrast. The placeholder brand is a blue-violet family and can be replaced later without renaming the roles. Business screens, including the photo organizer, are not restyled.

The values live in one stylesheet as `oklch()` custom properties. The sample page reads only those properties. A style-sheet check and a separate screen check, both `node:test` scanners, reject a raw numeric color or a named color. The screen check is not the style-sheet check. No new dependency is added.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer (vanilla browser JavaScript bundled by Vite; no TypeScript and no UI framework)

**Primary Dependencies**: None added. Vite 7 and Biome stay as they are. Tests use `node:test`. Contrast math is a local function in the test, not a library.

**Storage**: N/A. Tokens are source text in `src/client/tokens.css`. Nothing is written to `data/`.

**Testing**: `node:test`. One test scans style-sheet text. A second test scans screen source. A third test reads both appearances from `tokens.css` and asserts contrast. A view test reads the sample page markup. The style-sheet test is not used as proof that a direct screen color was found.

**Target Platform**: Local desktop. The existing Vite dev server serves the sample page. A current desktop browser is used for the visual check.

**Project Type**: Local web application. This feature adds a review page beside the existing client and does not change the library server.

**Performance Goals**: The sample page shows every role on first paint. Switching appearance is a class change on the page, with no request. The color checks scan the token files only and stay inside the existing `npm test` run.

**Constraints**: The photo organizer's `src/client/styles.css` keeps its current colors and is outside this check. The sample page must not import that file. Borders, input outlines, and focus emphasis are present in both appearances and are not held to 4.5 to 1. The brand hue is a placeholder. `DATA_DIR` and `PORT` stay as they are.

**Scale/Scope**: One sample page, one token stylesheet, and the closed role list in the spec. No business screen.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | The role catalog is one module. Token values live only in `tokens.css`. The two color checks are different rules and do not share a pass result. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers the new client and test files. The color checks run inside `npm test`. |
| Observable tests, including storage boundaries | II. Testing | PASS | Fixtures prove a raw color and a named color fail. Contrast is computed from the token file. Markup lists every role. |
| Simplest design that meets the spec | III. Maintainability | PASS | Custom properties and a `.dark` class meet both appearances. The photo client is not rewritten. |
| Dependencies named and justified | Quality Constraints | PASS | No dependency is added. A second UI stack is not required by the spec. |
| Configuration injectable; no committed secrets or library data | Quality Constraints | PASS | The checks read source text. No service or data directory is required. |
| Failures returned to the caller | Quality Constraints | PASS | A rejected color reports the kind of color and the text that was rejected. |

No gate fails. Phase 0 may proceed.

### Post-design re-check

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/token-preview.md](contracts/token-preview.md), [contracts/color-check.md](contracts/color-check.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | `token-roles.js` is the only role list. `tokens.css` is the only value source. The preview renders that list and does not invent a second palette. |
| II. Testing | PASS | Quickstart steps map to the spec scenarios. The style-sheet fixture and the screen fixture are separate tests. Contrast covers both appearances. |
| III. Maintainability | PASS | The photo organizer's HTML, server, and `styles.css` stay untouched. A later brand change edits hue and chroma in `tokens.css` only. |
| Quality Constraints | PASS | Stylelint, Tailwind, React, and TypeScript are not added. The checker returns a finding instead of ignoring an unknown color. |

All gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/003-design-token-foundation/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
│   ├── token-preview.md
│   └── color-check.md
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
src/client/
├── index.html            # existing photo organizer, unchanged
├── styles.css            # existing photo styles, outside this color check
├── tokens.css            # light and dark semantic values
├── token-roles.js        # the closed role catalog
├── token-preview.html    # sample page
├── token-preview.css     # layout that references var(--role) only
└── token-preview.js      # renders the catalog and toggles .dark
tests/unit/
├── color-check.test.js   # style-sheet scanner, including a failing fixture
├── screen-color.test.js  # separate scanner for a color set directly on a screen
├── token-contrast.test.js
└── token-preview.test.js
```

**Structure Decision**: The existing local web app stays in place. `tokens.css` holds the light values on `:root` and the dark values on `.dark`. `token-roles.js` is the only list of roles the sample page and the contrast test share. `token-preview.html` is a second page served by the existing Vite root `src/client`. It does not load `styles.css` or `main.js`. The library server is not involved. The color checks are functions covered by `node:test`, called with the token files and with fixtures, not with the photo organizer's stylesheet.

## Complexity Tracking

None. The Constitution Check passes with no exceptions.
