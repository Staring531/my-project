# Feature Specification: Album and Image Management

**Feature Branch**: `002-album-image-management`

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Add album and image management, including creating albums, deleting images, and setting albums to private. Clicking an image enlarges it in proportion to the screen. A picture already in the library, for example from 2025-10-15, cannot be added again, for example on 2026-10-16."

## User Scenarios & Testing *(mandatory)*

A signed-in person can create their own named albums, remove their own pictures, and make an album private again. Anyone who can already see a picture can open a larger view that fits the screen without stretching or cropping it. A picture kept in the library stays on its original day and cannot be added a second time on a later day.

### User Story 1 - Create a named album (Priority: P1)

A signed-in person creates an album with a name they choose. The album starts empty and only they can see it. They can place their own pictures, already in the library, into that album. Each picture also stays in the date album it already belongs to.

**Why this priority**: The organizer already groups pictures by day. Creating an album is the new way a person collects pictures under a name they choose.

**Independent Test**: Sign in, create a named album, add two pictures the person already owns, and confirm the album shows that name, a count of 2, and those pictures, while each picture still appears on its original day.

**Acceptance Scenarios**:

1. **Given** a person is signed in, **When** they create an album named "Holiday", **Then** they see an album named Holiday with no pictures, a count of zero, and no preview, and nobody else can see it.
2. **Given** the owner has pictures already in the library, **When** they add two of those pictures to Holiday, **Then** Holiday shows both pictures, a count of 2, and a preview of the first picture they added, and each picture still appears in its original date album.
3. **Given** Holiday already contains a picture, **When** the owner adds that same picture to Holiday again, **Then** Holiday still contains it once and the count does not change.
4. **Given** the owner already has an album named Holiday, **When** they create another album named Holiday, **Then** the new album is not created and the existing Holiday album is unchanged.
5. **Given** another person already has an album named Holiday, **When** a signed-in person creates an album named Holiday, **Then** that person's Holiday album is created.
6. **Given** a person is signed in, **When** they create an album whose name is empty, only spaces, or longer than 64 characters after spaces are removed, **Then** no album is created.
7. **Given** a person is not signed in, **When** they try to create an album, **Then** no album is created.
8. **Given** a person does not own a named album, **When** they try to add a picture to it, **Then** the album is unchanged.

---

### User Story 2 - Delete a picture (Priority: P1)

The owner of a picture can delete it after confirming. The picture then disappears from every album, and counts and previews update. Canceling leaves the picture where it was.

**Why this priority**: Creating albums is only useful if the owner can remove a picture they no longer want in the library.

**Independent Test**: Sign in as the owner of a picture that appears in a date album and a named album, confirm deletion, and confirm the picture is gone from both. Repeat with cancel and confirm the picture remains.

**Acceptance Scenarios**:

1. **Given** a picture belongs to its owner and appears in a date album and a named album, **When** the owner confirms deletion, **Then** the picture is gone from both albums and both counts decrease by one.
2. **Given** the owner is asked to confirm deletion, **When** they cancel, **Then** the picture remains in every album it was in.
3. **Given** a picture is the preview of an album that still has other pictures, **When** the owner deletes that picture, **Then** the album preview becomes the next picture that belongs in that preview and the deleted picture is not shown.
4. **Given** a person does not own a picture, **When** they try to delete it, **Then** the picture remains.
5. **Given** a picture has no owner, **When** any person tries to delete it, **Then** the picture remains.
6. **Given** a date album contains only one picture, **When** the owner confirms deletion of that picture, **Then** the picture is gone and that date album is no longer shown.
7. **Given** a named album contains only one picture, **When** the owner confirms deletion of that picture, **Then** the picture is gone and the owner still sees that named album with a count of zero and no preview.

---

### User Story 3 - Set an album private (Priority: P1)

The owner of an album can make it private. Other people, including people who are not signed in, no longer see that album. The owner still sees it, and its pictures are not deleted.

**Why this priority**: An album that was shared can be taken back. Privacy has to be reversible by the owner.

**Independent Test**: Mark an owned album public, confirm another person can see it, set it private, and confirm that other person no longer sees the album while the owner still does.

**Acceptance Scenarios**:

1. **Given** the owner has marked an album public and another person can see it, **When** the owner sets that album private, **Then** the other person no longer sees the album and the owner still sees the album and its pictures.
2. **Given** an album is already private to its owner, **When** the owner sets it private again, **Then** it stays private and only the owner can see it.
3. **Given** a person does not own an album, **When** they try to set it private, **Then** the album's visibility does not change.
4. **Given** an album has no owner, **When** any person tries to set it private, **Then** the album stays as it was.
5. **Given** an album is set private and one of its pictures was separately available to everyone, **When** someone other than the owner views the library, **Then** they do not see the album, and they still see that picture on its own.

---

### User Story 4 - Enlarge a picture (Priority: P2)

A person who can see a picture selects it and sees the whole picture enlarged to fit the screen. The shape stays the same, and none of the picture is cut off. Dismissing the enlarged picture returns them to the same album.

**Why this priority**: Album tiles and album grids stay useful without a larger view. The larger view is how a person inspects one picture.

**Independent Test**: Open an album the person can see, select a picture, confirm the whole picture fits the screen without stretching, dismiss it, and confirm the same album is shown again.

**Acceptance Scenarios**:

1. **Given** a person can see a picture in an album, **When** they select that picture, **Then** the whole picture is shown as large as the screen allows, with its shape unchanged and no part cut off.
2. **Given** a picture is wider than the screen or taller than the screen, **When** the person selects it, **Then** the entire picture remains visible and is not stretched.
3. **Given** a picture is enlarged, **When** the person dismisses it, **Then** they return to the same album they were viewing.
4. **Given** a picture is enlarged, **When** the available screen becomes smaller or larger, **Then** the picture is fitted again under the same rules.
5. **Given** a person cannot see a picture, **When** they try to enlarge it, **Then** it is not shown.

---

### User Story 5 - Keep a picture on its original day (Priority: P2)

A picture already in the library cannot be added again, even on another day. The original copy stays on the original day, and the person is told the picture is already in the library. A different picture that happens to use the same file name can still be added.

**Why this priority**: Date albums already keep one copy of a picture. This story makes a later day refuse that same picture instead of giving it a second home.

**Independent Test**: Add a picture that is stored on 2025-10-15, try to add that same picture on 2026-10-16, and confirm the 2025-10-15 album is unchanged and no 2026-10-16 copy exists. Add a different picture that uses the same file name and confirm it is kept.

**Acceptance Scenarios**:

1. **Given** a picture is already in the library on 2025-10-15, **When** a person adds that same picture on 2026-10-16, **Then** it is not added, the 2025-10-15 album is unchanged, no album for 2026-10-16 is created for that picture, and the person is told the picture is already in the library.
2. **Given** a picture is already in the library, **When** a person adds that same picture again on its original day, **Then** it is not added again and the album count does not increase.
3. **Given** a picture named a.png is already in the library, **When** a person adds a different picture that is also named a.png, **Then** the different picture is added and the original picture stays where it was.
4. **Given** the same picture is refused, **When** the person looks at the named album they were trying to fill with a new copy, **Then** that album does not gain a second copy of the picture.

---

### Edge Cases

- A named album name that is only spaces is refused, and no album is created.
- A named album name longer than 64 characters after trimming spaces is refused, and no album is created.
- Two people may each have a named album with the same name. One person's name does not block the other person.
- A person who does not own a named album cannot add pictures to it.
- Deleting the last picture in a date album removes that date album from view.
- Deleting the last picture in a named album leaves the named album visible to its owner, with a count of zero and no preview.
- Deleting a picture removes it for everyone, including people who could see it because it or its album was public.
- Setting an album private does not remove its pictures and does not change which day a picture belongs to.
- A picture smaller than the screen is enlarged up to the largest size that still fits entirely, without stretching.
- If an enlarged picture cannot be shown, the person is told, and the album they were viewing stays in place.
- A picture that merely looks similar to one already in the library is a different picture and can be added.
- An empty named album can be set private and stays visible only to its owner.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A signed-in person MUST be able to create a named album. The album MUST start with no pictures, MUST be visible only to that person, and MUST show the name they chose.
- **FR-002**: A named album name MUST be 1 to 64 characters after surrounding spaces are removed. An empty name, a name of only spaces, and a name longer than 64 characters MUST be refused without creating an album.
- **FR-003**: A person MUST NOT create a second named album with the same name as a named album they already have. Another person's use of that name MUST NOT block them.
- **FR-004**: The owner of a named album MUST be able to add their own pictures that are already in the library. A picture already in that named album MUST remain a single entry, and the count MUST NOT increase.
- **FR-005**: Adding a picture to a named album MUST NOT remove it from its date album.
- **FR-006**: A person who is not signed in MUST NOT be able to create an album. A person who does not own a named album MUST NOT add pictures to it.
- **FR-007**: The owner of a picture MUST be able to delete it only after confirming. Canceling MUST leave the picture in every album it already belongs to.
- **FR-008**: After the owner confirms deletion, that picture MUST NOT appear in any album, count, or preview for anyone.
- **FR-009**: A person MUST NOT delete a picture they do not own. A picture with no owner MUST NOT be deleted.
- **FR-010**: Deleting the last picture in a date album MUST remove that date album from view. Deleting the last picture in a named album MUST leave the named album visible to its owner with a count of zero and no preview.
- **FR-011**: The owner of an album MUST be able to set that album private. Only the owner can then see the album. Other people, including a person who is not signed in, MUST NOT see it.
- **FR-012**: Setting an album private MUST NOT delete its pictures. The owner MUST still see the album and its pictures, on the same days as before.
- **FR-013**: A person who does not own an album MUST NOT set it private. An album with no owner MUST keep its current visibility.
- **FR-014**: A picture that was separately available to everyone MUST remain available on its own after its album is set private. The private album itself MUST NOT be shown to anyone except the owner.
- **FR-015**: A person who can see a picture MUST be able to select it and see the whole picture enlarged to the largest size that fits on the screen, with its shape unchanged and no part cut off.
- **FR-016**: An enlarged picture MUST remain until the person dismisses it. Dismissing it MUST return the person to the same album they were viewing.
- **FR-017**: When the available screen changes size while a picture is enlarged, the picture MUST be fitted again so the whole picture stays visible without stretching.
- **FR-018**: A person who cannot see a picture MUST NOT be able to enlarge it. If a selected picture cannot be shown, the person MUST be told and the album they were viewing MUST stay in place.
- **FR-019**: A picture already in the library MUST NOT be added again on any day, including a different calendar day. The original picture, its original day, and the existing counts MUST stay unchanged, and the person MUST be told the picture is already in the library.
- **FR-020**: Two different pictures that use the same file name MUST both be addable. The refusal in FR-019 applies to the same picture, not to the file name, and not to a different picture that only looks similar.
- **FR-021**: A named album a person is allowed to see MUST show its name, its picture count, and a preview of the first picture added to it. An empty named album MUST show its name, a count of zero, and no preview.

### Key Entities *(include if feature involves data)*

- **Named album**: An album a signed-in person creates with a name. It starts visible only to that person, may contain zero or more of that person's pictures, and can be set private by its owner. It is not a date album. Its preview is the first picture added to it.
- **Date album**: The existing day grouping for pictures. A picture stays in its date album when it is also placed in a named album. A date album disappears from view when it no longer contains a picture. Its owner can set it private.
- **Picture**: A still image owned by the person who added it, unless it was already in the library before any account existed and therefore has no owner. The owner may delete it after confirming. The same picture cannot be added to the library again. A picture may appear in its date album and in one or more named albums of its owner.
- **Person**: Someone who creates an account and signs in, as the organizer already allows. Only a signed-in owner can create named albums, add their pictures to those albums, delete their pictures, and set their albums private.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a first-use test, at least 9 of 10 signed-in people create a named album and place an existing picture into it within 2 minutes.
- **SC-002**: After an owner confirms deletion of 20 pictures, reviewers see none of those 20 pictures in any album, and each affected count matches the number of pictures that remain.
- **SC-003**: After an owner sets 20 public albums private, people other than the owner see none of those 20 albums, and the owner still sees all 20 with their pictures still present.
- **SC-004**: For 20 pictures of different shapes, including pictures wider than the screen and taller than the screen, selecting each one shows the entire picture within 1 second, with no stretching and no cropping.
- **SC-005**: At least 9 of 10 people enlarge a picture and return to the same album on the first attempt.
- **SC-006**: In 20 attempts to add a picture that is already stored on an earlier day, none of the attempts create a second copy, all 20 original days stay unchanged, and each attempt tells the person the picture is already in the library.
- **SC-007**: In 20 attempts to add a different picture that reuses a file name already in the library, all 20 different pictures are kept and none of the original pictures are moved or removed.

## Assumptions

- The organizer already provides accounts, sign-in, date albums, and the rule that a person sees their own pictures plus albums and pictures that are available to everyone. This feature adds named albums, deletion, making an album private, a larger picture view, and a visible refusal when the same picture is added again.
- A named album is a collection the owner creates. It does not replace date albums.
- "The same picture" means the same image already kept in the library. It does not mean the same file name, and it does not mean a different picture that looks similar.
- A new picture still joins the date album for the day it was taken, or the day it was added when no taken day is known. That existing day rule is unchanged.
- An album starts visible only to its owner. The owner can still make it available to everyone, as the organizer already allows, and can then set it private again.
- A picture with no owner stays in the library. Nobody can delete it or set its album private through this feature.
- The owner must confirm before a picture is deleted. There is no separate way to remove a picture from a named album while keeping it in the library.
- Deleting a named album, renaming an album, reordering pictures, changing a picture's day, editing or cropping a picture, and adding video are out of scope.
- How the screens are built is out of scope. This specification defines what a person can do, not the tools used to construct the screens.
- Acceptance scenarios in this specification are the behaviors that must be demonstrated before release (Principle II, Testing). Each picture has one library copy, and album visibility has one rule (Principle I, Code Quality). Named albums are an additional collection and do not add a second date-grouping rule (Principle III, Maintainability).
