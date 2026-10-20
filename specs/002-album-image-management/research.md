# Research: Album and Image Management

## Named albums are stored; date albums stay derived

- **Decision**: Add a `named_albums` row for an album a person creates, and a `named_album_photos` row for each picture placed in it. Date albums stay a query over `photos.owner_id`, `album_date`, and `date_assigned`. Placing a picture in a named album does not change those photo fields.
- **Rationale**: A named album must exist with no pictures, so it cannot be derived from photo rows. A date album is still exactly the pictures that share a day, and storing that membership again would copy the date rule (Principle I, Code Quality).
- **Alternatives considered**: Replacing date albums with albums the person creates. Rejected because the existing organizer still groups by day. One album table that sometimes has a date and sometimes a name. Rejected because empty date albums are forbidden while empty named albums are required, so the two collections do not share one lifecycle.

## One publication rule for making an album private

- **Decision**: An album is public only while a publication row exists. Date albums keep using `album_publications`. Named albums use `named_album_publications` with the named album id and the time it was marked public. Setting an album private deletes that row. It does not delete pictures, and it does not change a picture's own `is_public` flag. Deleting a missing row still leaves the album private.
- **Rationale**: The existing organizer already treats a missing publication row as private. Reusing that meaning keeps one privacy rule (Principle I, Code Quality). The specification allows a picture that was itself made public to stay public after its album is made private.
- **Alternatives considered**: A second `is_public` column on the album. Rejected because date albums would then have a different privacy mechanism from named albums. Clearing `photos.is_public` when the album is made private. Rejected because that hides a picture the owner had made available on its own.

## Who can see a named album and its pictures

- **Decision**: The owner can see every named album they created, including an empty one. Anyone else can see a named album only when its publication row exists. Pictures listed for a named album are the pictures linked to it, and only when the viewer can see that album. Those pictures do not become visible inside a private date album. Image bytes are readable when the viewer can see the picture in its date album or in at least one named album. Both checks live in `src/server/library.js`.
- **Rationale**: A public named album includes its pictures, which matches the existing public date album. Using that link to reveal the owner's private day would publish more than the named album. One module owns both checks so the screen cannot apply a second visibility rule (Principle III, Maintainability).
- **Alternatives considered**: Treating membership in a public named album as making the picture public everywhere. Rejected because the private date album would start showing that picture to other people.

## The same picture on a later day

- **Decision**: Keep the existing SHA-256 `content_hash` unique constraint. `POST /api/photos` stays `200` with `status: "duplicate"` and does not write a row or a file. The client shows "This picture is already in the library." The file name is not an identity. Two different files with the same name still create two pictures.
- **Rationale**: The specification's "same picture" is the image already kept, including one stored on 2025-10-15 and added again on 2026-10-16. That rule already has one implementation. A new filename rule would reject different pictures.
- **Alternatives considered**: A second unique key on `original_name`. Rejected because the specification says a different picture that reuses a file name can be added. Changing the duplicate response into an HTTP error. Rejected because skip and duplicate are already statuses, not errors, and the client is what the person reads.

## Deleting a picture

- **Decision**: The owner confirms in the page, then the client calls `DELETE /api/photos/{photoId}`. Cancel does not call the server. The server deletes the photo row, the named-album links, and the image file in one library function. A failure before the database commit leaves the picture in place. People who do not own the picture, and pictures with no owner, are refused with no delete.
- **Rationale**: Confirmation is a screen step, so the view test can see confirm and cancel without a browser dialog. The storage boundary stays in one function (Principle II, Testing). Unowned pictures stay public and undeletable, as the specification requires.
- **Alternatives considered**: `window.confirm`. Rejected because the unit tests read markup and cannot answer a browser dialog. Deleting the file only and leaving the row. Rejected because the picture would remain in album counts.

## Enlarged picture

- **Decision**: Selecting a picture the person can already see opens a layer in the current album. The picture element fills that layer and uses `object-fit: contain`, so a small picture grows and a wide or tall picture stays whole. Dismissing the layer, including Escape or the close control, leaves the person on the same album. The browser refits the layer when the window changes size. No new image request shape is added. If the picture fails to load, the layer says it cannot be shown and the album remains underneath.
- **Rationale**: The specification is about fitting the screen, not about a second stored size. CSS contain-fit is the smallest way to avoid stretching and cropping, including enlarging a picture smaller than the screen. The album screen already receives only pictures this person can see.
- **Alternatives considered**: A server-rendered preview at a chosen pixel size. Rejected because it adds an image pipeline for a fit the browser already does. Navigating to a separate preview page. Rejected because dismissal must return to the same album without a second copy of album state.

## Client language

- **Decision**: Keep the Vite client in JavaScript, and keep `src/client/index.html` as the document that loads it. This feature does not add TypeScript and does not replace the page with a UI framework.
- **Rationale**: The specification states that how the screens are built is out of scope. A browser page is an HTML document; forbidding that document would remove the organizer. TypeScript would be a new compiler dependency and a rewrite of the existing client without a behavior in the specification. Principle III requires the simplest design that meets the current spec, and Quality Constraints forbid a dependency the existing code does not need.
- **Alternatives considered**: Rewrite `src/client` in TypeScript and leave a nearly empty HTML entry. Rejected because it changes every screen's source for no acceptance scenario. Adopt a TypeScript UI framework. Rejected because it adds a dependency and a second way to render the library API.

## API compatibility

- **Decision**: The library API becomes version 2.1.0. Date album objects and the existing account, session, publication, and add-photo routes stay as in version 2.0.0. `GET /api/albums` adds `namedAlbums`. New routes create a named album, place an existing picture in it, make an album private, and delete a picture. The caller that must show the new fields is `src/client`.
- **Rationale**: Adding a response field and routes is compatible for a client that only reads date albums. A required `kind` on every date album would break that object for no behavior change (Principle III, Maintainability).
- **Alternatives considered**: Version 3.0.0 with one mixed album array. Rejected because date tiles would have to ignore named albums, and existing date-album equality checks would change.
