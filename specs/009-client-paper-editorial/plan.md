# Implementation Plan: Client Paper Editorial

**Branch**: `009-client-paper-editorial` | **Date**: 2026-10-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-client-paper-editorial/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

The organizer keeps its screens, its tasks, and its Chinese-first language switch. The shared color roles are retuned to the warm paper language in both appearances: warm paper in the light appearance, warm near-black in the dark appearance, and one terracotta accent for the mark, the main action, and links. Display titles use a device serif, micro-labels use a device monospace, and cards gain a 5-pixel corner, a warm shadow, and a small hover lift. No package is added.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer. Client screens are JSX bundled by Vite 7. No TypeScript.

**Primary Dependencies**: Already present: `react`, `react-dom`, `tailwindcss`, the shadcn `button`, `input`, `card`, `dialog`, `dropdown-menu`, and `popover`, and `playwright`. None are added. See [research.md](research.md).

**Storage**: The existing preference record. Appearance stays `light` or `dark`, language stays `zh` or `en`, and the two fields stay independent. No new database column and no new server field. The API keeps its English error strings.

**Testing**: `node:test` for contrast and the token values. Playwright Chromium in `tests/layout/` for the paper page, the dark page, the mark, the flourish, the 5-pixel corner, the hover lift, and the header order. `npm test` runs them with the rest of the suite.

**Target Platform**: Local web application in a desktop or phone-width browser. Narrow means under 640 pixels wide. The Vite server still serves the organizer at `/` and proxies `/api/` and `/images/`.

**Project Type**: Local web application. The client tokens, style sheet, and screens change. `src/server/` does not change.

**Performance Goals**: Switching language or appearance does not refetch the library. The first library response is the only time the card-shaped blocks replace the grid.

**Constraints**: Specs 001 through 006 keep their behavior except the paint. Spec 008 keeps the sentences, the language switch, the appearance memory, the confirmation, the loading blocks, and the narrow hit sizes. Role names in `src/client/token-roles.js` stay. Hexadecimal colors, `rgb()`, and named colors stay out of screen style sheets. A semantic role value stays `oklch(L C H)` without alpha so the contrast test can parse it. `DATA_DIR` and `PORT` stay as they are.

**Scale/Scope**: Every organizer screen in the spec, plus the color sample. One mark. One empty-page flourish. No new sentence.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Visibility stays in `src/server/library.js`. Sentences stay in `src/client/copy.js`. Appearance and language memory stay in `src/client/preferences.js`. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers JSX and CSS. |
| Observable tests, including error paths | II. Testing | PASS | FR-021 names rendered checks. Contrast still gates every semantic pair. |
| Simplest design that meets the spec | III. Maintainability | PASS | No new package and no new role name. The existing tokens change value. The mark and the flourish are one screen element each. |
| Every screen states structure, placement, empty state, and narrow layout | IV. Interface | PASS | The spec's Screens section does this. This plan cites it and [contracts/visual-language.md](contracts/visual-language.md). |
| Dependencies named and justified | Quality Constraints | PASS | No dependency is added. |
| Configuration injectable; no committed secrets | Quality Constraints | PASS | Preference storage stays injectable. No secret is stored. |
| Failures returned to the caller | Quality Constraints | PASS | A known failure uses the active language's sentence. An unknown failure is shown as received. |

### Post-design gate

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/visual-language.md](contracts/visual-language.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | The terracotta values live only in `tokens.css`. The mark's two initials live in one place beside the product name. |
| II. Testing | PASS | The quickstart names the unit and layout files that fail when the paper page, the dark page, the corner, the lift, or the flourish is wrong. |
| III. Maintainability | PASS | Changes stay in the existing screens, `tokens.css`, `styles.css`, and the button, input, card, and dialog components. |
| IV. Interface | PASS | The contract places the mark, the flourish, both appearances, and the header order. Tasks that build a screen must cite this principle and that contract. |
| Quality Constraints | PASS | No new package. Color values stay `oklch()` in `tokens.css`. The contrast test still gates every semantic pair. |

## Project Structure

### Documentation (this feature)

```text
specs/009-client-paper-editorial/
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
├── tokens.css                       # paper and warm-dark role values; 5px radius; shadow
├── token-roles.js                   # same role names; supporting tokens gain shadow and primary-hover
├── styles.css                       # serif, mono, 56px header, warm shadow, card lift, flourish
├── screens/
│   ├── header.jsx                   # mark beside the title; both switches stay
│   ├── library.jsx                  # flourish on the empty library
│   └── album.jsx                    # flourish on the empty named album
└── components/ui/
    ├── button.jsx                   # 5px corner; terracotta hover; no cool shadow
    ├── input.jsx                    # 5px corner
    ├── card.jsx                     # no cool shadow
    └── dialog.jsx                   # warm shadow token

tests/
├── unit/
│   ├── token-contrast.test.js       # existing; radius expectation becomes 5px
│   └── token-values.test.js         # paper and warm-dark values
└── layout/
    ├── visual-language.test.js      # corner, shadow, terracotta action, serif, lift
    └── library-layout.test.js       # empty flourish; dark appearance stays paper
```

**Structure Decision**: The existing local web application. This feature edits the tokens and the paint of the screens that already exist. It does not add a package, a preference field, a sentence, or a server route.

## Complexity Tracking

None. No constitution gate is violated, and no new dependency is introduced.
