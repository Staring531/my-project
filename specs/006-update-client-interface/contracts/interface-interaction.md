# Contract: Client interface interaction

What a person can operate, on top of the layout in `specs/005-organizer-screen-layout/contracts/screen-layout.md`. That contract still decides regions, order, empty copy, and geometry. This file wins only where it names a change: the More menu has no Cancel row, a failed picture shows a sentence, and a shortened name still yields the full name.

Album and picture data still come only from `specs/002-album-image-management/contracts/library-api.md`.

## Keyboard

Without a pointer, a person can sign in, add photos, create an album, open an album, enlarge a picture, cancel a deletion, change privacy, switch appearance, and close a notice.

- Tab reaches every visible control. Enter or Space activates the focused control.
- Escape closes the top menu, panel, or dialog and leaves focus on the control that opened it.
- The enlarged picture closes from Close, the backdrop, or Escape, and focus returns to the picture control that opened it.
- The sign-in dialog opens with focus on Name.
- Closing the notice strip leaves focus on Add photos when signed in, and on Sign in when signed out.
- The appearance switch does not close an open layer and does not change the route.

The focused control shows a 2-pixel solid ring in the existing ring role. The ring is visible on both appearances. Buttons and fields do not remove that ring.

## Pictures that cannot be shown

The sentence is `This picture cannot be shown.`

- A date-album cover is the first picture in album order that can be shown. The picture count still includes the others.
- A cover URL that fails, or a card with pictures and no cover URL, shows the sentence in the picture area.
- A named-album cover stays the first picture. If that picture cannot be loaded, the card shows the sentence.
- The same sentence appears on the picture card, on the enlarged layer, on an Add pictures square, and in the delete confirmation when that small copy cannot be painted.
- The album underneath an enlarged picture stays open.

## Names, errors, and labels

- A shortened album name or title exposes the full string on point and when the keyboard is on that link or title.
- The visible line stays one line.
- An empty album name or a duplicate name shows the correction under the Name field. The panel stays open.
- `Could not sign in.` stays under the sign-in title.
- Button labels stay the sentence-case labels from spec 005: `Add photos`, `Sign in`, `Sign out`, `Create`, `Delete`, `Cancel`, `Done`, and `Close`.
- An icon-only control has a spoken name that states the action. `All albums` and `Add pictures` keep those names when the narrow window shows them as an arrow and a plus.

## More menu

Narrow window, signed in. More contains New album, the appearance switch, and Sign out, in that order. It does not contain Cancel. Escape closes it.

The narrow picture menu still ends with Cancel, as spec 005 requires. Add to album may scroll inside the menu. The menu stays inside the window.

## Narrow window

Below 640 pixels wide:

- No screen scrolls sideways.
- Every visible control is at least 24 by 24 pixels.
- The header's main action and every close control are at least 44 by 44 pixels. Those targets do not overlap.
- Name and Secret use 16-pixel text. Focusing either field does not zoom the page.
- The page still allows pinch zoom.

When the person has asked the device to reduce motion, a screen, menu, or dialog appears with no slide and no scale.

## Add pictures

Done and Close are present. Close is at the dialog's top-right. When the owner has no pictures, the dialog shows `No pictures to add.` and Done remains. Pictures already in the album stay in the grid and stay marked as added.
