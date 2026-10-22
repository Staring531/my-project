# Implementation Plan: Client Web Design

**Branch**: `008-client-web-design` | **Date**: 2026-10-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-client-web-design/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

The organizer keeps its screens and its tasks. The shared color roles are retuned so the page is white or pure black, the main action is near-black or light, and blue is only for links. The first visit is Chinese, a switch beside the appearance control changes to English, and both choices are remembered on this browser. No package is added.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer. Client screens are JSX bundled by Vite 7. No TypeScript.

**Primary Dependencies**: Already present: `react`, `react-dom`, `tailwindcss`, the shadcn `button`, `input`, `card`, `dialog`, `dropdown-menu`, and `popover`, and `playwright`. None are added. See [research.md](research.md).

**Storage**: Browser storage through an injectable `getItem` / `setItem` pair. Two fields, appearance and language. No new database column and no new server field. The API keeps its English error strings.

**Testing**: `node:test` for contrast, the copy table, preferences, and the composition predicate. Playwright Chromium in `tests/layout/` for the rendered language switch, the header, the card paint, and the 320-pixel hit size. `npm test` runs them with the rest of the suite.

**Target Platform**: Local web application in a desktop or phone-width browser. Narrow means under 640 pixels wide. The Vite server still serves the organizer at `/` and proxies `/api/` and `/images/`.

**Project Type**: Local web application. The client screens, tokens, and style sheet change. `src/server/` does not change.

**Performance Goals**: Switching language or appearance does not refetch the library. The first library response is the only time the card-shaped blocks replace the grid.

**Constraints**: Specs 001 through 006 keep their behavior except the paint, the language of interface sentences, the header order (the language switch is added), the narrow signed-out More control, the 40-pixel floor, and the 3-pixel focus ring. Role names in `src/client/token-roles.js` stay. Hexadecimal colors stay out of screen style sheets. `DATA_DIR` and `PORT` stay as they are.

**Scale/Scope**: Every organizer screen in the spec, plus the color sample. One copy table. One preference record.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Visibility stays in `src/server/library.js`. Each interface sentence has one row. Appearance and language memory share one module. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers JSX and CSS. |
| Observable tests, including error paths | II. Testing | PASS | FR-021 names rendered checks. Contrast and the copy table have unit checks. An unknown server sentence is shown as received. |
| Simplest design that meets the spec | III. Maintainability | PASS | No new package and no new role name. The existing tokens change value. |
| Every screen states structure, placement, empty state, and narrow layout | IV. Interface | PASS | The spec's Screens section does this. This plan cites it and [contracts/visual-language.md](contracts/visual-language.md). |
| Dependencies named and justified | Quality Constraints | PASS | No dependency is added. |
| Configuration injectable; no committed secrets | Quality Constraints | PASS | Preference storage is an argument. Tests use a memory object. No secret is stored. |
| Failures returned to the caller | Quality Constraints | PASS | A known failure uses the active language's sentence. An unknown failure is shown as received. |

### Post-design gate

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/visual-language.md](contracts/visual-language.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | The copy module is the only sentence list. The server strings stay the English contracts. |
| II. Testing | PASS | The quickstart names the unit and layout files that fail when the language, the paint, or the hit size is wrong. |
| III. Maintainability | PASS | Changes stay in the existing screens, `tokens.css`, `styles.css`, and one new copy module plus one preference module. |
| IV. Interface | PASS | The contract places the language switch, the Chinese and English titles, the loading blocks, and the confirmation. Tasks that build a screen must cite this principle and that contract. |
| Quality Constraints | PASS | No new package. Color values stay `oklch()` in `tokens.css`. The contrast test still gates every semantic pair. |

## Project Structure

### Documentation (this feature)

```text
specs/008-client-web-design/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── visual-language.md
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
src/client/
├── tokens.css                       # retuned role values; gray ring; 12px radius; header alpha
├── token-roles.js                   # unchanged names
├── styles.css                       # 56px header, 3px ring, 6px controls, 40px narrow floor, skeleton
├── copy.js                          # Interface copy and month headings
├── preferences.js                   # appearance and language memory
├── appearance.js                    # still only toggles the document class
├── organizer.jsx                    # loads preferences, loading flag, confirmation
├── screens/
│   ├── header.jsx                   # language switch before appearance; narrow More
│   ├── library.jsx                  # month heading, skeleton, links use the info role
│   ├── album.jsx                    # same sentences through the copy module
│   ├── account-dialog.jsx           # copy plus composition-safe Enter
│   ├── notice-strip.jsx             # known sentences mapped to the active language
│   └── preview.jsx                  # failure sentence through the copy module
└── components/ui/
    ├── button.jsx                   # 6px radius; no shadow; secondary keeps a hairline
    ├── input.jsx                    # 6px radius; no shadow
    └── dialog.jsx                   # may keep its shadow; language switch stays outside-dismiss

tests/
├── unit/
│   ├── copy.test.js
│   ├── preferences.test.js
│   └── token-contrast.test.js       # existing; must still pass
└── layout/
    ├── language-layout.test.js
    ├── header-layout.test.js
    ├── library-layout.test.js
    └── narrow-layout.test.js
```

**Structure Decision**: The existing local web application. This feature edits the screens and the tokens. It adds `copy.js` and `preferences.js` because those rules do not exist yet and each needs one implementation. It does not add a package or a server route.

## Complexity Tracking

None. No constitution gate is violated, and no new dependency is introduced.
