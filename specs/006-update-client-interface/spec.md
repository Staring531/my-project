# Feature Specification: Update Client Interface

**Feature Branch**: `006-update-client-interface`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "使用better-interface skill 更新client"

## User Scenarios & Testing *(mandatory)*

This feature updates the organizer a person already uses. The blocks, control order, empty messages, and narrow layout from spec 005 stay. What changes is that every flow can be finished without a pointer, every control is named and easy to hit, a picture that cannot be shown says so wherever it appears, and long names stay readable. Specs 001 through 004 still decide who can see an album or a picture, and which pictures an album contains.

Under the constitution's Governance section, this spec follows Principle IV, Interface, for every screen in the Screens section.

### User Story 1 - Finish every task with the keyboard (Priority: P1)

A person who does not use a pointer can sign in, add photos, make an album, open it, enlarge a picture, delete a picture, change privacy, switch appearance, and close a notice. Closing a menu, panel, or dialog returns them to the control that opened it. Switching appearance does not close anything they already have open.

**Why this priority**: A control that only a pointer can reach blocks the task. Focus that disappears after a dialog closes makes the next step a search.

**Independent Test**: With a pointer unused, complete sign-in, album creation, picture enlargement, and a cancelled deletion. After each close, the control that opened the layer is the one ready for the next key.

**Acceptance Scenarios**:

1. **Given** the signed-out library, **When** the person uses only the keyboard to open Sign in, enter a name and secret, and submit, **Then** a successful sign-in closes the dialog and shows the signed-in library, and a failed sign-in keeps the dialog open with `Could not sign in.` under the title.
2. **Given** a picture menu, the New album panel, a dialog, or an enlarged picture is open, **When** the person switches appearance, **Then** that layer stays open and the appearance changes.
3. **Given** any menu, panel, or dialog is open, **When** the person presses Escape, **Then** it closes and the control that opened it is ready for the next key.
4. **Given** an enlarged picture, **When** the person closes it with the close control, the backdrop, or Escape, **Then** they are on the same album and the picture they opened is ready for the next key.

---

### User Story 2 - See a picture or a clear failure (Priority: P1)

A person looking at the library or an album always sees a picture that can be shown, or the sentence `This picture cannot be shown.` A public album's cover is a picture that can be shown when the album has one. Pictures that cannot be shown stay in the album and stay counted.

**Why this priority**: The public library is the first thing a signed-out person sees. A blank cover looks like a missing album.

**Independent Test**: Open a public album whose earliest picture cannot be shown and whose next picture can. The library card shows the picture that can be shown. Inside the album, the picture that cannot be shown displays the failure sentence, and the album count is unchanged.

**Acceptance Scenarios**:

1. **Given** a public album whose first picture cannot be shown and a later picture can, **When** a signed-out person views the library, **Then** the album card shows the later picture, and the album's picture count still includes the picture that cannot be shown.
2. **Given** an album card whose cover cannot be loaded, **When** the library is shown, **Then** the card shows `This picture cannot be shown.` in the picture area.
3. **Given** a picture inside an album cannot be loaded, **When** the person views the album and then enlarges that picture, **Then** both the card and the enlarged layer show `This picture cannot be shown.`, and the album stays open underneath.
4. **Given** every picture in an album can be shown, **When** the person views the library and the album, **Then** each cover and each picture is the picture itself, with no failure sentence.

---

### User Story 3 - Read every name and every next step (Priority: P2)

Buttons name the action. Errors sit next to the field that failed and say what to do. A shortened album name or title still offers the full name. Empty places say what they are and what to do next.

**Why this priority**: A shortened name and an error far from the field make people repeat work or pick the wrong album.

**Independent Test**: Create an album with a long name, shorten it in the library, and still read the full name. Submit an empty album name and read the correction under the field without leaving the panel.

**Acceptance Scenarios**:

1. **Given** an album name is shortened to one line, **When** the person points at that name or moves the keyboard to it, **Then** the full name is available.
2. **Given** the New album panel, **When** the person submits an empty name or a name already in use, **Then** the message sits under the Name field and the panel stays open.
3. **Given** a place with nothing in it, **When** the person views it, **Then** they see the empty message from the Screens section and one next action when they are allowed to take it.
4. **Given** the delete confirmation, **When** it is open, **Then** the confirming button says `Delete` and the title is `Delete this picture?`.

---

### User Story 4 - Use the organizer on a narrow window (Priority: P2)

On a narrow window every control can be tapped, text stays on one line, and the page does not scroll sideways. Tapping a field does not zoom the whole page. When the person has asked their device to reduce motion, nothing slides or scales on its own.

**Why this priority**: The same organizer is used on a phone. A control that is too small, or a page that jumps when a field is tapped, stops the task.

**Independent Test**: At 320 pixels wide, open an album, the picture menu, and Sign in. Every visible control can be activated, nothing scrolls sideways, and tapping Name does not zoom the page.

**Acceptance Scenarios**:

1. **Given** a window 320 pixels wide, **When** the person visits the library, an album, and an open dialog, **Then** the page does not scroll sideways and every visible control is at least 24 by 24 pixels, with the close control and the main header action at least 44 by 44 pixels.
2. **Given** a narrow window and the sign-in dialog, **When** the person taps Name or Secret, **Then** the page does not zoom.
3. **Given** the person has asked the device to reduce motion, **When** any screen, menu, or dialog opens, **Then** it appears without a slide or a scale.

---

### Edge Cases

- An album whose every stored picture cannot be shown still lists those pictures and shows the failure sentence on the card. Its library cover shows the failure sentence in the picture area rather than a blank card.
- Switching appearance while a picture is enlarged keeps the picture enlarged and does not return the person to the library.
- A notice with a long skipped-count sentence wraps inside the strip. The close control stays at the strip's right end on a wide window and at its top-right on a narrow window.
- The Add pictures list is long enough to overflow the menu. The person can scroll inside that list without the menu leaving the window.
- A picture the person is allowed to see still appears. This feature does not hide it because its cover was replaced by a later picture.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each screen in Screens MUST keep the structure, control order, empty messages, and narrow arrangement from spec 005, plus the additions in that screen's section here. A control that exists but sits in another place MUST NOT meet this requirement (Principle IV, Interface).
- **FR-002**: Who can see an album or a picture, album counts, picture order, ownership, and the two-step delete MUST stay as specs 001 through 004 require. A picture that cannot be shown MUST remain in its album and in the count (Principle I, Code Quality).
- **FR-003**: Every flow in User Story 1 MUST be completable with the keyboard alone. Tab reaches every visible control. Enter or Space activates the focused control. Escape closes the open menu, panel, or dialog (Principle IV, Interface).
- **FR-004**: Closing a menu, panel, dialog, or enlarged picture MUST return the keyboard to the control that opened it.
- **FR-005**: Switching appearance MUST NOT close an open menu, New album panel, dialog, or enlarged picture.
- **FR-006**: The focused control MUST show a visible ring at least 2 pixels thick. The ring MUST be visible against the surface behind it in both appearances.
- **FR-007**: A library cover MUST be the first picture in album order that can be shown. When none can be shown, the cover area shows `This picture cannot be shown.`
- **FR-008**: A picture or cover that cannot be loaded MUST show `This picture cannot be shown.` in that picture's area, on the album card and again when enlarged. The album underneath stays open.
- **FR-009**: A shortened album name or album title MUST still make the full name available, both while the person points at it and while the keyboard is on it.
- **FR-010**: The notice close control MUST sit at the strip's right end on a wide window and at the strip's top-right on a narrow window.
- **FR-011**: Sign in, Create account, and Add pictures MUST each have a close control at the dialog's top-right. The More menu MUST NOT add an extra Cancel row beyond the rows spec 005 lists.
- **FR-012**: Every icon-only control MUST have a spoken name that states the action. The visible words of a labeled control MUST be part of that spoken name.
- **FR-013**: Button labels MUST stay in sentence case and MUST start with the action, matching the labels already used: `Add photos`, `Sign in`, `Sign out`, `Create`, `Delete`, `Cancel`, `Done`, and `Close`.
- **FR-014**: A field error MUST appear under that field and MUST say what to correct. `Could not sign in.` stays under the sign-in title, as spec 005 places it.
- **FR-015**: On a narrow window, every visible control MUST be at least 24 by 24 pixels. The enlarged close control and the main header action MUST be at least 44 by 44 pixels. Those targets MUST NOT overlap.
- **FR-016**: Tapping Name or Secret on a narrow window MUST NOT zoom the page.
- **FR-017**: When the person has asked the device to reduce motion, screens and layers MUST appear without sliding or scaling.
- **FR-018**: Album counts MUST stay the same width as they change, so neighboring text does not jump.
- **FR-019**: From 320 pixels wide upward, no screen scrolls sideways (Principle IV, Interface).
- **FR-020**: Tests MUST fail when FR-003, FR-004, FR-005, FR-007, FR-008, or FR-015 is broken on a rendered screen (Principle II, Testing).

### Key Entities *(include if feature involves data)*

- **Album cover**: The picture shown on a library card. It is the first picture in that album that can be shown. The album's picture count is a separate fact and still includes pictures that cannot be shown.
- **Unshowable picture**: A picture the person is allowed to see, but which cannot be painted. It remains in the album and shows `This picture cannot be shown.`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a keyboard-only pass, a person completes sign-in, creates an album, enlarges a picture, and cancels a deletion without using a pointer. Each close returns them to the control that opened the layer.
- **SC-002**: On the public library, an album that has at least one picture that can be shown never uses an unshowable picture as its cover. Its picture count still includes every picture.
- **SC-003**: For any picture that cannot be loaded, the album card and the enlarged layer both show `This picture cannot be shown.` in 100% of trials.
- **SC-004**: At 320, 375, 640, 960, and 1440 pixels wide, zero screens scroll sideways and zero controls overlap.
- **SC-005**: At 320 pixels wide, 100% of visible controls are at least 24 by 24 pixels, and the enlarged close control and the main header action are at least 44 by 44 pixels.
- **SC-006**: In every case tried, a shortened album name still yields the full name both on point and when the keyboard is on that name.
- **SC-007**: 100% of the acceptance scenarios in specs 001 through 005 that are not changed by FR-007 through FR-011 still pass.

## Assumptions

- Spec 005 remains the layout. This feature fills the interaction gaps it left: focus return, appearance not dismissing an open layer, the notice close position, dialog close controls, the extra More cancel row, a scrolling Add to album list, and the full name on a shortened title.
- The shared color roles from specs 003 and 004 stay. This feature does not introduce a new palette.
- The color sample page from spec 003 is not an organizer screen. It stays out of scope.
- Screen text stays in English, in sentence case, as in specs 001 through 005.
- A picture that cannot be shown is explained. It is not deleted and it is not removed from the count.
- The library cover rule applies to date albums. A named album still uses its first picture as the cover, and that cover shows the failure sentence when that picture cannot be loaded.
- The Add pictures dialog shows `No pictures to add.` only when the owner has no pictures. Pictures already in the album stay visible and marked as added.
- Search, renaming, deleting a named album, and dragging pictures are out of scope.
- Which building blocks supply focus, menus, and dialogs is decided in the plan, within the constitution's Quality Constraints.

## Screens *(mandatory)*

Each screen keeps spec 005's order of blocks. The notes below are the additions this feature requires. Narrow means a window under 640 pixels wide.

### Header (every screen)

- **Structure**: One bar. The title Photo Date Albums is at the left and stays on one line. Controls are at the right, in the spec 005 order.
- **Control placement**: Wide and signed in: New album, Add photos, the appearance switch, Sign out. Wide and signed out: the appearance switch, then Sign in. The focused control shows the ring from FR-006. Switching appearance does not close an open layer.
- **Empty state**: The header is unchanged when the library is empty.
- **Narrow window**: One line. The main action stays visible and is at least 44 by 44 pixels. More opens from the bottom and lists only New album, the appearance switch, and Sign out, with no extra Cancel row.

### Notices (every screen)

- **Structure**: One strip under the header, inside the page width. Skipped count, then the duplicate sentence, then errors, one per line.
- **Control placement**: Close is at the strip's right end. On a narrow window it is at the strip's top-right. Closing the strip leaves the keyboard on the header's main action.
- **Empty state**: No notice means no strip and no gap reserved for one.
- **Narrow window**: Messages wrap inside the strip. Close stays at the top-right and is at least 44 by 44 pixels.

### Signed-out library

- **Structure**: Header, notices, then public date albums by month, then public named albums under Albums.
- **Control placement**: Album cards follow the Album card pattern. No privacy control. Sign in is only in the header.
- **Empty state**: `There are no public photos.` centered, with Sign in directly under it. No grid and no Albums heading.
- **Narrow window**: Two columns. Month and Albums headings span the width. No sideways scroll.

### Sign-in dialog

- **Structure**: Title, message, Name, Secret, the main button, then the mode switch. The dialog sits over the dimmed library.
- **Control placement**: Close is at the top-right. The message is under the title. Name and Secret are labeled fields, and the label and the field are one hit target. Focus moves to Name when the dialog opens. Escape and Close return focus to Sign in.
- **Empty state**: Sign in mode, empty fields, and no message until a failure or a confirmation.
- **Narrow window**: The dialog sits near the top, inset from both sides. Tapping a field does not zoom the page. Close is at least 44 by 44 pixels.

### Signed-in library

- **Structure**: Header, notices, date albums by month, then Albums.
- **Control placement**: New album and Add photos are in the header. Privacy stays inside an owned card at the top-right and does not cover the album name.
- **Empty state**: No pictures and no named albums: `Add photos to organize them by the day they were taken.` with Add photos under it. Pictures but no named albums: the Albums heading plus `No named albums yet. Use New album to make one.`
- **Narrow window**: Two columns. Add photos remains the visible main action.

### Album card

- **Structure**: One picture area, then one line: name or date, the assigned mark when needed, and the count.
- **Control placement**: The whole card except the privacy control opens the album. Privacy is only on an owned card, at the picture area's top-right. A shortened name makes the full name available on point and on keyboard focus. The count does not shift the line when its digits change.
- **Empty state**: A card is not shown for an album with no pictures, except a named album, which uses the named-album empty state.
- **Narrow window**: Two columns. The privacy control stays inside the card and remains at least 24 by 24 pixels.

### Date album and named album

- **Structure**: Header, notices, the title bar, then the picture grid. A date album with no pictures is not shown. A named album with no pictures shows `This album has no pictures.`
- **Control placement**: All albums is at the left of the title bar. The owner of a named album has Add pictures at the right. Picture actions stay in one menu. Add to album scrolls inside the menu when the list is long. A shortened album title makes the full name available on point and on keyboard focus.
- **Empty state**: The named-album message is centered under the title bar, with Add pictures under it for the owner.
- **Narrow window**: The back control is an arrow named All albums. Add pictures is a plus named Add pictures. The picture menu opens from the bottom. Two picture columns.

### Picture card

- **Structure**: One picture area, then one line with the taken time or `Assigned`, and one picture menu.
- **Control placement**: Choosing the picture enlarges it. The menu holds the spec 005 actions. A picture that cannot be loaded shows `This picture cannot be shown.` in the picture area and can still be enlarged.
- **Empty state**: A card exists only for a picture.
- **Narrow window**: Two columns. The menu opens from the bottom. The picture area stays large enough to tap.

### Enlarged picture

- **Structure**: A layer over the dimmed album. The picture is fitted whole, without a shape change.
- **Control placement**: Close is at the top-right, at least 44 by 44 pixels, and does not cover the picture when the window has room. Close, the backdrop, and Escape return to the same album and to the picture control that opened the layer.
- **Empty state**: `This picture cannot be shown.` in the center. Close stays at the top-right.
- **Narrow window**: The same layout. Close stays at least 44 by 44 pixels inside the margin.

### Delete confirmation

- **Structure**: Title `Delete this picture?`, a small copy of the picture, `It will be removed from every album.`, any error, then Cancel and Delete.
- **Control placement**: Focus starts on Cancel. Delete is the confirming action. Escape and Cancel return focus to Picture actions. A failed delete keeps the dialog and shows the reason inside it.
- **Empty state**: Not applicable.
- **Narrow window**: Delete is stacked above Cancel. Both span the dialog width and are at least 44 pixels tall.

### Add pictures dialog

- **Structure**: Title `Add pictures`, a grid of the owner's pictures, then Done.
- **Control placement**: Close is at the top-right. Done is at the bottom-right. A square that cannot be loaded shows `This picture cannot be shown.` and can still be chosen.
- **Empty state**: When the owner has no pictures at all, the dialog shows `No pictures to add.` under the title and Done remains. When every picture is already in the album, those pictures stay in the grid and are marked as added.
- **Narrow window**: The dialog sits at the bottom edge. The grid has three columns. Close and Done are at least 44 pixels tall.
