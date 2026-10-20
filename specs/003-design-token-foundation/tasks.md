---
description: "Task list for Design Token Foundation implementation"
---

# Tasks: Design Token Foundation

**Input**: Design documents from `/specs/003-design-token-foundation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. The specification requires every acceptance scenario to be demonstrated before release (Principle II, Testing), and the constitution makes that proof automated. Write each story's tests first and confirm they fail before implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Local web app from `plan.md`: `src/client/`, `tests/unit/`
- Existing photo organizer, not part of this feature: `src/client/index.html`, `src/client/styles.css`, `src/client/main.js`
- Generated build: `dist/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep the existing local app and add no new toolchain

- [X] T001 Confirm `package.json` keeps `"type": "module"`, `engines.node` `>=24.20.0`, scripts `test` = `node --test`, `dev` = `node scripts/dev.js`, and `build` = `vite build`, and adds no dependency (Quality Constraints)
- [X] T002 [P] Confirm `vite.config.js` still uses root `src/client` so `/token-preview.html` is served from that root, with no new plugin, per `specs/003-design-token-foundation/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The one role catalog that the sample page and the contrast test both read

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create `src/client/token-roles.js` exporting the closed catalog. Quote these rules from `specs/003-design-token-foundation/data-model.md`: name "One of: `background`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `info`."; text name "`foreground` for `background`. For every other name, the text name is that name plus `-foreground`."; supporting names `border` "oklch() on `:root` and on `.dark`.", `input` "oklch() on `:root` and on `.dark`.", `ring` "oklch() on `:root` and on `.dark`. Focus emphasis uses this value.", `radius` "One length, shared by both appearances. The placeholder is `0.5rem`." Do not put color values in this file (Principle I, Code Quality)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Review the color set (Priority: P1) 🎯 MVP

**Goal**: A reviewer opens one sample page, sees every semantic role with paired text, and switches that same page between light and dark.

**Independent Test**: Open `/token-preview.html`, read every role name in the light appearance, switch to dark, and confirm the same roles remain on that page.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T004 [P] [US1] Contrast test in `tests/unit/token-contrast.test.js` that reads `src/client/tokens.css` and `src/client/token-roles.js` and asserts every paired role meets contrast of at least 4.5 to 1 in both appearances. Quote these rules from `specs/003-design-token-foundation/data-model.md`: "Text on its paired background has contrast of at least 4.5 to 1 in the light appearance and in the dark appearance."; "The catalog and `tokens.css` contain the same role names. A missing name, an extra color property, or a value that is not `oklch()` is incomplete."; "`border`, `input`, `ring`, and `radius` are not pairs and are not measured." The conversion function lives in this test file (Principle II, Testing)
- [X] T005 [P] [US1] Unit test in `tests/unit/token-preview.test.js` that the sample markup lists every catalog role and its text name, uses custom properties rather than a color literal, records the appearance as `light` or `dark`, and includes the switch control, per `specs/003-design-token-foundation/contracts/token-preview.md` (Principle II, Testing)

### Implementation for User Story 1

- [X] T006 [US1] Create `src/client/tokens.css` with `:root` light values and `.dark` dark values. Quote these rules from `specs/003-design-token-foundation/data-model.md`: light value "An `oklch()` color on `:root`."; dark value "An `oklch()` color on `.dark`." Use these placeholder values and no others. Light: `--background: oklch(1 0 0)`, `--foreground: oklch(0.145 0 0)`, `--card: oklch(1 0 0)`, `--card-foreground: oklch(0.145 0 0)`, `--popover: oklch(1 0 0)`, `--popover-foreground: oklch(0.145 0 0)`, `--primary: oklch(0.5 0.19 262)`, `--primary-foreground: oklch(0.985 0 0)`, `--secondary: oklch(0.96 0.005 262)`, `--secondary-foreground: oklch(0.25 0.02 262)`, `--muted: oklch(0.96 0.005 262)`, `--muted-foreground: oklch(0.48 0.02 262)`, `--accent: oklch(0.94 0.02 262)`, `--accent-foreground: oklch(0.25 0.05 262)`, `--destructive: oklch(0.5 0.2 27)`, `--destructive-foreground: oklch(0.985 0 0)`, `--success: oklch(0.5 0.11 150)`, `--success-foreground: oklch(0.985 0 0)`, `--warning: oklch(0.78 0.15 75)`, `--warning-foreground: oklch(0.25 0.05 75)`, `--info: oklch(0.5 0.09 235)`, `--info-foreground: oklch(0.985 0 0)`, `--border: oklch(0.9 0.005 262)`, `--input: oklch(0.9 0.005 262)`, `--ring: oklch(0.5 0.19 262)`, `--radius: 0.5rem`. Dark: `--background: oklch(0.145 0 0)`, `--foreground: oklch(0.985 0 0)`, `--card: oklch(0.205 0 0)`, `--card-foreground: oklch(0.985 0 0)`, `--popover: oklch(0.205 0 0)`, `--popover-foreground: oklch(0.985 0 0)`, `--primary: oklch(0.72 0.12 262)`, `--primary-foreground: oklch(0.16 0.04 262)`, `--secondary: oklch(0.27 0.01 262)`, `--secondary-foreground: oklch(0.985 0 0)`, `--muted: oklch(0.27 0.01 262)`, `--muted-foreground: oklch(0.72 0.02 262)`, `--accent: oklch(0.3 0.04 262)`, `--accent-foreground: oklch(0.985 0 0)`, `--destructive: oklch(0.7 0.17 25)`, `--destructive-foreground: oklch(0.16 0.04 25)`, `--success: oklch(0.72 0.15 150)`, `--success-foreground: oklch(0.16 0.04 150)`, `--warning: oklch(0.8 0.15 80)`, `--warning-foreground: oklch(0.2 0.03 80)`, `--info: oklch(0.74 0.12 235)`, `--info-foreground: oklch(0.16 0.02 235)`, `--border: oklch(0.32 0.01 262)`, `--input: oklch(0.32 0.01 262)`, `--ring: oklch(0.72 0.12 262)`. Do not edit `src/client/styles.css` (Principle I, Code Quality)
- [X] T007 [P] [US1] Create `src/client/token-preview.css` so each role surface and its paired text use `var(--...)` only, the shared corner uses `var(--radius)`, and the file contains no color literal, per `specs/003-design-token-foundation/contracts/token-preview.md`
- [X] T008 [P] [US1] Create `src/client/token-preview.js` that renders one row per catalog entry from `src/client/token-roles.js` and toggles the class `dark` on the page root. Quote these rules from `specs/003-design-token-foundation/data-model.md`: light "The root element does not have the class `dark`. This is the initial appearance."; dark "The root element has the class `dark`."; "Switching adds or removes that class. The document address does not change."
- [X] T009 [US1] Create `src/client/token-preview.html` loading only `tokens.css`, `token-preview.css`, and `token-preview.js`. Do not load `styles.css` or `main.js`. The switch control label states the appearance that is currently showing, per `specs/003-design-token-foundation/contracts/token-preview.md`

**Checkpoint**: User Story 1 is a reviewable page without the color-check functions

---

## Phase 4: User Story 2 - Reject a one-off color in a style sheet (Priority: P1)

**Goal**: A style sheet that contains a raw numeric color or a named color fails the style-sheet check, and the token files pass that check.

**Independent Test**: Feed the checker one hexadecimal fixture and one named-color fixture and confirm both are findings. Feed `tokens.css` and `token-preview.css` and confirm an empty finding list.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T010 [US2] Unit test in `tests/unit/color-check.test.js` for the style-sheet check in `src/client/color-check.js`. A `tokens` fixture with `#ff0000` and a fixture with a named color such as `red` each return a finding `{ "kind": "hex" | "named" | "function", "text": "..." }`. An `oklch()` value is allowed only in the `tokens` profile. A `screen` fixture that contains `oklch()` is a `function` finding. `src/client/tokens.css` passes the `tokens` profile and `src/client/token-preview.css` passes the `screen` profile. Quote this rule from `specs/003-design-token-foundation/data-model.md`: "`oklch()` outside `tokens.css` is a raw numeric color." Do not read `src/client/styles.css` (Principle II, Testing)

### Implementation for User Story 2

- [X] T011 [US2] Implement the style-sheet check in `src/client/color-check.js` with profiles `tokens` and `screen`, returning one finding per offending span and not rewriting the file, per `specs/003-design-token-foundation/contracts/color-check.md`. A passing `tokens` result must not imply the `screen` profile passed (Principle I, Code Quality)

**Checkpoint**: User Stories 1 and 2 both work. The style-sheet check does not look at the photo organizer

---

## Phase 5: User Story 3 - Find a color painted directly on a screen (Priority: P2)

**Goal**: A raw color written directly on the sample page is found by a different function from the style-sheet check.

**Independent Test**: Feed the screen checker a fixture that sets `#ff0000` directly on an element and confirm a finding. Confirm that function is not the style-sheet check.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T012 [US3] Unit test in `tests/unit/screen-color.test.js` that a fixture setting a raw color directly on an element is a finding from `src/client/screen-color.js`, that catalog custom-property names are not findings, and that the test does not call the style-sheet check. Also assert `src/client/token-preview.html` and `src/client/token-preview.js` return an empty finding list, per `specs/003-design-token-foundation/contracts/color-check.md` (Principle II, Testing)

### Implementation for User Story 3

- [X] T013 [US3] Implement the screen check in `src/client/screen-color.js` as a different function from `src/client/color-check.js`. Report `hex`, `named`, or `function` with the offending `text`. A passing style-sheet result is not an input and does not clear a screen finding, per `specs/003-design-token-foundation/contracts/color-check.md` (Principle I, Code Quality)

**Checkpoint**: All three user stories work on their own

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove the stories still pass together and match the quickstart

- [X] T014 [P] Run `npx biome check src tests` and fix violations in the files this feature changed (Principle I, Code Quality)
- [X] T015 Run `npm test` from the repository root and keep every existing assertion. Do not delete or weaken a failing test (Principle II, Testing)
- [X] T016 Walk checks 1 through 6 in `specs/003-design-token-foundation/quickstart.md` after `npm test` is green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on the user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Fixture tests do not need the sample page. The assertions that read `tokens.css` and `token-preview.css` wait until those files exist
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Fixture tests do not need User Story 2. The assertions that read the sample page wait until User Story 1 has created it

Do not implement two stories at the same time when they edit the same file. `src/client/color-check.js` belongs to User Story 2. `src/client/screen-color.js` belongs to User Story 3. The safe order is Phase 3, then 4, then 5.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Catalog before values
- Values before the sample page
- Story complete before moving to the next priority

### Parallel Opportunities

- T001 and T002 can run in parallel
- T004 and T005 can run in parallel
- T007 and T008 can run in parallel after T006
- T012 can be written beside T010 because they use different test files
- T014 runs after the stories, before or beside T015

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Contrast test in tests/unit/token-contrast.test.js"
Task: "Markup test in tests/unit/token-preview.test.js"

# After tokens.css exists:
Task: "Layout in src/client/token-preview.css"
Task: "Render and toggle in src/client/token-preview.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open the sample page, switch appearance, and confirm every role remains
5. Demo that page before the color-check functions

### Incremental Delivery

1. Setup + Foundational → the catalog exists
2. User Story 1 → sample page (MVP)
3. User Story 2 → style-sheet check
4. User Story 3 → screen check
5. Polish → Biome, the full suite, and the quickstart

### Parallel Team Strategy

With multiple developers:

1. Complete Setup and Foundational together
2. After that, User Story 2's `src/client/color-check.js` and User Story 3's `src/client/screen-color.js` are the safe split. Keep `src/client/tokens.css` and `src/client/token-preview.js` with one person at a time

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
