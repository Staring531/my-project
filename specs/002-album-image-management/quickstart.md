# Quickstart: Album and Image Management

Validation guide for named albums, deletion, private albums, the enlarged picture, and a repeated picture. Field meanings live in [data-model.md](data-model.md). Request and response shapes live in [contracts/library-api.md](contracts/library-api.md). Screen behavior lives in [contracts/library-ui.md](contracts/library-ui.md).

The date-album checks in [../001-photo-date-albums/quickstart.md](../001-photo-date-albums/quickstart.md) still apply.

## Prerequisites

- Node.js 24.20 or newer.
- A current desktop browser.
- Two different JPEG, PNG, GIF, or WebP pictures, plus a second copy of the first picture's bytes saved under another file name. One extra different picture that reuses the first file name.

## Setup

From the repository root:

```bash
npm install
npm test
npm run dev
```

`npm test` runs the unit, integration, and contract tests. Integration tests use a temporary data directory, not `data/`.

`npm run dev` starts the local server and the Vite client. Open the URL Vite prints. Sign in with an account you create. Use a second account, or a signed-out window, for the privacy checks.

## Checks

Confirm each outcome in the browser after `npm test` is green.

1. **Create a named album.** While signed in, create an album named Holiday. A tile shows Holiday, a count of zero, and no cover. A signed-out visitor does not see it.
2. **Rejected names.** Try a blank name, a name of only spaces, a name longer than 64 characters, and Holiday again. No new tile appears. Holiday is unchanged. The form shows the API message. A second account can also create an album named Holiday.
3. **Place existing pictures.** Add two different pictures, then place both into Holiday. Holiday shows a count of 2 and uses the first of those pictures as the cover. Each picture still appears on its original day. Place the first picture into Holiday again. The count stays 2.
4. **Someone else's album.** From the second account, Holiday owned by the first account is not available, and there is no control to add a picture to it.
5. **Delete and cancel.** On one of the owner's pictures, choose delete and then cancel. The picture remains in its date album and in Holiday. Confirm deletion of that picture. It disappears from both. Counts decrease by one. Delete the last picture in a date album and that day tile disappears. Delete the last picture in Holiday and Holiday remains with a count of zero and no cover.
6. **Owners only.** The second account has no delete control on the first account's picture. A picture that was already in the library before any account exists has no delete control.
7. **Make an album private.** The first account marks Holiday public. The second account can see Holiday and its pictures. The first account makes Holiday private. The second account no longer sees Holiday. The first account still sees it and its pictures. Making it private again leaves it private. A picture the owner had separately made public is still visible to the second account after its album is private.
8. **Unowned and other owners.** The second account has no control to make the first account's album private. A public album with no owner has no such control.
9. **Enlarge.** Open an album and select a picture. The whole picture fits the screen without stretching or cropping. Select a picture that is wider than the window and one that is taller. Both stay fully visible. Select a picture smaller than the window. It is enlarged without changing shape. Close the picture. The same album is still open. Resize the window while a picture is enlarged and it fits again. If a picture cannot be loaded, the screen says it cannot be shown and the album remains.
10. **Same picture, later day.** Add a picture, then add those same bytes again as a file for another day. The screen says `This picture is already in the library.` The original day and its count are unchanged, and the other day does not gain a copy. Add a different picture that uses the first file name. That different picture is kept.

## What failure looks like

- Creating Holiday fails for a second person who has never used that name.
- A picture disappears from its day after it is placed in a named album.
- Holiday's cover is not the first picture placed in it.
- Canceling a delete removes the picture.
- Making an album private deletes a picture, or hides a picture that was public on its own.
- Another person can delete a picture or make an album private.
- The enlarged picture is cropped or stretched, or closing it leaves the album.
- Adding the same bytes on a later day increases a count.
- A different picture is rejected only because its file name was used before.
- `npm test` fails. Do not treat the browser session as passing while tests are red.
