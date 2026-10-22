# Implementation Plan: Update Client Interface

**Branch**: `006-update-client-interface` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-update-client-interface/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

The organizer screens from spec 005 stay where they are. This feature makes every flow finish from the keyboard, keeps an open layer open when appearance changes, shows `This picture cannot be shown.` wherever a picture fails, and keeps a shortened album name available. The date-album cover remains the first picture the server can show. No package is added.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer. Client screens are JSX bundled by Vite 7. No TypeScript.

**Primary Dependencies**: Already present: `react`, `react-dom`, `tailwindcss`, the shadcn `button`, `input`, `card`, `dialog`, `dropdown-menu`, and `popover`, and `playwright`. None are added. See [research.md](research.md).

**Storage**: N/A. Cover choice for a date album stays in `src/server/library.js`. No new column and no new file.

**Testing**: `node:test` for the server and the color scan. Playwright Chromium in the existing `tests/layout/` files for keyboard focus, the failure sentence, More, and the 320-pixel hit size. `npm test` runs them with the rest of the suite.

**Target Platform**: Local web application in a desktop or phone-width browser. Narrow means under 640 pixels wide. The Vite server still serves the organizer at `/` and proxies `/api/` and `/images/`.

**Project Type**: Local web application. The client screens are updated. `src/client/api.js` is not changed. The server changes only if a date-album cover test shows the existing `showableCoverName` path no longer matches FR-007.

**Performance Goals**: Opening a menu or switching appearance does not refetch the library. The first row of album cards stays on screen at 1280 by 800, as spec 005 requires.

**Constraints**: Specs 001 through 005 keep their behavior except the More Cancel row, the failure sentence, and the full-name tooltip (FR-002, FR-011). Colors stay the roles in `src/client/tokens.css`. The page does not set `maximum-scale`. `DATA_DIR` and `PORT` stay as they are.

**Scale/Scope**: The header, notices, both libraries, both albums, the picture card, the enlarged picture, the delete confirmation, and the Add pictures dialog. The token sample page is out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Who can see a picture stays in `src/server/library.js`. The client paints the URL it is given and the failure sentence. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers JSX and CSS. |
| Observable tests, including error paths | II. Testing | PASS | FR-020 requires a rendered check for keyboard, focus, appearance, the cover, the failure sentence, and hit size. |
| Simplest design that meets the spec | III. Maintainability | PASS | No new component and no new package. The enlarged picture records its opener instead of becoming a second dialog. |
| Every screen states structure, placement, empty state, and narrow layout | IV. Interface | PASS | The spec's Screens section does this. This plan cites that section and [contracts/interface-interaction.md](contracts/interface-interaction.md). The token sample page keeps its exemption. |
| Dependencies named and justified | Quality Constraints | PASS | No dependency is added. The existing Radix and Playwright packages stay for the reasons in spec 005. |
| Configuration injectable; no committed secrets | Quality Constraints | PASS | No new configuration. Layout tests keep using fixture responses. |
| Failures returned to the caller | Quality Constraints | PASS | A failed picture shows the sentence on the surface that failed. A failed delete stays in its dialog. |

### Post-design gate

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/interface-interaction.md](contracts/interface-interaction.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | Cover choice stays one server function. The client has one sentence for a picture that cannot be painted. |
| II. Testing | PASS | The quickstart names the layout files and the outcomes that must fail when focus, the cover, or the hit size is wrong. |
| III. Maintainability | PASS | Changes stay in the existing screen modules, `styles.css`, and the existing layout tests. |
| IV. Interface | PASS | The contract places Close, More, the failure sentence, and the full name. Tasks that build a screen must cite this principle and that contract. |
| Quality Constraints | PASS | No new package. `index.html` does not add `maximum-scale`. The color scanner still covers the screen files. |

## Project Structure

### Documentation (this feature)

```text
specs/006-update-client-interface/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── interface-interaction.md
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
src/client/
├── index.html                       # viewport stays without maximum-scale
├── styles.css                       # 2px focus ring, 16px fields, tabular counts, reduced motion
├── tokens.css                       # unchanged
├── api.js                           # unchanged
├── appearance.js                    # unchanged; still only toggles the document class
├── screens/
│   ├── header.jsx                   # More has no Cancel; appearance does not close a layer
│   ├── notice-strip.jsx             # Close returns focus to the main action
│   ├── library.jsx                  # failed or missing cover shows the sentence; full name
│   ├── album.jsx                    # picture, Add pictures, and delete copy show the sentence
│   ├── account-dialog.jsx           # focus starts on Name; 16px fields on a narrow window
│   └── preview.jsx                  # focus returns to the picture that opened it
└── components/ui/
    ├── button.jsx                   # stop clearing the focus outline
    └── input.jsx                    # stop clearing the focus outline

src/server/
└── library.js                       # showableCoverName stays the date-album cover rule

tests/layout/
├── keyboard-layout.test.js          # keyboard flows, focus return, appearance
├── library-layout.test.js           # cover sentence
├── album-layout.test.js             # card and enlarged sentence
├── header-layout.test.js            # More has no Cancel
└── narrow-layout.test.js            # 320-pixel hit size and no sideways scroll
```

**Structure Decision**: The existing local web application. Screens stay the modules spec 005 added. This feature edits those modules and the layout tests. It does not add a screen, a component, or a package.

## Complexity Tracking

None. No constitution gate is violated, and no new dependency is introduced.
