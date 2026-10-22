# Tasks: Client Web Design

**Input**: Design documents from `/specs/008-client-web-design/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. Spec FR-021 and Principle II require rendered checks that fail when the paint, the language, the focus ring, the hit size, or composition-safe Enter is broken.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Client and server live in `src/` at the repository root
- Tests live in `tests/unit/` and `tests/layout/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep the existing toolchain. This feature adds no package.

- [X] T001 Confirm `package.json` gains no dependency and `engines` stays Node.js 24.20 or newer

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One preference record and one sentence table. No screen work until these exist.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Write failing tests in `tests/unit/preferences.test.js` for `src/client/preferences.js`: a missing record is appearance `light` and language `zh`; appearance is only `light` or `dark`; language is only `zh` or `en`; writing one field leaves the other unchanged (Principle II, Testing)
- [X] T003 [P] Write failing tests in `tests/unit/copy.test.js` for `src/client/copy.js`: every English and Chinese row in `specs/008-client-web-design/spec.md` Interface copy; a month heading follows `October 2026` / `2026年10月` for every month; a sentence with no row is returned unchanged; Enter does not submit when `isComposing` is true or `keyCode` is 229
- [X] T004 [P] Implement `src/client/preferences.js` so T002 passes, using an injectable `getItem` / `setItem` storage and the first-visit values `light` and `zh`
- [X] T005 [P] Implement `src/client/copy.js` so T003 passes, with the English sentence as the lookup key and Chinese as the default text

**Checkpoint**: Preference and copy modules pass their unit tests. Screens still show the existing English strings.

---

## Phase 3: User Story 1 - See a quiet, consistent organizer (Priority: P1) 🎯 MVP

**Goal**: The library, an album, and an enlarged picture use a white or pure-black page, a hairline card, and a main action that is not blue.

**Independent Test**: Open the signed-in library, a date album, and an enlarged picture in the light appearance, then the dark appearance. The page, the card, and Add photos match `specs/008-client-web-design/contracts/visual-language.md`. A photograph keeps its own colors.

### Tests for User Story 1

- [X] T006 [P] [US1] Write failing tests in `tests/unit/token-values.test.js` that `src/client/tokens.css` keeps the role names in `src/client/token-roles.js`, the dark page is `oklch(0 0 0)`, the light page is white, the light primary is near-black with chroma 0, the dark primary is a light fill, and `--radius` is `0.75rem` (12 pixels)
- [X] T007 [P] [US1] Extend `tests/layout/library-layout.test.js` so a card has a 1-pixel border, a 12-pixel corner, and no drop shadow, and `#add-photos` matches `--primary` and does not match the blue `--info` role (Principle II, Testing; Principle IV, Interface)

### Implementation for User Story 1

- [X] T008 [P] [US1] Retune role values in `src/client/tokens.css` per `specs/008-client-web-design/research.md`: pure-black dark page, near-black light primary, light dark primary, gray `--ring`, neutral `--accent` hover, blue `--info` link pair that still clears 4.5 to 1, `--radius` `0.75rem`, and an alpha `oklch()` header token
- [X] T009 [P] [US1] In `src/client/components/ui/button.jsx`, remove the drop shadow, set a 6-pixel corner, and give the secondary variant a 1-pixel border. The main action stays `bg-primary`
- [X] T010 [P] [US1] In `src/client/components/ui/input.jsx`, set a 6-pixel corner and remove the drop shadow
- [X] T011 [P] [US1] Remove drop shadows from `src/client/components/ui/card.jsx`, `src/client/components/ui/dropdown-menu.jsx`, and `src/client/components/ui/popover.jsx`. Leave the soft shadow on `src/client/components/ui/dialog.jsx`
- [X] T012 [US1] In `src/client/styles.css`, make the header 56 pixels tall, sticky, and edged with a 1-pixel hairline using the header token; give `.album-card` and `.picture-card` the 12-pixel radius, the 1-pixel border, and no drop shadow; paint album links with `var(--info)` so the blue does not fill a button

**Checkpoint**: User Story 1 is testable on its own. Interface sentences are still the existing English strings.

---

## Phase 4: User Story 4 - Read Chinese first, then switch to English (Priority: P1)

**Goal**: A first visit is Chinese. The switch reads `English`, then `中文`, and the same page stays open. Album names and stored dates do not change.

**Independent Test**: Open the organizer with no saved language. The title is `照片日期相册`. Choose `English`. The title is `Photo Date Albums` and a stored album name is unchanged. Choose `中文` and the Chinese title returns.

### Tests for User Story 4

- [X] T013 [P] [US4] Write failing checks in `tests/layout/language-layout.test.js`: a first visit shows `照片日期相册` and a switch reading `English`; choosing it shows `Photo Date Albums` and a switch reading `中文`; a named album's stored name is unchanged; an open sign-in dialog stays open (Principle II, Testing; Principle IV, Interface)

### Implementation for User Story 4

- [X] T014 [US4] Update `tests/layout/harness.js` so `openOrganizer` saves language `en` unless the test asks for a first visit, keeping the English scenarios from specs 001 through 006
- [X] T015 [US4] Load `src/client/preferences.js` in `src/client/organizer.jsx`, set `document.documentElement.lang` to `zh` or `en`, and pass the language into the screens
- [X] T016 [US4] In `src/client/screens/header.jsx`, place `#language-switch` immediately before `#appearance-switch`. Wide and signed in the order is New album, Add photos, language, appearance, Sign out. Wide and signed out it is language, appearance, Sign in. The switch reads `English` while language is `zh` and `中文` while language is `en`, and uses the secondary treatment
- [X] T017 [P] [US4] In `src/client/components/ui/dialog.jsx`, `src/client/components/ui/popover.jsx`, and `src/client/components/ui/dropdown-menu.jsx`, keep a press on `#language-switch` from closing the open layer, the same way `#appearance-switch` is already excluded
- [X] T018 [US4] Read sentences from `src/client/copy.js` in `src/client/screens/header.jsx`, `src/client/screens/library.jsx`, `src/client/screens/album.jsx`, `src/client/screens/account-dialog.jsx`, `src/client/screens/notice-strip.jsx`, `src/client/screens/preview.jsx`, and the account message in `src/client/organizer.jsx`. Month headings use the copy module. Server sentences with no row stay as received
- [X] T019 [P] [US4] Add the language switch to `src/client/token-preview.js` and `src/client/token-preview.html` so it changes only the sample and does not rename the role identifiers in `src/client/token-roles.js`

**Checkpoint**: First visit is Chinese. Existing layout tests still select English through the harness.

---

## Phase 5: User Story 2 - Keep every current task (Priority: P1)

**Goal**: Sign-in, album creation, enlargement, and a cancelled deletion still finish as specs 005 and 006 require. A successful create, delete, or privacy change shows a confirmation in the active language.

**Independent Test**: With Chinese showing, complete sign-in, album creation, picture enlargement, and a cancelled deletion. Switch to English and read the same screens. Delete stays visually distinct from the main action.

### Tests for User Story 2

- [X] T020 [P] [US2] Write failing tests in `tests/unit/confirmation.test.js` for a confirmation helper: kinds are exactly album created, picture deleted, album now public, and album now private; a newer confirmation replaces the older one; a clock argument clears it at 4000 milliseconds
- [X] T021 [P] [US2] Extend `tests/layout/header-layout.test.js` so a created album shows `Album created.` when English is selected, and the confirmation does not cover `#add-photos` (Principle II, Testing)

### Implementation for User Story 2

- [X] T022 [US2] Add `src/client/confirmation.js` with the four kinds from Interface copy and a 4000-millisecond clear through an injectable clock
- [X] T023 [US2] Show that confirmation from `src/client/organizer.jsx` after a successful create, delete, or privacy change, and do not clear a pending delete when appearance or language changes
- [X] T024 [P] [US2] Place `.confirmation` in `src/client/styles.css` at the bottom-right on a wide window and the bottom-center on a narrow window, inside the page width, above the page edge

**Checkpoint**: The existing keyboard, album, and account flows still pass with English selected. The confirmation appears after a created album.

---

## Phase 6: User Story 3 - Read, focus, and finish on a narrow window (Priority: P2)

**Goal**: At 320 pixels every visible control is at least 40 by 40 pixels, the focus ring is 3 pixels, Enter during composition does not submit, and a loading library shows quiet blocks instead of an empty sentence.

**Independent Test**: At 320 pixels wide, open the library and the sign-in dialog. Nothing scrolls sideways. Enter while a character is composing does not submit Name.

### Tests for User Story 3

- [X] T025 [P] [US3] Extend `tests/layout/narrow-layout.test.js`: at 320 pixels every visible control is at least 40 by 40 pixels; the enlarged close control, the notice close control, the dialog close control, and the main header action are at least 44 by 44 pixels; nothing scrolls sideways; signed out, More lists the language switch and the appearance switch and Sign in stays visible (Principle II, Testing; Principle IV, Interface)
- [X] T026 [P] [US3] Extend `tests/layout/keyboard-layout.test.js` so a focused control's outline is 3 pixels thick
- [X] T027 [P] [US3] Extend `tests/layout/account-layout.test.js` so Enter on Name while `isComposing` is true, or `keyCode` is 229, does not submit the sign-in form
- [X] T028 [P] [US3] Extend `tests/layout/library-layout.test.js` so a delayed library response shows quiet card-shaped blocks and does not show `There are no public photos.` or `没有公开的照片。` until the response settles

### Implementation for User Story 3

- [X] T029 [US3] In `src/client/styles.css`, set the focus outline to 3 pixels, raise the narrow control floor from 24 pixels to 40 pixels, keep the 44-pixel close and main-action targets, add the skeleton block, and under reduced motion remove skeleton and confirmation animation without setting `transform: none` on a dialog
- [X] T030 [US3] In `src/client/screens/account-dialog.jsx` and the New album form in `src/client/screens/header.jsx`, ignore Enter while `isComposing` is true or `keyCode` is 229
- [X] T031 [US3] In `src/client/organizer.jsx`, keep a loading flag until the first library response settles. In `src/client/screens/library.jsx` and `src/client/screens/album.jsx`, show quiet blocks in the card shape during that flag and hide the empty sentences

**Checkpoint**: Narrow layout, focus, composition, and the first-load blocks pass without breaking the language switch.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Prove the whole feature against the quickstart.

- [X] T032 [P] Run the checks in `specs/008-client-web-design/quickstart.md`, including `npm test -- --test-concurrency=1` and `tests/unit/token-contrast.test.js`
- [X] T033 Run Biome on the touched files under `src/client/` and `tests/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks every user story
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2, US3, or US4
- **User Story 4 (Phase 4)**: Depends on Foundational. No dependency on US1's paint, but it should follow US1 so the suite stays English until the harness opt-in in T014
- **User Story 2 (Phase 5)**: Depends on Foundational and on US4, because the confirmation uses the active language's sentences
- **User Story 3 (Phase 6)**: Depends on Foundational and on US4, because the narrow More menu contains the language switch
- **Polish (Phase 7)**: Depends on the stories being present

### User Story Dependencies

- **User Story 1 (P1)**: First increment. Does not change sentences
- **User Story 4 (P1)**: Before US2 and US3. Wires the copy module into the screens
- **User Story 2 (P1)**: After US4. Proves the old tasks and adds the confirmation
- **User Story 3 (P2)**: After US4. Raises the hit size, the focus ring, composition, and loading

### Within Each User Story

- Tests are written and fail before the implementation tasks in that story
- `src/client/token-roles.js` is not given new role names
- `src/server/` is not edited. API errors stay English

### Parallel Opportunities

- T002 and T003 together; then T004 and T005 together
- T006 and T007 together; then T008, T009, T010, and T011 together
- T017 and T019 together after T015
- T020 and T021 together; T024 beside T022
- T025, T026, T027, and T028 together

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "tests/unit/token-values.test.js"
Task: "tests/layout/library-layout.test.js card paint"

# Then the independent style files:
Task: "src/client/tokens.css"
Task: "src/client/components/ui/button.jsx"
Task: "src/client/components/ui/input.jsx"
Task: "src/client/components/ui/card.jsx and the menu shells"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (User Story 1)
3. Stop and check the library, an album, and an enlarged picture in both appearances

### Incremental Delivery

1. Setup and foundation
2. User Story 1: the new paint, English sentences unchanged
3. User Story 4: Chinese by default, English still selectable
4. User Story 2: existing tasks plus the confirmation
5. User Story 3: narrow hit size, 3-pixel ring, composition, loading blocks
6. Polish: `specs/008-client-web-design/quickstart.md`

### Parallel Team Strategy

1. Finish Phase 1 and Phase 2 together
2. One person takes User Story 1 while another prepares the User Story 4 layout test
3. User Story 2 and User Story 3 start only after User Story 4 has wired the sentences

---

## Notes

- [P] tasks use different files and do not wait on each other
- Tests in a story are written to fail before that story's implementation
- The first visit values are exactly `light` and `zh`
- Card corners are 12 pixels. Button and field corners are 6 pixels. The header is 56 pixels. The focus ring is 3 pixels
- Narrow visible controls are at least 40 by 40 pixels. The enlarged close control, the notice close control, the dialog close control, and the main header action stay at least 44 by 44 pixels
- A confirmation clears at 4000 milliseconds
