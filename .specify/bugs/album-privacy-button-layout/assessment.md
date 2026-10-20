# Bug Assessment: Album privacy buttons overlap the tiles

- **Slug**: album-privacy-button-layout
- **Created**: 2026-10-19
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> album layout mess, like make album private/piblic button

On the signed-in library at `http://localhost:5173/#/`, **Mark album public** and **Make album private** sit on top of the album cards. The card border does not wrap the cover, the date, or the count. The count bar and the privacy button cross the rounded corners.

## Symptom

For an album the signed-in person owns, the public or private control overlaps the tile instead of sitting in its own row under the card. The tile border does not contain the cover and the text. The control should stay readable and the card should stay a single aligned tile.

## Reproduction

1. Open `http://localhost:5173/#/` while signed in as the owner of at least one album.
2. Look at a named album whose `public` flag is false, and a date album whose `public` flag is true.
3. **Mark album public** overlaps the named-album card. **Make album private** overlaps the bottom corners of the date-album card. The count background extends outside the card border.

## Suspected Code Paths

- `src/client/library-view.js:24` — `privacyControls` renders **Mark album public** or **Make album private** for the owner's album.
- `src/client/library-view.js:39` — the control is a sibling after `<a class="tile">` inside `.tile-wrap`. Named albums use the same structure at line 51.
- `src/client/styles.css:105` — `button, a` gives every link and button button padding. `.tile` is an `a` and does not set its own padding or `display`.
- `src/client/styles.css:151` — the library grid is `repeat(auto-fill, minmax(160px, 1fr))`.
- `src/client/styles.css:158` — `.tile` sets the card border and `overflow: hidden`, but no rule gives `.tile-wrap` a column layout. `.tile-wrap` appears only in the markup.

## Root Cause Hypothesis

The tile link stays an inline box, while its image and paragraphs are block content, so the border does not enclose the cover, date, or count. The privacy button is an inline-block sibling of that link, so it shares the line and draws across the card instead of below it. `.tile-wrap` has no layout rule to stack them. Confidence: high. This is what the signed-in library showed: the public button overlaps the empty named album, and the private button overlaps the 2026-10-16 card.

## Proposed Remediation

**Preferred**: In `src/client/styles.css`, make `.tile-wrap` a column that fills its grid cell, make `.tile` a block so the border wraps the cover and text, and place the privacy button in a row beneath the card at the cell width. Keep the button labels and the `data-publish-album` / `data-private-album` behavior unchanged. The global `button, a` padding must not keep the tile inline or push the privacy control over the card.

**Alternatives**:
- Move the privacy control inside the tile link. The whole card, including the control, would then navigate to the album, so the control could not be clicked on its own.
- Shorten the labels only. The text would be smaller, and the inline tile border would still fail to wrap the cover.

**Files likely to change**:
- `src/client/styles.css`
- `tests/unit/organizer-colors.test.js` or a small stylesheet assertion, if the new rules need to stay free of raw colors

**Tests to add or update**:
- Assert `.tile` is a block and `.tile-wrap` stacks its privacy button under the card, so the inline overlap cannot return.
- Keep the existing library-view assertions that the owner still gets **Make album private** or **Mark album public**, and that other people do not.

## Risks & Considerations

- The global `a` rule also styles the **Back** link. Narrowing that rule must leave **Back** readable.
- Album tiles use the card color pair. A layout change must not introduce a hex, `rgb()`, `hsl()`, or `oklch()` color outside the token file.
- Do not change who is allowed to publish or hide an album.

## Open Questions

- None. The overlapping controls were visible on the signed-in library.
