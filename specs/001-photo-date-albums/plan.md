# Implementation Plan: Photo Date Albums

**Branch**: `001-photo-date-albums` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-photo-date-albums/spec.md`

## Summary

The organizer shows one album tile per calendar day of still photos, grouped under year and month headings, with a single cover preview, the date, and the photo count. Each person creates an account and signs in to see their own photos. Anyone, including a person who is not signed in, also sees albums and photos that the owner has marked public. Photos already stored before any account exists become public and keep no owner. Opening a tile lists the visible photos from that album. Adding photos requires a signed-in person and places each new photo, still private, by its taken date, or by the day it was added when no taken date exists.

The client is Vite with vanilla JavaScript. A local Node process stores image bytes as files under `data/images/` and stores metadata only in SQLite through `node:sqlite`. Album membership, cover choice, visibility, and date labels are computed in that process and returned through the library API. The browser renders those results and does not apply a second grouping or visibility rule.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer (vanilla browser JavaScript bundled by Vite; no TypeScript and no UI framework)

**Primary Dependencies**: Vite 7 or newer; `exifr` to read the raw EXIF taken-date string; Biome for formatting and static analysis. SQLite, HTTP, hashing, passwords, sessions, and tests use Node itself (`node:sqlite`, `node:http`, `node:crypto`, `node:test`).

**Storage**: Image files in `data/images/`. Metadata, account secret hashes, and session token hashes in `data/library.sqlite`. Albums are queries, not rows. Album publication is a separate row because it is an owner choice, not a membership fact. `data/` is not committed.

**Testing**: `node:test` for date, ordering, visibility, and account rules, rendered library and album markup, HTTP plus SQLite plus files, and the JSON contract. Session cookies are set by the test client. Hash cost is an argument so tests stay fast.

**Target Platform**: Local desktop. Vite dev server for the client, local Node server for the library, current desktop browser for use.

**Project Type**: Local web application (vanilla JavaScript client and local server).

**Performance Goals**: First screen of album tiles for a library of 1,000 visible photos appears within 3 seconds. An album of 200 visible photos shows that day's photos within 5 seconds.

**Constraints**: Images stay on local disk and are not uploaded to another service. SQLite stores metadata only. Secrets and session tokens are stored only as hashes. Still images only: JPEG, PNG, GIF, and WebP. No custom albums, editing, deletion, or a way to make a public item private again. Date rules accept an explicit timezone and instant so tests stay deterministic. `DATA_DIR` and `PORT` are injectable.

**Scale/Scope**: Several people on one local library. Success criteria are defined at 1,000 visible photos and at albums of 200 visible photos. Screens: the signed-out public library, account creation, sign-in, the signed-in date library, and one opened album.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Date selection, album membership, visibility, and cover order are each assigned to one server module. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome is included because Node does not provide either check. |
| Observable tests, including storage boundaries | II. Testing | PASS | `node:test` covers rules, markup, and the HTTP/SQLite/file boundary. Time, timezone, and hash cost are arguments. |
| Simplest design that meets the spec | III. Maintainability | PASS | One photo table plus people, sessions, and publication rows. A local server exists because a Vite page cannot keep ordinary image files and a SQLite file on disk. |
| Dependencies named and justified | Quality Constraints | PASS | Vite is required by the request. `exifr` reads taken dates. Biome runs the required checks. Accounts use `node:crypto`. |
| Configuration injectable; no committed secrets or library data | Quality Constraints | PASS | Tests pass `DATA_DIR`. `data/` stays untracked. Secrets are hashed before storage. |
| Failures returned to the caller | Quality Constraints | PASS | Unexpected failures use the error object. Skip, duplicate, and the single sign-in failure are explicit statuses. |

No gate fails. Phase 0 may proceed.

### Post-design re-check

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/library-api.md](contracts/library-api.md), [contracts/library-ui.md](contracts/library-ui.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | The API returns album membership and only the photos a caller can see. The UI contract forbids the screen from choosing an album or a second visibility rule. Cover order is one rule in the data model. The image route uses that same visibility rule. |
| II. Testing | PASS | Quickstart checks map to the spec scenarios, including sign-in, private photos, publication, and pre-existing photos. Contract tests have a JSON shape to assert. Markup hooks are specified for view tests. |
| III. Maintainability | PASS | Membership is still a query. `album_publications` stores only the publish choice. The API version is 2.0.0 because album ids and add-photo auth break 1.0.0; the caller that must change is `src/client`. `exifr` stays behind one module. |
| Quality Constraints | PASS | No password, session, multipart, thumbnail, or test-runner dependency was introduced. Secret hashes stay in SQLite. Error, skip, and sign-in behavior is in the API contract. |

All gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-date-albums/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
│   ├── library-api.md
│   └── library-ui.md
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
package.json
biome.json
vite.config.js
scripts/dev.js
src/client/
├── index.html
├── main.js
├── api.js
├── library-view.js
├── album-view.js
├── session-view.js
└── styles.css
src/server/
├── server.js
├── library.js
├── accounts.js
├── sessions.js
├── dates.js
├── db.js
├── files.js
└── exif-date.js
tests/unit/
├── dates.test.js
├── library.test.js
├── accounts.test.js
├── library-view.test.js
├── album-view.test.js
└── session-view.test.js
tests/integration/
└── library-storage.test.js
tests/contract/
└── library-api.test.js
data/                    # runtime library, gitignored
├── library.sqlite
└── images/
dist/                    # generated client build, gitignored
```

**Structure Decision**: One local web application. `src/client` is the Vite root and only renders the library API. `src/server` owns SQLite, image files, accounts, and the date, album, and visibility rules: `dates.js` chooses the calendar day, `library.js` applies membership, order, duplicates, skips, and the one visibility rule, `accounts.js` creates people and checks secrets, `sessions.js` issues and reads the cookie, `db.js` is the SQLite boundary, `files.js` is the image-directory boundary, and `exif-date.js` is the only caller of `exifr`. Tests mirror those boundaries instead of adding a second copy of the rules in the client.

## Complexity Tracking

None. The Constitution Check passes with no exceptions.
