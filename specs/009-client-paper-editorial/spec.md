# Feature Specification: Client Paper Editorial

**Feature Branch**: `009-client-paper-editorial`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "使用web-design skill优化client，使用web-design paper editorial风格"

## Clarifications

### Session 2026-10-21

- Q: Should the paper organizer keep a dark appearance and the Chinese/English switch? → A: Keep both. The dark appearance stays, and the bilingual switch stays.

## User Scenarios & Testing *(mandatory)*

This feature gives the organizer a warm, print-like paper look in both appearances and retires the cool white, pure black, and blue-accent look from spec 008. The light appearance is warm paper. The dark appearance is the same paper language on a warm near-black page, not a second cool theme. Display titles use a serif face, small status labels use a monospaced face, and one terracotta accent marks the product, the main action, and links. Chinese is the first language, and the person can switch to English. Specs 001 through 006 still decide who can see an album or a picture, which pictures an album contains, the order of blocks, and how a person finishes a task with the keyboard. Spec 008 still decides the language switch, the confirmation sentences, the loading blocks, the appearance memory, and the narrow hit sizes. Under the constitution's Governance section, this spec follows Principle IV, Interface, for every screen in the Screens section.

### User Story 1 - See a warm paper organizer (Priority: P1)

A person opens the library, an album, and an enlarged picture and sees one paper language in the light appearance and the same language in the dark appearance. In the light appearance the page is warm paper, cards are a lighter warm white, and text is warm ink. In the dark appearance the page is a warm near-black, cards sit slightly above it, and text is warm off-white. Cards and dialogs have small even corners, a warm hairline, and a soft warm shadow in both. The mark beside the product name, the main action, and links share one terracotta hue. A photograph keeps its own colors.

**Why this priority**: The organizer is the product. A paper look that never appears on the library does not matter.

**Independent Test**: Open the signed-in library, a date album, and an enlarged picture in the light appearance, then switch to the dark appearance. Confirm both are the paper language rather than cool white or pure black, the main action matches the mark, a month heading is serif, a count is monospaced, and a photograph keeps its own colors.

**Acceptance Scenarios**:

1. **Given** the light appearance, **When** a person views the library, an album, and an enlarged picture, **Then** the page is warm paper, body text is warm near-black ink, cards and dialogs have a warm hairline, a corner of 4 or 5 pixels, and a soft warm shadow, and the page is not pure white.
2. **Given** the dark appearance, **When** the person views those same screens, **Then** the page is a warm near-black rather than pure black or a blue-tinted navy, cards are a slightly lifted warm black, body text is warm off-white, and the hairline, the 4 or 5 pixel corner, and the soft warm shadow remain.
3. **Given** either appearance, **When** the person looks at the header, **Then** a terracotta mark sits beside the product name, three of the mark's corners match, one corner is tighter, and the initial inside the mark is light and serif.
4. **Given** Add photos, Sign in, Create, or Done, **When** it is shown in the light appearance, **Then** it uses the terracotta fill with light text. **When** it is shown in the dark appearance, **Then** it uses a lighter tint of that same terracotta with dark text. In both, it is not a cool near-black fill and not blue.
5. **Given** a month heading, an Albums heading, or a dialog title, **When** it is shown in either appearance, **Then** it uses a serif face at a lighter weight than heavy bold. Body text and button labels use a plain sans face. A count, Assigned, Public, and Private use a small monospaced face.
6. **Given** a photograph on a card or enlarged, **When** the person looks at it in either appearance, **Then** the photograph keeps its own colors.

---

### User Story 2 - Keep every current task, both appearances, and both languages (Priority: P1)

A person can still sign in, add photos, make an album, open it, enlarge a picture, delete a picture, change privacy, switch appearance, switch language, and close a notice. The order of blocks stays as specs 005 and 006 describe them. The header keeps the language switch immediately before the appearance switch. Delete stays visually distinct from the terracotta main action. Chinese is the first language. English remains one switch away. Switching appearance or language does not leave the page.

**Why this priority**: A warmer look that moves a task, drops Chinese or English, or drops the dark appearance makes people relearn a product that already works.

**Independent Test**: With the paper look applied and Chinese showing, complete sign-in, album creation, picture enlargement, and a cancelled deletion. Switch to the dark appearance and confirm the page is the warm near-black paper language. Switch to English and read the same screens in the English sentences.

**Acceptance Scenarios**:

1. **Given** the paper look is applied, **When** a person signs in, creates an album, enlarges a picture, and cancels a deletion, **Then** each task has the same outcome as specs 005 and 006, and the words are the active language's sentences.
2. **Given** any screen in the Screens section, **When** it is shown, **Then** its blocks stay in the spec 006 order, the language switch sits immediately before the appearance switch, and each other control stays where spec 006 places it.
3. **Given** the delete confirmation, **When** it is open, **Then** Delete uses a danger treatment that is distinct from the terracotta main action, and Cancel uses the secondary treatment.
4. **Given** Chinese is showing, **When** the person chooses `English` and then the dark appearance, **Then** the sentences are English, the page is the dark paper language, and the open page stays open.

---

### User Story 3 - Read the paper details while finishing a task (Priority: P2)

On a narrow window every control can be tapped. An empty library or an empty album shows the paper flourish above the sentence the person already knows. Pointing at a card lifts it slightly. A loading page shows quiet paper-colored blocks. A finished action shows a confirmation that rises into view. While a person is still composing a character, Enter does not submit the form.

**Why this priority**: The paper language includes the empty page, the hover, and the confirmation. A control that is too small, or an Enter key that sends a half-composed name, still stops the task.

**Independent Test**: At 320 pixels wide, open an empty library and the sign-in dialog. The flourish is visible, the empty sentence is unchanged, every visible control is at least 40 by 40 pixels, and Enter during character composition does not submit Name.

**Acceptance Scenarios**:

1. **Given** a window 320 pixels wide, **When** the person visits the library, an album, and an open dialog, **Then** the page does not scroll sideways, every visible control is at least 40 by 40 pixels, and the enlarged close control, the notice close control, the dialog close control, and the main header action are at least 44 by 44 pixels.
2. **Given** an empty library or an empty named album, **When** it is shown, **Then** the paper flourish sits above the existing empty sentence, and that sentence is unchanged.
3. **Given** a card, **When** the pointer rests on it, **Then** the card rises by about 2 pixels and its shadow deepens. A button does not rise.
4. **Given** the person has asked the device to reduce motion, **When** a card is hovered or a confirmation appears, **Then** the card does not rise and the confirmation appears in place.
5. **Given** Name, Secret, or the album name field, **When** the person presses Enter while a character is still being composed, **Then** the character is confirmed and the form is not submitted.

---

### Edge Cases

- An empty library, an empty named album, and a library with no public photos keep their current sentences. The flourish does not replace the sentence.
- A picture that cannot be shown still shows the active language's form of `This picture cannot be shown.` The sentence stays readable on the picture area.
- Switching language while a picture is enlarged, a dialog is open, or a delete confirmation is showing keeps that layer open and does not confirm or cancel the delete.
- A notice with a long sentence still wraps inside the strip. The close control stays where spec 006 places it.
- A Chinese micro-label such as 私密, 公开, or 指定日期 stays the short Chinese word. It is not forced into Latin capitals.
- From 320 pixels wide upward, no screen scrolls sideways.
- A confirmation of a finished action disappears on its own and never covers the control the person needs next. Two confirmations stack with the newest at the bottom.
- The colors inside a photograph stay the photograph's own colors.
- A first visit opens in the light paper appearance and in Chinese. After the person switches appearance or language, the next visit opens in the pair they chose. The two choices are independent. The mark's initial follows the language, not the appearance.
- Switching appearance uses the same exception as switching language: an enlarged picture, an open dialog, and a delete confirmation stay open, and the delete is not confirmed or cancelled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every screen in the Screens section MUST use one shared paper language in both appearances. Light: a warm paper page, a lighter warm-white card, and warm near-black ink. Dark: a warm near-black page, a slightly lifted warm-black card, and warm off-white ink. Both use warm hairlines. The light page MUST NOT be pure white. The dark page MUST NOT be pure black and MUST NOT be a blue-tinted navy (Principle IV, Interface).
- **FR-002**: Add photos, Sign in, Create, and Done MUST use the main-action treatment. In the light appearance that is a terracotta fill with light text, and hover moves the fill to a deeper shade of the same terracotta. In the dark appearance that is a lighter tint of the same terracotta with dark text, and hover moves the fill one step lighter. Those controls MUST NOT be blue and MUST NOT use the cool near-black fill from spec 008.
- **FR-003**: Cancel, Sign out, New album, the language switch, and the appearance switch MUST use the secondary treatment: the card or page fill, a 1-pixel warm hairline, and ink text. Hover MUST change the fill or the hairline only, and MUST NOT lift the control.
- **FR-004**: Delete MUST use a danger treatment that stays distinct from the terracotta accent. The danger text on its paired background MUST meet a contrast of at least 4.5 to 1.
- **FR-005**: The terracotta accent MUST be limited to the signature mark, the main action, and links. It MUST NOT fill the page or a card. In the light appearance, links, including All albums, MUST use the deeper terracotta. In the dark appearance, links MUST use a lighter terracotta that stays readable on the warm near-black page. Links MUST NOT be blue.
- **FR-006**: A card, a button, a field, a dialog, and a confirmation MUST use a corner of 4 or 5 pixels, the same corner on each of those surfaces. The privacy control MUST be a fully round chip. A card in a grid MUST match the height of the cards in its row.
- **FR-007**: The header MUST stay visible while the page scrolls, be 56 pixels tall, and show a 1-pixel warm hairline along its bottom. The signature mark sits beside the product name. The product name is 15 pixels. The mark is a terracotta square with three matching corners and one tighter corner, and it holds a light serif initial: 照 while Chinese is active, and P while English is active.
- **FR-008**: Month headings, the Albums heading, dialog titles, and a card's name line MUST use a serif face already on the device, at a weight lighter than heavy bold, with slightly tight letter spacing. Month and Albums headings are 24 pixels. A card's name line is 16 pixels. Body text and button labels are 14 pixels in a sans face already on the device. Counts and the Assigned, Public, and Private labels are 12 pixels in a monospaced face already on the device, in the muted ink. A Chinese label MUST NOT be uppercased.
- **FR-009**: Each screen MUST keep the structure, empty messages, and narrow arrangement from spec 006, plus the language switch, the appearance switch, loading, and confirmation notes in the Screens section. The language switch MUST sit immediately before the appearance switch. A control that exists but sits in another place MUST NOT meet this requirement (Principle IV, Interface).
- **FR-010**: Who can see an album or a picture, album counts, picture order, ownership, and the two-step delete MUST stay as specs 001 through 004 require (Principle I, Code Quality).
- **FR-011**: Keyboard completion, focus return, the language switch leaving an open layer in place, the full name on a shortened title, and the failure sentence MUST stay as spec 006 requires.
- **FR-012**: In both appearances, every text-and-background pair MUST meet a contrast of at least 4.5 to 1, including ink on the page, text on the terracotta main action, and terracotta links on the page. Borders, the focus ring, and the soft shadow are visible in both appearances and are not held to that text contrast rule.
- **FR-013**: The focused control MUST show a ring 3 pixels thick, offset from the control, and visible against the page and against a card in both appearances.
- **FR-014**: On a narrow window, every visible control MUST be at least 40 by 40 pixels. The enlarged close control, the notice close control, the dialog close control, and the main header action MUST be at least 44 by 44 pixels. From 320 pixels wide upward, no screen scrolls sideways (Principle IV, Interface).
- **FR-015**: Enter in Name, Secret, or the album name field MUST NOT submit the form while a character is still being composed.
- **FR-016**: While the library or an album is loading, the page MUST show quiet blocks in the shape of the missing cards, in the warm muted paper tone, with the same small corner as a card. The blocks MAY pulse gently. A finished create, delete, or privacy change MUST show the active language's confirmation. The confirmation uses the card fill, a warm hairline, the small corner, and a soft warm shadow, and it rises into place. It disappears on its own within 4 seconds. A failure MUST show the active language's form of the sentence spec 006 already uses. No action MAY use a blocking alert.
- **FR-017**: Hovering a card MUST lift it by about 2 pixels and deepen its warm shadow. Hovering a button MUST NOT move it. When the person has asked the device to reduce motion, a card MUST NOT lift, loading blocks MUST NOT pulse, and a confirmation MUST appear in place without traveling.
- **FR-018**: A photograph MUST keep its own colors. The frame, card, and page around it MUST use the paper language.
- **FR-019**: The light paper appearance is the appearance on a first visit. After the person switches, the organizer MUST open in the appearance they last chose, and that appearance MUST be the paper language for that choice. Switching appearance MUST keep the person on the same page and MUST NOT change the language. Switching language MUST NOT change the appearance.
- **FR-020**: The color sample page MUST show the paper language in both appearances. The language switch and the appearance switch on the sample change only the sample. A one-off color on an organizer screen MUST still be rejected as specs 003 and 004 require.
- **FR-021**: Tests MUST fail when FR-001, FR-002, FR-007, FR-008, FR-009, FR-013, FR-014, FR-015, FR-016, or FR-022 is broken on a rendered screen (Principle II, Testing).
- **FR-022**: The organizer MUST open in Chinese on a first visit. The language switch MUST sit immediately before the appearance switch and MUST read `English` while Chinese is active and `中文` while English is active. The appearance switch MUST read `Dark appearance` while the light paper appearance is active and `Light appearance` while the dark paper appearance is active, in the active language's form. Choosing either switch MUST keep the person on the same page. Choosing the language MUST exchange every interface sentence for the other language's form in Interface copy, leave album names and stored dates unchanged, exchange the mark's initial between 照 and P, and leave the appearance unchanged. The language choice and the appearance choice MUST each be the one used on the next visit.
- **FR-023**: An empty library, an empty named album, and a library with no public photos MUST show the paper flourish above the existing empty sentence. The flourish is the signature mark centered in a circle, with one or two warm hairline arcs offset to one side. The sentence and the action under it stay the sentences spec 008 already uses.

**Interface copy**. The Chinese form is the default. The English form is the sentence already used by specs 001 through 006. A count inside a sentence stays a numeral. `Dark appearance` and `Light appearance` are the appearance switch labels and MUST appear only on that switch.

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

- **Paper language**: The shared look of the organizer in both appearances. It covers the warm page, the card, the terracotta accent, the serif display titles, the monospaced micro-labels, the small corner, the warm hairline, and the soft warm shadow. The light appearance and the dark appearance are two values of this one language. A one-off color is not part of it.
- **Signature mark**: The small terracotta square beside the product name, with one tighter corner and a light serif initial. The empty-page flourish reuses this mark inside a circle. The initial follows the language in both appearances.
- **Main action**: The control that completes the step in front of the person: Add photos, Sign in, Create, or Done. In Chinese those labels are 添加照片, 登录, 创建, and 完成.
- **Confirmation**: A short note that a create, delete, or privacy change finished. It is not a notice about skipped files, and it is not a field error. Its four sentences are listed in Interface copy.
- **Language choice**: Chinese or English for interface sentences and for the mark's initial. Album names and stored dates are not part of it. It does not select an appearance.
- **Appearance choice**: Light paper or dark paper. It does not select a language. The first visit is light paper.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On the library, a date album, and an enlarged picture, the light page is warm paper in 100% of trials and pure white in 0%. The dark page is warm near-black in 100% of trials, pure black in 0%, and blue-tinted navy in 0%.
- **SC-002**: In 100% of trials in both appearances, the main action uses the terracotta family and matches the mark's hue, whether it reads 添加照片, 登录, 创建, 完成, Add photos, Sign in, Create, or Done. It is the cool near-black fill from spec 008 in 0% of trials and blue in 0% of trials.
- **SC-003**: In 100% of trials in both appearances, a card has a corner of 4 or 5 pixels, a warm hairline, and a visible soft shadow, and hovering it lifts it by about 2 pixels. A button lifts in 0% of trials.
- **SC-004**: In both appearances, 100% of text-and-background pairs meet a contrast of at least 4.5 to 1, including ink on the page and text on the terracotta main action.
- **SC-005**: At 320, 375, 640, 960, and 1440 pixels wide, zero screens scroll sideways. At 320 pixels wide, 100% of visible controls are at least 40 by 40 pixels, and the enlarged close control and the main header action are at least 44 by 44 pixels.
- **SC-006**: Enter during character composition on Name and on the album name submits the form in 0% of trials.
- **SC-007**: With English selected, 100% of the acceptance scenarios in specs 001 through 006 that are not about the previous cool near-black or blue main action still pass, including the appearance switch. With Chinese selected, those same scenarios pass using the Chinese sentences.
- **SC-008**: On a first visit, 100% of interface sentences are Chinese, the mark's initial is 照, and the appearance is light paper. After one switch to English, one switch to the dark appearance, and a later visit, 100% of interface sentences are English, the mark's initial is P, the page is the dark paper language, and a stored album name is unchanged.
- **SC-009**: The language switch and the appearance switch are both shown on the header in 100% of visits, including a visit that previously saved the dark appearance. An empty library shows both the flourish and the existing empty sentence in 100% of trials in both appearances.

## Assumptions

- The request replaces the cool look from spec 008 with the warm paper editorial language in both appearances. It does not add a chat, a marketing page, or a second product.
- The dark appearance stays. It is the paper language on a warm near-black page, not the cool pure-black page from spec 008. A saved dark choice opens on that dark paper page. Light paper and dark paper are one language, not a mix of the paper look and the cool look.
- Specs 005 and 006 remain the layout and the interaction, including the appearance switch. Spec 008 remains the source of the interface sentences, the language switch, the appearance memory, the confirmation, the loading blocks, and the narrow hit sizes.
- Chinese is the first language. English remains available through the language switch. The English sentences stay in sentence case. Album names, secrets, and stored dates are shown as stored and are not translated. A month heading uses the active language. A server sentence that is not listed in Interface copy is shown as received. The language choice and the appearance choice are stored separately.
- The language switch and the appearance switch use the secondary treatment. On a wide window the language switch sits immediately before the appearance switch: after Add photos when signed in, and before Sign in when signed out. On a narrow window, signed in, More lists New album, the language switch, the appearance switch, and Sign out, and Add photos stays visible. Signed out and narrow, More holds the language switch and the appearance switch, and Sign in stays visible.
- The type comes from faces already on the device: a serif for display titles, a sans for body and buttons, and a monospaced face for micro-labels. No new face is delivered with the product.
- The mark's initial is 照 in Chinese and P in English, taken from the first character of the active product name.
- The notice strip still reports skipped files and errors. The confirmation is only for a finished create, delete, or privacy change.
- Search, renaming, deleting a named album, and dragging pictures stay out of scope.
- Spec 007 is a separate draft and is not the source of this look.

## Screens *(mandatory)*

Each screen keeps spec 006's blocks and empty message, and spec 008's language, appearance memory, loading, and confirmation behavior, except where this section changes the paint. Quoted sentences below are the English form. The person sees the active language's form from Interface copy. The visual treatment is FR-001 through FR-008 and FR-023. Narrow means a window under 640 pixels wide.

### Header (every screen)

- **Structure**: One bar, 56 pixels tall, that stays visible while the page scrolls. The signature mark sits at the left of the title. The title is 照片日期相册 or Photo Date Albums, 15 pixels, in the serif face, and stays on one line. Controls are at the right. A 1-pixel warm hairline runs along the bottom.
- **Control placement**: Wide and signed in, from left to right: New album, Add photos, the language switch, the appearance switch, Sign out. Wide and signed out: the language switch, the appearance switch, then Sign in. New album, the language switch, the appearance switch, and Sign out use the secondary treatment. Add photos and Sign in use the terracotta main-action treatment. The language switch reads `English` or `中文` as FR-022 requires. The appearance switch reads the other appearance, in the active language. Choosing either switch does not close an open layer. Choosing the language does not change the appearance, and choosing the appearance does not change the language. The focused control shows the 3-pixel ring.
- **Empty state**: The header is unchanged when the library is empty. The flourish belongs to the empty library, not to the header.
- **Narrow window**: One line. The main action stays visible and is at least 44 by 44 pixels. Signed in, More lists New album, the language switch, the appearance switch, and Sign out. Signed out, More lists the language switch and the appearance switch, and Sign in stays visible.

### Notices (every screen)

- **Structure**: One strip under the header, inside the page width, with a 1-pixel warm hairline. Skipped count, then the duplicate sentence, then errors, one per line.
- **Control placement**: Close is at the strip's right end. On a narrow window it is at the strip's top-right.
- **Empty state**: No notice means no strip and no gap reserved for one.
- **Narrow window**: Messages wrap inside the strip. Close stays at the top-right and is at least 44 by 44 pixels.

### Confirmation

- **Structure**: One short sentence naming the finished create, delete, or privacy change. The surface is the card fill, with a warm hairline, a 4 or 5 pixel corner, and a soft warm shadow.
- **Control placement**: Bottom-right on a wide window, above the page edge, and not covering the main action. It rises into that place, then disappears on its own within 4 seconds. The newest confirmation is the lower one. With reduced motion it appears in place.
- **Empty state**: No finished action means no confirmation.
- **Narrow window**: Bottom-center, inside the page width.

### Signed-out library

- **Structure**: Header, notices, then public date albums by month, then public named albums under Albums. Month and Albums headings are 24 pixels in the serif face.
- **Control placement**: Album cards follow the Album card pattern. No privacy control. Sign in is only in the header.
- **Empty state**: The paper flourish, then `There are no public photos.` centered, with Sign in directly under it.
- **Narrow window**: Two columns. Month and Albums headings span the width. No sideways scroll. While the library is loading, quiet warm blocks stand in for the cards.

### Sign-in dialog

- **Structure**: Title in the serif face, message, Name, Secret, the main button, then the mode switch. The dialog sits over the dimmed library and has a soft warm shadow.
- **Control placement**: Close is at the top-right. The message is under the title. Sign in uses the terracotta treatment. Fields have a 1-pixel warm hairline and a 4 or 5 pixel corner. Enter during composition does not submit.
- **Empty state**: Sign in mode, empty fields, and no message until a failure or a confirmation.
- **Narrow window**: The dialog sits near the top, inset from both sides. Tapping a field does not zoom the page. Close is at least 44 by 44 pixels. Field text is at least 16 pixels.

### Signed-in library

- **Structure**: Header, notices, date albums by month, then Albums.
- **Control placement**: New album and Add photos are in the header. Privacy stays inside an owned card at the top-right as a fully round chip.
- **Empty state**: No pictures and no named albums: the paper flourish, then `Add photos to organize them by the day they were taken.` with Add photos under it. Pictures but no named albums: the Albums heading plus `No named albums yet. Use New album to make one.` The flourish is not repeated under Albums when the date albums are already showing.
- **Narrow window**: Two columns. Add photos remains the visible main action. While the library is loading, quiet warm blocks stand in for the cards.

### Album card

- **Structure**: One picture area, then one line: the name or date at 16 pixels in the serif face, the assigned mark when needed, and the count in the monospaced face. The card has a 4 or 5 pixel corner, a 1-pixel warm hairline, and a soft warm shadow.
- **Control placement**: The whole card except the privacy control opens the album. Privacy is only on an owned card, at the picture area's top-right, fully round. Hover lifts the card by about 2 pixels. With reduced motion the card does not lift.
- **Empty state**: A card is not shown for an album with no pictures, except a named album, which uses the named-album empty state.
- **Narrow window**: Two columns. The privacy control stays inside the card and is at least 40 by 40 pixels.

### Date album and named album

- **Structure**: Header, notices, the title bar, then the picture grid. The album title is serif. A date album with no pictures is not shown. A named album with no pictures shows the flourish and `This album has no pictures.`
- **Control placement**: All albums is at the left of the title bar and uses the deeper terracotta. The owner of a named album has Add pictures at the right as the main action. Picture actions stay in one menu.
- **Empty state**: The flourish and the named-album message are centered under the title bar, with Add pictures under the message for the owner.
- **Narrow window**: The back control is an arrow named All albums. Add pictures is a plus named Add pictures. The picture menu opens from the bottom. Two picture columns. While the album is loading, quiet warm blocks stand in for the pictures.

### Picture card

- **Structure**: One picture area, then one line with the taken time or `Assigned` in the monospaced face, and one picture menu. The card matches the album-card hairline, corner, and shadow, and lifts on hover the same way.
- **Control placement**: Choosing the picture enlarges it. A picture that cannot be loaded shows `This picture cannot be shown.` in the picture area.
- **Empty state**: A card exists only for a picture.
- **Narrow window**: Two columns. The menu opens from the bottom. The menu control is at least 40 by 40 pixels.

### Enlarged picture

- **Structure**: A layer over the dimmed album. The picture is fitted whole, without a shape change. The page behind is dimmed, not recolored.
- **Control placement**: Close is at the top-right, at least 44 by 44 pixels. Close, the backdrop, and Escape return to the picture that opened the layer.
- **Empty state**: `This picture cannot be shown.` in the center. Close stays at the top-right. The flourish is not used here, because the sentence sits in the picture area.
- **Narrow window**: The same layout. Close stays at least 44 by 44 pixels inside the margin.

### Delete confirmation

- **Structure**: Serif title `Delete this picture?`, a small copy of the picture, `It will be removed from every album.`, any error, then Cancel and Delete. The dialog has a soft warm shadow and the small corner.
- **Control placement**: Focus starts on Cancel. Cancel uses the secondary treatment. Delete uses the danger treatment. Escape and Cancel return focus to Picture actions.
- **Empty state**: Not applicable.
- **Narrow window**: Delete is stacked above Cancel. Both span the dialog width and are at least 44 pixels tall.

### Add pictures dialog

- **Structure**: Serif title `Add pictures`, a grid of the owner's pictures, then Done. The dialog has a soft warm shadow and the small corner.
- **Control placement**: Close is at the top-right. Done uses the terracotta treatment. The picture list scrolls inside the dialog.
- **Empty state**: When the owner has no pictures at all, the dialog shows `No pictures to add.` under the title and Done remains. The flourish is not repeated inside this dialog.
- **Narrow window**: The dialog sits at the bottom edge. The grid has three columns. Close and Done are at least 44 pixels tall.

### Color sample

- **Structure**: The sample lists every shared paper role with its paired text, in both the light paper appearance and the dark paper appearance.
- **Control placement**: The language switch on the sample changes only the sample's sentences and the mark's initial. The appearance switch on the sample changes only the sample's appearance. The two switches sit in the same order as the header.
- **Empty state**: Not applicable. The sample always lists the roles.
- **Narrow window**: The role list stays on the page width and does not scroll sideways.
