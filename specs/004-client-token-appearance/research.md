# Research: Client Token Appearance

## Restyle the organizer stylesheet in place

- **Decision**: Rewrite the color declarations in `src/client/styles.css` so every color is a `var(--...)` from the catalog in `src/client/token-roles.js`. Load `src/client/tokens.css` from `src/client/index.html` before `styles.css`. Do not copy `oklch()` values into `styles.css`. Do not add a second palette.
- **Rationale**: The specification says the library screens use the existing shared set (Principle I, Code Quality). `tokens.css` is already the value source. A second copy would drift when the placeholder brand changes.
- **Alternatives considered**: Pasting the `oklch()` values into `styles.css`. Rejected because that creates a second source. A new utility framework. Rejected because Quality Constraints forbid a dependency the existing custom properties already meet. Leaving `styles.css` outside the check, as the token foundation did. Rejected because this specification extends the check to the library screens.

## One switch, shared with the sample page

- **Decision**: Add `src/client/appearance.js` with the rule that light means the document element has no class `dark`, and dark means it has that class. `src/client/main.js` and `src/client/token-preview.js` both call it. The library control is a button in the header of `index.html`, outside `#app`. Its label is the appearance currently showing. The click handler only changes that class and label. It does not call `showLibrary`, `showAlbum`, or `dismissPreview`. The choice is not written to `localStorage` or to the account.
- **Rationale**: The specification requires the same screen after the switch, including an open album, an enlarged picture, and a pending delete (Principle I, Code Quality). A control outside `#app` survives the view renders that replace `#app`. Sharing the helper keeps the sample page and the library on one rule. The assumption says the choice lasts for the visit and is not part of the account.
- **Alternatives considered**: A second sample-page-style document for the dark library. Rejected because the person must stay on the open screen. Re-rendering the album on each switch. Rejected because a re-render can drop the pending delete confirmation and the enlarged picture. Saving the choice in the account. Rejected because the spec does not add account behavior.

## Role map for the existing screens

- **Decision**: Use the pairs below. A rule that sets a surface also sets that surface's paired text. Do not place a text color on a different surface. `img` keeps `object-fit` and has no filter. The box behind a picture uses `--muted` and is covered by the photograph.

| Existing surface | Custom properties |
| --- | --- |
| Page (`:root` background and text) | `--background`, `--foreground` |
| Album tile, photo figure, account form, create-album form | `--card`, `--card-foreground` |
| Enlarged picture overlay (`.preview`) | `--popover`, `--popover-foreground` |
| Add photos, create account, sign in, create album | `--primary`, `--primary-foreground` |
| Sign out, cancel, back link, view, place, publish | `--secondary`, `--secondary-foreground` |
| Empty states and the count line | `--muted`, `--muted-foreground` |
| Duplicate and other skip notices (`.skip`) | `--info`, `--info-foreground` |
| Error sentence (`.error`) | `--destructive`, `--destructive-foreground` |
| Confirm delete | `--destructive`, `--destructive-foreground` |
| Input outline | `--input` |
| Focus | `--ring` |
| Borders | `--border` |
| Corners that are now `0.75rem` or `999px` | `--radius` |

- **Rationale**: These are the roles the catalog already defines. Pairing text with its own surface keeps the 4.5 to 1 proof in `tests/unit/token-contrast.test.js` valid for the library (Principle II, Testing). Confirm delete is the only markup change, and it is a class so the color stays in `styles.css`.
- **Alternatives considered**: Making every button primary. Rejected because delete confirmation must stay visually distinct. Recalculating contrast for every CSS rule. Rejected because the token pairs are already measured, and a mixed pair would be a new color decision.

## Extend the existing checks; do not rewrite them

- **Decision**: Keep `checkStylesheet` and `findScreenColors` as they are. `tests/unit/color-check.test.js` calls the style-sheet check on `src/client/styles.css` with the `screen` profile, in addition to the existing call on `token-preview.css`. `tests/unit/screen-color.test.js` calls the screen check on `index.html`, `main.js`, `library-view.js`, `album-view.js`, `preview-view.js`, and `session-view.js`, in addition to the sample page. Each file is its own assertion. `tokens.css` stays on the `tokens` profile. The checker source files are not inputs, because they list color names as data.
- **Rationale**: The specification says a passing sample-page check is not proof the library is clean (Principle II, Testing). New scanner code would be a second implementation of the same rule (Principle I, Code Quality).
- **Alternatives considered**: Stylelint on `styles.css`. Rejected because it is a new dependency and the scanner already exists. Scanning `styles.css` only as part of the token-preview assertion. Rejected because one pass would hide a failure in the other file.

## What stays put

- **Decision**: Do not change `src/server/`, `src/client/tokens.css`, `src/client/token-roles.js`, `src/client/token-preview.html`, or `src/client/token-preview.css`. Do not change the sentences, data attributes, or hash routes the current tests assert. Do not filter photographs.
- **Rationale**: The specification keeps current album, account, and picture outcomes and keeps the sample page (Principle III, Maintainability). Photographs are content.
- **Alternatives considered**: Rebuilding the client screens as new markup. Rejected because the current views already express the tasks, and new markup would risk those tests.
