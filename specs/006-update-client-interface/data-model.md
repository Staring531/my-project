# Data Model: Update Client Interface

No stored entity changes. `data/library.sqlite`, album membership, visibility, and publication stay as specified in `specs/001-photo-date-albums/data-model.md` and `specs/002-album-image-management/data-model.md`. Screen structure stays `specs/005-organizer-screen-layout/data-model.md`. This feature adds presentation and focus facts for the current visit.

## Album cover

The picture on a library card. It is not a new stored field.

| Album | Cover |
| --- | --- |
| Date album | The first picture in album order whose file can be shown. Chosen in `src/server/library.js`. |
| Named album | The first picture in the album, unchanged. |

`photoCount` still counts every picture, including ones that cannot be shown.

| What the card receives | What the picture area shows |
| --- | --- |
| A cover URL that loads | That picture |
| A cover URL that fails to load | `This picture cannot be shown.` |
| No cover URL, and `photoCount` greater than zero | `This picture cannot be shown.` |
| No cover URL, and no pictures | No card. The library empty state from spec 005 is used instead |

## Unshowable picture

A picture the person is allowed to see, and which cannot be painted. It stays in the album response and in `photoCount`.

| Surface | Shown |
| --- | --- |
| Picture card | `This picture cannot be shown.` in the picture area. The card can still be enlarged. |
| Enlarged picture | The same sentence, centered. The album stays mounted underneath. |
| Add pictures square | The same sentence. The square can still be chosen. |
| Delete confirmation | The same sentence in place of the small copy when that copy cannot be painted. |

## Full name

The album name or date is one visible line. The full string is a separate fact from the truncated line.

| Fact | Where it lives |
| --- | --- |
| Visible line | The truncated text already on the card and the album title |
| Full string | The accessible name of that link or title, and the tooltip shown on point and on keyboard focus |
| Count | `photoCount`, drawn with equal-width digits so the line does not jump |

## Overlay focus

At most the overlays from spec 005 are open. This feature records which control opened the top overlay.

| Overlay | Focus when it opens | Focus when it closes |
| --- | --- | --- |
| Sign-in dialog | Name | Sign in |
| New album panel | Name | New album |
| Delete confirmation | Cancel | Picture actions |
| Add pictures | The dialog | Add pictures |
| Picture menu | The first item | Picture actions |
| More | The first item | More |
| Enlarged picture | Close | The picture control that opened it |
| Notice strip | Close | The header's main action, Add photos or Sign in |

Choosing the appearance switch does not change this record and does not close the overlay.
