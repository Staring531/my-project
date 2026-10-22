# Implementation Plan: Organizer Screen Layout

**Branch**: `005-organizer-screen-layout` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-organizer-screen-layout/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

The organizer screens listed in the spec's Screens section are rebuilt so each control sits where that section places it. The header, the notice strip, the signed-out library, the sign-in dialog, the signed-in library, the date album, the named album, and the enlarged picture each follow their structure, control placement, empty state, and narrow-window rules. Album cards and picture cards are shared patterns: one picture, one text line, and no control hanging below the card.

The client keeps React, Tailwind, and the shadcn components already in the tree. Menus and dialogs come from three added Radix packages, copied in as shadcn sources and recolored with the existing tokens. The server, the API, and the album rules do not change. Placement is checked in a real browser, because string markup cannot show that two controls overlap.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer. Client screens are JSX bundled by Vite 7. No TypeScript.

**Primary Dependencies**: Already present: `react`, `react-dom`, `tailwindcss`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, and the shadcn `button`, `input`, and `card`. Added: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, and `@radix-ui/react-popover`, because focus trapping and Escape-to-close are not in the components already present. Added dev dependency: `playwright`, because `node:test` cannot measure a rendered layout. No icon package. See [research.md](research.md).

**Storage**: N/A. Screen state lives in memory for the visit. Appearance stays a class on the document element and is still not saved. `data/library.sqlite` is unchanged.

**Testing**: `node:test` for the server, the API, the notice lifetime, and the color scanners. `playwright` Chromium, launched from `tests/layout/screen-layout.test.js`, for presence and placement on a rendered page. Existing assertions for owner-only controls, empty copy, and confirm-or-cancel move into that browser check with the same outcomes. The one-time notice assertion is replaced by the stay-until-closed rule the spec records.

**Target Platform**: Local web application in a desktop or phone-width browser. Narrow means under 640 pixels wide. The Vite dev server still serves the organizer at `/` and proxies `/api/` and `/images/`.

**Project Type**: Local web application. This feature replaces the client screens. It does not change `src/server/`.

**Performance Goals**: The first row of album cards is on screen without scrolling at 1280 by 800, as SC-002 requires. Opening a menu or dialog does not refetch the library. Switching appearance still does not change the route.

**Constraints**: Specs 001 through 004 keep their behavior (FR-002). Colors stay the semantic roles in `src/client/tokens.css`. New screen files pass `findScreenColors`. The page does not scroll sideways from 320 pixels up. The global `button, a` rule in `styles.css` is removed. `DATA_DIR` and `PORT` stay as they are.

**Scale/Scope**: Eight screens plus three shared patterns, as the Screens section lists them. The token sample page is out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Date, visibility, and deletion stay in `src/server/library.js`. The client renders the API result and does not grow a second rule. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers JSX and CSS. |
| Observable tests, including error paths | II. Testing | PASS | FR-021 requires a failing check for a broken layout. The plan adds a rendered-screen check and keeps the API tests. |
| Simplest design that meets the spec | III. Maintainability | PASS | One React tree. Dialog is reused for the bottom panel, so no sheet component is added. |
| Every screen states structure, placement, empty state, and narrow layout | IV. Interface | PASS | The spec's Screens section does this for the header, notices, both libraries, both albums, the sign-in dialog, and the enlarged picture. This plan cites that section. The token sample page keeps its exemption. |
| Dependencies named and justified | Quality Constraints | PASS | Three Radix packages and Playwright are named in Technical Context. The reason for each is in [research.md](research.md). |
| Configuration injectable; no committed secrets | Quality Constraints | PASS | No new configuration. Tests do not read the owner's `data/` library; the layout test uses its own fixture responses. |
| Failures returned to the caller | Quality Constraints | PASS | A failed delete stays in the dialog with the server message. Sign-in and album-name errors stay in their own surfaces. |

### Post-design gate

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/screen-layout.md](contracts/screen-layout.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | Overlay rules and the notice lifetime have one description in the data model. The screen contract does not restate visibility rules; it points at the 002 API contract. |
| II. Testing | PASS | The quickstart names the browser check, the five widths, and the notice test that replaces one-time consumption. API tests are unchanged. |
| III. Maintainability | PASS | New UI files are the three copied components and the screen modules. `api.js` and `src/server/` stay. |
| IV. Interface | PASS | [contracts/screen-layout.md](contracts/screen-layout.md) gives each region a position a test can fail. Tasks that build a screen must cite this principle and that contract. |
| Quality Constraints | PASS | No server dependency. Copied components must pass the existing color scanner, so they are not a second palette. |

## Project Structure

### Documentation (this feature)

```text
specs/005-organizer-screen-layout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── screen-layout.md
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
src/client/
├── App.jsx                          # header plus the open screen, one React tree
├── photo-app.js                     # session, route, and overlay state; no second root
├── api.js                           # unchanged
├── notice.js                        # notice stays until closed or replaced
├── appearance.js                    # unchanged
├── styles.css                       # page column, grids, truncation; no global button rule
├── tokens.css                       # unchanged
├── components/ui/
│   ├── button.jsx                   # existing
│   ├── input.jsx                    # existing
│   ├── card.jsx                     # existing
│   ├── dialog.jsx                   # added, also the narrow bottom panel
│   ├── dropdown-menu.jsx            # added, wide picture menu
│   └── popover.jsx                  # added, wide New album panel
└── screens/
    ├── header.jsx
    ├── notice-strip.jsx
    ├── library.jsx                  # signed-in and signed-out library
    ├── album.jsx                    # date album and named album
    ├── account-dialog.jsx
    └── preview.jsx

tests/
├── layout/screen-layout.test.js     # Playwright, presence and geometry
├── unit/                            # notice lifetime and color scan updated
├── contract/                        # unchanged
└── integration/                     # unchanged
```

**Structure Decision**: The existing local web application. Screens move under `src/client/screens/` and are what Vite serves. `library-view.js`, `album-view.js`, `session-view.js`, and `preview-view.js` are removed once their assertions live in the layout test. The server tree is not part of this feature.

## Complexity Tracking

None. The three Radix packages and Playwright are justified dependencies, not a second implementation of an existing rule.
