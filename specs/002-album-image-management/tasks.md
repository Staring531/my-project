---
description: "Task list for Album and Image Management implementation"
---

# Tasks: Album and Image Management

**Input**: Design documents from `/specs/002-album-image-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included. The specification requires every acceptance scenario to be demonstrated before release (Principle II, Testing), and the constitution makes that proof automated. Write each story's tests first and confirm they fail before implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Local web app from `plan.md`: `src/client/`, `src/server/`, `tests/unit/`, `tests/integration/`, `tests/contract/`
- Runtime library, not source: `data/library.sqlite` and `data/images/`
- Generated build: `dist/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep the existing local app and add no new toolchain

- [X] T001 [P] Confirm `package.json` keeps `"type": "module"`, `engines.node` `>=24.20.0`, scripts `test` = `node --test`, `dev` = `node scripts/dev.js`, `build` = `vite build`, and `start` = `node src/server/server.js`, and adds no dependency (Quality Constraints)
- [X] T002 [P] Confirm `vite.config.js` still uses root `src/client` and proxies `/api` and `/images` to the local server, with no TypeScript or UI-framework plugin, per `specs/002-album-image-management/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stored named-album tables that every later story can use without a second migration

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add `named_albums`, `named_album_photos`, and `named_album_publications` to the schema in `src/server/db.js` with `CREATE TABLE IF NOT EXISTS`, foreign keys on, and no rewrite of existing photo, person, session, or `album_publications` rows. Quote these rules from `specs/002-album-image-management/data-model.md`: `named_albums.id` "Primary key. Generated UUID. The API id is `named:{id}`."; `owner_id` "References `people.id`."; `name` "Trimmed, 1 to 64 characters. Unique for that owner. Comparison is case-sensitive."; `created_at` "UTC instant `YYYY-MM-DDTHH:MM:SS.SSSZ`."; `named_album_photos.named_album_id` "References `named_albums.id`. Part of the primary key."; `photo_id` "References `photos.id`. Part of the primary key."; `member_seq` "Unique within the named album. The first picture added has the lowest value."; `named_album_publications.named_album_id` "Primary key. References `named_albums.id`."; `published_at` "UTC instant when the owner marked it public." Enforce uniqueness with `UNIQUE (owner_id, name)` and `UNIQUE (named_album_id, member_seq)`. Deleting a picture must be able to delete its `named_album_photos` links. Do not implement create, list, or privacy behavior in this task.

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create a named album (Priority: P1) 🎯 MVP

**Goal**: A signed-in person creates a named album, sees it empty, and places their own existing pictures into it without removing those pictures from their date albums.

**Independent Test**: Sign in, create a named album, add two pictures the person already owns, and confirm the album shows that name, a count of 2, and those pictures, while each picture still appears on its original day.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T004 [P] [US1] Contract tests in `tests/contract/library-api.test.js` for `POST /api/albums` (`201` named album with `photoCount` 0, `public` false, and `coverImageUrl` null; `401` "Sign in to create an album."; `400` "Enter an album name of 1 to 64 characters."; `409` "An album with that name already exists."), `GET /api/albums` including `namedAlbums` without changing the date-album `albums` array, `GET /api/albums/named:{id}/photos` (`200` with `photos` `[]` or member pictures in `member_seq` order, `404` "No album exists for that id."), and `POST /api/albums/named:{id}/photos` (`201` `status` "added", `200` `status` "present", `401` "Sign in to add a picture to an album.", `403` "Only the owner can add pictures to that album.", `404` "No album exists for that id." or "No photo exists for that id.") per `specs/002-album-image-management/contracts/library-api.md`. A date-album id is refused by `POST /api/albums/{albumId}/photos` and does not store image bytes (Principle II, Testing)
- [X] T005 [P] [US1] Integration test in `tests/integration/library-storage.test.js` that a trimmed name of 1 to 64 characters inserts one private `named_albums` row, an empty name, a name of only spaces, or a trimmed name longer than 64 characters inserts none, the same owner and same trimmed name inserts none, another owner may use that name, linking an owned picture keeps `photos.album_date` unchanged, linking it again does not change `member_seq` or the count, and a picture with a different `owner_id` or a null `owner_id` is not linked (Principle II, Testing)
- [X] T006 [P] [US1] Unit test in `tests/unit/library-view.test.js` that a signed-in library includes a create-album form and one named-album tile with the named album id, the name, the count, and the cover URL when a cover exists; an empty tile includes the id, the name, a count of zero, and no cover URL; a signed-out library has no create-album form; year and month headings are not applied to named albums (Principle II, Testing)
- [X] T007 [P] [US1] Unit test in `tests/unit/album-view.test.js` that a named album shows its name, its count, and a control for the owner to add one of their existing pictures, that a date album offers a control to place an owned picture into one of the owner's named albums, and that a person who does not own the album or the picture has neither control (Principle II, Testing)
- [X] T008 [P] [US1] Unit test in `tests/unit/library.test.js` that the stored name is the trimmed input, comparison is case-sensitive, and the cover is the linked picture with the lowest `member_seq` (Principle II, Testing)

### Implementation for User Story 1

- [X] T009 [US1] Implement create, list, and link in `src/server/library.js`. Quote these rules from `specs/002-album-image-management/data-model.md`: "The stored name is the trimmed input. An empty name, a name of only spaces, or a trimmed name longer than 64 characters does not insert a row."; "A second named album for the same owner and the same trimmed name does not insert a row. Another owner's identical name does."; "The picture's `owner_id` must equal the named album's `owner_id`. A picture with no owner cannot be linked."; "Linking the same picture again does not insert a second row and does not change `member_seq`." The first picture added has the lowest `member_seq` and is the cover. Listing returns named albums the viewer can see, including an empty one owned by them, ordered by `created_at` descending then `id` ascending. A picture's date album is not changed (Principle I, Code Quality)
- [X] T010 [US1] Register `POST /api/albums`, `POST /api/albums/{albumId}/photos` for a `named:` id only, and add `namedAlbums` to `GET /api/albums` and named-album handling to `GET /api/albums/{albumId}/photos` in `src/server/server.js` with the status codes and messages from `specs/002-album-image-management/contracts/library-api.md`. Leave the version 2.0.0 date-album `albums` objects and `No album exists for that date.` unchanged
- [X] T011 [P] [US1] Render the create-album form and named-album tiles in `src/client/library-view.js` per `specs/002-album-image-management/contracts/library-ui.md`. Extend `renderLibrary` so `namedAlbums` are a separate list. Do not pass them through the year and month loop that reads `album.year` and `album.albumDate`. An empty named album has no cover image element
- [X] T012 [P] [US1] Extend `renderAlbum` in `src/client/album-view.js` so a named album shows its name, its count, and every picture in response order, and the owner sees a control to add one existing picture by id. On a date album, an owned picture offers a control to place it into one of the owner's named albums. A `present` result is not a second entry. A person who does not own the picture has no add control, per `specs/002-album-image-management/contracts/library-ui.md`
- [X] T013 [P] [US1] Style named-album tiles, the empty count, and the create-album form in `src/client/styles.css`
- [X] T014 [P] [US1] Add `createNamedAlbum` and `addPhotoToNamedAlbum` to `src/client/api.js` and read `namedAlbums` from `GET /api/albums`
- [X] T015 [US1] Wire create, the 400 and 409 messages, a 401 that returns to the signed-out screen, the named-album route, and a `present` result that does not change the count in `src/client/main.js`. Pass `namedAlbums` into the library view and the album object plus the owner's named albums into `renderAlbum`

**Checkpoint**: User Story 1 is functional and testable without deletion, privacy, or the enlarged picture

---

## Phase 4: User Story 2 - Delete a picture (Priority: P1)

**Goal**: The owner confirms, and the picture disappears from every album. Cancel leaves it in place. A named album with no pictures left remains. A date album with no pictures left does not.

**Independent Test**: Sign in as the owner of a picture that appears in a date album and a named album, confirm deletion, and confirm the picture is gone from both. Repeat with cancel and confirm the picture remains.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T016 [P] [US2] Contract tests in `tests/contract/library-api.test.js` for `DELETE /api/photos/{photoId}`: `204` empty body, `401` "Sign in to delete a picture.", `403` "Only the owner can delete that picture." including a null `ownerId`, and `404` "No photo exists for that id." A later `GET /images/{storedName}` for the deleted file is 404, per `specs/002-album-image-management/contracts/library-api.md` (Principle II, Testing)
- [X] T017 [P] [US2] Integration test in `tests/integration/library-storage.test.js` that a confirmed owner delete removes the photo row, every `named_album_photos` link, and the image file; when that picture was the cover and other pictures remain, the cover becomes the remaining picture with the lowest `member_seq`; the date album is absent when it was the last picture; the named album remains with count 0 and no cover; a non-owner delete and an unowned-picture delete leave the row and the file; a failure before the database commit leaves the picture in place (Principle II, Testing)
- [X] T018 [P] [US2] Unit test in `tests/unit/album-view.test.js` that a delete control is present only for a picture whose owner is the signed-in person on both the date album and the named album, confirm and cancel appear only after delete is chosen, and cancel leaves the picture id in the album markup (Principle II, Testing)

### Implementation for User Story 2

- [X] T019 [P] [US2] Add a delete of one stored image file by `stored_name` in `src/server/files.js` that fails when the file cannot be removed. Do not send picture deletion through `removeImage`, which ignores a failed removal. A missing file is a failed delete, not a silent success (Quality Constraints)
- [X] T020 [US2] Implement `deletePhoto` in `src/server/library.js` so only the owner deletes their picture, a null `owner_id` is not deleted, `is_public` is never set back to `0` by this path, and success removes the photo row, its named-album links, and the image file. Quote this rule from `specs/002-album-image-management/research.md`: "A failure before the database commit leaves the picture in place." (Principle I, Code Quality)
- [X] T021 [US2] Register `DELETE /api/photos/{photoId}` in `src/server/server.js` with the `204`, `401`, `403`, and `404` bodies from `specs/002-album-image-management/contracts/library-api.md`
- [X] T022 [P] [US2] Add the two-step delete control to `src/client/album-view.js` for a date album and a named album: delete, then confirm and cancel. Cancel does not call the server. No delete control for a picture the person does not own
- [X] T023 [P] [US2] Add `deletePhoto` to `src/client/api.js` for `DELETE /api/photos/{photoId}`
- [X] T024 [US2] On confirm, call delete and show the album the API returns from `src/client/main.js`. Cancel only clears the confirm step. After the last picture in a date album is deleted, that date album is no longer shown

**Checkpoint**: User Stories 1 and 2 both work, and deletion can be tested with seeded rows

---

## Phase 5: User Story 3 - Set an album private (Priority: P1)

**Goal**: The owner can make a public date album or named album private. Pictures stay. A picture that is public on its own stays visible. Other people cannot make an album private.

**Independent Test**: Mark an owned album public, confirm another person can see it, set it private, and confirm that other person no longer sees the album while the owner still does.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T025 [P] [US3] Contract tests in `tests/contract/library-api.test.js` for `DELETE /api/albums/{albumId}/publication`: `200` with `public` false when the album was public and when it was already private, `401` "Sign in to change an album.", `403` "Only the owner can make that album private." including an `unowned:` album, date-album `404` "No album exists for that date.", and named-album `404` "No album exists for that id." Also assert `POST /api/albums/{albumId}/publication` can mark a named album public, and `GET /images/{storedName}` returns the file when the caller can see the picture in a named album and otherwise stays 404 `That image is not available.` per `specs/002-album-image-management/contracts/library-api.md` (Principle II, Testing)
- [X] T026 [P] [US3] Integration test in `tests/integration/library-storage.test.js` that setting a date album or named album private deletes only its publication row, pictures and `album_date` stay, a picture with `is_public` 1 remains visible on its own, a public named album's pictures are readable by a non-owner through that named album and not through the owner's private date album, an empty named album set private stays visible only to its owner, and a non-owner or unowned album is unchanged (Principle II, Testing)
- [X] T027 [P] [US3] Unit test in `tests/unit/library-view.test.js` that a private control is present only for an album whose owner is the signed-in person and whose `public` flag is true, and a publication control remains only when that owner’s `public` flag is false (Principle II, Testing)

### Implementation for User Story 3

- [X] T028 [US3] Implement make-private in `src/server/library.js`. An album is public only while a publication row exists. Setting a date album private deletes its `album_publications` row. Setting a named album private deletes its `named_album_publications` row. Deleting a row that is already absent leaves the album private. Do not delete pictures and do not change `photos.is_public`. Extend `markAlbumPublic` so the owner can mark a named album public. Image bytes are readable when the viewer can see the picture in its date album or in at least one named album, and both checks stay in this file. A public named album does not make its pictures visible in a private date album (Principle I, Code Quality)
- [X] T029 [US3] Register `DELETE /api/albums/{albumId}/publication` in `src/server/server.js` and accept a `named:` id on the existing `POST /api/albums/{albumId}/publication`, using the messages in `specs/002-album-image-management/contracts/library-api.md`
- [X] T030 [P] [US3] Show the make-private control on the signed-in library in `src/client/library-view.js` only for an owned album whose `public` flag is true, per `specs/002-album-image-management/contracts/library-ui.md`
- [X] T031 [P] [US3] Add `makeAlbumPrivate` to `src/client/api.js` for `DELETE /api/albums/{albumId}/publication`
- [X] T032 [US3] Wire the private control in `src/client/main.js` so the library shows the albums the API returns after the change

**Checkpoint**: User Stories 1, 2, and 3 work. Privacy can be tested on a date album without using the create-album form

---

## Phase 6: User Story 4 - Enlarge a picture (Priority: P2)

**Goal**: A person who can see a picture selects it and sees the whole picture fitted to the screen. Dismissing it returns to the same album.

**Independent Test**: Open an album the person can see, select a picture, confirm the whole picture fits the screen without stretching, dismiss it, and confirm the same album is shown again.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T033 [P] [US4] Unit test in `tests/unit/preview-view.test.js` that the enlarged picture includes the picture URL and `data-preview-fit="contain"`, it is absent until a picture is selected, it is absent after dismissal, and a failed load includes the sentence `This picture cannot be shown.` (Principle II, Testing)

### Implementation for User Story 4

- [X] T034 [P] [US4] Create `src/client/preview-view.js` to open over the current album, show the picture URL with `data-preview-fit="contain"`, dismiss back to that album, and show `This picture cannot be shown.` when the picture cannot be loaded, per `specs/002-album-image-management/contracts/library-ui.md`
- [X] T035 [P] [US4] In `src/client/styles.css`, fit the enlarged picture to the screen with the layer filling the viewport and the image at `width: 100%`, `height: 100%`, and `object-fit: contain`, so a smaller picture is enlarged and a wider or taller picture stays whole. Do not add a resize listener; the viewport fit is the refit
- [X] T036 [P] [US4] Add a select-picture control for each visible picture in `src/client/album-view.js`. Do not offer a picture the album response did not include
- [X] T037 [US4] Open and dismiss the enlarged picture, including Escape and the close control, from `src/client/main.js` without loading a different album

**Checkpoint**: The enlarged picture works on a date album or a named album the person can already open

---

## Phase 7: User Story 5 - Keep a picture on its original day (Priority: P2)

**Goal**: The same picture bytes cannot be added on a later day. The person is told the picture is already in the library. A different picture that reuses the file name is kept.

**Independent Test**: Add a picture that is stored on 2025-10-15, try to add that same picture on 2026-10-16, and confirm the 2025-10-15 album is unchanged and no 2026-10-16 copy exists. Add a different picture that uses the same file name and confirm it is kept.

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T038 [P] [US5] Integration test in `tests/integration/library-storage.test.js` that bytes already stored on 2025-10-15 return `200` `status` "duplicate" when added for 2026-10-16, the original `album_date` stays `2025-10-15`, no second row and no second file are written, a named album does not gain a second membership from that refusal, and a different picture that uses the same `original_name` is stored (Principle II, Testing)
- [X] T039 [P] [US5] Unit test in `tests/unit/library-view.test.js` that a duplicate result renders the sentence `This picture is already in the library.` and does not increase a count (Principle II, Testing)

### Implementation for User Story 5

- [X] T040 [US5] Keep SHA-256 `content_hash` as the only same-picture rule in `src/server/library.js`. Do not add a unique constraint or comparison on `original_name`. A duplicate response does not change `album_date` and omits `photo` when the caller cannot see that picture, per `specs/002-album-image-management/contracts/library-api.md` (Principle I, Code Quality)
- [X] T041 [P] [US5] Render `This picture is already in the library.` from a duplicate result in `src/client/library-view.js`
- [X] T042 [US5] Include that sentence from `src/client/main.js` when `POST /api/photos` reports `status` "duplicate", including a duplicate of a picture from another day. A duplicate does not add a membership to a named album

**Checkpoint**: All five user stories work on their own

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Prove the stories still pass together and match the quickstart

- [X] T043 [P] Run `npx biome check src tests` and fix violations in the files this feature changed (Principle I, Code Quality)
- [X] T044 Run `npm test` from the repository root and keep every existing assertion. Do not delete or weaken a failing test (Principle II, Testing)
- [X] T045 Walk checks 1 through 10 in `specs/002-album-image-management/quickstart.md` after `npm test` is green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 8)**: Depends on the user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Tests may seed a named album; they do not need the create-album form
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - A date album can be made private without User Story 1
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Uses the album screen that already exists
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Uses the existing add-photo route

Do not implement two stories at the same time when they edit the same file. `src/server/library.js`, `src/server/server.js`, `src/client/main.js`, `src/client/api.js`, `src/client/library-view.js`, `src/client/album-view.js`, and `src/client/styles.css` are shared. The safe order is Phase 3, then 4, then 5, then 6, then 7.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Library rules before routes
- Routes before the client call
- Story complete before moving to the next priority

### Parallel Opportunities

- T001 and T002 can run in parallel
- Tests in one story marked [P] can run in parallel because they use different files
- T011, T012, T013, and T014 can run in parallel after T010
- T019, T022, and T023 can run in parallel
- T030 and T031 can run in parallel after T029
- T034, T035, and T036 can run in parallel
- T038 and T039 can run in parallel
- T041 can run in parallel with T040
- T043 runs after the stories, before or beside T044

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Contract tests in tests/contract/library-api.test.js"
Task: "Integration test in tests/integration/library-storage.test.js"
Task: "Unit test in tests/unit/library-view.test.js"
Task: "Unit test in tests/unit/album-view.test.js"
Task: "Unit test in tests/unit/library.test.js"

# After the routes exist, client files together:
Task: "Render named-album tiles in src/client/library-view.js"
Task: "Render the add-existing-picture control in src/client/album-view.js"
Task: "Style named-album tiles in src/client/styles.css"
Task: "Add createNamedAlbum and addPhotoToNamedAlbum in src/client/api.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Create Holiday, place two existing pictures in it, and confirm both date albums still show them
5. Demo that increment before deletion, privacy, or the enlarged picture

### Incremental Delivery

1. Setup + Foundational → tables exist, no new behavior yet
2. User Story 1 → named albums (MVP)
3. User Story 2 → delete a picture
4. User Story 3 → make an album private
5. User Story 4 → enlarged picture
6. User Story 5 → the same picture cannot be added on a later day
7. Polish → Biome, the full suite, and the quickstart

### Parallel Team Strategy

With multiple developers:

1. Complete Setup and Foundational together
2. After that, split only work that does not share a file. User Story 4's new `src/client/preview-view.js` and User Story 2's `src/server/files.js` are the safe splits. Keep `src/server/library.js` and `src/client/main.js` with one person at a time

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
