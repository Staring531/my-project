# Contract: Library UI

What a person can see and do for named albums, deletion, private albums, and the enlarged picture. Album, picture, and session data come only from [library-api.md](library-api.md). The screen does not decide date membership, named-album membership, or visibility.

The version 2.0.0 screen in [../../001-photo-date-albums/contracts/library-ui.md](../../001-photo-date-albums/contracts/library-ui.md) still applies except where this contract adds a control or a message.

## Signed-out screen

- Shows date albums from `albums` and public named albums from `namedAlbums`.
- Does not show a control to create an album, add a picture to a named album, delete a picture, mark an album public, or make an album private.
- Selecting a visible picture still opens the enlarged picture.

## Signed-in library screen

- Shows date-album tiles as before. Year and month headings apply only to `albums`.
- Shows one tile per entry in `namedAlbums`, in that order, separate from the year and month headings. Each tile shows the name, the count, and the cover when `coverImageUrl` is not null. An empty named album shows the name, a count of zero, and no cover.
- A signed-in person can create a named album by entering a name. Success shows the new tile. The 400 and 409 messages from the API are shown on the form. A 401 returns to the signed-out screen.
- An album the signed-in person owns, and whose `public` flag is false, still offers the control to mark it public.
- An album the signed-in person owns, and whose `public` flag is true, offers a control to make it private. Nobody else's album, and an unowned album, offers neither control for that album.
- Choosing a named-album tile opens that named album.

## Named album screen

- Shows the album name, the count, and every picture returned for it, in response order.
- The owner sees a way to add one of their existing pictures. Choosing it sends that picture's id. A `present` result leaves the count unchanged. A picture the person does not own has no such control.
- A picture the signed-in person owns offers deletion in two steps: a delete control, then a confirm control and a cancel control. Cancel removes the confirm step and does not delete. Confirm sends the delete request and then shows the album the API returns. The last picture in a named album leaves the named album on screen with a count of zero.
- A picture the person does not own has no delete control.
- A way back returns to the library screen.

## Date album screen

- The owner's pictures offer the same two-step deletion. After the last picture in that date album is deleted, the library no longer shows that date album.
- The owner's pictures offer a way to place that picture into one of their named albums.
- Selecting a picture opens the enlarged picture instead of leaving the album.

## Enlarged picture

- Opens over the album the person is already viewing.
- Shows the whole picture, fitted to the screen, with its shape unchanged. A picture smaller than the screen is enlarged to the largest size that still fits. A picture wider or taller than the screen stays fully visible.
- Stays open until the person dismisses it. Dismissal returns to the same album without reloading a different collection.
- Changing the window size fits the picture again under the same rule.
- If the picture cannot be loaded, the layer says `This picture cannot be shown.` and the album remains in place.

## Duplicate add

- When `POST /api/photos` returns `status: "duplicate"`, the screen says `This picture is already in the library.`
- The date album count does not increase, including when the existing picture is from another day.
- A different picture that uses the same file name is still reported as added when the API says `added`.

## Observable markup

View functions return markup that tests can read without a browser:

- A named-album tile includes the named album id, the name, the count, and the cover URL when a cover exists. An empty tile includes the id, the name, a count of zero, and no cover URL.
- The create-album form is present on the signed-in library and absent when signed out.
- A private control is present only for an album whose owner is the signed-in person and whose `public` flag is true.
- A publication control is still present only for an album or picture whose owner is the signed-in person and whose `public` flag is false.
- A delete control is present only for a picture whose owner is the signed-in person. Confirm and cancel are present only after that control is chosen. Cancel leaves the picture id in the album markup.
- The enlarged picture includes the picture URL and `data-preview-fit="contain"`. It is absent until a picture is selected, and absent again after dismissal.
- The duplicate message is the sentence `This picture is already in the library.`
