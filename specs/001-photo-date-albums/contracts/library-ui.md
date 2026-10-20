# Contract: Library UI

What a person can see and do. The screen gets album, photo, and session data only from [library-api.md](library-api.md). It does not decide which album a photo belongs to, and it does not decide which photos are visible.

## Signed-out screen

Shown when `GET /api/session` is 401.

- Shows the public and unowned albums returned by `GET /api/albums`.
- When that list is empty, the screen says there are no public photos. It shows no album tiles and no add control.
- Shows a way to create an account and a way to sign in.
- Does not show a control that adds photos or marks an album or photo public.

## Signed-in library screen

Shown when `GET /api/session` returns a person.

- Shows one tile per album the API returned, in that order. The list includes that person's own albums and the public albums and public photos they are allowed to see.
- When `albums` is empty, the screen explains how to add photos and shows an add control. It shows no album tiles.
- A year and month heading appears when that year or month changes. Headings do not reorder albums.
- Each tile shows the cover image, the calendar date, and the photo count.
- A tile whose `dateAssigned` is true also states that the date was assigned.
- Choosing a tile opens that album.
- The add control accepts more than one file and then reports the batch outcome from the API contract.
- An album the signed-in person owns, and that is not yet public, offers a control to mark that album public. Nobody else's album offers that control. An unowned album does not offer it.
- A way to sign out calls `DELETE /api/session` and returns to the signed-out screen.

## Album screen

Shown after a tile is chosen.

- Shows every photo returned for that album, earliest first.
- Shows no photo whose `albumId` is different.
- A photo the signed-in person owns, and that is not yet public, offers a control to mark that photo public. A photo they do not own does not offer it.
- A way back returns to the library screen.
- The library screen then shows the same albums, counts, covers, and assigned-date labels the API returns for that person. Leaving and opening the organizer again does the same while the session cookie remains.

## Account actions

- Creating an account sends `POST /api/accounts` and then shows the sign-in form. It does not show that person's private library until sign-in succeeds.
- A failed sign-in stays on the signed-out screen and shows `Could not sign in.`
- A duplicate account name shows `An account with that name already exists.`

## Observable markup

View functions return markup that tests can read without a browser:

- A tile includes the album id, the date, the count, the cover URL, and the assigned-date text when required.
- The signed-in empty state includes the add explanation and includes no tile.
- The signed-out empty state includes the public-library explanation, account and sign-in controls, and no add control.
- The album screen lists photo ids in response order and no other ids.
- A publication control is present only for an album or photo whose owner is the signed-in person and whose `public` flag is false.
