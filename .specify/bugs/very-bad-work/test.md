# Bug Verification: Functional layout is broken

- **Slug**: very-bad-work
- **Tested**: 2026-10-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original layout no longer reproduces. The title is one line, privacy controls sit under their cards, and photo actions stay inside each card. The full suite and the lint check passed.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Open `http://localhost:5173/#/` signed in, then open `#/albums/65b46269-3061-466f-b4a8-66aa25927fce:2026-10-16:1` | pass | Title height is 42px, equal to its line height. Tiles are `display: block` with no padding. **Mark album public** and **Make album private** start 8px below their cards. All **View**, **Delete**, and **Place in** buttons are inside their figures. **Back** is a 68 by 37 control. Content width is 440px inside a 490px shell, inset by the card padding only. |
| New / updated tests | `npm test` | pass | 60 passed, including the tile stack assertion and the owner privacy controls. |
| Regression suite | `npm test` | pass | Same run. |
| Lint / type-check | `npx biome check src/client/styles.css src/client/App.jsx src/client/album-view.js tests/unit/organizer-colors.test.js` | pass | 4 files, no fixes. |

## Output Excerpts

```text
ℹ tests 60
ℹ pass 60
ℹ fail 0
```

```text
Checked 4 files in 22ms. No fixes applied.
```

Library measurement: title `oneLine: true`, tile `display: block`, `padding: 0px`, privacy `overlap: false`, `gap: 8`. Album measurement: three figures, four buttons each, `outside: []`.

## Residual Risks

- On a narrow window the header actions wrap onto the row under the title. The title stays one line.
- The count still uses the muted pair, so it remains a shaded line inside the card.

## Recommendation

Close the bug — verified on the signed-in library and on the open date album.
