# Research: Photo Date Albums

## Local files and SQLite from a Vite app

- **Decision**: Run a small local Node process beside the Vite client. The Node process stores each image as a file under `data/images/` and stores only metadata in `data/library.sqlite`. Vite serves the vanilla JavaScript client and proxies `/api` and `/images` to that process during development. In normal use, the Node process also serves the built client.
- **Rationale**: The organizer must keep image bytes as local files and metadata in SQLite, and both must still be there after the browser closes. A Vite client runs in the browser and cannot own a durable image directory plus a SQLite file outside the browser profile. Node 24.20.0 on this machine exposes `node:sqlite` (`DatabaseSync`) with no extra flag and no native addon. The HTTP API is the narrow boundary between the screen and the stored library (Principle III, Maintainability).
- **Alternatives considered**: SQLite compiled to WebAssembly plus the Origin Private File System keeps both images and the database inside the browser profile. That fails the requirement that images stay as ordinary local files. `better-sqlite3` is a second SQLite API and a native build; `node:sqlite` is already in the runtime (Stability 1.2, release candidate, verified on Node 24.20.0).

## Album membership is derived

- **Decision**: Persist photos, people, sessions, and album publication. An album is still computed: the photos that share one owner (or no owner), one `album_date`, and one date source (`taken` or `assigned`). Year and month headings are display groups over that ordered album list. There is no album table of membership. `album_publications` stores only the owner's choice to mark that album public.
- **Rationale**: The specification defines an album as one person's photos on one calendar day, plus a separate public no-owner set for photos that were already stored before any account existed. Storing membership would copy the grouping rule (Principle I, Code Quality). Publication cannot be derived from the photos, because a public album includes a photo added later even when that photo itself was not marked public.
- **Alternatives considered**: One global album per calendar day for every person. Rejected because two people can have private photos on the same day, and each album has an owner who alone can mark it public. An `albums` table maintained on every add. Rejected because membership would have to be updated in lockstep with the photo row. Stamping every current photo public when the album is marked public, with no publication row. Rejected because a photo added the next day would not become part of the public album.

## Calendar date of a photo

- **Decision**: When the file has an EXIF `DateTimeOriginal`, use that recorded calendar date and time with no timezone conversion. Store `taken_at` as `YYYY-MM-DDTHH:MM:SS` and `album_date` as the first 10 characters. When the field is missing, set `taken_at` to null, set `date_assigned` to true, and set `album_date` to the calendar date of the add instant in an explicit timezone. Production uses the machine timezone. Tests pass the timezone and the instant in, so results do not depend on where the test runs (Principle II, Testing).
- **Rationale**: The specification says a photo stays on the calendar date recorded with it, including times near midnight. EXIF `DateTimeOriginal` has no offset. Turning it into a JavaScript `Date` would shift that day.
- **Alternatives considered**: Always use the day the file was added. Rejected because photos with a known taken date would land on the wrong album. Parse EXIF inside the browser. Rejected because membership must have one implementation, on the server.

## Reading the taken date

- **Decision**: Use `exifr` with value revival off, and read only the raw `DateTimeOriginal` string. Wrap that call in `src/server/exif-date.js`. Detect JPEG, PNG, GIF, and WebP by file signature in project code. Any other signature, or an empty body, is skipped.
- **Rationale**: Node's standard library cannot read EXIF. A hand-written TIFF/IFD parser would be a second, fragile date rule. Signature checks are short and remove the need for a file-type package. PNG, GIF, and WebP are still photos the browser can show; without a taken date they use the assigned-date album.
- **Alternatives considered**: `sharp` to decode and resize every image. Rejected because the first screen needs album summaries and a viewport of cover files, not a thumbnail pipeline, and `sharp` is a large native dependency. Accepting HEIC. Rejected because the specification says to skip items that cannot be shown, and HEIC is not reliably shown in current desktop browsers.

## The same photo added again

- **Decision**: Hash the file bytes with `node:crypto` SHA-256. `content_hash` is unique. A repeat upload returns the existing photo and does not write a second file or change the album count.
- **Rationale**: The specification defines "the same photo" as the same image added again. A content hash is that rule in one place. The hash uses the standard library.
- **Alternatives considered**: Treating the file name as identity. Rejected because the same image renamed, or two different images with one name, would break the rule.

## Cover photo and order

- **Decision**: One ordering function is used for the cover and for the photos inside an album: earliest `taken_at`, then earliest `added_seq`, with `added_seq` an increasing insert number. Adding a later photo never changes the cover. The album list is `album_date` descending, and a taken-date album precedes an assigned-date album on the same day.
- **Rationale**: The specification requires the earliest taken photo as the preview, with the first added photo winning a tie, and it requires the opened album to follow taken-time order. One ordering function keeps those from drifting apart (Principle I, Code Quality).
- **Alternatives considered**: Ordering ties by UUID. Rejected because UUIDs do not record which photo was added first.

## Upload shape

- **Decision**: The user may choose many files, but each file is one `POST /api/photos` body (the raw bytes). The client adds up added, duplicate, and skipped results and shows one skip message when the skipped count is not zero.
- **Rationale**: Node's standard library does not parse multipart bodies. One raw request per file avoids a multipart dependency and makes each result testable. The specification's batch behavior is the total the person sees, which the client can sum.
- **Alternatives considered**: `busboy` for one multipart request. Rejected because it adds a dependency for a parsing problem the client can avoid.

## Tests, format, and lint

- **Decision**: Test with `node:test`. Unit tests cover date rules, ordering, duplicates, and the HTML the library and album views emit. Integration tests start the server against a temporary data directory and assert rows, files, and HTTP results together. Contract tests assert the JSON fields in `contracts/library-api.md`. Format and lint with Biome.
- **Rationale**: Principle II requires observable outcomes and a test at each storage boundary, with time and timezone passed in. `node:test` is in the runtime. View functions return markup so those tests do not need a browser or a DOM library. Principle I requires a formatter and static analysis, which Node does not include; Biome is the one tool for both.
- **Alternatives considered**: Vitest and Playwright. Rejected for the first version because they duplicate `node:test` for rules that are already observable through markup and HTTP. They remain a later option if a browser-only defect cannot be expressed here.

## First screen speed

- **Decision**: `GET /api/albums` returns album summaries and cover URLs, not photo bytes. The browser loads cover images for the tiles on screen. Opening an album returns that day's metadata and image URLs only.
- **Rationale**: The success criteria are a first screen for 1,000 photos within 3 seconds and an album of 200 photos within 5 seconds. The summary payload for a personal library is small. Image bytes stay out of the album list.
- **Alternatives considered**: Embedding covers in the JSON response. Rejected because it would send image bytes the first screen does not need.

## Accounts and sessions

- **Decision**: A person creates an account with a unique name and a secret, then signs in. The name is trimmed, from 1 to 64 characters, and unique exactly as stored. The secret is non-empty and is stored only as an `node:crypto` scrypt hash. Sign-in sets an HttpOnly cookie whose value is a random token; SQLite stores the SHA-256 of that token. The session lasts until sign-out. Wrong name, wrong secret, and a missing account all return the same failure, `Could not sign in.`, and do not create a session. Creating an account does not sign the person in.
- **Rationale**: The specification says each person creates their own account and then signs in, and it does not name an external identity service. `node:crypto` already provides scrypt and random tokens, so no password library is added (Quality Constraints). One failure message avoids telling a stranger which names exist. The cookie stays out of page scripts, and the token hash means a copy of `library.sqlite` does not contain a usable cookie.
- **Alternatives considered**: An email and a hosted login service. Rejected because the library stays on this machine and the specification does not ask for either. Signing the person in as soon as the account is created. Rejected because the specification states create and sign-in as two steps. A session that ends when the browser process exits. Rejected because reopening the organizer is a normal return to the same library, and the person should not have to sign in again until they sign out.

## Who can see a photo

- **Decision**: One visibility rule, used by the album list, the opened album, and `GET /images/{storedName}`. A signed-in owner sees their own photos. Anyone, signed in or not, sees a photo when that photo is public, when its owner's album for that day is public, or when the photo has no owner. Photos already stored before any account exists are marked public and keep a null owner; creating an account does not assign them. A newly added photo belongs to the signed-in person and starts not public. Only that owner can mark the photo or their album public. There is no action to make a public photo or album private again. Album counts and covers use only the photos that viewer can see. A private image request from someone who cannot see it is the same 404 as a missing file.
- **Rationale**: The clarifications require own photos, public albums, public photos, unsigned access to public items, owner-only publication, and no owner for the photos already in the library. One rule keeps the screen and the image URL from disagreeing (Principle I, Code Quality). Hiding the count of private photos stops a tile from revealing photos the viewer must not see. Leaving unpublish out matches the specification, which only defines marking an item public.
- **Alternatives considered**: Giving the pre-existing photos to the first account. Rejected because the clarification says those photos become public and have no owner. Treating a public album as a global day shared by every person. Rejected because a later private photo on that day would be included. Returning 403 for a private image URL. Rejected because it tells the caller that a hidden photo exists.

## Library API version

- **Decision**: The library API moves to 2.0.0. Album ids gain the owner: `{personId}:{albumDate}:0` or `:1`, and `unowned:{albumDate}:0` or `:1` for photos with no owner. Adding a photo requires a session. The caller that must change is `src/client`.
- **Rationale**: Principle III requires a version bump and a caller list when a public interface breaks. The previous id was `{albumDate}:0` or `:1` and `POST /api/photos` did not require an account.
- **Alternatives considered**: Keeping version 1.0.0 and adding optional auth fields. Rejected because old clients would show every person's private photos and would use album ids the server no longer returns.
