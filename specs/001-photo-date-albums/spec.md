# Feature Specification: Photo Date Albums

**Feature Branch**: `001-photo-date-albums`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Build a photo organizer with albums grouped by date and a tile preview of each album."

## Clarifications

### Session 2026-10-16

- Q: Who is allowed to sign in, and whose photos do they see? → A: Each person signs in and sees only their own photos, plus public albums and public photos.
- Q: Can a person who is not signed in see public albums and public photos? → A: Yes. Anyone can see public albums and photos without signing in.
- Q: Who decides that an album or a photo is public, and what is it before that decision? → A: The owner marks an album or a photo public. Until then, only the owner can see it.
- Q: How does a person get an account so they can sign in? → A: A person creates their own account, then signs in.
- Q: Who owns the photos that are already in the library before any account exists? → A: They become public and have no owner.

## User Scenarios & Testing *(mandatory)*

A person creates their own account and then signs in. They see their own photos, and they also see albums and photos that are public. A person who is not signed in sees public albums and public photos. An album or photo added after accounts exist stays visible only to its owner until that owner marks it public. Photos already in the library before any account exists become public and have no owner.

### User Story 1 - Browse albums by date (Priority: P1)

A person opens the photo organizer and sees their photos collected into albums, one album for each calendar day that has photos. Albums are grouped under the month and year they belong to, with the newest dates first. Each album is a tile that shows one preview photo from that day, the calendar date, and how many photos are in the album.

**Why this priority**: Scanning photos by date, with a preview on every album, is the organizer the request asks for. A library that already contains photos can deliver that value before adding or opening photos is available.

**Independent Test**: Place still photos from several known days into the library, open the organizer, and confirm the tiles, groupings, dates, counts, and previews. This can be demonstrated without adding photos in the session and without opening an album.

**Acceptance Scenarios**:

1. **Given** photos taken on three different days in the same month, **When** the user opens the organizer, **Then** three album tiles appear under that month and year, newest day first, and each tile shows that day's date, the number of photos, and a preview photo from that album.
2. **Given** several photos taken on a single day, **When** the user opens the organizer, **Then** that day has one tile whose preview is the earliest photo taken that day and whose count equals the number of photos from that day.
3. **Given** two photos in a day share the earliest taken time and one was added before the other, **When** the user views that album tile, **Then** the preview is the photo that was added first.
4. **Given** photos taken in two different years, **When** the user scrolls the organizer, **Then** album tiles are grouped under the matching year and month headings, newest year and month first.
5. **Given** the library has no photos, **When** the user opens the organizer, **Then** the user sees an explanation of how to add photos and sees no album tiles.
6. **Given** photos were taken on Monday and Wednesday of the same week and none on Tuesday, **When** the user opens the organizer, **Then** tiles appear only for Monday and Wednesday.

---

### User Story 2 - Open an album from its tile (Priority: P2)

A person chooses an album tile and reviews every photo from that day, in the order they were taken, without photos from any other day mixed in. Returning to the organizer shows the same tiles as before.

**Why this priority**: A tile preview is only useful if the person can open that album and see the photos it represents. Browsing tiles still works if this story is not yet available.

**Independent Test**: Open one album tile from a library that contains photos on more than one day, and confirm the opened album contains only that day's photos in taken-time order.

**Acceptance Scenarios**:

1. **Given** an album tile for a day that contains several photos, **When** the user opens that tile, **Then** they see every photo from that day, earliest first, and no photo from another day.
2. **Given** the user is viewing an album, **When** they return to the organizer, **Then** the same album tiles, groupings, counts, and previews are shown.

---

### User Story 3 - Add photos into date albums (Priority: P3)

A person adds one or more still photos. Each photo joins the album for the day it was taken. The matching tile appears or updates its count and preview. Photos are still there, in the same albums, after the person leaves and comes back.

**Why this priority**: The date-tile view can be shown from photos already in the library. Adding photos is what lets a new library grow into those albums.

**Independent Test**: Start from an empty library, add still photos with known taken dates, leave, and reopen. Confirm each date has one tile with the right count and preview.

**Acceptance Scenarios**:

1. **Given** an empty library, **When** the user adds photos taken on a known date, **Then** one album tile appears for that date, the count matches the photos added, and the preview is the earliest photo from that date.
2. **Given** an album already exists for a date, **When** the user adds another photo taken on that date, **Then** the count increases by one and the preview remains the earliest photo in the album.
3. **Given** a photo with no taken date, **When** the user adds it, **Then** it appears in the album for the day it was added, and that album's label states that the date was assigned.
4. **Given** a photo is already in the library, **When** the user adds that same photo again, **Then** it remains in its original album and the album count does not increase.
5. **Given** a batch includes items that cannot be shown as photos, **When** the user adds the batch, **Then** the usable photos join the correct date albums and the user is told how many items were skipped.
6. **Given** the user has added photos and seen their album tiles, **When** they leave the organizer and open it again, **Then** the same albums, counts, and previews are shown.

---

### User Story 4 - See your photos and public items (Priority: P1)

A person signs in and sees date albums for their own photos. They also see albums and photos that are public, including ones owned by someone else. They do not see another person's album or photo when it is not public.

**Why this priority**: Photos are no longer one shared library. Each person must see only what they own, plus public albums and public photos, before the date-album view is trustworthy.

**Independent Test**: Sign in as one person while another person owns both private and public photos. Confirm the signed-in person sees their own photos, the public album, and the public photo, and does not see the other person's private album or private photo. Open the organizer without signing in and confirm the public album and public photo are visible and the private ones are not.

**Acceptance Scenarios**:

1. **Given** two people each have photos and none of those albums or photos are public, **When** the first person is signed in, **Then** they see only their own albums and photos.
2. **Given** another person owns an album that is public, **When** a signed-in person views the organizer, **Then** that public album is visible, including the photos that belong to it.
3. **Given** another person owns a photo that is public, **When** a signed-in person views the organizer, **Then** that public photo is visible.
4. **Given** another person owns an album and a photo that are not public, **When** a signed-in person views the organizer, **Then** that album and that photo are not shown.
5. **Given** public albums and public photos exist, **When** a person who is not signed in opens the organizer, **Then** those public albums and public photos are visible.
6. **Given** albums and photos that are not public, **When** a person who is not signed in opens the organizer, **Then** those albums and photos are not shown.
7. **Given** a person adds an album or a photo and has not marked it public, **When** anyone other than that owner views the organizer, **Then** that album or photo is not shown.
8. **Given** an owner marks their album or photo public, **When** another person or a person who is not signed in views the organizer, **Then** that album or photo is visible.
9. **Given** a person is not the owner of an album or photo, **When** they try to mark it public, **Then** it stays not public.

---

### User Story 5 - Create an account (Priority: P1)

A person creates their own account and then signs in. Nobody else has to create that account. After signing in, photos they add belong to them.

**Why this priority**: Sign-in is required to see and add one's own photos. A person needs a way to get an account without an administrator.

**Independent Test**: With no account for a new person, create an account, sign in, and add a photo. Confirm that person sees the photo and another person does not, unless it is public.

**Acceptance Scenarios**:

1. **Given** a person has no account, **When** they create an account and sign in, **Then** they are signed in as that person and see their own photos plus public albums and public photos.
2. **Given** a person has created an account, **When** they sign in and add a photo, **Then** that photo belongs to them.
3. **Given** a person has not created an account, **When** they try to sign in, **Then** they are not signed in.
4. **Given** photos are already in the library before any account exists, **When** the first person creates an account, **Then** those photos are public, have no owner, and are visible without signing in.
5. **Given** those pre-existing photos are public and have no owner, **When** a person creates an account, **Then** that account does not own those photos.

---

### Edge Cases

- A day with one photo still appears as an album tile. The preview is that photo and the count is 1.
- A day with hundreds of photos still appears as one tile. The count is the full number, and opening the album shows every photo from that day.
- A day with no photos does not appear as an album.
- A photo whose taken time falls on a calendar-day boundary stays on the calendar date recorded with the photo.
- Photos dated many years in the past, or on a future calendar date, still appear in the album for that recorded date.
- When several photos share the earliest taken time, the preview is the one added first, and adding other photos does not change it.
- Adding the same photo again does not create a second copy or a second album.
- If every item in a batch cannot be shown, no album tile is created from that batch, and the user is told that all of the items were skipped.
- After the user leaves and returns, assigned-date albums keep the label that states the date was assigned.
- A signed-in person sees none of another person's albums or photos when those albums and photos are not public.
- Anyone, including a person who is not signed in, sees a public album and a public photo.
- A person who is not signed in sees none of the albums or photos that are not public.
- A newly added album or photo is not public, and only its owner can see it until that owner marks it public.
- A person who does not own an album or photo cannot mark it public.
- A person can create their own account and then sign in. Someone else is not required to create that account.
- A person who has not created an account is not signed in.
- Photos already in the library before any account exists become public and have no owner. Creating an account does not give that person those photos.
- A photo added after an account exists stays private to its owner, even when the same day already has a public photo with no owner.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present the user's still photos as albums, with one album for each calendar day that contains at least one photo.
- **FR-002**: The system MUST group album tiles under the month and year of each album date, with the newest year, month, and day first.
- **FR-003**: The system MUST show each album as one tile whose preview image is a single photo from that album.
- **FR-004**: Each album tile MUST show the album's calendar date and the number of photos in the album.
- **FR-005**: The tile preview MUST be the earliest photo taken that day. When more than one photo shares that earliest time, the preview MUST be the photo added first. Adding other photos to the album MUST NOT change that preview.
- **FR-006**: The user MUST be able to open an album from its tile and see every photo from that day in taken-time order, earliest first, with no photos from other days.
- **FR-007**: The user MUST be able to add one or more still photos to the library.
- **FR-008**: A newly added photo that has a taken date MUST appear only in the album for that calendar date.
- **FR-009**: A newly added photo with no taken date MUST appear in the album for the day it was added, and that album MUST be labeled to state that the date was assigned.
- **FR-010**: The same photo MUST appear in only one album. Adding it again MUST NOT create a second copy or increase the album count.
- **FR-011**: When the library has no photos, the system MUST explain how to add photos and MUST NOT show album tiles.
- **FR-012**: When an added item cannot be shown as a photo, the system MUST skip that item, keep the remaining photos usable, and tell the user how many items were skipped.
- **FR-013**: The system MUST NOT show an album tile for a calendar day that has no photos.
- **FR-014**: Photos, album membership, counts, previews, and assigned-date labels MUST remain the same when the user leaves the organizer and opens it again.
- **FR-015**: A person MUST sign in to see their own photos.
- **FR-016**: A signed-in person MUST see their own photos, and MUST also see albums and photos that are public, including albums and photos owned by someone else.
- **FR-017**: A signed-in person MUST NOT see another person's album or photo unless that album or that photo is public. A public album includes the photos that belong to it.
- **FR-018**: A person who is not signed in MUST see public albums and public photos, and MUST NOT see an album or photo that is not public.
- **FR-019**: A newly added album or photo MUST NOT be public until its owner marks that album or that photo public. Until then, only its owner can see it.
- **FR-020**: Only the owner of an album or photo MUST be able to mark it public. Another person MUST NOT make it public.
- **FR-021**: A person MUST be able to create their own account and then sign in. Another person MUST NOT be required to create that account.
- **FR-022**: A person who has not created an account MUST NOT be signed in.
- **FR-023**: Every photo already in the library before any account exists MUST become public and MUST have no owner. Creating an account MUST NOT assign those photos to that person. A photo added after an account exists is unchanged by this rule.

### Key Entities *(include if feature involves data)*

- **Person**: Someone who creates their own account and then signs in. They own the photos they add. When signed in, they see their own photos and any album or photo that is public. A person who has not created an account is not signed in. A person who is not signed in sees public albums and public photos only.
- **Photo**: A still image in one date album. It has a taken date when one is known, otherwise the day it was added. The same photo added again remains the original photo. A photo added after an account exists has an owner, starts not public, and only that owner can mark it public. A photo already in the library before any account exists is public and has no owner. Anyone, including a person who is not signed in, can see a photo when it is public or its album is public. Its owner, when it has one, can see it while signed in.
- **Album**: The set of photos that share one calendar day. It has a date label, a photo count, one preview photo, and, when the date was assigned, a label stating that the date was assigned. It starts not public, and only its owner can mark it public. A public album is visible to anyone, including a person who is not signed in, with the photos that belong to it.
- **Date group**: The year and month heading under which album tiles for that month are shown. It is derived from album dates and is not a separate collection the user creates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a review of 20 album tiles with known dates, a user identifies the correct day from the tile preview and date label for at least 19 tiles (95%) without opening the album.
- **SC-002**: A user opening a library of 1,000 photos sees the first screen of album tiles within 3 seconds.
- **SC-003**: 100% of photos that have a taken date appear in the album for that calendar date and in no other album.
- **SC-004**: A user opens an album of up to 200 photos from its tile and sees the full set of that day's photos within 5 seconds.
- **SC-005**: In a first-use test, at least 90% of users add a still photo and find its date album tile without help.
- **SC-006**: After leaving and reopening the organizer, 100% of previously shown albums match the earlier dates, counts, and previews.
- **SC-007**: When a signed-in person reviews 20 albums and photos owned by someone else that are not public, they see none of them. When they review 20 public albums or public photos owned by someone else, they see all 20.
- **SC-008**: A person who is not signed in sees all 20 of 20 public albums or public photos, and sees none of 20 albums or photos that are not public.
- **SC-009**: Of 20 newly added albums and photos that the owner has not marked public, everyone except that owner sees none of them. After that owner marks the same 20 public, other people see all 20.
- **SC-010**: In a first-use test of 10 new people, all 10 create their own account, sign in, and see their own photos without another person creating the account.
- **SC-011**: 100% of photos present before any account exists are visible without signing in, and none of them belongs to the first account created.

## Assumptions

- Each person creates their own account and then signs in. They see only their own photos, plus albums and photos that are public. A person who is not signed in can see public albums and public photos. An album or photo added after an account exists starts visible only to its owner, and only that owner can mark it public. Photos already in the library before any account exists are public and have no owner.
- An album is one calendar day of photos, not a named album the user creates. Custom albums, search, maps, and grouping by person are out of scope.
- Album tiles are grouped under year and month headings so a long history stays scannable. The tile itself always represents a single day.
- The date used for grouping is the calendar date recorded as when the photo was taken. When that date is missing, the day the user added the photo is used and the album label says the date was assigned.
- The tile preview is one photo, the earliest in the album, not a collage of several photos.
- Only still photos are included. Video and other non-photo items are skipped and counted in the skip message.
- The user can choose still photos they already have and add them to the library. How those photos are stored is outside this specification.
- Deleting, editing, cropping, filters, and cloud sync across devices are out of scope.
- "The same photo" means the same image added again, not two different photos that happen to look alike.
- Acceptance scenarios in this specification are the behaviors that must be demonstrated before release (Principle II, Testing). One photo belongs to one date album everywhere the library is shown (Principle I, Code Quality). This feature uses day albums only, with no extra album types (Principle III, Maintainability).
