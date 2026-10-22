# Data Model: Organizer Screen Layout

No stored entity changes. `data/library.sqlite`, album membership, visibility, and publication stay as specified in `specs/001-photo-date-albums/data-model.md` and `specs/002-album-image-management/data-model.md`. This feature adds screen state that lives in the client for the current visit.

## Screen

The open surface. Exactly one of:

| Value | When |
| --- | --- |
| Signed-out library | `GET /api/session` is 401 |
| Signed-in library | A person is signed in and the route is the library |
| Date album | The route is an album id with no name |
| Named album | The route is an album id with a name |
| Enlarged picture | A picture is selected. The album screen stays mounted underneath |

The header is part of every screen. It is not a separate route.

## Header actions

Ordered, and filtered by the session.

| Order | Control | Shown |
| --- | --- | --- |
| 1 | New album | Signed in, wide window. Inside More when the window is narrow |
| 2 | Add photos | Signed in. Stays visible in a narrow window |
| 3 | Appearance switch | Always. Inside More when the window is narrow and the person is signed in. Stays visible when signed out |
| 4 | Sign out | Signed in. Inside More when the window is narrow |
| 5 | Sign in | Signed out. The main action, so it stays visible in a narrow window |

More exists only in a narrow window. It holds the header controls that are not the main action, in the order above.

## Album card

One per album returned for the signed-in person, or per public album when signed out.

| Field | Source | Shown |
| --- | --- | --- |
| Cover | `coverImageUrl` | Square picture, or a plain placeholder when null |
| Line | Date or name, then `photoCount` | One line. A long name or date is cut with an ellipsis. The count stays visible |
| Assigned mark | `dateAssigned` | On a date album only. The full words are the accessible name when the line is cut |
| Privacy | `ownerId`, `public` | Only when the signed-in person owns the album. Sits in the card's top-right corner. Label is the current state, Private or Public |

Choosing the card opens that album. Choosing the privacy control does not.

## Picture card

One per picture in the open album, in the order the API returns.

| Field | Shown |
| --- | --- |
| Image | Square. Choosing it enlarges the picture |
| Line | Taken time, or the assigned-date mark when there is no taken time |
| Menu | Only when the person has at least one action below |

Menu items, in order, each included only when its rule matches:

1. Mark picture public — the person owns the picture and `public` is false.
2. Add to album — the open album is a date album and the person has at least one named album. The submenu lists those albums.
3. Delete — the person owns the picture. Last, after a separator, styled destructive.

## Overlays

At most one overlay is open. Opening another closes the one that was open, except the enlarged picture, which stays under a dialog because the spec allows a notice and a dialog together and does not allow the enlarged picture to close on an unrelated switch. Appearance switching closes nothing.

| Overlay | Opens from | Closes by |
| --- | --- | --- |
| New album panel | New album | Create succeeding, Cancel, or Escape |
| Sign-in dialog | Sign in | Sign-in succeeding, the close control, or Escape |
| Delete confirmation | Delete in a picture menu | Delete succeeding, Cancel, or Escape |
| Add pictures | Add pictures | Done, the close control, or Escape |
| Picture menu | Picture actions | Choosing an item that opens a dialog, or Escape |
| More | More | Choosing an item, or Escape |
| Enlarged picture | The picture image | Close, the backdrop, or Escape |

Escape and every other close return focus to the control that opened the overlay.

The delete confirmation shows the picture, the fixed sentences from the spec, and an error area. The error area is empty until a delete request fails. A failure leaves the dialog open and shows the server message. Cancel leaves the picture in every album.

## Notice

One strip under the header.

| Field | Rule |
| --- | --- |
| Skipped count | Shown when the last batch skipped one or more files. Wording stays the wording from spec 001 |
| Duplicate | Shown when the last batch reported a duplicate. The sentence stays `This picture is already in the library.` |
| Errors | One line each, from the last batch |

The strip is absent when all three are empty. It remains through navigation until the person closes it or a new batch replaces it.

## Window

| Mode | Width | Grid | Menus |
| --- | --- | --- | --- |
| Narrow | 319 pixels and below is unsupported. 320 to 639 pixels | Two columns | Picture menu, More, and New album open from the bottom edge |
| Wide | 640 pixels and above | Album and picture cards at least 200 pixels wide, as many columns as fit, at most five | Picture menu drops down. New album hangs under its control. Header controls are all visible |

Resizing across 640 pixels closes the open menu and keeps an open dialog, rearranged for the new width.

## State transitions

- Sign-in success: close the dialog, replace the signed-out library with the signed-in library.
- Account created: stay in the dialog, switch it to Sign in, keep the name, show that the account was created.
- New album success: close the panel, show the new card in the named albums section.
- Delete success on a date album that still has pictures: close the dialog, remove that card, update the count.
- Delete success of the last picture in a date album: close the dialog, open the signed-in library, that date album is gone.
- Delete success of the last picture in a named album: close the dialog, show the empty named album.
- Delete failure: dialog stays, error area shows the message, picture stays.
