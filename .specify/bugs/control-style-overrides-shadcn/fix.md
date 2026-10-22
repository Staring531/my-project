# Bug Fix: Global control rules no longer override shadcn utilities

- **Slug**: control-style-overrides-shadcn
- **Fixed**: 2026-10-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Unlayered control rules were winning over Tailwind utilities, so a shadcn `Button` could not keep its own colors or hover state. The leftover color repaints were removed, and the remaining legacy control rules now sit in `@layer components`, which utilities override.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/client/styles.css` | modified | Removed the unlayered `[id="add-photos"]` and `[id="sign-out"], [id="appearance-switch"]` color rules. Moved `.confirm-delete` and the focus outline into `@layer components`. |
| `tests/unit/control-layer.test.js` | added | Requires `@layer components` and rejects a bare `button` or `a` rule outside an at-rule. |
| `tests/unit/organizer-colors.test.js` | modified | Primary and secondary pairs are read from the Button variants in `button.jsx`. |

## Diff Highlights (optional)

```css
@layer components {
  .confirm-delete {
    background: var(--destructive);
    color: var(--destructive-foreground);
  }

  button:focus-visible,
  input:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}
```

The built stylesheet places that block in `@layer components` immediately before `@layer utilities`.

## Tests Added or Updated

- `tests/unit/control-layer.test.js` — `keeps a bare button or link rule inside @layer components`. Failed before the layer existed, and passes after.
- `tests/unit/organizer-colors.test.js` — `paints each surface with its own paired text` now checks `bg-primary text-primary-foreground` and `bg-secondary text-secondary-foreground` on the Button variants.

## Local Verification

- Commands run: `node --test tests/unit/control-layer.test.js tests/unit/organizer-colors.test.js tests/unit/color-check.test.js tests/unit/screen-color.test.js` → 9 passed, 0 failed.
- Commands run: `npx vite build` on Node v24.20.0 → the legacy rules are inside `@layer components`, ahead of `@layer utilities`.
- Manual checks: none in a browser. The padding and border values in the assessment's reproduction step 4 are not in the current stylesheet.

## Deviations from Assessment

- The cited global `button, a` paint rule at `styles.css:115-149` was already gone. The rules that still overrode components were the id color repaints, `.confirm-delete`, and `button:focus-visible`.
- `[id="appearance-switch"]` shared the sign-out color rule, so removing that rule removed it too. The appearance switch already uses the secondary Button variant.
- The narrow-window `button, a` rule only sets a minimum size and stays inside `@media`. It is not the legacy paint rule.
- `library-view.test.js`, `album-view.test.js`, and the string-built screens named in the assessment are no longer in the tree, so they were not re-run.
- Computed styles for `#appearance-switch` were not measured. The predicted padding and border come from a rule that is no longer present.

## Follow-ups

- `.empty`, `.text-button`, `.album-link`, and `.picture-open` are still unlayered. They will override `Card` or `Input` utilities when a screen starts using those components.
