# Bug Fix: Functional layout is broken

- **Slug**: very-bad-work
- **Fixed**: 2026-10-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Album cards now contain their picture and text, and the public, private, view, delete, and place controls sit in their own rows. The title stays on one line, and the page width is applied only to the outer shell.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/client/styles.css` | modified | Tile is a block, the wrap is a column, photo actions wrap inside the card, and `main` no longer repeats the page width. |
| `src/client/App.jsx` | modified | Header buttons share one action group. Their ids are unchanged. |
| `src/client/album-view.js` | modified | View, delete, place, and add-picture controls are in a `photo-actions` row. |
| `tests/unit/organizer-colors.test.js` | added test | Pins the block tile, the column wrap, and the single width rule. |

## Diff Highlights (optional)

```css
.tile-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.tile {
  display: block;
}
```

## Tests Added or Updated

- `tests/unit/organizer-colors.test.js` — `.tile` is a block with no shared link padding, `.tile-wrap` is a column, and the width rule does not include `main`.
- `tests/unit/library-view.test.js` — the owner still gets **Make album private** or **Mark album public**.
- `tests/unit/color-check.test.js` — the organizer stylesheet still has no raw colors.

## Local Verification

- Commands run: `node --test tests/unit/organizer-colors.test.js tests/unit/album-view.test.js tests/unit/library-view.test.js tests/unit/color-check.test.js` → 17 passed. `npx biome check` on the four edited files → clean.
- Manual checks: on `http://localhost:5173/` the title is one line, **Mark album public** and **Make album private** sit under their cards, and the content width matches the card padding. On the open date album, **View**, **Delete**, and **Place in aaa** stay inside each card. **Back** is still a readable control.

## Deviations from Assessment

The title uses `min-width: max-content` instead of `white-space: nowrap`. The stylesheet color check treats the word `white` in `white-space` as a named color. On a narrow window the action group wraps onto the next row so the title can stay on one line.

## Follow-ups

- None.
