---
description: "Task list for Client Token Appearance implementation"
---

# Tasks: Client Token Appearance

**Input**: Design documents from `/specs/004-client-token-appearance/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. The specification requires every acceptance scenario to be demonstrated before release (Principle II, Testing), and the constitution makes that proof automated. Write each story's tests first and confirm they fail before implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Local web app from `plan.md`: `src/client/`, `tests/unit/`
- Unchanged value source: `src/client/tokens.css`, `src/client/token-roles.js`
- Unchanged server: `src/server/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep the current app and the existing color source

- [X] T001 Confirm `package.json` keeps `"type": "module"`, `engines.node` `>=24.20.0`, and `test` = `node --test`, and adds no dependency (Quality Constraints)
- [X] T002 [P] Confirm this feature does not edit `src/server/`, `src/client/tokens.css`, `src/client/token-roles.js`, `src/client/token-preview.html`, or `src/client/token-preview.css` per `specs/004-client-token-appearance/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One light/dark switch for the sample page and the photo library

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create `src/client/appearance.js` exporting `nextAppearance` and `applyAppearance`. Quote these rules from `specs/004-client-token-appearance/data-model.md`: appearance "`light` or `dark`."; where it lives "The document element. `light` has no class `dark`. `dark` has the class `dark`."; first value "`light` when the page opens."; persistence "Not stored. A reload starts at `light`. Sign-out does not clear it." The apply function records the appearance on the document element and does not return library or album markup, per `specs/004-client-token-appearance/contracts/organizer-appearance.md`. Do not write browser storage or an account field (Principle I, Code Quality)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - See the shared colors on the photo library (Priority: P1) 🎯 MVP

**Goal**: The library, album, enlarged picture, account forms, empty states, notices, and actions use the existing catalog pairs in the light appearance.

**Independent Test**: Open `/` in the light appearance and read the library, an album, and an enlarged picture. Surfaces use catalog variables only, and the existing account and album actions still pass their tests.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T004 [US1] Pairing test in `tests/unit/organizer-colors.test.js` that reads `src/client/styles.css` and fails while hexadecimal colors remain. Assert there is no `oklch()`, `rgb()`, or `hsl()`. Quote this rule from `specs/004-client-token-appearance/data-model.md`: "`oklch()` outside `src/client/tokens.css` is a raw numeric color, including inside `src/client/styles.css`." Assert these pairs from `specs/004-client-token-appearance/research.md`: page `--background` with `--foreground`; album tile, photo figure, account form, and create-album form `--card` with `--card-foreground`; enlarged picture `--popover` with `--popover-foreground`; Add photos, create account, sign in, and create album `--primary` with `--primary-foreground`; Sign out, cancel, back, view, place, and publish `--secondary` with `--secondary-foreground`; empty states and the count line `--muted` with `--muted-foreground`; `.skip` `--info` with `--info-foreground`; `.error` and confirm delete `--destructive` with `--destructive-foreground`. Quote this rule from `specs/004-client-token-appearance/data-model.md`: "A text color from one pair on a surface from another pair is incomplete." Assert `img` has no color filter, the box behind a picture uses `--muted`, corners use `var(--radius)`, and `--border`, `--input`, and `--ring` are present and not measured for contrast (Principle II, Testing)

### Implementation for User Story 1

- [X] T005 [P] [US1] Replace color declarations in `src/client/styles.css` with the pairs asserted in `tests/unit/organizer-colors.test.js`. Replace corner lengths `0.75rem` and `999px` with `var(--radius)`. Keep layout, font, and `object-fit`. Do not copy `oklch()` values into this file (Principle I, Code Quality)
- [X] T006 [P] [US1] Link `tokens.css` before `styles.css` in `src/client/index.html` so the light values from `:root` paint the first view
- [X] T007 [P] [US1] In `src/client/album-view.js`, add a class on the confirm-delete button only, so `src/client/styles.css` can use the destructive pair. The button text stays `Confirm delete`. Do not change delete behavior or other data attributes (Principle III, Maintainability)

**Checkpoint**: User Story 1 shows the shared colors. The appearance switch is not required yet

---

## Phase 4: User Story 2 - Switch the library between light and dark (Priority: P1)

**Goal**: One header control switches the whole library between light and dark without replacing the open screen.

**Independent Test**: Open an album, switch to dark, and confirm the address and the album stay. Switch back to light. Reload and confirm the page starts light.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T008 [US2] Unit test in `tests/unit/appearance.test.js` for `src/client/appearance.js`. Quote these rules from `specs/004-client-token-appearance/data-model.md`: "`light` has no class `dark`."; "`dark` has the class `dark`."; "A reload starts at `light`." Assert `nextAppearance("light")` is `dark` and `nextAppearance("dark")` is `light`. Assert `applyAppearance` sets and removes the class and records `data-appearance`, and that its return value is not library or album markup, per `specs/004-client-token-appearance/contracts/organizer-appearance.md` (Principle II, Testing)

### Implementation for User Story 2

- [X] T009 [US2] Add one header button in `src/client/index.html`, outside `#app`, whose label states the appearance currently showing. The label starts as `light`, per `specs/004-client-token-appearance/contracts/organizer-appearance.md`
- [X] T010 [US2] In `src/client/main.js`, handle that button with `src/client/appearance.js`. The handler must not call `showLibrary`, `showAlbum`, or `dismissPreview`. Sign-out must not clear the class. Do not write the choice to browser storage or the account (Principle I, Code Quality)
- [X] T011 [P] [US2] Change `src/client/token-preview.js` so it calls `nextAppearance` and the class toggle from `src/client/appearance.js` instead of a private copy. Re-export `nextAppearance` so `tests/unit/token-preview.test.js` keeps its current assertions (Principle I, Code Quality)

**Checkpoint**: User Stories 1 and 2 both work. A reload returns to light

---

## Phase 5: User Story 3 - Reject a one-off color on a library screen (Priority: P2)

**Goal**: The existing color checks read the organizer files themselves. A passing sample-page result is not that proof.

**Independent Test**: Feed the style-sheet check one hexadecimal fixture and one named-color fixture and confirm findings. Confirm `styles.css` is checked on its own. Confirm each organizer source file is checked on its own.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T012 [P] [US3] Extend `tests/unit/color-check.test.js` so `src/client/styles.css` is checked with the `screen` profile in its own assertion, separate from `src/client/token-preview.css`. Quote this rule from `specs/004-client-token-appearance/contracts/organizer-color-check.md`: "A passing result for the sample page is not an input to the organizer checks and does not clear an organizer finding." Keep the existing fixture findings for `#ff0000` and `red`. Do not change `src/client/color-check.js` (Principle II, Testing)
- [X] T013 [P] [US3] Extend `tests/unit/screen-color.test.js` so each of `src/client/index.html`, `src/client/main.js`, `src/client/library-view.js`, `src/client/album-view.js`, `src/client/preview-view.js`, and `src/client/session-view.js` is its own call. Keep the sample-page calls separate. Do not pass `src/client/color-check.js` or `src/client/screen-color.js` as inputs, per `specs/004-client-token-appearance/contracts/organizer-color-check.md`. Do not change `src/client/screen-color.js` (Principle II, Testing)

**Checkpoint**: All three user stories work. The sample page is still a separate check

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove the stories still pass together and match the quickstart

- [X] T014 [P] Run `npx biome check src tests` and fix violations in the files this feature changed (Principle I, Code Quality)
- [X] T015 Run `npm test` from the repository root and keep every existing assertion. Do not delete or weaken a failing test (Principle II, Testing)
- [X] T016 Walk checks 1 through 8 in `specs/004-client-token-appearance/quickstart.md` after `npm test` is green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on the user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - The header button is added to `src/client/index.html` after User Story 1 links the stylesheets in that file
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Fixture findings do not need the restyle. The assertions that read `src/client/styles.css` and the organizer source wait until those files no longer contain a raw color

Do not implement two stories at the same time when they edit the same file. `src/client/index.html` is User Story 1 for the stylesheet link and User Story 2 for the switch. The safe order is Phase 3, then 4, then 5.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Catalog values stay in `src/client/tokens.css`
- Story complete before moving to the next priority

### Parallel Opportunities

- T001 and T002 can run in parallel
- T005, T006, and T007 can run in parallel after T004
- T011 can run in parallel with T009 and T010 after T008
- T012 and T013 can run in parallel
- T014 runs after the stories, before or beside T015

---

## Parallel Example: User Story 1

```bash
# Test first:
Task: "Pairing test in tests/unit/organizer-colors.test.js"

# After that test fails on the current stylesheet:
Task: "Restyle src/client/styles.css"
Task: "Link tokens.css in src/client/index.html"
Task: "Class on confirm delete in src/client/album-view.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open the library in the light appearance and confirm the shared colors
5. Demo that library before the switch

### Incremental Delivery

1. Setup + Foundational → the shared switch exists
2. User Story 1 → light library uses the catalog (MVP)
3. User Story 2 → the same screen switches to dark and back
4. User Story 3 → organizer files are their own color-check inputs
5. Polish → Biome, the full suite, and the quickstart

### Parallel Team Strategy

With multiple developers:

1. Complete Setup and Foundational together
2. After that, `src/client/styles.css` and `src/client/album-view.js` can be split. Keep `src/client/index.html` with one person until the stylesheet link and the header button are both done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
