# Feature Specification: Client Visual Style

**Feature Branch**: `007-client-visual-style`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "使用 https://www.figma.com/site/JlH1n5nv4rdnNUHbmksrmk/Untitled?node-id=0-3 风格样式优化 client 所有页面"

## User Scenarios & Testing *(mandatory)*

This feature changes the look of every page a person can open. The look comes from the linked reference. Specs 001 through 006 still decide who can see an album or a picture, which pictures an album contains, the words on each screen, the order of blocks, where each control sits, the empty messages, the narrow arrangement, and how a person finishes a task with the keyboard. Under the constitution's Governance section, this spec follows Principle IV, Interface, for every screen in the Screens section.

### User Story 1 - See the reference look on every page (Priority: P1)

A person opens the organizer and recognizes the reference's look on the library, an album, an enlarged picture, and each dialog. Page surfaces, text, actions, and cards share one set of roles. A photograph keeps its own colors.

**Why this priority**: The reference has no effect until the pages a person actually opens are painted with it.

**Independent Test**: Open the signed-in library, a date album, an enlarged picture, the sign-in dialog, and the delete confirmation. Each page uses the reference's page background, text pairing, action colors, card shape, and type scale. The photograph itself is unchanged.

**Acceptance Scenarios**:

1. **Given** the reference's visual rules are known, **When** a person views the signed-out library, the signed-in library, an album, and an enlarged picture, **Then** each page uses that reference's page background, paired text, action colors, card shape, type scale, spacing, and surface elevation.
2. **Given** a photograph is showing on a card or enlarged, **When** the person looks at it, **Then** the photograph keeps its own colors and the frame around it uses the reference.
3. **Given** any page in the Screens section, **When** a person looks for a one-off color, **Then** the page uses only the roles taken from the reference.

---

### User Story 2 - Keep the current tasks while the look changes (Priority: P1)

A person can still sign in, add photos, make an album, open it, enlarge a picture, delete a picture, change privacy, switch appearance, and close a notice. The words, the order of blocks, and the place of each control stay as specs 005 and 006 describe them.

**Why this priority**: A restyle that moves a control or rewrites a message makes people relearn a product that already works.

**Independent Test**: With the new look applied, complete sign-in, album creation, picture enlargement, and a cancelled deletion. Each step ends where specs 005 and 006 say it ends, with the same words.

**Acceptance Scenarios**:

1. **Given** the new look is applied, **When** a person signs in, creates an album, enlarges a picture, and cancels a deletion, **Then** each task has the same outcome and the same words as specs 005 and 006.
2. **Given** any screen in the Screens section, **When** it is shown, **Then** its blocks stay in the spec 006 order and each control stays where spec 006 places it.
3. **Given** an empty library, an empty named album, a failed picture, or a field error, **When** the person views it, **Then** the message is the sentence spec 006 already uses.

---

### User Story 3 - Switch appearance without leaving the page (Priority: P2)

A person still switches the whole organizer between the light appearance and the dark appearance and stays on the page they were using. Both appearances use the reference's roles. Text stays readable on its paired background.

**Why this priority**: The organizer already offers both appearances. A restyle that drops one of them removes a choice the person has today.

**Independent Test**: Open an album, switch appearance, and confirm the same album is still open. In both appearances, body text on its background meets a contrast of at least 4.5 to 1.

**Acceptance Scenarios**:

1. **Given** any page is open, **When** the person switches appearance, **Then** the same page shows the other appearance and the person is not taken elsewhere or signed out.
2. **Given** either appearance, **When** the person reads text on its paired background, **Then** every text-and-background pair meets a contrast of at least 4.5 to 1.
3. **Given** either appearance, **When** a control is focused, **Then** the focus ring is at least 2 pixels thick and is visible against the surface behind it.

---

### Edge Cases

- An empty library, an empty named album, and a library with no public photos keep their current sentences and remain readable in both appearances.
- A picture that cannot be shown still shows `This picture cannot be shown.` The sentence stays readable on the picture area.
- A delete confirmation stays distinct from a primary action in both appearances. Switching appearance does not confirm or cancel the delete.
- A notice with a long sentence still wraps inside the strip. The close control stays where spec 006 places it.
- From 320 pixels wide upward, no page scrolls sideways, and every visible control keeps the hit size spec 006 requires.
- When the person has asked the device to reduce motion, pages and layers still appear without sliding or scaling.
- The colors inside a photograph stay the photograph's own colors in both appearances.
- The color sample page shows the same roles the organizer uses. It does not become an organizer screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every screen in the Screens section MUST use one shared set of visual roles taken from the reference: page background, paired text, primary action, secondary action, card surface, danger action, type scale, spacing, corner shape, and surface elevation (Principle IV, Interface).
- **FR-002**: The reference is the linked site `https://www.figma.com/site/JlH1n5nv4rdnNUHbmksrmk/Untitled?node-id=0-3`. The page background, paired text, primary action, secondary action, card surface, type scale, spacing, and corner shape MUST be the values in that file. Those values are read from the file. They are not listed here yet: on 2026-10-21 the connected account was not an editor, and the file refused the read. Until the file owner shares it with that account as an editor, this requirement cannot be checked, and no substitute palette is used.
- **FR-003**: Each screen MUST keep the structure, control order, words, empty messages, and narrow arrangement from spec 006. A control that exists but sits in another place MUST NOT meet this requirement (Principle IV, Interface).
- **FR-004**: Who can see an album or a picture, album counts, picture order, ownership, and the two-step delete MUST stay as specs 001 through 004 require (Principle I, Code Quality).
- **FR-005**: Keyboard completion, focus return, the appearance switch leaving an open layer in place, the full name on a shortened title, and the failure sentence MUST stay as spec 006 requires.
- **FR-006**: The light appearance and the dark appearance MUST both remain. Switching appearance MUST keep the person on the same page.
- **FR-007**: In both appearances, every text-and-background pair MUST meet a contrast of at least 4.5 to 1. Borders and the focus ring are visible in both appearances and are not held to that text contrast rule.
- **FR-008**: A photograph MUST keep its own colors. The frame, card, and page around it MUST use the shared roles.
- **FR-009**: On a narrow window, every visible control MUST stay at least 24 by 24 pixels, and the enlarged close control and the main header action MUST stay at least 44 by 44 pixels. From 320 pixels wide upward, no screen scrolls sideways (Principle IV, Interface).
- **FR-010**: The focused control MUST show a visible ring at least 2 pixels thick against the new surfaces in both appearances.
- **FR-011**: The color sample page MUST show the same roles the organizer uses after this change. It MUST NOT replace the organizer screens.
- **FR-012**: Tests MUST fail when FR-001, FR-003, FR-006, FR-007, or FR-009 is broken on a rendered screen (Principle II, Testing).

### Key Entities

- **Reference**: The linked site. It is the source of the visual roles. It does not add pages, tasks, or words.
- **Visual role**: A named purpose, such as page background, paired text, primary action, secondary action, card surface, or danger action. Every screen uses these roles. A one-off color is not a role.
- **Photograph**: The picture the person stored. Its colors are not a visual role and are not repainted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the signed-in library, a date album, an enlarged picture, the sign-in dialog, and the delete confirmation, a side-by-side check against the reference matches the page background, text pairing, action colors, card corner shape, and type scale in 100% of those pages.
- **SC-002**: In both appearances, 100% of text-and-background pairs meet a contrast of at least 4.5 to 1.
- **SC-003**: At 320, 375, 640, 960, and 1440 pixels wide, zero screens scroll sideways and zero controls fall below the hit sizes in FR-009.
- **SC-004**: Switching appearance on an open album, an enlarged picture, or a delete confirmation leaves that same layer open in 100% of trials.
- **SC-005**: 100% of the acceptance scenarios in specs 001 through 006 that are not about color still pass.

## Assumptions

- "风格样式" means the reference's color, type, spacing, corner shape, and surface elevation. It does not add screens, change who can see a picture, or rewrite the words.
- Specs 005 and 006 remain the layout and the interaction. This feature replaces the shared color set from specs 003 and 004 with the roles taken from the reference.
- Both appearances stay. The reference's look is applied to the light appearance and to the dark appearance through the same roles. The appearance switch stays in the header where spec 006 places it.
- Screen text stays in English, in sentence case, as in specs 001 through 006.
- Search, renaming, deleting a named album, and dragging pictures stay out of scope.
- The color sample page from spec 003 stays a sample. It shows the new roles and is not laid out as an organizer screen.
- The visual rules are read from the linked file. A written description does not stand in for it. On 2026-10-21 the connected account was not an editor, so the file refused the read. No color, type size, or corner size is invented in its place.

## Screens *(mandatory)*

Each screen keeps spec 006's blocks, control placement, empty message, and narrow arrangement. The visual treatment on every screen is the shared roles from FR-001, using the file values required by FR-002. Narrow means a window under 640 pixels wide.

### Header (every screen)

- **Structure**: One bar. The title Photo Date Albums is at the left and stays on one line. Controls are at the right, in the spec 006 order.
- **Control placement**: Wide and signed in: New album, Add photos, the appearance switch, Sign out. Wide and signed out: the appearance switch, then Sign in. The focused control shows the ring from FR-010.
- **Empty state**: The header is unchanged when the library is empty.
- **Narrow window**: One line. The main action stays visible and is at least 44 by 44 pixels. More opens from the bottom and lists only New album, the appearance switch, and Sign out.

### Notices (every screen)

- **Structure**: One strip under the header, inside the page width. Skipped count, then the duplicate sentence, then errors, one per line.
- **Control placement**: Close is at the strip's right end. On a narrow window it is at the strip's top-right.
- **Empty state**: No notice means no strip and no gap reserved for one.
- **Narrow window**: Messages wrap inside the strip. Close stays at the top-right and is at least 44 by 44 pixels.

### Signed-out library

- **Structure**: Header, notices, then public date albums by month, then public named albums under Albums.
- **Control placement**: Album cards follow the Album card pattern. No privacy control. Sign in is only in the header.
- **Empty state**: `There are no public photos.` centered, with Sign in directly under it.
- **Narrow window**: Two columns. Month and Albums headings span the width. No sideways scroll.

### Sign-in dialog

- **Structure**: Title, message, Name, Secret, the main button, then the mode switch. The dialog sits over the dimmed library.
- **Control placement**: Close is at the top-right. The message is under the title. Focus moves to Name when the dialog opens.
- **Empty state**: Sign in mode, empty fields, and no message until a failure or a confirmation.
- **Narrow window**: The dialog sits near the top, inset from both sides. Tapping a field does not zoom the page. Close is at least 44 by 44 pixels.

### Signed-in library

- **Structure**: Header, notices, date albums by month, then Albums.
- **Control placement**: New album and Add photos are in the header. Privacy stays inside an owned card at the top-right.
- **Empty state**: No pictures and no named albums: `Add photos to organize them by the day they were taken.` with Add photos under it. Pictures but no named albums: the Albums heading plus `No named albums yet. Use New album to make one.`
- **Narrow window**: Two columns. Add photos remains the visible main action.

### Album card

- **Structure**: One picture area, then one line: name or date, the assigned mark when needed, and the count.
- **Control placement**: The whole card except the privacy control opens the album. Privacy is only on an owned card, at the picture area's top-right.
- **Empty state**: A card is not shown for an album with no pictures, except a named album, which uses the named-album empty state.
- **Narrow window**: Two columns. The privacy control stays inside the card and remains at least 24 by 24 pixels.

### Date album and named album

- **Structure**: Header, notices, the title bar, then the picture grid. A date album with no pictures is not shown. A named album with no pictures shows `This album has no pictures.`
- **Control placement**: All albums is at the left of the title bar. The owner of a named album has Add pictures at the right. Picture actions stay in one menu.
- **Empty state**: The named-album message is centered under the title bar, with Add pictures under it for the owner.
- **Narrow window**: The back control is an arrow named All albums. Add pictures is a plus named Add pictures. The picture menu opens from the bottom. Two picture columns.

### Picture card

- **Structure**: One picture area, then one line with the taken time or `Assigned`, and one picture menu.
- **Control placement**: Choosing the picture enlarges it. A picture that cannot be loaded shows `This picture cannot be shown.` in the picture area.
- **Empty state**: A card exists only for a picture.
- **Narrow window**: Two columns. The menu opens from the bottom.

### Enlarged picture

- **Structure**: A layer over the dimmed album. The picture is fitted whole, without a shape change.
- **Control placement**: Close is at the top-right, at least 44 by 44 pixels. Close, the backdrop, and Escape return to the picture that opened the layer.
- **Empty state**: `This picture cannot be shown.` in the center. Close stays at the top-right.
- **Narrow window**: The same layout. Close stays at least 44 by 44 pixels inside the margin.

### Delete confirmation

- **Structure**: Title `Delete this picture?`, a small copy of the picture, `It will be removed from every album.`, any error, then Cancel and Delete.
- **Control placement**: Focus starts on Cancel. Delete is the confirming action and uses the danger role.
- **Empty state**: Not applicable.
- **Narrow window**: Delete is stacked above Cancel. Both span the dialog width and are at least 44 pixels tall.

### Add pictures dialog

- **Structure**: Title `Add pictures`, a grid of the owner's pictures, then Done.
- **Control placement**: Close is at the top-right. Done is at the bottom-right.
- **Empty state**: When the owner has no pictures at all, the dialog shows `No pictures to add.` under the title and Done remains.
- **Narrow window**: The dialog sits at the bottom edge. The grid has three columns. Close and Done are at least 44 pixels tall.

### Color sample

- **Structure**: The sample lists every visual role with its paired text, in both appearances. It is not an organizer screen.
- **Control placement**: The appearance switch on the sample changes only the sample's appearance.
- **Empty state**: Not applicable. The sample always lists the roles.
- **Narrow window**: The role list stays on the page width and does not scroll sideways.
