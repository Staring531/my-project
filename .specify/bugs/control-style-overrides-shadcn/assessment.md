# Bug Assessment: Global button and link rule overrides shadcn components

- **Slug**: control-style-overrides-shadcn
- **Created**: 2026-10-21
- **Source**: code review in conversation, preparing to adopt the "Memories Albums App" Figma design with the shadcn components already in the project
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

The project already ships shadcn components (`src/client/components/ui/button.jsx`, `card.jsx`, `input.jsx`) on Tailwind v4, but a global stylesheet rule paints every `button` and `a`. The shadcn variants, sizes, hover states and focus ring do not take effect. The earlier assessment `very-bad-work` named this same rule as part of the tile layout failure; this report covers its effect on the component library, which blocks the screen redesign.

## Symptom

A shadcn `Button` is painted by the legacy rule instead of its own classes. `variant="destructive"` shows the secondary colors, hover shades do nothing, and the default variant is primary only because an `[id="add-photos"]` selector re-paints it. Expected: shadcn components are styled by their own utilities, and plain `button` and `a` elements keep the legacy look until a screen replaces them.

## Reproduction

1. Run `npx vite build` and read the emitted CSS. The rule `button,[id=sign-out],…,a{font:inherit;background:var(--secondary);…;padding:.55rem 1rem}` is at brace depth 0, outside every layer. `.bg-primary` is at depth 1, inside `@layer utilities`. (Checked at draft time.)
2. Render `<Button variant="destructive">` on any screen. It takes the secondary background and text from the global rule, not `bg-destructive text-destructive-foreground`.
3. Open the header. **Add photos** is a default-variant `Button`; it is primary only through the `[id="add-photos"]` rule at `styles.css:133`. **Light** and **Sign out** look correct because the secondary variant matches the legacy colors.
4. [NEEDS CLARIFICATION: measure `#appearance-switch` in a browser. The cascade predicts `border-top-width: 1px`, `border-radius: 8px`, `padding-top: 8.8px` from the legacy rule, against `0px`, `6px`, `8px` from the Button classes. These values were derived from the CSS, not measured.]

## Suspected Code Paths

- `src/client/styles.css:115` — `button, [id="sign-out"], …, a { font; background; color; border; border-radius; padding; cursor }` is unlayered. A normal declaration outside a layer beats every normal declaration inside a layer, regardless of specificity or order, so it beats all Tailwind utilities.
- `src/client/styles.css:133` — `[id="add-photos"], .account button, .create-album button` re-paints primary for the same reason; the first selector is a workaround for the Button component.
- `src/client/styles.css:140` — `.confirm-delete` and `src/client/styles.css:145` — `button:focus-visible` (`outline: 2px solid`) have the same problem. The focus rule defeats the Button's `focus-visible:outline-none focus-visible:ring-1`.
- `src/client/styles.css:1` — `@import "tailwindcss"` places `base`, `components` and `utilities` in layers, which is what makes the unlayered rule win.
- `src/client/components/ui/button.jsx:7` — the variant and size classes that are being overridden.
- `src/client/App.jsx:16` — the three header `Button`s depend on the id selectors.
- `src/client/library-view.js:23`, `src/client/library-view.js:146`, `src/client/album-view.js:15`, `src/client/session-view.js:36`, `src/client/preview-view.js:7` — plain `button` and `a` elements that rely on the legacy look. The rule cannot simply be deleted.

## Root Cause Hypothesis

The legacy stylesheet was written before the shadcn components were added, and it was never moved out of the unlayered cascade. Tailwind v4 emits utilities inside `@layer utilities`, so any unlayered element rule overrides them. The id selectors for `add-photos` and `sign-out` were added to make the Button components look right, which hid the problem. Confidence: high for the mechanism, medium for the exact computed values in the reproduction step 4.

## Proposed Remediation

**Preferred**: Wrap the contiguous legacy control rules (`styles.css:115-149`: the global control rule, the primary re-paint, `.confirm-delete`, and the focus rule) in one `@layer components { … }` block, with their selectors and declarations unchanged. The components layer is declared after `base`, so the legacy rules still override the Tailwind reset for plain elements, and it is declared before `utilities`, so shadcn classes now override the legacy rules. Plain `button` and `a` elements keep their current look.

```css
/* Legacy control look for plain button and a elements. It sits in the components
   layer so Tailwind utilities, and therefore the shadcn components, override it. */
@layer components {
  button,
  [id="sign-out"],
  …,
  a { … }
  /* the three rules that follow are moved in unchanged */
}
```

A prototype of this change was run against the repository at draft time and then reverted: the existing suite gave the same result before and after, `npx biome check` was clean, and the built CSS showed the legacy rules at depth 1 inside `@layer components` (they were at depth 0 before). A new regression test failed on the original stylesheet and passed on the prototype.

After the change, `[id="add-photos"]` and `[id="sign-out"]` are redundant, because the Button variants supply the same colors. The constitution (Principle III) asks that dead code is removed in the change that makes it obsolete. Remove those two selectors and re-point the two `hasPair` assertions in `tests/unit/organizer-colors.test.js` at the Button variants in `button.jsx` (`default` pairs `bg-primary` with `text-primary-foreground`; `secondary` pairs `bg-secondary` with `text-secondary-foreground`). This keeps each assertion's meaning and does not weaken it. This removal was **not** prototyped.

**Alternatives**:
- Move all of `styles.css` into `@layer components` now. Fixes the same class of problem for `.tile`, `.empty`, `.account input` and the rest before the screens adopt `Card` and `Input`. Larger diff and more to re-verify; better as part of the screen redesign spec.
- Delete the global rule and convert every plain `button` and `a` to `<Button>` or a classed link. This is the screen rewrite; it needs a feature spec that follows Principle IV, so it is out of scope for a bug fix.
- Make Tailwind utilities `!important`. Rejected: it hides the cause and affects every utility.

**Files likely to change**:
- `src/client/styles.css`
- `tests/unit/control-layer.test.js` (new)
- `tests/unit/organizer-colors.test.js` (only if the two id selectors are removed)

**Tests to add or update**:
- New `tests/unit/control-layer.test.js`: after stripping comments, assert that `styles.css` declares a `@layer components` block, and that no rule outside an at-rule has a bare `button` or `a` in its selector list. It fails on the current stylesheet and passes after the fix.
- `tests/unit/organizer-colors.test.js`: if the id selectors are removed, replace `hasPair(/add-photos/…)` and `hasPair(/sign-out/…)` with assertions on the Button variants. Keep every other assertion, including the no-raw-color checks.
- Keep `tests/unit/library-view.test.js`, `album-view.test.js` and `color-check.test.js` unchanged and passing.

## Risks & Considerations

- The `rules()` helper in `organizer-colors.test.js` is a flat regex and is not aware of nesting. The prototype still passed because the layered block parses as ordinary rules, but the helper is fragile if more at-rules are added.
- The **Back** link and the string-built screens still depend on the legacy look; the layer keeps it. Check **Back**, **Create album**, **Sign in**, **View**, **Delete** and the preview **Close** button by eye after the change.
- `button:focus-visible` inside the layer means the shadcn focus ring now shows on `Button`, while plain buttons keep the 2px outline.
- Other unlayered rules (`.tile`, `.empty`, `.account input`, `.create-album input`) will have the same problem as soon as a screen uses `Card` or `Input`. Not fixed here.
- In the draft sandbox the suite gave 58 passed and 2 failed, both "database not writable" tests in the library storage suite, both before and after the prototype. The sandbox ran as root, which probably explains them (not verified). The previous `very-bad-work` run recorded 60 passing, so confirm the baseline locally before fixing.
- The sandbox runs Node 22 while `package.json` requires 24.20 or newer; run the final verification on the project's own Node version.
- Do not change who may publish, hide, delete or place a picture; this fix touches only styling.

## Open Questions

- [NEEDS CLARIFICATION: remove the two id selectors in this change (Constitution III) or keep them for one more change? The assessment recommends removing them.]
- [NEEDS CLARIFICATION: measure the computed styles of `#appearance-switch` and `#add-photos` in a browser before the fix, so the test report has real before-and-after numbers.]
