# Feature Specification: Organizer Screen Layout

**Feature Branch**: `005-organizer-screen-layout`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "起一份新功能，描述里直接写屏幕，不写数据。每个屏幕一段，四项固定内容：结构：从上到下有哪几块，先后顺序。例如相册页：页头 → 日期分组网格 → 命名相册区；创建相册入口放页头，不占第一屏。控件位置：每个控件靠着什么放。例如公开/私有切换在卡片内右上角，不是卡片下方一整条；照片操作收进一个菜单，卡片上只留图和一行信息。空状态：没照片、没相册、未登录各显示什么、放在哪。窄屏：宽度低于某个值时网格几列、页头按钮怎么排、操作菜单变成什么。"

## User Scenarios & Testing *(mandatory)*

This feature replaces every organizer screen described by specs 001 through 004 with the layout in the Screens section below. A person can still do everything those specs allow. What changes is where each thing sits on the screen and how a person reaches it. Under the constitution's Governance section, adopting this spec ends the Principle IV exemption for the header, the signed-out library, the account forms, the signed-in library, the date album, the named album, the enlarged picture, and the notices.

### User Story 1 - Scan the library at a glance (Priority: P1)

A signed-in person opens the organizer and sees their albums as a clean grid of cards. Each card shows a picture and one line of text. Nothing hangs below a card, and no form sits above the albums. The date albums come first, grouped by month, and the named albums follow.

**Why this priority**: The library is the first screen every signed-in person sees. Today a create-album form takes the top of that screen, and a full-width privacy button hangs below each card. Fixing this screen fixes most of what a person sees.

**Independent Test**: Sign in with a library that has date albums in two months, at least two named albums, and one album the person owns. Open the library at 1280 by 800 pixels. Confirm that the first row of album cards is visible without scrolling, each card shows one line of text, and the privacy control sits in the card's top-right corner.

**Acceptance Scenarios**:

1. **Given** a signed-in person with date albums and named albums, **When** they open the library, **Then** the screen shows the header, then the month-grouped date albums, then the named albums, in that order.
2. **Given** a signed-in person, **When** they open the library, **Then** no form for naming an album appears on the screen until they choose New album in the header.
3. **Given** an album the signed-in person owns, **When** they view its card, **Then** a privacy control showing Private or Public sits inside the card at its top-right corner, over the picture, and nothing is attached below the card.
4. **Given** an album the signed-in person does not own, **When** they view its card, **Then** the card shows no privacy control.
5. **Given** any album card, **When** it is shown at any window width, **Then** the text under the picture fits on one line and does not wrap.

---

### User Story 2 - Act on a picture from its menu (Priority: P1)

Inside an opened album, a person sees a grid of pictures. Choosing a picture enlarges it. Every other action for that picture is in one menu at the corner of its card. Deleting asks for confirmation in a dialog, not in a row of buttons squeezed into the card.

**Why this priority**: Today each picture card carries View, Delete, and one Place in button per named album. That row wraps and grows with every new album. One menu per card keeps every card the same size, however many albums the person has.

**Independent Test**: Open a date album the person owns while they have two named albums. Confirm each picture card shows the picture, one line of text, and one menu control. Open the menu, confirm it lists the picture's actions, choose Delete, choose Cancel in the dialog, and confirm the picture is still there.

**Acceptance Scenarios**:

1. **Given** an opened album, **When** a person chooses a picture's image, **Then** that picture opens enlarged.
2. **Given** a picture the signed-in person owns, **When** they open its menu, **Then** the menu lists the actions that apply to it: Mark picture public when it is not public, Add to album when they have a named album and the open album is a date album, and Delete as the last item.
3. **Given** a picture the person does not own, **When** they view its card, **Then** the card shows no menu control.
4. **Given** the person chooses Delete from a picture's menu, **When** the confirmation dialog opens, **Then** the dialog shows a small copy of that picture, says that the picture will be removed from every album, and offers Cancel and Delete. Focus starts on Cancel.
5. **Given** the confirmation dialog is open, **When** the person chooses Cancel or presses Escape, **Then** the dialog closes and the picture stays in every album it belongs to.
6. **Given** the confirmation dialog is open, **When** the person chooses Delete and the deletion fails, **Then** the dialog stays open, shows the reason inside the dialog above its buttons, and the picture stays on screen.
7. **Given** the person chooses Delete and the deletion succeeds, **When** the dialog closes, **Then** that picture's card is gone and the count in the album title bar is updated.
8. **Given** the person owns a named album, **When** they open that named album, **Then** an Add pictures control sits at the right end of the album title bar.

---

### User Story 3 - Sign in without forms covering the public library (Priority: P2)

A person who is not signed in sees the public pictures straight away. The way to sign in or create an account is one control in the header. Choosing it opens a dialog with the form, and the library stays behind it.

**Why this priority**: Today two full forms sit above the public library, so a visitor sees forms before any picture. Visitors come to look at pictures, and only some of them sign in.

**Independent Test**: Sign out, open the organizer, and confirm the first thing below the header is the public grid. Choose Sign in, enter a wrong secret, and confirm the failure message appears inside the dialog. Switch the dialog to Create account and confirm the form changes without leaving the dialog.

**Acceptance Scenarios**:

1. **Given** a person who is not signed in, **When** they open the organizer, **Then** the screen shows the header and then the public albums, with no account form on the page.
2. **Given** the signed-out screen, **When** the person chooses Sign in in the header, **Then** a dialog opens in the middle of the window with Name, Secret, a Sign in button, and a link to switch to Create account.
3. **Given** the sign-in dialog, **When** sign-in fails, **Then** the message `Could not sign in.` appears inside the dialog, directly under its title, and the dialog stays open.
4. **Given** the person creates an account in the dialog, **When** creation succeeds, **Then** the dialog switches to Sign in with the new name already filled in and says the account was created.
5. **Given** the sign-in dialog, **When** sign-in succeeds, **Then** the dialog closes and the signed-in library replaces the public library.

---

### User Story 4 - Use the organizer in a narrow window (Priority: P2)

A person uses the organizer in a window narrower than 640 pixels, such as a phone. The grids drop to two columns. The header keeps the title and the main action on one line and puts the other controls in one menu. Picture menus open as a panel from the bottom edge.

**Why this priority**: Today a narrow window wraps the header buttons under the title and wraps picture action rows inside the cards. A person on a phone should get the same screens, arranged to fit.

**Independent Test**: Set the window to 375 pixels wide and open the library, an album, a picture menu, the delete dialog, and the enlarged picture. Confirm two-column grids, a one-line header, a bottom panel for the picture menu, and no horizontal scrolling on any screen.

**Acceptance Scenarios**:

1. **Given** a window narrower than 640 pixels, **When** the library or an album is shown, **Then** the card grid has exactly two columns.
2. **Given** a narrow window and a signed-in person, **When** the header is shown, **Then** it is one line: the title at the left, then Add photos and one More control at the right. New album, the appearance switch, and Sign out are inside More.
3. **Given** a narrow window, **When** the person opens a picture menu, **Then** the menu opens as a panel along the bottom edge of the window. It lists the same actions with full-width rows and has Cancel at the bottom.
4. **Given** a narrow window, **When** the delete confirmation or the sign-in dialog opens, **Then** it spans the window width minus a margin, and its buttons are stacked full-width with the main action on top.
5. **Given** any screen in a window from 320 to 639 pixels wide, **When** it is shown, **Then** the page does not scroll sideways.

---

### User Story 5 - Reach every library action from the header (Priority: P3)

A signed-in person adds photos, creates a named album, switches appearance, and signs out from controls in the header, in the same place on every screen.

**Why this priority**: The header is on every screen, so placing its controls once makes them easy to find. Today the appearance switch reads only `light` and does not say what it will do.

**Independent Test**: Sign in and open the library, then an album. Confirm the header controls are the same and in the same order on both screens. Choose New album, enter a name that is already taken, and confirm the message appears under the name field inside the panel.

**Acceptance Scenarios**:

1. **Given** a signed-in person on any screen, **When** the header is shown in a wide window, **Then** its right side shows, from left to right: New album, Add photos, the appearance switch, and Sign out.
2. **Given** the person chooses New album, **When** the panel opens, **Then** it hangs directly below the New album control with a Name field, Create, and Cancel, and it covers the screen beneath it without moving that screen down.
3. **Given** the New album panel, **When** the name is empty, too long, or already used, **Then** the message appears directly under the Name field and the panel stays open.
4. **Given** the New album panel, **When** the album is created, **Then** the panel closes and the new album's card appears in the named albums section.
5. **Given** the appearance switch, **When** the screen is light, **Then** the switch says Dark appearance. When the screen is dark, it says Light appearance.

---

### Edge Cases

- An album name too long for one line is cut short with an ellipsis on the card and in the album title bar. The full name is available on hover and to screen readers.
- An assigned-date album still states that the date was assigned. When the line has no room for the words, it shows a short mark that carries the full words on hover and for screen readers.
- A person with many named albums sees Add to album open a list that scrolls inside the menu. The menu does not grow past the window.
- A person with no named albums does not see Add to album in the picture menu.
- A picture for which the person has no actions shows no menu control. Choosing its image still enlarges it.
- Resizing the window across 640 pixels while a menu is open closes the menu. Resizing while a dialog is open keeps the dialog open and arranges it for the new width.
- Resizing while a picture is enlarged fits the picture again, as spec 002 requires.
- Every menu, panel, and dialog closes with Escape and returns focus to the control that opened it.
- Switching appearance does not close an open menu, dialog, or enlarged picture, and does not change the screen, as spec 004 requires.
- Deleting the last picture of a date album closes the dialog and returns the person to the library, where that date album is gone.
- Deleting the last picture of a named album leaves the named album open, showing the empty album state.
- A notice and an open dialog can be on screen at the same time. The dialog stays on top.

## Screens *(mandatory, Principle IV, Interface)*

Every screen below is described by its structure, where each control sits, its empty state, and its arrangement in a narrow window. A narrow window is narrower than 640 pixels. A wide window is 640 pixels or wider. Shared patterns are defined once and referred to by name.

### Shared pattern: Album card

- **Structure**: A rectangle with a square picture filling its top. One line of text sits below the picture inside the card. Cards in one grid are the same width and height.
- **Control placement**: For an album the signed-in person owns, the privacy control sits inside the card at the top-right corner, over the picture. It shows the album's current state as a short label, Private or Public. Choosing it switches the state, and its accessible name states the action, Mark album public or Make album private. No control sits below or beside the card. Choosing anywhere else on the card opens the album.
- **Text line**: A date album shows its date, then its photo count, then the assigned-date mark when the date was assigned. A named album shows its name, then its photo count.
- **Empty state**: A named album with no pictures shows a plain placeholder of the same square size in place of the picture, and a count of 0.
- **Narrow window**: Same content. The text line uses the smaller card width and cuts the name or date short with an ellipsis. The count is always visible.

### Shared pattern: Picture card

- **Structure**: A rectangle with a square picture filling its top. One line of text sits below the picture inside the card.
- **Control placement**: Choosing the picture enlarges it. When the person has at least one action for this picture, a menu control, shown as three dots and named Picture actions, sits at the right end of the text line. The text line shows the time the picture was taken at its left end. When no taken time exists, it shows the assigned-date mark.
- **Menu**: In a wide window, the menu drops down from the menu control and is aligned to the card's right edge. Items, top to bottom: Mark picture public, when the person owns it and it is not public. Add to album, when the person has named albums and the open album is a date album; it opens a list of their named albums beside the menu. Then a separator, then Delete, shown as a destructive action, when the person owns the picture.
- **Empty state**: Not applicable. A picture card exists only for a picture.
- **Narrow window**: The menu opens as a panel from the bottom edge of the window, with one full-width row per item and Cancel as the last row. Add to album replaces the panel's rows with the named album list and a Back row.

### Shared pattern: Delete confirmation

- **Structure**: A dialog in the middle of the window over a dimmed screen. From top to bottom: the title `Delete this picture?`, a small copy of the picture, the sentence `It will be removed from every album.`, an error area that is empty unless deletion fails, then the buttons.
- **Control placement**: In a wide window, Cancel and Delete sit at the dialog's bottom-right, Cancel first and Delete last. Delete is styled as destructive. Focus starts on Cancel.
- **Empty state**: Not applicable.
- **Narrow window**: The dialog spans the window width minus a 16-pixel margin on each side. Delete and Cancel are stacked full-width, Delete on top.

### Header (every screen)

- **Structure**: One bar across the top of every screen. The title, Photo Date Albums, is at the left. The controls are at the right. The title is never wrapped onto two lines.
- **Control placement, signed in, wide window**: From left to right after the title: New album, Add photos as the main action, the appearance switch, and Sign out. New album opens a panel that hangs directly below it. The panel holds a Name field, its message area, then Cancel and Create at its bottom-right.
- **Control placement, signed out, wide window**: The appearance switch, then Sign in as the main action. Add photos and New album are not shown.
- **Appearance switch**: Its label states the appearance it will switch to, Dark appearance or Light appearance.
- **Empty state**: The header has no empty state. It is the same with an empty library.
- **Narrow window**: Still one line. The title is at the left in a smaller size. The main action stays visible at the right: Add photos when signed in, Sign in when signed out. Next to it is one control named More. More opens a menu from the bottom edge holding the remaining header controls in the wide-window order. Choosing New album from More opens the New album panel from the bottom edge.

### Notices (every screen)

- **Structure**: Messages about the last add batch sit in one strip directly under the header, above everything else on the screen and inside the page width. These are the skipped count, the duplicate picture message, and storage errors from spec 001 and spec 002. When more than one applies, they are listed in that strip one per line. The skipped count and the duplicate message use the information style. Errors use the destructive style.
- **Control placement**: A close control sits at the strip's right end. The strip stays until the person closes it or adds another batch.
- **Empty state**: With no notice, the strip is absent and takes no space.
- **Narrow window**: Same position and order. Long messages wrap inside the strip. The close control stays at the top-right of the strip.

### Signed-out library

- **Structure**: Header, notices, then the public albums. The public albums are the month-grouped date albums, then the public named albums under the heading Albums, the same as the signed-in library below. The page holds no account form.
- **Control placement**: Sign in is in the header. Album cards follow the Album card pattern and show no privacy control.
- **Empty state**: With no public albums, the area below the header shows one centered message, `There are no public photos.`, with a Sign in button directly under it. No grid, month heading, or Albums heading is shown.
- **Narrow window**: Two-column grids. Month headings and the Albums heading span the full width.

### Sign-in dialog

- **Structure**: A dialog in the middle of the window over the dimmed signed-out library. From top to bottom: the title Sign in or Create account, the message area, the Name field, the Secret field, the main button, then a one-line link that switches mode. In Sign in mode the link says Create an account. In Create account mode it says Sign in instead.
- **Control placement**: The main button spans the dialog's width under the fields. A close control sits at the dialog's top-right corner. The message area sits directly under the title. It shows `Could not sign in.`, `An account with that name already exists.`, the empty name or secret message, or the account-created confirmation.
- **Empty state**: When it first opens, the dialog is in Sign in mode with empty fields and an empty message area that takes no space.
- **Narrow window**: The dialog spans the window width minus a 16-pixel margin on each side and sits near the top of the window, so the on-screen keyboard does not cover the fields.

### Signed-in library

- **Structure**: Header, notices, then the date albums grouped under year and month headings, newest first. Then the heading Albums with the person's named albums. The page holds no create-album form.
- **Control placement**: New album and Add photos are in the header. Album cards follow the Album card pattern, with the privacy control only on cards the person owns.
- **Grid**: In a wide window, cards are at least 200 pixels wide, with as many columns as fit, up to five. Gaps between cards are equal horizontally and vertically.
- **Empty state, no pictures and no named albums**: The area below the header shows one centered message, `Add photos to organize them by the day they were taken.`, with an Add photos button directly under it. No month heading, grid, or Albums heading is shown.
- **Empty state, pictures but no named albums**: The date albums are shown. The Albums heading is followed by one line, `No named albums yet. Use New album to make one.` No empty card is shown.
- **Empty state, named albums but no pictures**: This happens when every picture is deleted and named albums remain. The no-pictures message from above takes the place of the date albums, and the Albums section follows it.
- **Narrow window**: Two-column grids. Month headings and the Albums heading span the full width.

### Date album

- **Structure**: Header, notices, the album title bar, then the picture grid in the order the pictures were taken.
- **Album title bar**: At the left, a back control named All albums with a leading arrow, then the date, then the photo count. The assigned-date mark follows the count when the date was assigned.
- **Control placement**: Picture cards follow the Picture card pattern. Deletion uses the Delete confirmation pattern. The title bar has no other controls.
- **Empty state**: A date album is not shown with no pictures. After its last picture is deleted, the person returns to the signed-in library.
- **Narrow window**: The title bar is one line, with the back control shown as an arrow only, named All albums for screen readers. Two-column picture grid.

### Named album

- **Structure**: Header, notices, the album title bar, then the picture grid in the order the album returns.
- **Album title bar**: At the left, the All albums back control, then the album name, then the photo count. For the owner, Add pictures sits at the bar's right end.
- **Add pictures**: Choosing it opens a dialog in the middle of the window. The dialog shows the owner's pictures as a grid of small squares under the title Add pictures, with Done at its bottom-right. Choosing a square adds that picture and marks the square as added. Choosing an already-added picture changes nothing.
- **Control placement**: Picture cards follow the Picture card pattern, without Add to album. Deletion uses the Delete confirmation pattern.
- **Empty state**: With no pictures, the area below the title bar shows one centered message, `This album has no pictures.` For the owner, an Add pictures button sits directly under it. Others see only the message.
- **Narrow window**: Same one-line title bar as the date album. Add pictures becomes a plus icon named Add pictures for screen readers. The Add pictures dialog spans the window width minus a margin, with a three-column grid of squares.

### Enlarged picture

- **Structure**: A layer covering the whole window over a dimmed backdrop, with the picture centered. The picture is fitted to the largest size that shows it whole without changing its shape, as spec 002 requires.
- **Control placement**: A close control sits at the top-right corner of the window, over the backdrop and not over the picture when there is room. Choosing the backdrop or pressing Escape also closes the layer and returns to the same album.
- **Empty state**: When the picture cannot be loaded, the layer shows `This picture cannot be shown.` in the center, and the close control stays at the top-right.
- **Narrow window**: Same layout. The close control stays at the top-right inside a margin and stays at least 44 by 44 pixels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each organizer screen MUST follow its section in Screens for structure, control placement, empty state, and narrow window. A screen that only contains the right controls in other positions MUST NOT meet this requirement (Principle IV, Interface).
- **FR-002**: Every outcome required by specs 001 through 004 MUST remain the same, including visibility, ownership, counts, covers, ordering, the two-step delete, the duplicate rule, and appearance switching. This feature MUST NOT add or remove an album, picture, account, or privacy rule (Principle I, Code Quality).
- **FR-003**: The header MUST show the same controls in the same order on every screen for the same signed-in state.
- **FR-004**: The signed-in library MUST NOT show a create-album form until the person chooses New album.
- **FR-005**: The signed-out library MUST NOT show an account form until the person chooses Sign in.
- **FR-006**: Every album card and picture card MUST show one picture area and exactly one line of text. That text MUST NOT wrap at any window width.
- **FR-007**: The album privacy control MUST sit inside the owner's album card at its top-right corner. Other cards MUST NOT show it.
- **FR-008**: Every picture action other than enlarging MUST be reached through that picture's single menu. A picture card MUST NOT show a separate button per named album.
- **FR-009**: Delete MUST be the last item in a picture menu, separated from the other items, and styled as destructive.
- **FR-010**: Deleting a picture MUST ask for confirmation in the Delete confirmation dialog. Cancel and Escape MUST keep the picture. A failed deletion MUST keep the dialog open with the reason shown inside it.
- **FR-011**: Choosing a picture's image MUST enlarge it. The enlarged layer MUST close by its close control, by its backdrop, or by Escape, and MUST return to the same album.
- **FR-012**: Add-batch notices MUST appear in one strip under the header and MUST stay until closed or until the next batch.
- **FR-013**: Each empty state in Screens MUST show its message in the stated place and MUST NOT show an empty grid or a heading with nothing under it, except the Albums heading with its one-line message.
- **FR-014**: In a narrow window, album and picture grids MUST have exactly two columns, the header MUST stay on one line with the main action and More, and picture menus MUST open from the bottom edge.
- **FR-015**: Screens MUST NOT scroll sideways at any window width from 320 pixels upward.
- **FR-016**: Controls MUST NOT overlap one another, and MUST NOT extend outside the card, bar, strip, menu, or dialog that contains them.
- **FR-017**: Every control, menu, and dialog MUST be usable by keyboard alone. Each menu and dialog MUST close with Escape and return focus to the control that opened it.
- **FR-018**: Every icon-only control MUST have an accessible name that states its action.
- **FR-019**: The appearance switch label MUST name the appearance it switches to.
- **FR-020**: Every screen surface, menu, panel, dialog, and notice MUST use the shared color roles from specs 003 and 004 and stay readable in both appearances.
- **FR-021**: Tests MUST check placement as well as presence. Each placement rule in FR-006, FR-007, FR-014, FR-015, and FR-016 MUST have a check that fails when the rule is broken in a rendered screen (Principle II, Testing).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At window widths of 320, 375, 640, 960, and 1440 pixels, on every screen in Screens, zero controls overlap another control and zero controls extend outside their container.
- **SC-002**: At 1280 by 800 pixels, a signed-in person with at least eight albums sees the first full row of album cards without scrolling.
- **SC-003**: At every width in SC-001, 100% of album and picture cards show their text on one line.
- **SC-004**: In a first-use test with 10 people, at least 9 find and cancel a picture deletion within 30 seconds without help. At least 9 make one of their albums private within 30 seconds without help.
- **SC-005**: In the same test, at least 9 of 10 people who are not signed in find how to sign in within 10 seconds.
- **SC-006**: 100% of the acceptance scenarios in specs 001 through 004 still pass after this feature is adopted.
- **SC-007**: A reviewer who has not seen the organizer sketches each screen from the Screens section alone. For every screen, their sketch matches the built screen in the order of its blocks and the position of each control.
- **SC-008**: Every control on every screen can be reached and used with the keyboard alone, and every menu and dialog returns focus to its opener when closed.

## Assumptions

- The narrow threshold is 640 pixels because common phones in portrait are 320 to 430 pixels wide, and small tablets in portrait start near 640.
- In a wide window the library grid shows up to five columns of cards at least 200 pixels wide. This fits the current 960-pixel page width with four columns.
- Showing the taken time on a picture card and the Private or Public label on the owner's album card uses information the organizer already has. It is not a new data rule.
- The add-batch notice now stays until closed instead of disappearing on the next library view. This is a change of presentation, not of what is reported.
- The Add pictures dialog replaces the current per-picture Add picture buttons for the same rule from spec 002: an owner adds one of their existing pictures to their named album.
- Screen text stays in English, as in specs 001 through 004.
- The shared color sample page from spec 003 is a review page, not an organizer screen. It is out of scope and keeps its current layout.
- Search, sorting choices, renaming or deleting named albums, removing a picture from a named album, multi-select, and drag-and-drop are out of scope.
- Which interface building blocks provide the menus, panels, and dialogs is decided in the plan, within the constitution's Quality Constraints.
