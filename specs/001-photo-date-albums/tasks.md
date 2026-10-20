---
description: "Task list for Photo Date Albums implementation"
---

# Tasks: Photo Date Albums

**Input**: Design documents from `/specs/001-photo-date-albums/`

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

**Purpose**: Project initialization and basic structure

- [X] T001 Create `src/client/`, `src/server/`, `tests/unit/`, `tests/integration/`, `tests/contract/`, and `scripts/` as listed in `specs/001-photo-date-albums/plan.md`
- [X] T002 Create `package.json` with `"type": "module"`, `engines.node` `>=24.20.0`, dependencies `vite` (vanilla client) and `exifr` (raw EXIF taken date), devDependency `@biomejs/biome` (Principle I, Code Quality), and scripts `test` = `node --test`, `dev` = `node scripts/dev.js`, `build` = `vite build`; run npm install
- [X] T003 [P] Create `biome.json` so formatting and static analysis cover project JavaScript (Principle I, Code Quality)
- [X] T004 [P] Create `.gitignore` ignoring `node_modules/`, `dist/`, and `data/`
- [X] T005 [P] Create `vite.config.js` with root `src/client`, dev-server proxy of `/api` and `/images` to `http://127.0.0.1:3000`, and build output `dist/` at the repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create `scripts/dev.js` to start `src/server/server.js` and Vite, using `PORT` (default `3000`) and `DATA_DIR` (default `data`) from the environment (Quality Constraints)
- [X] T007 [P] Create `src/server/db.js` to open `node:sqlite` `DatabaseSync` at `{DATA_DIR}/library.sqlite` and create `photos` with these rules quoted from `specs/001-photo-date-albums/data-model.md`: `id` "Primary key. Generated UUID. Also the stable identity in API responses."; `content_hash` "SHA-256 of the file bytes. Unique. A second add of the same bytes returns this row and does not insert another."; `stored_name` "File name under the image directory, `{id}.{ext}`. Unique. Never taken from the user's file name."; `media_type` "One of `image/jpeg`, `image/png`, `image/gif`, `image/webp`, matching the file signature."; `original_name` "Name the user chose, kept for diagnosis. Not used as a path or as the album label."; `taken_at` "Local EXIF timestamp `YYYY-MM-DDTHH:MM:SS` with no offset. Null when the file has no `DateTimeOriginal`."; `added_at` "UTC instant `YYYY-MM-DDTHH:MM:SS.SSSZ` when the add succeeded."; `added_seq` "Unique. Greater than every previously stored photo. Tie-break for \"added first\"."; `album_date` "`YYYY-MM-DD`. The calendar day of `taken_at` when the date was taken from the photo. Otherwise the calendar day of `added_at` in the timezone passed to the date rule."; `date_assigned` "`0` when `taken_at` is present. `1` when the date was assigned."; plus "`album_date` is a real calendar day. The date rule is the only writer of this field."; "When `date_assigned` is `0`, `taken_at` is present and its first 10 characters equal `album_date`."; "When `date_assigned` is `1`, `taken_at` is null."; "`media_type` is one of the four types above. Any other file is not a row."; "`stored_name` contains no path separators."; "A stored photo has exactly one row and exactly one file. A failed add leaves neither."
- [X] T008 [P] Create `src/server/server.js` with `node:http`, injectable `PORT` and `DATA_DIR`, a JSON error body `{ "error": "..." }` whose message says what failed, and serving of `dist/` when that directory exists. Do not add story routes in this task (Quality Constraints)
- [X] T009 [P] Create `src/client/api.js` with a fetch wrapper that returns parsed JSON and passes `{ "error": "..." }` to the caller instead of swallowing it (Quality Constraints)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse albums by date (Priority: P1) 🎯 MVP

**Goal**: Show one tile per stored album, grouped under year and month, newest first, with one cover, the date, and the photo count. An empty library explains how to add photos and shows no tiles.

**Independent Test**: Seed still photos from several known days into a temporary library, open the organizer, and confirm tiles, groupings, dates, counts, and covers without adding photos in the session and without opening an album.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T010 [P] [US1] Contract test `GET /api/albums` in `tests/contract/library-api.test.js` for `200` `{ "albums": [] }` on an empty library and, when photos exist, album objects with `id`, `albumDate`, `year`, `month`, `photoCount`, `dateAssigned`, and `coverImageUrl` only (no image bytes), ordered by `album_date` descending (Principle II, Testing)
- [X] T011 [P] [US1] Integration test in `tests/integration/library-storage.test.js` that seeds `photos` rows in a temporary `DATA_DIR` and checks three days in one month, one day with several photos whose cover is the earliest `taken_at`, a same-time tie whose cover is the lower `added_seq`, Monday and Wednesday with no Tuesday album, two years under year and month headings, and an assigned-date album (Principle II, Testing)
- [X] T012 [P] [US1] Unit test in `tests/unit/library-view.test.js` that empty markup explains how to add photos and includes no tile, and that a tile includes the album id, calendar date, photo count, cover URL, and the assigned-date text only when `dateAssigned` is true (Principle II, Testing)

### Implementation for User Story 1

- [X] T013 [US1] Create `src/server/dates.js` with `parts(albumDate)` as the only split of a stored `YYYY-MM-DD` into year and month (Principle I, Code Quality)
- [X] T014 [US1] Implement `listAlbums` in `src/server/library.js` so an album is derived from (`album_date`, `date_assigned`), library order is "`album_date` descending, then taken-date before assigned-date on the same day", and the cover is the first photo in "`taken_at` ascending, then `added_seq` ascending" (Principle I, Code Quality)
- [X] T015 [US1] Register `GET /api/albums` and `GET /images/{storedName}` in `src/server/server.js`, including `404` `{ "error": "..." }` when the image name is unknown, is not a single file name, or has no file on disk
- [X] T016 [P] [US1] Create `src/client/library-view.js` to render `specs/001-photo-date-albums/contracts/library-ui.md`: year and month headings when the year or month changes, without reordering albums, one tile per album, and the empty state
- [X] T017 [P] [US1] Create `src/client/styles.css` for the year and month headings, the album tile grid, and the empty state
- [X] T018 [US1] Add `getAlbums` to `src/client/api.js` for `GET /api/albums`
- [X] T019 [US1] Create `src/client/index.html` and `src/client/main.js` to load albums and show the library screen, including a visible add control that this story does not yet submit

**Checkpoint**: User Story 1 is functional and testable without opening an album or adding photos through the UI

---

## Phase 4: User Story 2 - Open an album from its tile (Priority: P2)

**Goal**: Open a tile and show every photo from that album, earliest first, with no photo from another album. Going back shows the same library tiles.

**Independent Test**: Open one album from a library that contains photos on more than one day and confirm only that day's photos appear in taken-time order.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T020 [P] [US2] Contract test `GET /api/albums/{albumId}/photos` in `tests/contract/library-api.test.js` for `200` with `album` and `photos` whose `albumId` matches the path, photo fields `id`, `albumId`, `albumDate`, `dateAssigned`, `takenAt`, `addedAt`, and `imageUrl`, plus `404` `{ "error": "No album exists for that date." }` (Principle II, Testing)
- [X] T021 [P] [US2] Integration test in `tests/integration/library-storage.test.js` that a seeded multi-day library returns only the requested album, earliest `taken_at` then `added_seq` first, and that listing albums again returns the same ids, counts, and cover URLs (Principle II, Testing)
- [X] T022 [P] [US2] Unit test in `tests/unit/album-view.test.js` that album markup lists photo ids in response order and includes no other ids (Principle II, Testing)

### Implementation for User Story 2

- [X] T023 [US2] Implement `listAlbumPhotos` in `src/server/library.js` using the same "`taken_at` ascending, then `added_seq` ascending" order as the cover (Principle I, Code Quality)
- [X] T024 [US2] Register `GET /api/albums/{albumId}/photos` in `src/server/server.js` with the `200` and `404` bodies from `specs/001-photo-date-albums/contracts/library-api.md`
- [X] T025 [P] [US2] Create `src/client/album-view.js` to list that album's photos earliest first and no others, per `specs/001-photo-date-albums/contracts/library-ui.md`
- [X] T026 [US2] Add `getAlbumPhotos` to `src/client/api.js`
- [X] T027 [US2] Handle the album route and the back control in `src/client/main.js` so returning shows the library from `GET /api/albums` again
- [X] T028 [US2] Add the opened-album layout to `src/client/styles.css`

**Checkpoint**: User Stories 1 and 2 both work, and the album screen can be tested with seeded rows

---

## Phase 5: User Story 3 - Add photos into date albums (Priority: P3)

**Goal**: Add one or more still photos. Each new photo joins the taken-date or assigned-date album, duplicates do not change the count, unreadable files are skipped, and a restart shows the same albums.

**Independent Test**: Start from an empty temporary library, add still photos with known taken dates, leave, and reopen. Each date has one tile with the right count and cover.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T029 [P] [US3] Unit test in `tests/unit/dates.test.js` that an EXIF `DateTimeOriginal` keeps its recorded calendar day with no timezone conversion, including a time near midnight, and that a missing taken date uses the calendar day of the add instant in the timezone passed in (Principle II, Testing)
- [X] T030 [P] [US3] Unit test in `tests/unit/library.test.js` that the same bytes return the existing photo, an empty or non-image file is skipped, and a failed write leaves neither a row nor a file (Principle II, Testing)
- [X] T031 [P] [US3] Contract test `POST /api/photos` in `tests/contract/library-api.test.js` for `201` `{ "status": "added", "photo": {} }`, `200` `{ "status": "duplicate", "photo": {} }`, `422` `{ "status": "skipped", "reason": "unsupported-type" }` or `"unreadable"`, and an error object when storage fails (Principle II, Testing)
- [X] T032 [P] [US3] Integration test in `tests/integration/library-storage.test.js` that a raw-byte POST stores one row and one file under `data/images/`, a second POST of those bytes does not increase `photoCount`, a mixed batch skips the non-photo, an assigned-date album keeps its label after a new process opens the same `DATA_DIR`, and a failed add leaves neither a row nor a file (Principle II, Testing)

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement `src/server/files.js` so signatures select only `image/jpeg`, `image/png`, `image/gif`, and `image/webp`, `stored_name` is `{id}.{ext}` and "contains no path separators", and a failed write removes the partial file. "`media_type` is one of the four types above. Any other file is not a row."
- [X] T034 [P] [US3] Implement `src/server/exif-date.js` as the only `exifr` caller, with value revival off, reading only the raw `DateTimeOriginal` string (Principle III, Maintainability)
- [X] T035 [US3] Extend `src/server/dates.js` so the taken calendar day is the EXIF date with no timezone conversion, and the assigned day is the calendar day of `added_at` in the timezone argument. "`album_date` is a real calendar day. The date rule is the only writer of this field." (Principle I, Code Quality)
- [X] T036 [US3] Implement `addPhoto` in `src/server/library.js` so a new supported image inserts one row, the same bytes "return this row and does not insert another", an unsupported or empty file is skipped, and a write or database failure "leaves neither" a row nor a file and returns the error. Enforce "When `date_assigned` is `0`, `taken_at` is present and its first 10 characters equal `album_date`." and "When `date_assigned` is `1`, `taken_at` is null." `added_seq` is "Unique. Greater than every previously stored photo."
- [X] T037 [US3] Register `POST /api/photos` in `src/server/server.js` for one raw file body, returning the `201`, `200`, `422`, and error statuses in `specs/001-photo-date-albums/contracts/library-api.md`
- [X] T038 [US3] Add one-file POST and batch totals to `src/client/api.js`: skipped count equals the number of `422` responses when that count is greater than zero, an error message is shown without discarding photos already added, and a `duplicate` response does not increase an album count
- [X] T039 [US3] Wire the multi-file add control in `src/client/index.html` and `src/client/main.js` to the batch call and refresh `GET /api/albums`
- [X] T040 [US3] Show the skipped-count message in `src/client/library-view.js`, including the case where every file in the batch was skipped and no tile was added

**Checkpoint**: All three user stories work. Adding photos, restarting, and browsing or opening albums use the same stored library

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T041 [P] Load cover and album images lazily in `src/client/library-view.js` and `src/client/album-view.js`, keeping image bytes out of `GET /api/albums`, so the first screen for 1,000 photos and an album of 200 photos meet the goals in `specs/001-photo-date-albums/plan.md`
- [X] T042 Run `npm test` and Biome, then execute the checks in `specs/001-photo-date-albums/quickstart.md`. A failed check becomes a failing test; do not weaken an existing assertion (Principle II, Testing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Story behavior is independently testable
  - Shared files should still be edited in priority order: `src/server/library.js`, `src/server/server.js`, `src/server/dates.js`, `src/client/api.js`, `src/client/main.js`, `src/client/styles.css`, `tests/contract/library-api.test.js`, and `tests/integration/library-storage.test.js`
- **Polish (Phase 6)**: Depends on the original user stories being complete
- **Accounts foundation (Phase 8)**: Depends on Phases 1–5. Blocks User Stories 5, 4, and the visibility follow-ups
- **User Story 5, User Story 4, then the User Story 2 and 3 follow-ups**: In that order, because they edit `src/server/library.js` and `src/server/server.js`
- **Final polish (Phase 13)**: Depends on those stories

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. Seeds rows directly. No dependency on adding or opening photos. Already implemented
- **User Story 2 (P2)**: Starts after Foundational. `GET /api/albums/{albumId}/photos` is testable with seeded rows. The back control uses the User Story 1 library screen. The visibility follow-up waits for User Story 4
- **User Story 3 (P3)**: Starts after Foundational. `POST /api/photos` is testable against an empty temporary library. The signed-in add follow-up waits for User Story 5
- **User Story 5 (P1)**: Starts after Phase 8. Create-account and sign-in do not require a published album
- **User Story 4 (P1)**: Starts after User Story 5. Needs two accounts to show private photos, public albums, and public photos

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Date and file helpers before `addPhoto`
- `src/server/library.js` before the matching route in `src/server/server.js`
- Client API function before `src/client/main.js` wiring
- Story complete before the next priority edits the same files

### Parallel Opportunities

- T003, T004, and T005 can run together after T002
- T006, T007, T008, and T009 can run together
- Test tasks inside one story can run together
- T016 and T017 can run together with T013 and T014
- T025 can run together with T023
- T033 and T034 can run together

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Contract test GET /api/albums in tests/contract/library-api.test.js"
Task: "Integration test seeded albums in tests/integration/library-storage.test.js"
Task: "Unit test library markup in tests/unit/library-view.test.js"

# Separate files after those tests are failing:
Task: "Create src/server/dates.js parts(albumDate)"
Task: "Create src/client/library-view.js"
Task: "Create src/client/styles.css"
```

---

## Parallel Example: User Story 2

```bash
# Tests first, together:
Task: "Contract test GET /api/albums/{albumId}/photos in tests/contract/library-api.test.js"
Task: "Integration test opened album in tests/integration/library-storage.test.js"
Task: "Unit test album markup in tests/unit/album-view.test.js"

# Separate files after those tests are failing:
Task: "Implement listAlbumPhotos in src/server/library.js"
Task: "Create src/client/album-view.js"
```

---

## Parallel Example: User Story 3

```bash
# Tests first, together:
Task: "Unit test src/server/dates.js rules in tests/unit/dates.test.js"
Task: "Unit test addPhoto outcomes in tests/unit/library.test.js"
Task: "Contract test POST /api/photos in tests/contract/library-api.test.js"
Task: "Integration test storage in tests/integration/library-storage.test.js"

# Separate files after those tests are failing:
Task: "Implement src/server/files.js"
Task: "Implement src/server/exif-date.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Seed a temporary library and confirm tiles, dates, counts, covers, groupings, and the empty state
5. Demo the date library before adding open or upload behavior

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → browse seeded albums (MVP)
3. User Story 2 → open a tile and return to the same tiles
4. User Story 3 → add photos, skip bad files, and see the same albums after restart
5. Polish → lazy images and the quickstart checks

### Parallel Team Strategy

With multiple developers:

1. Complete Setup + Foundational together
2. After that, different files can proceed at once: `src/client/library-view.js`, `src/client/album-view.js`, `src/server/files.js`, and `src/server/exif-date.js`
3. Edit `src/server/library.js`, `src/server/server.js`, and `src/client/main.js` in story order so two people do not write the same route

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

## Phase 7: Convergence

- [X] T043 CRITICAL: Extract the skip-notice handoff from `src/client/main.js` into a pure function and add a regression test in `tests/unit/batch.test.js` that fails if a batch skip notice is dropped on the next library render, including when an open album returns to the library, per Constitution II and FR-012 (missing)

---

## Phase 8: Accounts Foundation (Blocking)

**Purpose**: Schema for people, sessions, ownership, and publication. No account behavior is wired to HTTP in this phase.

**⚠️ CRITICAL**: User Stories 5 and 4, and the visibility follow-ups, wait until this phase is complete

- [X] T044 Extend `src/server/db.js` with `people` (`id` "Primary key. Generated UUID."; `name` "Trimmed, 1 to 64 characters. Unique."; `secret_hash` "scrypt hash of the secret. The secret itself is never stored."; `created_at` "UTC instant `YYYY-MM-DDTHH:MM:SS.SSSZ`."), `sessions` (`id` "Primary key. Generated UUID."; `person_id` "References `people.id`."; `token_hash` "SHA-256 of the cookie token. Unique. The cookie value is never stored."; `created_at` "UTC instant."), and `album_publications` (`owner_id` "References `people.id`. Part of the primary key."; `album_date` "`YYYY-MM-DD`. Part of the primary key."; `date_assigned` "`0` or `1`. Part of the primary key."; `published_at` "UTC instant when the owner marked it public."). Add photo columns `owner_id` "References `people.id`. Null only for a photo that was already stored before any account existed." and `is_public` "`0` or `1`." Update photos already stored before any account exists once: "`owner_id` stays null and `is_public` becomes `1`." "A photo with a null `owner_id` has `is_public` set to `1`."

**Checkpoint**: The database can store people, sessions, and publication without a route yet

---

## Phase 9: User Story 5 - Create an account (Priority: P1)

**Goal**: A person creates their own account, then signs in. A wrong secret or a missing account does not sign anyone in. Creating an account does not require someone else to do it.

**Independent Test**: With no account for a new person, create an account, sign in, and confirm `GET /api/session` returns that person. A wrong secret stays signed out.

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T045 [P] [US5] Unit test in `tests/unit/accounts.test.js` that "An empty name or an empty secret does not create a person.", "A second account with the same name does not create a person.", the stored value is a scrypt hash and not the secret, and an unknown name and a wrong secret both fail without creating a session (Principle II, Testing)
- [X] T046 [P] [US5] Contract test in `tests/contract/library-api.test.js` for `POST /api/accounts` `201` `{ "person": {} }` with no session cookie, `400` `{ "error": "Enter an account name and a secret." }`, `409` `{ "error": "An account with that name already exists." }`, `POST /api/session` `200` with `Set-Cookie` `HttpOnly`, `SameSite=Lax`, and `Path=/`, `401` `{ "error": "Could not sign in." }`, `GET /api/session` `200` `{ "person": {} }` or `401` `{ "error": "Sign in to continue." }`, and `DELETE /api/session` `204` (Principle II, Testing)
- [X] T047 [P] [US5] Unit test in `tests/unit/session-view.test.js` that the signed-out screen offers account creation and sign-in, shows no add control, and a failed sign-in shows `Could not sign in.` (Principle II, Testing)

### Implementation for User Story 5

- [X] T048 [P] [US5] Implement `createAccount` and secret checking in `src/server/accounts.js` with an injectable scrypt cost. "An empty name or an empty secret does not create a person." "A second account with the same name does not create a person." `name` is "Trimmed, 1 to 64 characters. Unique." `secret_hash` is a "scrypt hash of the secret. The secret itself is never stored."
- [X] T049 [P] [US5] Implement `src/server/sessions.js` so sign-in stores only the SHA-256 of a random cookie token, "A session stays until that person signs out. Signing out deletes the session row.", and the cookie is `HttpOnly`, `SameSite=Lax`, and `Path=/`
- [X] T050 [US5] Register `POST /api/accounts`, `POST /api/session`, `GET /api/session`, and `DELETE /api/session` in `src/server/server.js` with the statuses in `specs/001-photo-date-albums/contracts/library-api.md`. Creating an account must not set a session cookie
- [X] T051 [P] [US5] Create `src/client/session-view.js` for the signed-out account and sign-in controls in `specs/001-photo-date-albums/contracts/library-ui.md`
- [X] T052 [US5] Add `createAccount`, `signIn`, `getSession`, and `signOut` to `src/client/api.js`, sending the session cookie on same-origin requests
- [X] T053 [US5] Wire account creation, sign-in, sign-out, and the duplicate-name message `An account with that name already exists.` in `src/client/index.html` and `src/client/main.js`
- [X] T054 [P] [US5] Style the account and sign-in controls in `src/client/styles.css`

**Checkpoint**: A person can create an account and sign in. Private photos are not part of this checkpoint

---

## Phase 10: User Story 4 - See your photos and public items (Priority: P1)

**Goal**: A signed-in person sees only their own photos, plus public albums and public photos. A person who is not signed in sees public albums and public photos. Only the owner can mark an album or photo public. Photos already stored before any account exists stay public and have no owner.

**Independent Test**: Sign in as one person while another person owns both private and public photos. The signed-in person sees their own photos, the public album, and the public photo, and does not see the other private album or private photo. Without signing in, only the public items are visible.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T055 [P] [US4] Contract test in `tests/contract/library-api.test.js` for `GET /api/albums` and `GET /api/albums/{albumId}/photos` returning only photos the caller can see, album ids `{ownerId}:{albumDate}:0` or `:1` and `unowned:{albumDate}:0` or `:1`, `POST /api/albums/{albumId}/publication` `200` with `public` true, `403` `{ "error": "Only the owner can mark that album public." }`, `POST /api/photos/{photoId}/publication` `200`, `403` `{ "error": "Only the owner can mark that photo public." }` including a null owner, and `GET /images/{storedName}` `404` `{ "error": "That image is not available." }` when the caller cannot see the photo (Principle II, Testing)
- [X] T056 [P] [US4] Integration test in `tests/integration/library-storage.test.js` that two owners on one day stay two albums, a signed-out caller sees a public album's photos and a public photo and sees none that are not public, creating an account does not assign pre-existing photos, and a photo added later on that day stays private when the older photo is public and has no owner (Principle II, Testing)
- [X] T057 [P] [US4] Unit test in `tests/unit/library-view.test.js` that a publication control is rendered only for an album whose owner is the signed-in person and whose `public` flag is false, and that the signed-out empty state includes the public-library explanation and no add control (Principle II, Testing)

### Implementation for User Story 4

- [X] T058 [US4] Implement the one visibility rule and viewer-specific `listAlbums` in `src/server/library.js`. A viewer can see a photo when "The viewer is signed in and `owner_id` is that person.", "`is_public` is `1`.", or "An `album_publications` row exists for that photo's owner, `album_date`, and `date_assigned`." Library order is "`album_date` descending, then taken-date before assigned-date on the same day, then a null owner before any person id, then `owner_id` ascending." `photo_count` and the cover use only visible photos. Album id is "`{ownerId}:{albumDate}:0` or `:1`. Photos with a null owner use `unowned:{albumDate}:0` or `:1`."
- [X] T059 [US4] Register publication routes in `src/server/server.js` and make `GET /images/{storedName}` use the same visibility rule. "Only the owner can set `is_public` from `0` to `1`. Nothing sets it back to `0`." An `unowned:` album returns 403
- [X] T060 [P] [US4] Add the owner-only "mark album public" control to `src/client/library-view.js` per `specs/001-photo-date-albums/contracts/library-ui.md`
- [X] T061 [P] [US4] Add the owner-only "mark photo public" control to `src/client/album-view.js` per `specs/001-photo-date-albums/contracts/library-ui.md`
- [X] T062 [US4] Add album and photo publication calls to `src/client/api.js`
- [X] T063 [US4] Hide the add control while signed out, and wire the publication controls, in `src/client/main.js`

**Checkpoint**: Own photos, public albums, public photos, and pre-existing unowned photos match the specification

---

## Phase 11: User Story 2 follow-up - Open only visible photos (Priority: P2)

**Goal**: Opening a tile shows only the photos from that album that this person can see, earliest first.

**Independent Test**: Open one album that mixes a public photo and another person's private photo. Only the visible photos appear, in taken-time order.

### Tests for User Story 2 follow-up ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T064 [P] [US2] Contract test in `tests/contract/library-api.test.js` that `GET /api/albums/{albumId}/photos` returns `404` `{ "error": "No album exists for that date." }` when the album exists but this caller can see none of its photos (Principle II, Testing)
- [X] T065 [P] [US2] Integration test in `tests/integration/library-storage.test.js` that the opened album lists only visible photos, earliest `taken_at` then `added_seq` first, and omits a private photo owned by someone else (Principle II, Testing)

### Implementation for User Story 2 follow-up

- [X] T066 [US2] Filter `listAlbumPhotos` in `src/server/library.js` with the same visibility rule and the same "`taken_at` ascending, then `added_seq` ascending" order
- [X] T067 [US2] Return the filtered album from `GET /api/albums/{albumId}/photos` in `src/server/server.js`, using 404 when no visible photo remains

**Checkpoint**: Opening an album cannot reveal a photo the library tiles hid

---

## Phase 12: User Story 3 follow-up - Add photos while signed in (Priority: P3)

**Goal**: A signed-in person adds a photo they own, starting not public. A signed-out person cannot add. A duplicate of a photo the caller cannot see does not reveal that photo.

**Independent Test**: Sign in, add a photo with a known taken date, sign out, and confirm that photo is hidden. The same bytes added again do not create a second row.

### Tests for User Story 3 follow-up ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Principle II, Testing)**

- [X] T068 [P] [US3] Contract test `POST /api/photos` in `tests/contract/library-api.test.js` for `401` `{ "error": "Sign in to add photos." }` when signed out, `201` with `ownerId` set and `public` false when signed in, and `{ "status": "duplicate" }` with no photo object when the caller cannot see the existing photo (Principle II, Testing)
- [X] T069 [P] [US3] Unit test in `tests/unit/library.test.js` that "A new photo has `owner_id` set to the signed-in person and `is_public` set to `0`.", and that the same bytes "return this row and does not insert another" without changing owner or `is_public` (Principle II, Testing)
- [X] T070 [P] [US3] Integration test in `tests/integration/library-storage.test.js` that a signed-out add leaves neither a row nor a file (Principle II, Testing)

### Implementation for User Story 3 follow-up

- [X] T071 [US3] Require a signed-in owner in `addPhoto` in `src/server/library.js`. "A new photo has `owner_id` set to the signed-in person and `is_public` set to `0`." "Add while signed out" leaves "No row and no file."
- [X] T072 [US3] Return `401` `{ "error": "Sign in to add photos." }` from `POST /api/photos` in `src/server/server.js` when no session is present, and omit the photo object from a duplicate the caller cannot see
- [X] T073 [US3] Send the session cookie from the batch upload in `src/client/api.js` and surface `Sign in to add photos.` without discarding a result already recorded for an earlier file

**Checkpoint**: Adding a photo requires sign-in, and the new photo stays private until its owner marks it public

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the updated quickstart and keep the skip notice covered

- [X] T074 Run `npm test` and Biome, then execute the checks in `specs/001-photo-date-albums/quickstart.md`, including create account, wrong secret, private until published, and photos from before accounts. A failed check becomes a failing test; do not weaken an existing assertion (Principle II, Testing)

---

## Parallel Example: User Story 5

```bash
# Tests first, together:
Task: "Unit test accounts in tests/unit/accounts.test.js"
Task: "Contract test accounts and session in tests/contract/library-api.test.js"
Task: "Unit test signed-out markup in tests/unit/session-view.test.js"

# Separate files after those tests are failing:
Task: "Implement src/server/accounts.js"
Task: "Implement src/server/sessions.js"
Task: "Create src/client/session-view.js"
Task: "Style the account controls in src/client/styles.css"
```

---

## Parallel Example: User Story 4

```bash
# Tests first, together:
Task: "Contract test visibility and publication in tests/contract/library-api.test.js"
Task: "Integration test two owners in tests/integration/library-storage.test.js"
Task: "Unit test publication controls in tests/unit/library-view.test.js"

# Separate files after those tests are failing:
Task: "Add the album publication control in src/client/library-view.js"
Task: "Add the photo publication control in src/client/album-view.js"
```

---

## Implementation Strategy (accounts)

### MVP for the remaining work

1. Phase 8 schema is already the blocker
2. Complete User Story 5 and confirm create-account and sign-in
3. Complete User Story 4 and confirm private photos stay hidden
4. **STOP and VALIDATE** before the open-album and add-photo follow-ups

### Incremental Delivery

1. User Story 5 → a person can create an account and sign in
2. User Story 4 → own photos, public albums, public photos, and pre-existing unowned photos
3. User Story 2 follow-up → an opened album shows only visible photos
4. User Story 3 follow-up → a new photo is private and requires sign-in
5. Phase 13 → quickstart checks, after T043 covers the skip notice

---

## Phase 14: Convergence

- [X] T075 CRITICAL: Assert in `tests/unit/album-view.test.js` and `tests/unit/library-view.test.js` that a publication control is rendered only when the signed-in person owns that album or photo and its `public` flag is false, per Constitution II (partial)
- [X] T076 Remove the unused `header .tools` rule from `src/client/styles.css` per Constitution III (unrequested)
