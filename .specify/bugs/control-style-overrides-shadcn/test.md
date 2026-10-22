# Bug Verification: Global control rules no longer override shadcn utilities

- **Slug**: control-style-overrides-shadcn
- **Tested**: 2026-10-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original symptom no longer reproduces. A destructive button, Add photos, and the appearance switch take their colors, hover, border, radius, and padding from the Button classes. The full suite passed with no regressions.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | `npx vite build`, then Playwright against the organizer on Node v24.20.0 | pass | Built CSS and computed styles match the Button variants. |
| New / updated tests | `node --test tests/unit/control-layer.test.js tests/unit/organizer-colors.test.js tests/unit/color-check.test.js tests/unit/screen-color.test.js` | pass | 9 passed, 0 failed. |
| Regression suite | `npm test -- --test-concurrency=1` | pass | 75 passed, 0 failed, on Node v24.20.0. |
| Lint / type-check | `npx biome check src/client/styles.css tests/unit/control-layer.test.js tests/unit/organizer-colors.test.js` | pass | 3 files, no fixes. |

## Output Excerpts

Built stylesheet `dist/assets/index-NwV2LpJb.css`: `.confirm-delete` and `button:focus-visible` sit at brace depth 1 inside `@layer components`, immediately before `@layer utilities`. The old unlayered `button, a` paint rule is absent. `[id=add-photos]` appears only in the narrow minimum-size rule.

Rendered organizer, signed in, 960px wide:

| Control | background | border-top | radius | padding-top | hover background |
|---------|------------|------------|--------|-------------|------------------|
| `#add-photos` | `oklch(0.5 0.19 262)` (`--primary`) | `0px` | `6px` | `8px` | `oklab(0.5 -0.0264429 -0.188151)` |
| `#appearance-switch` | `oklch(0.96 0.005 262)` (`--secondary`) | `0px` | `6px` | `8px` | — |
| Delete (`bg-destructive` and `.confirm-delete`) | `oklch(0.5 0.2 27)` (`--destructive`) | — | — | — | `oklab(0.5 0.178201 0.0907981)` |

`--secondary` is `oklch(0.96 0.005 262)`. The Delete button does not use it. Hover changes both Add photos and Delete. `#appearance-switch` measures `0px`, `6px`, and `8px`, the Button classes. The assessment's predicted legacy values were `1px`, `8px`, and `8.8px`.

```text
ℹ tests 75
ℹ pass 75
ℹ fail 0
```

## Residual Risks

- `.empty`, `.text-button`, `.album-link`, and `.picture-open` remain unlayered. They will override `Card` or `Input` utilities when a screen starts using those components.
- The 2px focus outline stays in `@layer components`. The Button no longer sets its own outline utility, so that outline is what focus shows, and a later outline utility can override it. Focus was not measured in the browser.
- `library-view.test.js` and `album-view.test.js` are no longer in the tree. The current layout suite covers those screens and passed.

## Recommendation

Close the bug — verified end-to-end on Node v24.20.0, including the built cascade and the rendered header and delete button.
