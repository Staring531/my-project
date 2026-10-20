# Contract: Organizer Appearance

What a person sees on the photo library after this feature. Colors come only from the catalog in [data-model.md](../data-model.md). The page does not decide contrast and does not change album or account rules.

The page address during development is `/` on the Vite origin. Album addresses stay the hash addresses they use today.

## First view

- The light appearance is showing. The document element has no class `dark`.
- The library, account forms, album, enlarged picture, empty states, and notices use catalog pairs.
- Borders, inputs, focus, and corners use the supporting values.
- A photograph is shown with its own colors.
- No sample-page role list is inserted into the library.

## Switching appearance

- One control in the page header switches between light and dark.
- The control's label states the appearance that is currently showing.
- After the switch, the address is unchanged, including the hash when an album is open.
- The open album, the enlarged picture, and a pending delete confirmation are still on the page.
- The person is not signed out.
- Switching back returns the light values.
- A reload starts at light again.

## Observable behavior

Tests can read this without a browser session:

- The header contains the switch control.
- Applying `dark` sets the class `dark` on the document element and records the appearance as `dark`.
- Applying `light` removes that class and records `light`.
- The apply function does not return markup for the library or the album.
- The confirm-delete control is marked so its surface can use the destructive pair. The button text stays `Confirm delete`.

## What this page does not do

- It does not change who can see a private photo.
- It does not change create account, sign in, add photo, delete, publish, or make private.
- It does not remove `/token-preview.html`.
- It does not store the appearance.
