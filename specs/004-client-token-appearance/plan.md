# Implementation Plan: Client Token Appearance

**Branch**: `004-client-token-appearance` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-client-token-appearance/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

The photo library, album, enlarged picture, account forms, empty states, notices, and actions use the semantic colors already stored in `src/client/tokens.css`. The light appearance is first. A control on the library page adds or removes the class `dark` on the document element and does not change the open album, the enlarged picture, a pending delete, or the signed-in person. Text pairs stay the pairs already measured at 4.5 to 1. Photographs are not recolored.

`src/client/styles.css` stops using hexadecimal colors and references `var(--...)` only. The existing style-sheet check and the separate screen check gain the organizer files as inputs. A passing sample-page result is a different assertion. No new dependency is added, and the library server is unchanged.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer (vanilla browser JavaScript bundled by Vite; no TypeScript and no UI framework)

**Primary Dependencies**: None added. Vite 7 and Biome stay as they are. Tests use `node:test`. The color scanners in `src/client/color-check.js` and `src/client/screen-color.js` stay the checkers. Contrast math stays in `tests/unit/token-contrast.test.js`.

**Storage**: N/A. The appearance is a class on the document element for the current visit. It is not written to `data/`, to the account, or to browser storage.

**Testing**: `node:test`. Existing library, album, preview, and session tests stay and must not be weakened. New tests cover the appearance switch and the organizer files as color-check inputs. The sample-page assertions stay separate.

**Target Platform**: Local desktop. The existing Vite dev server serves the photo library at `/` and the sample page at `/token-preview.html`.

**Project Type**: Local web application. This feature restyles the existing client. It does not change `src/server/`.

**Performance Goals**: Switching appearance is a class change, with no request and no re-render of the open screen. The first paint uses the light values already in `tokens.css`.

**Constraints**: Do not copy `oklch()` values into `styles.css`. Do not add a second palette. Borders, input outlines, and focus emphasis use `--border`, `--input`, and `--ring` and are not held to 4.5 to 1. Corners use `--radius`. Photographs keep `object-fit` and receive no color filter. `DATA_DIR` and `PORT` stay as they are.

**Scale/Scope**: The existing organizer screens only. The sample page remains a review surface. No new album, picture, account, or privacy behavior.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Token values stay in `tokens.css`. The role list stays in `token-roles.js`. The light/dark switch is one helper used by the sample page and the organizer. The two color checks stay different functions. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers the client and the tests. |
| Observable tests, including storage boundaries | II. Testing | PASS | Appearance is asserted from markup and the document class. Color checks read the organizer source. Existing task tests stay. Nothing is stored. |
| Simplest design that meets the spec | III. Maintainability | PASS | Restyle `styles.css` and add one control. The server, the view behavior, and the token values stay. |
| Dependencies named and justified | Quality Constraints | PASS | No dependency is added. The scanners from the token foundation meet the check. |
| Configuration injectable; no committed secrets or library data | Quality Constraints | PASS | The switch is in-memory. Tests do not need `data/`. |
| Failures returned to the caller | Quality Constraints | PASS | A rejected color still reports its kind and text. Existing error sentences stay. |

No gate fails. Phase 0 may proceed.

### Post-design re-check

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/organizer-appearance.md](contracts/organizer-appearance.md), [contracts/organizer-color-check.md](contracts/organizer-color-check.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | `appearance.js` is the only switch. `styles.css` does not restate token values. Delete confirmation is a class on the existing button, not a second delete rule. |
| II. Testing | PASS | Quickstart steps map to the spec scenarios. Organizer files are separate inputs from the sample page. Existing tests remain the proof of album and account behavior. |
| III. Maintainability | PASS | Hash routing, session refresh, and view modules keep their jobs. A later brand change still edits `tokens.css` only. |
| Quality Constraints | PASS | No Stylelint, Tailwind, React, or TypeScript. The checker is not rewritten. |

All gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-client-token-appearance/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
│   ├── organizer-appearance.md
│   └── organizer-color-check.md
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
src/client/
├── index.html            # loads tokens.css, then styles.css; hosts the switch
├── styles.css            # organizer layout; colors are var(--...) only
├── appearance.js         # the one light/dark switch
├── main.js               # wires the switch without repainting the open screen
├── album-view.js         # class on the confirm-delete button only
├── tokens.css            # unchanged value source
├── token-roles.js        # unchanged catalog
├── token-preview.html    # unchanged sample page
├── token-preview.css     # unchanged sample layout
├── token-preview.js      # calls appearance.js instead of a private switch
├── color-check.js        # unchanged function
└── screen-color.js       # unchanged function
src/server/               # unchanged
tests/unit/
├── appearance.test.js    # switch leaves the open screen alone
├── color-check.test.js   # styles.css is its own input
├── screen-color.test.js  # organizer source is its own input
└── token-contrast.test.js # unchanged pair proof
```

**Structure Decision**: The photo library stays the Vite page at `/`. `index.html` links `tokens.css` before `styles.css`. `styles.css` replaces its hexadecimal colors with catalog variables and uses `--radius` for corners. `appearance.js` toggles the class `dark` on the document element. `main.js` listens to the header control and does not call the library or album render when the class changes. `token-preview.js` uses the same helper so the sample page and the library cannot drift. The scanners are not rewritten. Their tests add the organizer files as separate inputs. `src/server/` is not part of this change.

## Complexity Tracking

None. The Constitution Check passes with no exceptions.
