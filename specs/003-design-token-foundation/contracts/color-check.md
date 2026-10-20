# Contract: Color Check

Two checks. They do not share a result. Field meanings live in [data-model.md](../data-model.md).

Both are functions called by `node:test`. `npm test` runs them. Neither check reads `src/client/styles.css`.

## Style-sheet check

Input is CSS source plus a profile: `tokens` or `screen`.

**`tokens` profile**, used only for `src/client/tokens.css`:

- `oklch()` values, `var(--...)`, and the radius length are allowed.
- A hexadecimal color, a named color, `rgb()`, or `hsl()` is a finding.

**`screen` profile**, used for `src/client/token-preview.css`:

- `var(--...)` references to catalog properties are allowed.
- `oklch()`, any other color function, a hexadecimal color, and a named color are findings.

**Pass**: an empty finding list.

**Fail**: one finding per offending span.

```json
{
  "kind": "hex",
  "text": "#ff0000"
}
```

`kind` is `hex`, `named`, or `function`. `text` is the offending span. The check does not rewrite the file.

A passing `tokens` result does not imply the `screen` profile passed.

## Screen check

Input is the sample page's HTML and script source. It is a different function from the style-sheet check.

- A hexadecimal color, a named color, or a color function anywhere in that source is a finding, including a color written in a style declaration.
- Custom property names from the catalog are not findings.
- The finding shape is the same as the style-sheet check.

A passing style-sheet check is not an input to this function and does not clear its findings.

## Contrast check

Input is the text of `src/client/tokens.css` and the catalog.

- Every paired role must have an `oklch()` value for the surface and the text, under `:root` and under `.dark`.
- Each of those pairs must have contrast of at least 4.5 to 1.
- A missing value or a short pair fails with the role name and the appearance name.
- `border`, `input`, `ring`, and `radius` are not pairs and are not measured.

## Fixture rule

Tests prove failure with source text that contains one bad color. They do not leave that color in `tokens.css` or in the sample page. Removing the bad color from the fixture source is what makes that assertion pass.
