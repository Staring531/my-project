# Implementation Plan: Album and Image Management

**Branch**: `002-album-image-management` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-album-image-management/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

A signed-in person can create a named album, place pictures they already own into it, delete their own pictures after confirming, and make an album private again. Selecting a picture enlarges it to fit the screen without stretching or cropping. The same picture bytes cannot be stored on a later day; the existing content hash remains the one identity, and the screen says the picture is already in the library.

Named albums are stored rows because they can be empty. Date albums stay a query. Publication stays one rule: an album is public only while a publication row exists, and making it private deletes that row without deleting pictures or clearing a picture's own public flag. The client remains Vite and vanilla JavaScript. The screen renders the library API and does not apply a second membership or visibility rule.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.20 or newer (vanilla browser JavaScript bundled by Vite; no TypeScript and no UI framework)

**Primary Dependencies**: Vite 7 or newer; `exifr` to read the raw EXIF taken-date string; Biome for formatting and static analysis. SQLite, HTTP, hashing, passwords, sessions, and tests use Node itself (`node:sqlite`, `node:http`, `node:crypto`, `node:test`). No new dependency.

**Storage**: Image files in `data/images/`. Metadata in `data/library.sqlite`. Date albums stay queries. Named albums, named-album membership, and named-album publication are rows. `data/` is not committed.

**Testing**: `node:test` for named-album names, membership, deletion, privacy, duplicate bytes, rendered markup, and the HTTP plus SQLite plus file boundary. View tests read markup, including confirm, cancel, and the enlarged picture. They do not open a browser dialog.

**Target Platform**: Local desktop. Vite dev server for the client, local Node server for the library, current desktop browser for use.

**Project Type**: Local web application (vanilla JavaScript client and local server).

**Performance Goals**: The existing first screen of 1,000 visible photos stays within 3 seconds, and an album of 200 photos stays within 5 seconds. An enlarged picture fits the screen within 1 second. Creating a named album and placing an existing picture into it is a single local request each.

**Constraints**: Images stay on local disk. A named album does not remove a picture from its date album. Only the owner deletes a picture, and only after the page confirms. Pictures with no owner are not deleted. Making an album private does not delete pictures and does not clear a picture's own public flag. The same file bytes cannot be stored twice, including on another day. A different picture may reuse a file name. `DATA_DIR` and `PORT` stay injectable. The client is not rewritten in TypeScript.

**Scale/Scope**: Several people on one local library. New screens and controls: create a named album, named-album tiles, the named-album screen, delete confirmation, make-private, and the enlarged picture layer. Date albums, accounts, and sign-in stay as they are.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate

| Gate | Principle | Result | Notes |
| --- | --- | --- | --- |
| Each business rule has one implementation | I. Code Quality | PASS | Date membership stays in the photo row. Named membership is a link, not a second date rule. Privacy stays "public while a publication row exists." The content hash stays the only same-picture rule. |
| Formatter and static analysis run before merge | I. Code Quality | PASS | Biome already covers the client and server. No second checker. |
| Observable tests, including storage boundaries | II. Testing | PASS | Markup covers confirm, cancel, and the enlarged picture. Integration covers the row, the link, and the image file together. |
| Simplest design that meets the spec | III. Maintainability | PASS | Empty named albums require stored rows. Date albums stay derived. The enlarged picture is a CSS fit, not a second image pipeline. |
| Dependencies named and justified | Quality Constraints | PASS | No dependency is added. TypeScript is not required by the specification. |
| Configuration injectable; no committed secrets or library data | Quality Constraints | PASS | Tests keep using a temporary data directory. `data/` stays untracked. |
| Failures returned to the caller | Quality Constraints | PASS | Refused names, ownership, and missing albums return the messages in the API contract. Duplicate stays a status the screen reads. |

No gate fails. Phase 0 may proceed.

### Post-design re-check

Reviewed against [research.md](research.md), [data-model.md](data-model.md), [contracts/library-api.md](contracts/library-api.md), [contracts/library-ui.md](contracts/library-ui.md), and [quickstart.md](quickstart.md).

| Gate | Result | Notes |
| --- | --- | --- |
| I. Code Quality | PASS | `library.js` remains the only visibility and membership module. Date albums do not treat a public named album as publishing the day. Image reads use that same module. |
| II. Testing | PASS | Quickstart checks map to the spec scenarios. Contract tests have the 2.1.0 JSON to assert. Markup hooks cover create, private, delete, cancel, and `data-preview-fit="contain"`. |
| III. Maintainability | PASS | API 2.1.0 adds `namedAlbums` and routes without changing date-album objects. The caller that must change is `src/client`. Existing account and date routes stay on 2.0.0. |
| Quality Constraints | PASS | No TypeScript, UI framework, image-processing, or dialog dependency. Delete and privacy failures name what was refused. A failed delete before commit leaves the picture in place. |

All gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-album-image-management/
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
├── preview-view.js
├── session-view.js
├── notice.js
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
├── preview-view.test.js
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

**Structure Decision**: One local web application, extended in place. `src/server/db.js` creates the named-album tables when the database opens. `src/server/library.js` is the only module that decides date membership, named-album membership, visibility, cover order, deletion, and privacy. `src/server/files.js` deletes the image file when that library function deletes a picture. `src/server/server.js` exposes the new routes and does not apply a second rule. `src/client` renders `albums` and `namedAlbums`, the confirm step, and the enlarged picture. `preview-view.js` is the enlarged layer only. Tests mirror those boundaries.

## Complexity Tracking

None. The Constitution Check passes with no exceptions.
