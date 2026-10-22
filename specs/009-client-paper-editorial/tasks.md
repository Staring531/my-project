# Tasks: Client Paper Editorial

**Input**: Design documents from `/specs/009-client-paper-editorial/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. Spec FR-021 and Principle II require rendered checks that fail when the paper page, the dark page, the corner, the lift, the flourish, or the header order is broken.

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

**Purpose**: Keep the sentence table and the preference record that every screen already uses. No screen paint until these stay intact.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Keep `src/client/preferences.js` the only appearance and language memory, and keep `tests/unit/preferences.test.js` passing: a missing record is appearance `light` and language `zh`; appearance is only `light` or `dark`; language is only `zh` or `en`; writing one field leaves the other stored value in place (Principle I, Code Quality; Principle II, Testing)
- [X] T003 [P] Keep `src/client/copy.js` the only sentence table, add no sentence, and keep `tests/unit/copy.test.js` passing: every Interface copy row in `specs/009-client-paper-editorial/spec.md` still maps, and a month heading follows `October 2026` / `2026年10月` (Principle I, Code Quality)

**Checkpoint**: Preferences and copy still pass. No token or screen has been retuned yet.

---

## Phase 3: User Story 1 - See a warm paper organizer (Priority: P1) 🎯 MVP

**Goal**: The library, an album, and an enlarged picture use warm paper in the light appearance and warm near-black in the dark appearance, with a terracotta main action, a serif title, and a mark beside the product name.

**Independent Test**: Open the signed-in library, a date album, and an enlarged picture in the light appearance, then the dark appearance. The page, the card, Add photos, and the mark match `specs/009-client-paper-editorial/contracts/visual-language.md`. A photograph keeps its own colors.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T004 [P] [US1] Write failing tests in `tests/unit/token-values.test.js` for the values in `specs/009-client-paper-editorial/research.md`: light background `oklch(0.968 0.009 84.6)`, light primary `oklch(0.504 0.124 37.6)`, dark background `oklch(0.22 0.012 70)`, dark primary `oklch(0.78 0.11 40)`, and `--radius` `5px`. `--accent` stays a neutral warm hover, not terracotta (Principle II, Testing)
- [X] T005 [P] [US1] Extend `tests/layout/visual-language.test.js` so a card has a 5-pixel corner, a 1-pixel border, and a visible shadow; `#add-photos` uses the terracotta primary rather than `oklch(0.2 0 0)`; a month heading uses a serif; the header is 56 pixels tall and shows the mark (Principle II, Testing; Principle IV, Interface)
- [X] T006 [US1] Update `tests/unit/token-contrast.test.js` so the radius assertion expects `5px` and the allowed set can include `shadow` and `primary-hover`. Every semantic text pair must still clear 4.5 to 1 in both appearances (Principle II, Testing)

### Implementation for User Story 1

- [X] T007 [US1] Add `shadow` and `primary-hover` to `supportingAppearance` in `src/client/token-roles.js`. Do not add a semantic role name
- [X] T008 [US1] Retune `src/client/tokens.css` to the light and dark tables in `specs/009-client-paper-editorial/research.md`. Alpha is allowed only on `--shadow`. `--header` is a solid fill equal to the page. `--radius` is `5px`. Depends on T007
- [X] T009 [P] [US1] In `src/client/components/ui/button.jsx`, set a 5-pixel corner, point the default hover at `var(--primary-hover)`, keep the secondary 1-pixel border, and remove any cool drop shadow. The main action stays `bg-primary`
- [X] T010 [P] [US1] In `src/client/components/ui/input.jsx`, set a 5-pixel corner and remove any cool drop shadow
- [X] T011 [P] [US1] Remove cool drop shadows from `src/client/components/ui/card.jsx`, `src/client/components/ui/dropdown-menu.jsx`, and `src/client/components/ui/popover.jsx`. In `src/client/components/ui/dialog.jsx`, replace `shadow-lg` with the warm `--shadow` token
- [X] T012 [US1] In `src/client/styles.css`, make the header 56 pixels tall, sticky, and edged with a 1-pixel warm hairline; set device serif weight 500 on `h1`, `h2`, and `.full-name`; set device monospace 12 pixels on `.count`, `.assigned`, and `.privacy-control` with no uppercase transform; give cards `var(--radius)` and `var(--shadow)`; set the privacy chip to `border-radius: 9999px`. In `src/client/screens/album.jsx`, color the All albums link with `var(--info)` without painting every anchor terracotta. Depends on T008
- [X] T013 [US1] In `src/client/screens/header.jsx`, render the signature mark beside the product name: a terracotta square, three corners at 5 pixels, one corner tighter, initial 照 when the language is `zh` and P when the language is `en`. Keep both switches (Principle IV, Interface)

**Checkpoint**: User Story 1 is testable on its own. The language switch and the appearance switch are still present.

---

## Phase 4: User Story 2 - Keep every current task, both appearances, and both languages (Priority: P1)

**Goal**: Sign-in, albums, enlargement, and deletion still finish as specs 005 and 006 require. Chinese stays first, English stays one switch away, and the dark appearance stays the warm paper language.

**Independent Test**: With Chinese showing, sign in, create an album, enlarge a picture, and cancel a deletion. Choose the dark appearance and confirm the page is warm near-black. Choose `English` and read the same screens in English without leaving the page.

### Tests for User Story 2

- [X] T014 [P] [US2] Extend `tests/layout/header-layout.test.js` so the wide signed-in order stays New album, Add photos, `中文`, Dark appearance, Sign out, and choosing the language switch does not change the appearance (Principle II, Testing; Principle IV, Interface)
- [X] T015 [P] [US2] Extend `tests/layout/library-layout.test.js` so the dark appearance paints a warm near-black page rather than `oklch(0 0 0)`, and switching language leaves that appearance in place (Principle II, Testing)

### Implementation for User Story 2

- [X] T016 [US2] In `src/client/screens/header.jsx`, keep the language switch immediately before the appearance switch. Wide and signed in: New album, Add photos, language, appearance, Sign out. Wide and signed out: language, appearance, Sign in. Narrow and signed in, More lists New album, language, appearance, and Sign out. Narrow and signed out, More lists language and appearance, and Sign in stays visible (Principle IV, Interface)
- [X] T017 [US2] In `src/client/screens/notice-strip.jsx`, paint the skip sentence with the muted pair so `--info` stays the terracotta link. Keep mapping known English sentences through `src/client/copy.js`
- [X] T018 [US2] Leave `src/client/preferences.js`, `src/client/appearance.js`, and `src/client/organizer.jsx` so the first visit is light paper and Chinese, a saved `dark` value applies the dark class, and writing appearance does not change language

**Checkpoint**: User Stories 1 and 2 both work. A saved dark visit opens the warm near-black paper page, and the English sentences still match specs 001 through 006.

---

## Phase 5: User Story 3 - Read the paper details while finishing a task (Priority: P2)

**Goal**: Empty pages show the flourish above the existing sentence. A card lifts on hover. Loading blocks and the confirmation respect reduced motion. Narrow hit sizes stay.

**Independent Test**: At 320 pixels wide, open an empty library and the sign-in dialog. The flourish is visible, the empty sentence is unchanged, every visible control is at least 40 by 40 pixels, and Enter during character composition does not submit Name.

### Tests for User Story 3

- [X] T019 [P] [US3] Extend `tests/layout/library-layout.test.js` so an empty signed-in library shows the flourish above `Add photos to organize them by the day they were taken.`, and the flourish is absent under Albums when date albums are already showing (Principle II, Testing; Principle IV, Interface)
- [X] T020 [P] [US3] Extend `tests/layout/visual-language.test.js` so hovering `.album-card` lifts it by about 2 pixels and hovering `#add-photos` does not lift it (Principle II, Testing)
- [X] T021 [P] [US3] Keep `tests/layout/narrow-layout.test.js` asserting that visible controls are at least 40 by 40 pixels, the main header action is at least 44 by 44 pixels, and the page does not scroll sideways at 320 pixels (Principle IV, Interface)

### Implementation for User Story 3

- [X] T022 [US3] Add the flourish in `src/client/screens/library.jsx` above the existing empty sentences, and in `src/client/screens/album.jsx` above `This album has no pictures.` Do not add it to the enlarged picture or the add-pictures dialog. Draw the circle and hairline arcs in `src/client/styles.css` with `var(--primary)` and `var(--border)` only (Principle IV, Interface)
- [X] T023 [US3] In `src/client/styles.css`, lift `.album-card` and `.picture-card` about 2 pixels on hover and deepen `var(--shadow)`. Do not lift a button. Under `prefers-reduced-motion`, remove that lift, the skeleton pulse, and the confirmation rise. Do not set `transform: none` on a dialog
- [X] T024 [US3] In `src/client/screens/confirmation.jsx` and `src/client/styles.css`, make the confirmation rise into place and appear in place under reduced motion. Keep the four-second dismiss from `src/client/confirmation.js`. Let `.skeleton` pulse, and do not pulse it under reduced motion

**Checkpoint**: All three stories work. Reduced motion leaves dialogs positioned and leaves the confirmation in place.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove the whole feature against the quickstart.

- [X] T025 Run `npm test -- --test-concurrency=1` from `specs/009-client-paper-editorial/quickstart.md` and fix failures in the files this feature touched
- [X] T026 [P] Run Biome on the edited files under `src/client/` and `tests/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2 or US3
- **User Story 2 (Phase 4)**: Depends on Foundational. Follows US1 because both edit `src/client/screens/header.jsx` and the dark paint
- **User Story 3 (Phase 5)**: Depends on US1 because it edits `src/client/styles.css` after the paper paint lands
- **Polish (Phase 6)**: Depends on the stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. Delivers the paper page on its own
- **User Story 2 (P1)**: Starts after US1. Proves the switches and the existing tasks still finish
- **User Story 3 (P2)**: Starts after US1. Adds the flourish, the lift, and the motion rules

### Within Each User Story

- Tests are written first and fail before implementation
- `src/client/token-roles.js` (T007) before `src/client/tokens.css` (T008)
- Token values before `src/client/styles.css` (T012)
- The mark element (T013) after the header paint (T012)
- Flourish markup (T022) before the hover and motion rules that share `src/client/styles.css` (T023, T024)

### Parallel Opportunities

- T002 and T003 touch different files
- T004 and T005 touch different test files
- T009, T010, and T011 touch different components after T008
- T014 and T015 touch different layout tests
- T019, T020, and T021 touch different layout tests

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Write failing token values in tests/unit/token-values.test.js"
Task: "Extend tests/layout/visual-language.test.js for the 5px corner and the mark"

# After tokens.css lands, components together:
Task: "Set the 5px corner in src/client/components/ui/button.jsx"
Task: "Set the 5px corner in src/client/components/ui/input.jsx"
Task: "Move the dialog shadow onto var(--shadow)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: The library is warm paper, the dark page is warm near-black, and the mark reads 照
5. Demo if ready

### Incremental Delivery

1. Setup plus Foundational keeps the current sentences and preferences
2. User Story 1 replaces the cool paint and adds the mark
3. User Story 2 proves Chinese, English, and both appearances still finish the existing tasks
4. User Story 3 adds the flourish, the card lift, and reduced motion
5. Polish runs the full suite

### Parallel Team Strategy

After Foundational:

1. One person completes User Story 1, including `header.jsx` and `styles.css`
2. A second person can write the US2 and US3 tests, then implement them after those files land

---

## Notes

- [P] tasks use different files and do not depend on an unfinished task
- [US1], [US2], and [US3] map to the three stories in `specs/009-client-paper-editorial/spec.md`
- The light main action uses the deeper terracotta because the lighter published accent fails 4.5 to 1 with light text. The numbers are in `specs/009-client-paper-editorial/research.md`
- Do not edit `src/server/`
- Verify tests fail before implementing
- Stop at any checkpoint to validate that story on its own
