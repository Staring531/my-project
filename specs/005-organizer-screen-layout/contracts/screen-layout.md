# Contract: Organizer screen layout

What a person sees, and what a rendered screen must satisfy. Album, picture, and session data still come only from the library API in `specs/002-album-image-management/contracts/library-api.md`. This contract replaces the placement and markup sections of:

- `specs/001-photo-date-albums/contracts/library-ui.md`
- `specs/002-album-image-management/contracts/library-ui.md`

Visibility, ownership, counts, order, and the wording of errors stay those contracts. Where this file names a position, that position wins.

## Regions

Every screen is a column: header, then the notice strip when one exists, then the screen body. The body is one of the screens in `spec.md`. A dialog or menu covers the body. It does not push the body down.

## Header

Wide window, signed in, left to right: the title `Photo Date Albums`, New album, Add photos, the appearance switch, Sign out.

Wide window, signed out: the title, the appearance switch, Sign in. New album, Add photos, and Sign out are absent.

Narrow window, signed in: the title, Add photos, More. New album, the appearance switch, and Sign out are inside More, in that order.

Narrow window, signed out: the title, the appearance switch, Sign in. More is absent.

The appearance switch reads `Dark appearance` while the screen is light and `Light appearance` while the screen is dark.

New album opens a panel under that control in a wide window, and a bottom panel in a narrow window. The panel contains Name, the message area, Cancel, and Create. A refused name shows the API message under the Name field. The panel stays open.

## Notice strip

Present only when the latest batch has a skipped count, a duplicate, or an error. Order inside the strip: skipped count, then `This picture is already in the library.`, then each error. A close control at the end removes the strip. Navigation does not remove it. The next batch replaces it.

## Album card

The card contains the cover and one text line. The line does not wrap at any width from 320 pixels up. A privacy control is present only for an album the signed-in person owns, and it is inside the card at the top-right of the cover. Its visible label is `Private` or `Public`. Its accessible name is `Mark album public` or `Make album private`. Nothing follows the card as a sibling control.

Choosing the card opens `#/albums/{id}`. Choosing the privacy control does not navigate.

## Library body

Signed in: month groups for date albums, newest first, then the heading `Albums` and the named albums. No create-album form is in the body.

Signed out: the same groups for public albums only. No account form is in the body.

Empty signed-in library with no albums of either kind: the message `Add photos to organize them by the day they were taken.` and one Add photos button, centered, with no month heading and no `Albums` heading.

Empty signed-out library: `There are no public photos.` and one Sign in button.

Date albums and no named albums: the `Albums` heading plus `No named albums yet. Use New album to make one.`

Named albums and no date albums: the no-pictures message, then the `Albums` section.

Wide grid: columns are equal, each card is at least 200 pixels wide, and there are at most five columns. Narrow grid: exactly two columns.

## Album body

Title bar, then the picture grid in API order.

Date album title bar: `All albums`, the date, the count, and the assigned-date mark when the date was assigned. No Add pictures control.

Named album title bar: `All albums`, the name, the count, and `Add pictures` at the end when the signed-in person owns it.

A picture card contains the image and one text line. The line does not wrap. A menu control named `Picture actions` is present only when the menu has at least one item. Items, in order: `Mark picture public` when the owner has not published it, `Add to album` when this is a date album and the person has a named album, then `Delete` last when the person owns the picture.

Choosing the image opens the enlarged picture. Choosing `Delete` opens the confirmation dialog and does not delete yet.

Named album with no pictures: `This album has no pictures.` and, for the owner, an Add pictures button.

## Dialogs

Delete confirmation: title `Delete this picture?`, the picture, `It will be removed from every album.`, the error area, then Cancel and Delete. Focus starts on Cancel. Cancel and Escape leave the picture in place. A failed delete leaves the dialog open and shows the server message in the error area. Delete is the destructive action.

Sign-in dialog: title `Sign in` or `Create account`, the message area, Name, Secret, the main button, and the mode switch. A failed sign-in shows `Could not sign in.` under the title. A duplicate name shows `An account with that name already exists.` Creating an account switches the dialog to Sign in with the name kept. Success closes it.

Add pictures: a grid of the owner's pictures and Done. Choosing a picture that is already in the album does not change the count.

## Enlarged picture

Covers the window. The image uses `object-fit: contain`. Close sits at the top-right, is at least 44 by 44 pixels, and does not cover the picture when the window has room. The backdrop and Escape close it and leave the same album open. A picture that cannot load shows `This picture cannot be shown.`

## Geometry

At viewport widths 320, 375, 640, 960, and 1440:

- No control's rectangle intersects another control's rectangle.
- No control's rectangle extends outside the card, bar, strip, menu, or dialog that contains it.
- The document's scroll width equals its client width.
- Below 640 pixels, album and picture grids have two columns and the header is one line.
- At 640 and above, the header shows the wide-window controls and the picture menu is a dropdown rather than a bottom panel.

## Keyboard

Tab reaches every visible control. Escape closes the top overlay and moves focus back to the control that opened it. The appearance switch does not close an overlay or change the route.
