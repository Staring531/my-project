# Contract: Organizer Color Check

The functions stay the ones in `specs/003-design-token-foundation/contracts/color-check.md`. This feature changes which files are inputs. It does not change the finding shape.

A passing result for the sample page is not an input to the organizer checks and does not clear an organizer finding.

## Style-sheet check

`src/client/styles.css` uses the `screen` profile:

- `var(--...)` references to catalog properties are allowed.
- `oklch()`, any other color function, a hexadecimal color, and a named color are findings.
- The radius length is the catalog property `var(--radius)`, not a second corner length.

`src/client/tokens.css` stays on the `tokens` profile. `src/client/token-preview.css` stays on the `screen` profile. Those calls remain separate from the call that reads `styles.css`.

**Pass**: an empty finding list for `styles.css`.

**Fail**: one finding per offending span, with `kind` of `hex`, `named`, or `function`, and `text` the offending span.

## Screen check

Inputs, each in its own call:

- `src/client/index.html`
- `src/client/main.js`
- `src/client/library-view.js`
- `src/client/album-view.js`
- `src/client/preview-view.js`
- `src/client/session-view.js`

The sample page files stay inputs of their own calls. A catalog custom-property name is not a finding. A color written in a style declaration is a finding.

`src/client/color-check.js` and `src/client/screen-color.js` are not inputs. They contain color names as the check's own data.

## Contrast

No new contrast function. `tests/unit/token-contrast.test.js` remains the proof that each catalog pair is at least 4.5 to 1 in both appearances. This feature is wrong if a library rule paints text with a different pair than its surface. `border`, `input`, `ring`, and `radius` are not measured.

## Fixture rule

Failure is still proved with source text that is not left in the organizer files. Removing the bad color from that fixture is what makes the fixture assertion pass. The real organizer files must pass on their own.
