# Bug Assessment: Functional layout is broken

- **Slug**: very-bad-work
- **Created**: 2026-10-20
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> 你做的非常差劲，在功能布局上，请分析原因

The signed-in library and an open date album were checked at `http://localhost:5173/`. The title wraps beside the header actions. Album cards do not contain their cover or their controls. **Mark album public**, **Make album private**, **View**, **Delete**, and **Place in aaa** collide with the card border.

## Symptom

The controls for the library and for an album are not arranged as a page of cards with actions. The title breaks across lines, the card border cuts through the picture and the count, and the public, private, view, delete, and place controls overlap the card. Those controls should sit in their own rows, and each card should contain its picture and text.

## Reproduction

1. Open `http://localhost:5173/#/` while signed in as the owner.
2. The title occupies about 164px and wraps, while **light**, **Sign out**, and **Add photos** sit in the same row. The page content is about 408px wide inside a 490px frame.
3. **Mark album public** overlaps the named-album card. **Make album private** overlaps the date-album card. The tile link is `display: inline` and has button padding.
4. Open a date album such as `#/albums/65b46269-3061-466f-b4a8-66aa25927fce:2026-10-16:1`. **View**, **Delete**, and **Place in aaa** sit on the card edge inside a figure whose overflow is hidden.

## Suspected Code Paths

- `src/client/styles.css:51` — `header`, `main`, and `.shell` all use the same `min(960px, calc(100% - 2rem))` width. `.shell` is the outer card, and `main` is inside that card's padding, so the content is inset a second time.
- `src/client/styles.css:58` — the header is `justify-content: space-between` with the title and three buttons as separate children (`src/client/App.jsx:13`). The title is squeezed to the leftover width.
- `src/client/styles.css:105` — `button, a` gives every link and every button the same padding, border, and background. `.tile` is an `a` and never sets `display` or its own padding, so it stays inline.
- `src/client/library-view.js:39` — the privacy control is a sibling after the tile inside `.tile-wrap`. No stylesheet rule names `.tile-wrap`.
- `src/client/styles.css:190` — `.count` shares the muted background with `.empty`, so the count is a separate bar that escapes the card.
- `src/client/album-view.js:57` — **View**, publish, delete, and **Place in** are consecutive buttons inside the figure. `src/client/styles.css:159` hides overflow on that figure.

## Root Cause Hypothesis

The layout rules were written for one plain column of links and buttons. They were not revised when the page became a card shell plus string-rendered albums. One rule paints every `button` and every `a` as a small control, so a tile link stays an inline box with button padding and its border does not enclose the cover. The privacy button and the photo actions have no row of their own, so they share that broken line and cross the card. The header does not group its actions, so the title wraps. The same width rule on the outer card and on `main` insets the content twice. Confidence: high.

## Proposed Remediation

**Preferred**: Give the header one action group so the title can stay on one line. Stop applying the small-control padding to `.tile`. Make `.tile` a block and `.tile-wrap` a column, with the privacy control in a row under the card. Put each photo's actions in a row that the figure does not clip. Apply the page width once, on the outer shell, not again on `main`. Keep the existing labels and the publish, private, delete, and place behavior.

**Alternatives**:
- Only restack the privacy button. The header, the double inset, and the photo actions would stay broken.
- Replace the string-rendered screens with the component library. That would fix the structure, and it is a larger change than the layout rules require.

**Files likely to change**:
- `src/client/styles.css`
- `src/client/App.jsx`
- `src/client/album-view.js`
- `tests/unit/organizer-colors.test.js`

**Tests to add or update**:
- Assert `.tile` is a block, `.tile-wrap` is a column, and the privacy control is not left to the inline `a` padding.
- Keep the library-view checks that the owner still gets **Make album private** or **Mark album public**.
- Keep the organizer color check free of hex, `rgb()`, `hsl()`, and `oklch()` outside the token file.

## Risks & Considerations

- The global `a` rule also styles **Back**. Changing it must leave that link readable.
- Grouping the header buttons must keep the existing ids `appearance-switch`, `sign-out`, and `add-photos`, because the page script looks them up.
- Do not change who may publish, hide, delete, or place a picture.

## Open Questions

- None. The wrapped title, the double inset, and the overlapping controls were measured on the signed-in library and on the open date album.
