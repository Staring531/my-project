# Feature Specification: Client Web Design

**Feature Branch**: `008-client-web-design`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "使用 web design skill 优化 client"

## Clarifications

### Session 2026-10-21

- Q: Which language does the organizer use, and can a person change it? → A: Chinese by default, with a switch between Chinese and English.

## User Scenarios & Testing *(mandatory)*

This feature changes the look of the organizer a person already uses, and it opens in Chinese. Surfaces are solid, depth comes from a 1-pixel hairline, and one blue accent is used sparingly. A language switch changes every interface sentence between Chinese and English. Specs 001 through 006 still decide who can see an album or a picture, which pictures an album contains, the order of blocks, where each control sits, the meaning of each empty message, and how a person finishes a task with the keyboard. Under the constitution's Governance section, this spec follows Principle IV, Interface, for every screen in the Screens section.

### User Story 1 - See a quiet, consistent organizer (Priority: P1)

A person opens the library, an album, and an enlarged picture and sees one visual language. The page is white in the light appearance and pure black in the dark appearance. Cards and dialogs are separated by a hairline, not by a shadow. The main action is near-black in the light appearance and light in the dark appearance. Blue is reserved for links and small marks.

**Why this priority**: The organizer is the product. A restyle that people never see on the library does not matter.

**Independent Test**: Open the signed-in library, a date album, and an enlarged picture in the light appearance, then switch to the dark appearance. Confirm the page, the cards, and the main action match the rules below, and that a photograph keeps its own colors.

**Acceptance Scenarios**:

1. **Given** the light appearance, **When** a person views the library, an album, and an enlarged picture, **Then** the page background is white, body text is near-black, cards and dialogs have a 1-pixel hairline and no drop shadow, and the main action is a near-black fill with white text.
2. **Given** the dark appearance, **When** the person views those same pages, **Then** the page background is pure black rather than a blue-tinted navy, cards sit on a near-black surface with a 1-pixel hairline, and the main action is a light fill with near-black text.
3. **Given** either appearance, **When** the person looks at Add photos, Sign in, Create, or Done, **Then** that control uses the main-action treatment and is not blue.
4. **Given** a link such as an album name or All albums, **When** it is shown, **Then** it may use the blue accent, and that blue does not fill a button.
5. **Given** a photograph on a card or enlarged, **When** the person looks at it, **Then** the photograph keeps its own colors.

---

### User Story 2 - Keep every current task (Priority: P1)

A person can still sign in, add photos, make an album, open it, enlarge a picture, delete a picture, change privacy, switch appearance, switch language, and close a notice. The order of blocks stays as specs 005 and 006 describe them. The header gains the language switch immediately before the appearance switch. Delete stays visually distinct from the main action.

**Why this priority**: A calmer look that moves a task or changes who can see a picture makes people relearn a product that already works.

**Independent Test**: With the new look applied and Chinese showing, complete sign-in, album creation, picture enlargement, and a cancelled deletion. Each step ends where specs 005 and 006 say it ends. Switch to English and read the same screens in the English sentences.

**Acceptance Scenarios**:

1. **Given** the new look is applied, **When** a person signs in, creates an album, enlarges a picture, and cancels a deletion, **Then** each task has the same outcome as specs 005 and 006, and the words are the active language's sentences.
2. **Given** any screen in the Screens section, **When** it is shown, **Then** its blocks stay in the spec 006 order, and each control stays where spec 006 places it, except the language switch specified in the Header.
3. **Given** the delete confirmation, **When** it is open, **Then** Delete uses a danger treatment that is distinct from the near-black or light main action, and Cancel uses the secondary treatment.
4. **Given** an empty library, an empty named album, a failed picture, or a field error, **When** the person views it, **Then** the message is the active language's form of the sentence spec 006 already uses.

---

### User Story 3 - Read, focus, and finish on a narrow window (Priority: P2)

On a narrow window every control can be tapped, text stays readable, and the page does not scroll sideways. The focused control shows a ring. While a person is still composing a character, Enter does not submit the form. A page that is still loading shows the shape of its content instead of a blank region.

**Why this priority**: The same organizer is used on a phone and with a keyboard. A control that is too small, or an Enter key that sends a half-composed name, stops the task.

**Independent Test**: At 320 pixels wide, open the library and the sign-in dialog. Every visible control is at least 40 by 40 pixels, the page does not scroll sideways, and Enter during character composition does not submit Name.

**Acceptance Scenarios**:

1. **Given** a window 320 pixels wide, **When** the person visits the library, an album, and an open dialog, **Then** the page does not scroll sideways, every visible control is at least 40 by 40 pixels, and the enlarged close control, the notice close control, the dialog close control, and the main header action are at least 44 by 44 pixels.
2. **Given** either appearance, **When** a control is focused, **Then** the ring is 3 pixels thick and visible against the surface behind it.
3. **Given** Name, Secret, or the album name field, **When** the person presses Enter while a character is still being composed, **Then** the character is confirmed and the form is not submitted.
4. **Given** the library or an album is still loading, **When** the person is waiting, **Then** they see quiet blocks in the shape of the cards, not a blank region and not a blocking alert.

---

### User Story 4 - Read Chinese first, then switch to English (Priority: P1)

A person's first visit opens in Chinese. The language switch shows `English`. Choosing it changes the interface to the English sentences, and the switch then shows `中文`. Album names and stored dates stay as they were stored. The choice is remembered on the next visit. Switching language does not close an open page, menu, or dialog.

**Why this priority**: The default language is the first thing a person reads. A switch that leaves the page, or that rewrites a name they typed, breaks the task.

**Independent Test**: Open the organizer with no saved language. The title is `照片日期相册` and the main action is `添加照片` or `登录`. Choose `English`. The title is `Photo Date Albums`. Choose `中文`. The Chinese title returns, and an album name typed in either language is unchanged.

**Acceptance Scenarios**:

1. **Given** a first visit with no saved language, **When** the organizer opens, **Then** every interface sentence is the Chinese form in Interface copy, and the language switch reads `English`.
2. **Given** Chinese is showing, **When** the person chooses `English`, **Then** every interface sentence becomes the English form, the same page stays open, and the switch reads `中文`.
3. **Given** English is showing, **When** the person chooses `中文`, **Then** the Chinese sentences return and the switch reads `English`.
4. **Given** a named album and a date album, **When** the language changes, **Then** the album name and the stored date stay character for character, and the month heading uses the active language.

---

### Edge Cases

- An empty library, an empty named album, and a library with no public photos keep their current sentences and remain readable in both appearances.
- A picture that cannot be shown still shows the active language's form of `This picture cannot be shown.` The sentence stays readable on the picture area.
- Switching appearance or language while a picture is enlarged, a dialog is open, or a delete confirmation is showing keeps that layer open and does not confirm or cancel the delete.
- A notice with a long sentence still wraps inside the strip. The close control stays where spec 006 places it.
- Hovering a card or a button changes its color or its hairline only. The card does not lift, grow, or shrink.
- When the person has asked the device to reduce motion, pages and layers appear without sliding, scaling, or a timed animation.
- From 320 pixels wide upward, no screen scrolls sideways.
- A confirmation of a finished action disappears on its own and never covers the control the person needs next. Two confirmations stack with the newest at the bottom.
- The colors inside a photograph stay the photograph's own colors in both appearances.
- The first visit still opens in the light appearance. After the person switches, the next visit opens in the appearance they chose.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every screen in the Screens section MUST use one shared visual language: a white page in the light appearance, a pure black page in the dark appearance, near-black body text on white, off-white body text on black, a 1-pixel hairline on cards and dialogs, and no drop shadow on cards or buttons (Principle IV, Interface).
- **FR-002**: Add photos, Sign in, Create, and Done MUST use the main-action treatment: near-black fill with white text in the light appearance, and a light fill with near-black text in the dark appearance. Those controls MUST NOT be blue.
- **FR-003**: Cancel, Sign out, New album, the language switch, and the appearance switch MUST use the secondary treatment: a surface fill, a 1-pixel border, and text in the body color. Hover MUST change the fill or the border only.
- **FR-004**: Delete MUST use a danger treatment that stays distinct from the main action and from the blue accent in both appearances. The danger text on its paired background MUST meet a contrast of at least 4.5 to 1.
- **FR-005**: The blue accent MUST be limited to links and small marks. It MUST NOT fill a button, a card, or the page.
- **FR-006**: A card corner MUST be 12 pixels. A button, a field, and a chip corner MUST be 6 pixels, except a fully round chip, which stays fully round. A card in a grid MUST match the height of the cards in its row.
- **FR-007**: The header MUST stay visible while the page scrolls, be 56 pixels tall, and show a 1-pixel hairline along its bottom. The product name is 15 pixels and semibold.
- **FR-008**: Headings MUST be semibold, tighter than body text, and no heavier than semibold. Month and Albums headings are 24 pixels. A card's name line is 16 pixels. Body text and button labels are 14 pixels. Captions are 12 pixels. The type is the type already on the device.
- **FR-009**: Each screen MUST keep the structure, empty messages, and narrow arrangement from spec 006, plus the language switch, loading, and confirmation notes in the Screens section. A control that exists but sits in another place MUST NOT meet this requirement (Principle IV, Interface).
- **FR-010**: Who can see an album or a picture, album counts, picture order, ownership, and the two-step delete MUST stay as specs 001 through 004 require (Principle I, Code Quality).
- **FR-011**: Keyboard completion, focus return, the appearance switch leaving an open layer in place, the full name on a shortened title, and the failure sentence MUST stay as spec 006 requires.
- **FR-012**: In both appearances, every text-and-background pair MUST meet a contrast of at least 4.5 to 1. Borders and the focus ring are visible in both appearances and are not held to that text contrast rule.
- **FR-013**: The focused control MUST show a ring 3 pixels thick, offset from the control, and visible against the surface behind it in both appearances.
- **FR-014**: On a narrow window, every visible control MUST be at least 40 by 40 pixels. The enlarged close control, the notice close control, the dialog close control, and the main header action MUST be at least 44 by 44 pixels. From 320 pixels wide upward, no screen scrolls sideways (Principle IV, Interface).
- **FR-015**: Enter in Name, Secret, or the album name field MUST NOT submit the form while a character is still being composed.
- **FR-016**: While the library or an album is loading, the page MUST show quiet blocks in the shape of the missing cards. A finished create, delete, or privacy change MUST show the active language's confirmation, and that confirmation disappears on its own within 4 seconds. A failure MUST show the active language's form of the sentence spec 006 already uses. No action MAY use a blocking alert.
- **FR-017**: Hover MUST NOT move, scale, or lift a card or a button. When the person has asked the device to reduce motion, screens and layers MUST appear without sliding, scaling, or a timed animation.
- **FR-018**: A photograph MUST keep its own colors. The frame, card, and page around it MUST use the shared language.
- **FR-019**: The light appearance is the appearance on a first visit. After the person switches, the organizer MUST open in the appearance they last chose. Switching MUST keep the person on the same page.
- **FR-020**: The color sample page MUST show the same roles the organizer uses after this change, in both appearances. A one-off color on an organizer screen MUST still be rejected as specs 003 and 004 require.
- **FR-021**: Tests MUST fail when FR-001, FR-002, FR-009, FR-013, FR-014, FR-015, or FR-022 is broken on a rendered screen (Principle II, Testing).
- **FR-022**: The organizer MUST open in Chinese on a first visit. The language switch MUST sit immediately before the appearance switch and MUST read `English` while Chinese is active and `中文` while English is active. Choosing it MUST exchange every interface sentence for the other language's form in Interface copy, keep the person on the same page, and leave album names and stored dates unchanged. The choice MUST be the one used on the next visit.

**Interface copy**. The Chinese form is the default. The English form is the sentence already used by specs 001 through 006. A count inside a sentence stays a numeral.

| English | Chinese |
|---------|---------|
| Photo Date Albums | 照片日期相册 |
| New album | 新建相册 |
| Add photos | 添加照片 |
| Sign in | 登录 |
| Sign out | 退出 |
| Create | 创建 |
| Delete | 删除 |
| Cancel | 取消 |
| Done | 完成 |
| Close | 关闭 |
| More | 更多 |
| Dark appearance | 深色外观 |
| Light appearance | 浅色外观 |
| All albums | 全部相册 |
| Add pictures | 添加照片 |
| Picture actions | 照片操作 |
| Mark picture public | 公开这张照片 |
| Add to album | 加入相册 |
| Back | 返回 |
| Already added | 已加入 |
| Add picture | 添加这张照片 |
| Private | 私密 |
| Public | 公开 |
| Mark album public | 将相册设为公开 |
| Make album private | 将相册设为私密 |
| Assigned | 指定日期 |
| Albums | 相册 |
| Name | 姓名 |
| Secret | 密码 |
| Create account | 创建账号 |
| Create an account | 创建账号 |
| Sign in instead | 改为登录 |
| Could not sign in. | 登录失败。 |
| An account with that name already exists. | 已有同名账号。 |
| Enter an account name and a secret. | 请输入姓名和密码。 |
| Account created. Sign in to continue. | 账号已创建。请登录。 |
| Enter an album name of 1 to 64 characters. | 请输入 1 到 64 个字符的相册名。 |
| An album with that name already exists. | 已有同名相册。 |
| There are no public photos. | 没有公开的照片。 |
| Add photos to organize them by the day they were taken. | 添加照片，按拍摄日期整理。 |
| No named albums yet. Use New album to make one. | 还没有命名相册。使用「新建相册」创建一个。 |
| This album has no pictures. | 此相册没有照片。 |
| No pictures to add. | 没有可添加的照片。 |
| This picture cannot be shown. | 这张照片无法显示。 |
| Delete this picture? | 删除这张照片？ |
| It will be removed from every album. | 它会从所有相册中移除。 |
| Could not delete the picture. | 无法删除这张照片。 |
| 1 item was skipped. | 已跳过 1 项。 |
| N items were skipped. | 已跳过 N 项。 |
| This picture is already in the library. | 这张照片已在库中。 |
| Could not store the photo. | 无法保存这张照片。 |
| Sign in to continue. | 请先登录。 |
| Album created. | 相册已创建。 |
| Picture deleted. | 照片已删除。 |
| Album is now public. | 相册已公开。 |
| Album is now private. | 相册已设为私密。 |
| October 2026 | 2026年10月 |

Every month heading follows that last row: the English month name and the year, or the year, 年, the month number, and 月. The four confirmation sentences are Album created, Picture deleted, Album is now public, and Album is now private.

### Key Entities

- **Visual language**: The shared look of the organizer. It covers the page, the card, the main action, the secondary action, the danger action, the blue accent, the type scale, and the hairline. A one-off color is not part of it.
- **Main action**: The control that completes the step in front of the person: Add photos, Sign in, Create, or Done. In Chinese those labels are 添加照片, 登录, 创建, and 完成.
- **Confirmation**: A short note that a create, delete, or privacy change finished. It is not a notice about skipped files, and it is not a field error. Its four sentences are listed in Interface copy.
- **Language choice**: Chinese or English for interface sentences. It is independent of the light or dark appearance. Album names and stored dates are not part of it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the library, a date album, and an enlarged picture, the light page background is white and the dark page background is pure black in 100% of trials.
- **SC-002**: In 100% of trials, the main action uses the main-action treatment and is not blue, whether it reads 添加照片, 登录, 创建, 完成, Add photos, Sign in, Create, or Done. Album-name links may be blue.
- **SC-003**: In 100% of trials, a card has a 1-pixel hairline, a 12-pixel corner, and no drop shadow, and hovering it does not move it.
- **SC-004**: In both appearances, 100% of text-and-background pairs meet a contrast of at least 4.5 to 1.
- **SC-005**: At 320, 375, 640, 960, and 1440 pixels wide, zero screens scroll sideways. At 320 pixels wide, 100% of visible controls are at least 40 by 40 pixels, and the enlarged close control and the main header action are at least 44 by 44 pixels.
- **SC-006**: Enter during character composition on Name and on the album name submits the form in 0% of trials.
- **SC-007**: With English selected, 100% of the acceptance scenarios in specs 001 through 006 that are not about the previous blue main action still pass. With Chinese selected, those same scenarios pass using the Chinese sentences.
- **SC-008**: On a first visit, 100% of interface sentences are Chinese. After one switch to English and a later visit, 100% of interface sentences are English, and a stored album name is unchanged in both trials.

## Assumptions

- The request optimizes the organizer a person already uses. It does not add a chat, a marketing page, or a second product.
- The look is the default visual language: solid surfaces, hairline borders, device type, and one blue accent. The warm paper editorial language is not used, because this organizer keeps a dark appearance and the request did not ask for a print-like theme.
- Specs 005 and 006 remain the layout and the interaction. This feature replaces the paint of the shared color set from specs 003 and 004. The role names on the sample page stay; their displayed values follow this spec.
- Chinese is the first language. English remains available through the language switch. The English sentences stay in sentence case. Album names, secrets, and stored dates are shown as stored and are not translated. A month heading uses the active language. A server sentence that is not listed in Interface copy is shown as received.
- The language switch uses the secondary treatment. On a wide window it sits immediately before the appearance switch. On a narrow window it sits in More, immediately before the appearance switch, so the header stays one line. Signed out and narrow, More holds the language switch and the appearance switch, and Sign in stays visible.
- Light remains the first appearance, as spec 004 decided. The person's later choice is remembered.
- Dialogs may use a soft shadow so they separate from the page. Cards, buttons, and pictures do not.
- The notice strip still reports skipped files and errors. The confirmation is only for a finished create, delete, or privacy change.
- Search, renaming, deleting a named album, and dragging pictures stay out of scope.
- Spec 007 is a separate draft and is not the source of this look.

## Screens *(mandatory)*

Each screen keeps spec 006's blocks, empty message, and narrow arrangement. Quoted sentences below are the English form. The person sees the active language's form from Interface copy. The visual treatment is FR-001 through FR-008. Narrow means a window under 640 pixels wide.

### Header (every screen)

- **Structure**: One bar, 56 pixels tall, that stays visible while the page scrolls. The title is 照片日期相册 or Photo Date Albums, 15 pixels, semibold, and stays on one line. Controls are at the right. A 1-pixel hairline runs along the bottom.
- **Control placement**: Wide and signed in, from left to right: New album, Add photos, the language switch, the appearance switch, Sign out. Wide and signed out: the language switch, the appearance switch, then Sign in. New album, the language switch, the appearance switch, and Sign out use the secondary treatment. Add photos and Sign in use the main-action treatment. The language switch reads `English` or `中文` as FR-022 requires. Choosing it does not close an open layer. The focused control shows the 3-pixel ring.
- **Empty state**: The header is unchanged when the library is empty.
- **Narrow window**: One line. The main action stays visible and is at least 44 by 44 pixels. Signed in, More lists New album, the language switch, the appearance switch, and Sign out. Signed out, More lists the language switch and the appearance switch, and Sign in stays visible.

### Notices (every screen)

- **Structure**: One strip under the header, inside the page width, with a 1-pixel hairline. Skipped count, then the duplicate sentence, then errors, one per line.
- **Control placement**: Close is at the strip's right end. On a narrow window it is at the strip's top-right.
- **Empty state**: No notice means no strip and no gap reserved for one.
- **Narrow window**: Messages wrap inside the strip. Close stays at the top-right and is at least 44 by 44 pixels.

### Confirmation

- **Structure**: One short sentence naming the finished create, delete, or privacy change.
- **Control placement**: Bottom-right on a wide window, above the page edge, and not covering the main action. It disappears on its own within 4 seconds. The newest confirmation is the lower one.
- **Empty state**: No finished action means no confirmation.
- **Narrow window**: Bottom-center, inside the page width.

### Signed-out library

- **Structure**: Header, notices, then public date albums by month, then public named albums under Albums. Month and Albums headings are 24 pixels and semibold.
- **Control placement**: Album cards follow the Album card pattern. No privacy control. Sign in is only in the header.
- **Empty state**: `There are no public photos.` centered, with Sign in directly under it.
- **Narrow window**: Two columns. Month and Albums headings span the width. No sideways scroll. While the library is loading, quiet blocks stand in for the cards.

### Sign-in dialog

- **Structure**: Title, message, Name, Secret, the main button, then the mode switch. The dialog sits over the dimmed library.
- **Control placement**: Close is at the top-right. The message is under the title. Sign in uses the main-action treatment. Fields have a 1-pixel border and a 6-pixel corner. Enter during composition does not submit.
- **Empty state**: Sign in mode, empty fields, and no message until a failure or a confirmation.
- **Narrow window**: The dialog sits near the top, inset from both sides. Tapping a field does not zoom the page. Close is at least 44 by 44 pixels. Field text is at least 16 pixels.

### Signed-in library

- **Structure**: Header, notices, date albums by month, then Albums.
- **Control placement**: New album and Add photos are in the header. Privacy stays inside an owned card at the top-right and uses the secondary treatment.
- **Empty state**: No pictures and no named albums: `Add photos to organize them by the day they were taken.` with Add photos under it. Pictures but no named albums: the Albums heading plus `No named albums yet. Use New album to make one.`
- **Narrow window**: Two columns. Add photos remains the visible main action. While the library is loading, quiet blocks stand in for the cards.

### Album card

- **Structure**: One picture area, then one line at 16 pixels: name or date, the assigned mark when needed, and the count. The card has a 12-pixel corner, a 1-pixel hairline, and no drop shadow.
- **Control placement**: The whole card except the privacy control opens the album. Privacy is only on an owned card, at the picture area's top-right. Hover changes the hairline only.
- **Empty state**: A card is not shown for an album with no pictures, except a named album, which uses the named-album empty state.
- **Narrow window**: Two columns. The privacy control stays inside the card and is at least 40 by 40 pixels.

### Date album and named album

- **Structure**: Header, notices, the title bar, then the picture grid. A date album with no pictures is not shown. A named album with no pictures shows `This album has no pictures.`
- **Control placement**: All albums is at the left of the title bar and may use the blue accent. The owner of a named album has Add pictures at the right as the main action. Picture actions stay in one menu.
- **Empty state**: The named-album message is centered under the title bar, with Add pictures under it for the owner.
- **Narrow window**: The back control is an arrow named All albums. Add pictures is a plus named Add pictures. The picture menu opens from the bottom. Two picture columns. While the album is loading, quiet blocks stand in for the pictures.

### Picture card

- **Structure**: One picture area, then one line with the taken time or `Assigned`, and one picture menu. The card matches the album-card hairline and corner.
- **Control placement**: Choosing the picture enlarges it. A picture that cannot be loaded shows `This picture cannot be shown.` in the picture area.
- **Empty state**: A card exists only for a picture.
- **Narrow window**: Two columns. The menu opens from the bottom. The menu control is at least 40 by 40 pixels.

### Enlarged picture

- **Structure**: A layer over the dimmed album. The picture is fitted whole, without a shape change. The page behind is dimmed, not recolored.
- **Control placement**: Close is at the top-right, at least 44 by 44 pixels. Close, the backdrop, and Escape return to the picture that opened the layer.
- **Empty state**: `This picture cannot be shown.` in the center. Close stays at the top-right.
- **Narrow window**: The same layout. Close stays at least 44 by 44 pixels inside the margin.

### Delete confirmation

- **Structure**: Title `Delete this picture?`, a small copy of the picture, `It will be removed from every album.`, any error, then Cancel and Delete.
- **Control placement**: Focus starts on Cancel. Cancel uses the secondary treatment. Delete uses the danger treatment. Escape and Cancel return focus to Picture actions.
- **Empty state**: Not applicable.
- **Narrow window**: Delete is stacked above Cancel. Both span the dialog width and are at least 44 pixels tall.

### Add pictures dialog

- **Structure**: Title `Add pictures`, a grid of the owner's pictures, then Done.
- **Control placement**: Close is at the top-right. Done uses the main-action treatment. The picture list scrolls inside the dialog.
- **Empty state**: When the owner has no pictures at all, the dialog shows `No pictures to add.` under the title and Done remains.
- **Narrow window**: The dialog sits at the bottom edge. The grid has three columns. Close and Done are at least 44 pixels tall.

### Color sample

- **Structure**: The sample lists every shared role with its paired text, in both appearances, using the values from this spec.
- **Control placement**: The language switch and the appearance switch on the sample change only the sample. The language switch follows FR-022.
- **Empty state**: Not applicable. The sample always lists the roles.
- **Narrow window**: The role list stays on the page width and does not scroll sideways.
