---
description: "Task list for organizer screen layout"
---

# Tasks: Organizer Screen Layout

**Input**: Design documents from `/specs/005-organizer-screen-layout/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. `spec.md` FR-021 and Principle II require a check that fails when a rendered screen breaks a placement rule. Layout tests are Playwright launched from `node:test`. Write each story's test first and confirm it fails before that story's implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Client: `src/client/`
- Tests: `tests/unit/`, `tests/layout/`
- Server is out of scope. Do not edit `src/server/` or `src/client/api.js`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the three dialog packages and the browser runner the plan names

- [X] T001 Add dependencies `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, and `@radix-ui/react-popover`, and dev dependency `playwright`, in `package.json`, then install them. Do not add `lucide-react`
- [X] T002 [P] Create `src/client/components/ui/dialog.jsx` as the shadcn dialog, with no `lucide-react` import and no `white`, `black`, or `transparent` utility class, so `findScreenColors` in `src/client/screen-color.js` returns no findings. Support a centered placement and a bottom-edge placement
- [X] T003 [P] Create `src/client/components/ui/dropdown-menu.jsx` as the shadcn dropdown menu, with no `lucide-react` import and no `white`, `black`, or `transparent` utility class
- [X] T004 [P] Create `src/client/components/ui/popover.jsx` as the shadcn popover, with no `lucide-react` import and no `white`, `black`, or `transparent` utility class
- [X] T005 [P] Create `tests/layout/fixtures.js` and `tests/layout/harness.js`. The harness builds the client, serves it, launches Playwright Chromium, and stubs `GET /api/session`, `GET /api/albums`, and `GET /api/albums/{id}/photos`. Tests must not read `data/library.sqlite`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One React tree, notice lifetime, and screen state shared by every story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Write a failing test in `tests/unit/notice.test.js` that a batch notice survives a library render and clears only when closed or when a later batch replaces it
- [X] T007 Change `src/client/notice.js` so the strip is absent when skipped count, duplicate, and errors are all empty, and so it remains through navigation until the person closes it or a new batch replaces it. Keep the skip and duplicate sentences from specs 001 and 002
- [X] T008 Update `tests/unit/batch.test.js` so it no longer expects `consumePendingNotice` to clear the notice on the next render. The replacement assertion lives in `tests/unit/notice.test.js`
- [X] T009 [P] Write a failing test in `tests/unit/screen-state.test.js` for the open surface and the overlay rules quoted in `specs/005-organizer-screen-layout/data-model.md`
- [X] T010 Implement `src/client/screen-state.js` so the open surface is exactly one of Signed-out library, Signed-in library, Date album, Named album, or Enlarged picture, where "Enlarged picture: A picture is selected. The album screen stays mounted underneath". At most one overlay is open. "Resizing across 640 pixels closes the open menu and keeps an open dialog, rearranged for the new width."
- [X] T011 Render one React tree from `src/client/App.jsx`. Move session and route state into `src/client/photo-app.js` and remove the second `createRoot` inside `#app`. The header is part of every screen and is not a separate route. A title-only header is enough until T032
- [X] T012 Remove the shared `button, a` rule from `src/client/styles.css`. Add the page column and the grid rules. Do not add a `white-space` declaration. One-line card text uses the class `truncate`
- [X] T013 [P] Create `src/client/screens/notice-strip.jsx` (Principle IV, Interface) per the Notices section of `specs/005-organizer-screen-layout/spec.md` and `specs/005-organizer-screen-layout/contracts/screen-layout.md`. Order inside the strip: skipped count, then `This picture is already in the library.`, then each error. The close control is at the end
- [X] T014 Add `src/client/components/ui/dialog.jsx`, `src/client/components/ui/dropdown-menu.jsx`, `src/client/components/ui/popover.jsx`, and `src/client/screens/notice-strip.jsx` to the file list in `tests/unit/screen-color.test.js`

**Checkpoint**: Foundation ready. `npm test` passes the notice and screen-state unit tests. User stories can begin

---

## Phase 3: User Story 1 - Scan the library at a glance (Priority: P1) 🎯 MVP

**Goal**: A signed-in person sees month-grouped date albums, then named albums, as equal cards. Each card is one picture and one line. The privacy control sits inside an owned card. No form sits above the albums

**Independent Test**: Sign in against the fixture library at 960 pixels wide. The first row of album cards is visible without scrolling. Each card's text is one line. An owned album shows Private or Public inside the card at the top-right of the cover, and nothing is attached below the card

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T015 [US1] Write a failing Playwright test in `tests/layout/library-layout.test.js` for the signed-in library region of `specs/005-organizer-screen-layout/contracts/screen-layout.md` at 960 pixels wide: month groups newest first, then the heading `Albums`; no create-album form in the body; card line "One line. A long name or date is cut with an ellipsis. The count stays visible"; privacy control only when the signed-in person owns the album, inside the card at the top-right of the cover, label `Private` or `Public`; empty library shows `Add photos to organize them by the day they were taken.` and one Add photos button, with no month heading and no `Albums` heading; pictures but no named albums shows `No named albums yet. Use New album to make one.`

### Implementation for User Story 1

- [X] T016 [US1] Create `src/client/screens/library.jsx` (Principle IV, Interface) for the signed-in library in `specs/005-organizer-screen-layout/spec.md`. Album card: "Square picture, or a plain placeholder when null". "Choosing the card opens that album. Choosing the privacy control does not." Wide grid: cards at least 200 pixels wide, as many columns as fit, at most five
- [X] T017 [US1] Show `src/client/screens/library.jsx` from `src/client/photo-app.js` when the open surface is Signed-in library
- [X] T018 [US1] Move the owner-only and empty-copy assertions out of `tests/unit/library-view.test.js` into `tests/layout/library-layout.test.js` with the same outcomes, then delete `tests/unit/library-view.test.js` and `src/client/library-view.js`

**Checkpoint**: User Story 1 is testable on its own. The first row of cards is visible at 960 pixels without a form above them

---

## Phase 4: User Story 2 - Act on a picture from its menu (Priority: P1)

**Goal**: An opened album is a grid of picture cards. Choosing the picture enlarges it. Every other action is one menu. Delete asks in a dialog

**Independent Test**: Open a date album the person owns while they have two named albums. Each card shows the picture, one line, and one menu. Delete opens a dialog. Cancel leaves the picture in the album

### Tests for User Story 2 ⚠️

- [X] T019 [US2] Write a failing Playwright test in `tests/layout/album-layout.test.js` for the album body and dialogs in `specs/005-organizer-screen-layout/contracts/screen-layout.md`: picture menu items in order `Mark picture public`, then `Add to album`, then `Delete` last after a separator; no per-album button on the card; delete dialog title `Delete this picture?`, sentence `It will be removed from every album.`, focus starting on Cancel; Cancel and Escape leave the picture; a failed delete leaves the dialog open and shows the server message; choosing the image opens the enlarged picture with `object-fit: contain` and `This picture cannot be shown.` when it cannot load

### Implementation for User Story 2

- [X] T020 [P] [US2] Create `src/client/screens/album.jsx` (Principle IV, Interface) for the date album and named album in `specs/005-organizer-screen-layout/spec.md`. Picture card line does not wrap. Menu control accessible name is `Picture actions` and is absent when the person has no action. `Delete` is last, after a separator, and styled destructive. Named album title bar ends with `Add pictures` for the owner. Empty named album shows `This album has no pictures.`
- [X] T021 [P] [US2] Create `src/client/screens/preview.jsx` (Principle IV, Interface) for the enlarged picture in `specs/005-organizer-screen-layout/spec.md`. Close is at the top-right, at least 44 by 44 pixels. Backdrop and Escape close it and leave the same album open
- [X] T022 [US2] Create the delete confirmation and the Add pictures dialog in `src/client/screens/album.jsx` using `src/client/components/ui/dialog.jsx`. "Delete failure: dialog stays, error area shows the message, picture stays." Deleting the last picture of a date album returns to the signed-in library. Deleting the last picture of a named album shows the empty named album
- [X] T023 [US2] Show the album screen and the enlarged picture from `src/client/photo-app.js`. The wide-window picture menu uses `src/client/components/ui/dropdown-menu.jsx`
- [X] T024 [US2] Move the photo-order, owner-only delete, and preview assertions out of `tests/unit/album-view.test.js` and `tests/unit/preview-view.test.js` into `tests/layout/album-layout.test.js` with the same outcomes, then delete those two test files, `src/client/album-view.js`, and `src/client/preview-view.js`

**Checkpoint**: User Stories 1 and 2 both work. A picture card has one menu, and Cancel does not delete

---

## Phase 5: User Story 3 - Sign in without forms covering the public library (Priority: P2)

**Goal**: A signed-out person sees public albums first. Sign in and account creation happen in a dialog opened from the header

**Independent Test**: Sign out. The first thing below the header is the public grid. A wrong secret shows `Could not sign in.` inside the dialog. Switching to Create account stays in the dialog

### Tests for User Story 3 ⚠️

- [X] T025 [US3] Write a failing Playwright test in `tests/layout/account-layout.test.js` for the signed-out library and the sign-in dialog in `specs/005-organizer-screen-layout/contracts/screen-layout.md`: no account form in the body; empty public library shows `There are no public photos.` and one Sign in button; failed sign-in shows `Could not sign in.` under the title; a duplicate name shows `An account with that name already exists.`; "Account created: stay in the dialog, switch it to Sign in, keep the name, show that the account was created."; "Sign-in success: close the dialog, replace the signed-out library with the signed-in library."

### Implementation for User Story 3

- [X] T026 [US3] Create `src/client/screens/account-dialog.jsx` (Principle IV, Interface) for the Sign-in dialog in `specs/005-organizer-screen-layout/spec.md`, using `src/client/components/ui/dialog.jsx` and `src/client/components/ui/input.jsx`. Mode switch reads `Create an account` or `Sign in instead`
- [X] T027 [US3] Add the signed-out body to `src/client/screens/library.jsx` (Principle IV, Interface). Public date albums, then public named albums. Album cards show no privacy control. No account form in the body
- [X] T028 [US3] Open the account dialog from `src/client/photo-app.js` when the open surface is Signed-out library
- [X] T029 [US3] Move the signed-out assertions out of `tests/unit/session-view.test.js` into `tests/layout/account-layout.test.js` with the same outcomes, then delete that test and `src/client/session-view.js`

**Checkpoint**: Signed-out visitors see pictures before any form. Sign-in failure stays inside the dialog

---

## Phase 6: User Story 4 - Use the organizer in a narrow window (Priority: P2)

**Goal**: Below 640 pixels the grids have two columns, the header stays one line, and picture menus open from the bottom edge

**Independent Test**: At 375 pixels wide, open the library, an album, a picture menu, the delete dialog, and the enlarged picture. Two columns, a one-line header, a bottom panel, and no sideways scrolling

### Tests for User Story 4 ⚠️

- [X] T030 [US4] Write a failing Playwright test in `tests/layout/narrow-layout.test.js` at 320 and 375 pixels for `specs/005-organizer-screen-layout/contracts/screen-layout.md`: "Narrow | 320 to 639 pixels | Two columns"; header is one line and shows Add photos plus More when signed in; picture menu, More, and New album open from the bottom edge; a dialog spans the window width minus a 16-pixel margin on each side; "The document's scroll width equals its client width"

### Implementation for User Story 4

- [X] T031 [US4] Apply the narrow grid and the bottom-edge Dialog placement in `src/client/styles.css`, `src/client/screens/library.jsx`, and `src/client/screens/album.jsx` (Principle IV, Interface). Below 640 pixels the picture menu is the bottom panel, not `dropdown-menu.jsx`
- [X] T032 [US4] Create the narrow header in `src/client/screens/header.jsx` (Principle IV, Interface). "More exists only in a narrow window. It holds the header controls that are not the main action, in the order above." Signed in, the visible controls are the title, Add photos, and More. Signed out, More is absent and Sign in stays visible
- [X] T033 [US4] Close the open menu when the viewport crosses 640 pixels in `src/client/screen-state.js`, and keep an open dialog open, rearranged for the new width

**Checkpoint**: At 375 pixels the library and an album are usable with no sideways scrolling

---

## Phase 7: User Story 5 - Reach every library action from the header (Priority: P3)

**Goal**: In a wide window the header shows the same controls in the same order on every screen, and New album opens a panel under its control

**Independent Test**: On the library and on an album, the wide header order matches. New album with a name that is already taken shows the message under the Name field and leaves the panel open

### Tests for User Story 5 ⚠️

- [X] T034 [US5] Write a failing Playwright test in `tests/layout/header-layout.test.js` at 960 pixels for the header in `specs/005-organizer-screen-layout/contracts/screen-layout.md`: signed in, left to right, title `Photo Date Albums`, New album, Add photos, the appearance switch, Sign out; the same controls and order on the library and on an album; the switch reads `Dark appearance` while the screen is light and `Light appearance` while the screen is dark; the New album panel hangs under that control and a refused name shows the API message under the Name field while the panel stays open

### Implementation for User Story 5

- [X] T035 [US5] Complete the wide header in `src/client/screens/header.jsx` (Principle IV, Interface). "Wide window, signed in, left to right: the title `Photo Date Albums`, New album, Add photos, the appearance switch, Sign out." Signed out: the title, the appearance switch, Sign in
- [X] T036 [US5] Open the New album panel from `src/client/screens/header.jsx` with `src/client/components/ui/popover.jsx` in a wide window. Fields are Name, the message area, Cancel, and Create. Success closes the panel and shows the new card in the named albums section
- [X] T037 [US5] Set the appearance switch label in `src/client/screens/header.jsx` from `src/client/appearance.js`. Switching appearance closes no overlay and does not change the route

**Checkpoint**: All five stories work. Header controls are in one place on every screen

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Geometry at every required width, keyboard focus, and removal of the old layout

- [X] T038 [P] Write `tests/layout/geometry-layout.test.js` for the Geometry section of `specs/005-organizer-screen-layout/contracts/screen-layout.md` at viewport widths 320, 375, 640, 960, and 1440. Fail when a control rectangle intersects another control, extends outside its card, bar, strip, menu, or dialog, or when the document scroll width exceeds its client width
- [X] T039 [P] Write `tests/layout/keyboard-layout.test.js` so Tab reaches every visible control, Escape closes the top overlay, and focus returns to the control that opened it
- [X] T040 Add `src/client/screens/library.jsx`, `src/client/screens/album.jsx`, `src/client/screens/preview.jsx`, `src/client/screens/account-dialog.jsx`, and `src/client/screens/header.jsx` to the file list in `tests/unit/screen-color.test.js`
- [X] T041 Remove the obsolete `.tile-wrap`, `.photo-actions`, and shared button rules from `src/client/styles.css` once no screen still uses them
- [X] T042 Run the checks in `specs/005-organizer-screen-layout/quickstart.md`: `npm test` and Biome on the client files this feature touches. Specs 001 through 004 acceptance checks still pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks every user story
- **User Stories (Phase 3+)**: Depend on Foundational
- **Polish (Phase 8)**: Depends on US1 through US5

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. No other story required
- **User Story 2 (P1)**: Starts after Foundational. Uses the library only as the way to open an album; the album screen is testable with a direct route
- **User Story 3 (P2)**: Starts after Foundational. Adds the signed-out body to the library screen from US1
- **User Story 4 (P2)**: Starts after US1, US2, and US3, because it changes the grids, the picture menu, and the header those stories render
- **User Story 5 (P3)**: Starts after US4, because both edit `src/client/screens/header.jsx`. US4 owns the narrow header. US5 owns the wide header

### Within Each User Story

- The story test fails before implementation starts
- A screen component exists before `photo-app.js` shows it
- The old string-view test is removed only after the layout test asserts the same outcome

### Parallel Opportunities

- T002, T003, T004, and T005 can run together
- T006 and T009 can run together
- T013 can run with T006
- T020 and T021 can run together
- T038 and T039 can run together

---

## Parallel Example: User Story 2

```bash
# After T019 is failing, these two screens can be written together:
Task: "Create src/client/screens/album.jsx"
Task: "Create src/client/screens/preview.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `tests/layout/library-layout.test.js` and look at the signed-in library at 960 pixels
5. Continue only after that screen matches the contract

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → library cards with no form above them
3. User Story 2 → picture menu and delete dialog
4. User Story 3 → signed-out library and sign-in dialog
5. User Story 4 → narrow window
6. User Story 5 → wide header and New album panel
7. Polish → five widths, keyboard, quickstart

### Parallel Team Strategy

After Foundational:

- One person can take User Story 1
- Another can take User Story 2
- User Story 3 waits until `library.jsx` exists
- User Stories 4 and 5 stay sequential because they share `header.jsx`

---

## Notes

- [P] tasks = different files, no dependencies
- [US1] through [US5] map to the five stories in `spec.md`
- A task that builds a visible screen cites Principle IV, Interface
- Quote a data-model or contract sentence in the test before implementing it
- Do not weaken an assertion from specs 001 through 004. Move it, then delete the old file
- Commit after each phase checkpoint

---

## Phase 9: Convergence

**Purpose**: Close gaps between the Screens section, FR-016, FR-017, FR-021, and the current client

- [ ] T043 CRITICAL Extend `tests/layout/geometry-layout.test.js`, `tests/layout/narrow-layout.test.js`, and `tests/layout/keyboard-layout.test.js` so a broken placement rule fails per FR-021 and Constitution II (partial). `tests/layout/geometry-layout.test.js` only compares `scrollWidth` with `clientWidth` on the signed-in library. Assert one-line card text at 320, 375, 640, 960, and 1440, two columns from 320 to 639, a bottom-edge picture menu, no sideways scrolling on the library and an album, and that a control rectangle which intersects another control or leaves its card, bar, strip, menu, or dialog fails the check. Tab must reach every visible control.
- [ ] T044 CRITICAL Assert the still-untested acceptance outcomes in `tests/layout/album-layout.test.js` and `tests/layout/account-layout.test.js` per Constitution II (partial). A failed delete keeps the dialog open and shows the server message. A picture that cannot load shows `This picture cannot be shown.` Creating an account stays in the dialog, switches it to Sign in, keeps the name, and says the account was created. A duplicate name shows `An account with that name already exists.` Sign-in success closes the dialog and shows the signed-in library.
- [ ] T045 Keep control rectangles from intersecting in `src/client/screens/library.jsx` and `src/client/screens/preview.jsx` per FR-016 (contradicts). The privacy control is absolutely positioned over the album link, and the enlarged-picture close control sits on the full-window backdrop button.
- [ ] T046 Place the notice close control at the strip's right end, and at the top-right in a narrow window, in `src/client/screens/notice-strip.jsx` and `src/client/styles.css` per FR-001 (contradicts). `.notice-strip` is a single-column grid, so Close sits under the messages.
- [ ] T047 Add the top-right close control to the sign-in dialog in `src/client/screens/account-dialog.jsx` and to Add pictures in `src/client/screens/album.jsx` per FR-001 (partial). Both dialogs close with Escape and have no close control.
- [ ] T048 Keep an open menu, New album panel, dialog, or enlarged picture open when the appearance switch is used, in `src/client/screens/header.jsx` and `src/client/organizer.jsx` per the spec edge cases (contradicts). The switch is an outside press, so the dropdown and popover dismiss.
- [ ] T049 Return focus to the picture control when Close, the backdrop, or Escape dismisses the enlarged picture, in `src/client/screens/preview.jsx` and `src/client/organizer.jsx` per FR-017 (partial). The Escape handler only clears the selected picture.
- [ ] T050 Make the Add to album list scroll inside the menu in `src/client/components/ui/dropdown-menu.jsx` and `src/client/screens/album.jsx` per the spec edge cases (partial). The submenu content has no maximum height, so many named albums grow past the window.
- [ ] T051 Expose a truncated album name on hover in `src/client/screens/library.jsx` and `src/client/screens/album.jsx` per the spec edge cases (partial). The card line and the album title use `truncate` and do not carry the full name as a title.
- [ ] T052 Remove the extra Cancel row from More in `src/client/screens/header.jsx` per the Header narrow-window rules (unrequested). More already lists New album, the appearance switch, and Sign out, which are the controls that section names.
