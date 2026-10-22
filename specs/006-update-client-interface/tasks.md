---
description: "Task list for update client interface"
---

# Tasks: Update Client Interface

**Input**: Design documents from `/specs/006-update-client-interface/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. `spec.md` FR-020 and Principle II require a rendered check that fails when keyboard completion, focus return, appearance dismissal, the showable cover, the failure sentence, or the narrow hit size is broken. Layout tests are Playwright launched from `node:test`. Write each story's test first and confirm it fails before that story's implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Client: `src/client/`
- Tests: `tests/layout/`, `tests/unit/`, `tests/integration/`
- Date-album cover selection stays in `src/server/library.js`. Do not add a second cover picker in the client. Do not edit `src/client/api.js`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep the existing client toolchain. This feature adds no package

- [X] T001 Do not add a dependency in `package.json`. The existing `react`, `react-dom`, `tailwindcss`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, and `playwright` stay. Do not add `motion`, `framer-motion`, `lucide-react`, or a tooltip package
- [X] T002 [P] Keep the viewport in `src/client/index.html` as `width=device-width, initial-scale=1` with no `maximum-scale`, so a phone can still pinch zoom

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One visible focus ring shared by every story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] In `src/client/components/ui/button.jsx` and `src/client/components/ui/input.jsx`, remove `focus-visible:outline-none` and `focus-visible:ring-1` so those components no longer hide the page outline
- [X] T004 [P] In `src/client/styles.css`, keep one `:focus-visible` rule for `button`, `a`, and `input`: a 2-pixel solid outline using the existing `--ring` role. Do not add a `white-space` declaration and do not add a new color

**Checkpoint**: Foundation ready. A focused button, link, or field shows a 2-pixel ring on both appearances. User stories can begin

---

## Phase 3: User Story 1 - Finish every task with the keyboard (Priority: P1) 🎯 MVP

**Goal**: A person who does not use a pointer can sign in, add photos, make an album, open it, enlarge a picture, cancel a deletion, switch appearance, and close a notice. Closing a layer returns to the control that opened it. Switching appearance does not close that layer

**Independent Test**: With a pointer unused, complete sign-in, album creation, picture enlargement, and a cancelled deletion against the layout harness. After each close, the control that opened the layer is the one ready for the next key. Switching appearance leaves the layer open

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T005 [US1] Extend `tests/layout/keyboard-layout.test.js`, using `openOrganizer` from `tests/layout/harness.js` and not `data/library.sqlite`, with failing checks for `specs/006-update-client-interface/contracts/interface-interaction.md`: keyboard-only sign-in reaches the signed-in library, and a failed sign-in keeps the dialog open with `Could not sign in.` under the title; Escape closes the picture menu, the New album panel, a dialog, and the enlarged picture and returns focus to the control that opened it; switching appearance does not close those layers and does not change the route; closing the notice strip leaves focus on `#add-photos` when signed in and on `#sign-in` when signed out

### Implementation for User Story 1

- [X] T006 [P] [US1] In `src/client/components/ui/dialog.jsx`, `src/client/components/ui/popover.jsx`, and `src/client/components/ui/dropdown-menu.jsx`, ignore an outside press whose target is `#appearance-switch`, so that press does not close the layer
- [X] T007 [P] [US1] In `src/client/screens/header.jsx` (Principle IV, Interface), give the signed-out Sign in button `id="sign-in"`. The narrow More menu lists only New album, the appearance switch, and Sign out, with no Cancel row. Choosing the appearance switch, including the copy inside More, does not close More, does not close any other layer, and does not change the route. Escape still closes More
- [X] T008 [P] [US1] In `src/client/screens/notice-strip.jsx` (Principle IV, Interface), keep Close at the strip's right end on a wide window and at its top-right on a narrow window. Closing the strip moves focus to `#add-photos` when that control exists, otherwise to `#sign-in`
- [X] T009 [P] [US1] In `src/client/screens/preview.jsx` and `src/client/organizer.jsx` (Principle IV, Interface), remember the `.picture-open` control that opened the enlarged picture. Close, the backdrop, and Escape return focus to that control and leave the same album open
- [X] T010 [P] [US1] In `src/client/screens/account-dialog.jsx` (Principle IV, Interface), keep focus on Name when the dialog opens. Escape and Close return focus to `#sign-in`

**Checkpoint**: User Story 1 is testable on its own. Every close returns to its opener, and appearance does not dismiss an open layer

---

## Phase 4: User Story 2 - See a picture or a clear failure (Priority: P1)

**Goal**: A library cover is a picture that can be shown, or the sentence `This picture cannot be shown.` The same sentence appears on a picture card and again when that picture is enlarged. Pictures that cannot be shown stay in the album and in the count

**Independent Test**: Open a public album whose earliest picture cannot be shown and whose next picture can. The library card shows the later picture. Inside the album, the failing picture shows the sentence, and the album count is unchanged

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US2] Add a failing Playwright test in `tests/layout/library-layout.test.js` for the cover rows in `specs/006-update-client-interface/data-model.md`: a cover URL that fails to load shows `This picture cannot be shown.`; "No cover URL, and `photoCount` greater than zero" shows that sentence rather than an empty placeholder; a cover URL that loads shows the picture and no sentence
- [X] T012 [P] [US2] Add a failing Playwright test in `tests/layout/album-layout.test.js` that a picture which cannot be loaded shows `This picture cannot be shown.` on the picture card and again in the enlarged layer, with the album still open underneath. An Add pictures square that cannot be loaded shows the same sentence and can still be chosen

### Implementation for User Story 2

- [X] T013 [P] [US2] In `src/client/screens/library.jsx` (Principle IV, Interface), show `This picture cannot be shown.` when the cover image fails or when the card has no cover URL and `photoCount` is greater than zero. Do not choose a different cover in the client. A cover URL that loads shows that picture
- [X] T014 [P] [US2] In `src/client/screens/album.jsx` (Principle IV, Interface), show `This picture cannot be shown.` in the picture area, in the Add pictures square, and in the delete confirmation's small copy when that copy cannot be painted. The picture card can still be enlarged. The sentence is centered on the enlarged layer from `src/client/screens/preview.jsx`. "A picture the person is allowed to see, and which cannot be painted. It stays in the album response and in `photoCount`."
- [X] T015 [P] [US2] Keep date-album cover selection in `showableCoverName` in `src/server/library.js`: "The first picture in album order whose file can be shown." `photoCount` still counts every picture. Do not weaken the existing cover assertion in `tests/integration/library-storage.test.js`. Named-album covers stay the first picture

**Checkpoint**: User Stories 1 and 2 both work. A public card does not use an unshowable file as its cover when a later picture can be shown

---

## Phase 5: User Story 3 - Read every name and every next step (Priority: P2)

**Goal**: A shortened album name still yields the full name on point and on keyboard focus. Field errors sit under the field. Empty Add pictures says what to do next. Button labels stay sentence case

**Independent Test**: Create an album with a long name, shorten it in the library, and read the full name both by pointing and by tabbing to the card. Submit an empty album name and read the correction under the Name field without leaving the panel

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T016 [P] [US3] Add a failing Playwright test in `tests/layout/library-layout.test.js` and `tests/layout/album-layout.test.js` for `specs/006-update-client-interface/contracts/interface-interaction.md`: the visible album name or title stays one line; pointing at it and moving the keyboard to that link or title exposes the full string; the accessible name of that link or title is the full string
- [X] T017 [US3] Add a failing Playwright test in `tests/layout/header-layout.test.js` and `tests/layout/album-layout.test.js`: an empty album name and a duplicate name show the correction under the Name field and the New album panel stays open; Add pictures with no owner pictures shows `No pictures to add.` and Done remains; pictures already in the album stay in the grid and stay marked as added; confirming delete still says `Delete` under the title `Delete this picture?`

### Implementation for User Story 3

- [X] T018 [P] [US3] In `src/client/screens/library.jsx` (Principle IV, Interface), set the album link's accessible name to the full album name or date. Keep the visible line one line with `truncate`. Store the full string in `data-full` so point and keyboard focus can show it. "The count stays visible" and uses equal-width digits so a change from 9 to 10 does not move the name
- [X] T019 [P] [US3] In `src/client/screens/album.jsx` (Principle IV, Interface), do the same for the album title. When the owner has no pictures at all, the Add pictures dialog shows `No pictures to add.` under the title and Done remains. Pictures already in the album stay visible and marked as added
- [X] T020 [P] [US3] In `src/client/styles.css`, show the `data-full` string when the person points at that line or when the keyboard is on it. Apply `font-variant-numeric: tabular-nums` to `.count`. Do not add a `white-space` declaration
- [X] T021 [US3] In `src/client/screens/header.jsx` (Principle IV, Interface), keep an empty name and a duplicate name message directly under the Name field, and keep the New album panel open. Button labels stay `Add photos`, `Sign in`, `Sign out`, `Create`, `Delete`, `Cancel`, `Done`, and `Close`

**Checkpoint**: User Story 3 is testable on its own. A shortened name and a field error are both readable without leaving the screen

---

## Phase 6: User Story 4 - Use the organizer on a narrow window (Priority: P2)

**Goal**: At 320 pixels wide, every visible control can be tapped, the page does not scroll sideways, and tapping Name or Secret does not zoom the page. Reduced motion removes slides and scales

**Independent Test**: At 320 pixels wide, open an album, the picture menu, and Sign in. Nothing scrolls sideways. The main action and every close control are at least 44 by 44 pixels. Tapping Name does not zoom the page

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T022 [US4] Add a failing Playwright test in `tests/layout/narrow-layout.test.js` at 320 pixels wide for `specs/006-update-client-interface/contracts/interface-interaction.md`: the document scroll width equals its client width; every visible control is at least 24 by 24 pixels; `#add-photos` or `#sign-in`, and every close control, are at least 44 by 44 pixels and do not overlap; Name and Secret computed text size is at least 16 pixels

### Implementation for User Story 4

- [X] T023 [US4] In `src/client/styles.css` (Principle IV, Interface), below 640 pixels wide, make `#add-photos`, `#sign-in`, and every close control at least 44 by 44 pixels, and keep every other visible control at least 24 by 24 pixels. Set Name and Secret text to 16 pixels at that width. Wrap any slide or scale so it runs only when the person has not asked the device to reduce motion; under that request a screen, menu, or dialog appears with no slide and no scale

**Checkpoint**: All four stories work. A 320-pixel window does not scroll sideways and does not zoom when a field is tapped

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the color scan and the quickstart still hold after every story

- [X] T024 [P] Confirm `tests/unit/screen-color.test.js` still lists the touched screen modules and passes with no new palette in `src/client/tokens.css`
- [X] T025 Run the checks in `specs/006-update-client-interface/quickstart.md`: `npm test` passes, and Biome passes on the client files this feature touches

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories then proceed in priority order (P1 → P1 → P2 → P2)
  - US2 may start after Foundational in parallel with US1 only where the files do not overlap. US1 owns `header.jsx`, `notice-strip.jsx`, `preview.jsx`, `organizer.jsx`, and `account-dialog.jsx`. US2 owns `library.jsx`, `album.jsx`, and `library.js` until US3
- **Polish (Phase 7)**: Depends on the user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independently testable. Does not require the keyboard work
- **User Story 3 (P2)**: Starts after US2 because both edit `src/client/screens/library.jsx` and `src/client/screens/album.jsx`. The full-name behavior is still tested on its own
- **User Story 4 (P2)**: Starts after US3 because both edit `src/client/styles.css`

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Story complete before moving to the next story that edits the same files

### Parallel Opportunities

- T001 and T002 can run in parallel
- T003 and T004 can run in parallel
- After T005, T006 through T010 can run in parallel
- T011 and T012 can run in parallel, then T013 through T015 can run in parallel
- T016 and T017 both edit `tests/layout/album-layout.test.js`, so T017 follows T016. T018 through T020 can then run in parallel. T021 follows T007 because both edit `src/client/screens/header.jsx`

---

## Parallel Example: User Story 1

```bash
# After T005 fails, launch the implementation tasks together:
Task: "Ignore outside presses on #appearance-switch in dialog.jsx, popover.jsx, and dropdown-menu.jsx"
Task: "Remove the More Cancel row in header.jsx"
Task: "Return notice-strip focus to the main action"
Task: "Return enlarged-picture focus to .picture-open"
Task: "Keep account-dialog focus on Name"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo keyboard completion and focus return

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP)
3. Add User Story 2 → Test independently → Demo the public cover
4. Add User Story 3 → Test independently → Demo full names and field errors
5. Add User Story 4 → Test independently → Demo the 320-pixel window
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. After those two land, one developer takes User Story 3 and then User Story 4, because they share `library.jsx`, `album.jsx`, and `styles.css`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
