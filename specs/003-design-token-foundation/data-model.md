# Data Model: Design Token Foundation

The photo library model is unchanged. This feature adds a closed color catalog and the values that paint it. There is no database table and no request body.

## Semantic color role

A named purpose for color. The catalog in `src/client/token-roles.js` is the only list. `src/client/tokens.css` stores the values.

| Field | Required | Rules |
| --- | --- | --- |
| name | yes | One of: `background`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `info`. |
| text name | yes | `foreground` for `background`. For every other name, the text name is that name plus `-foreground`. |
| light value | yes | An `oklch()` color on `:root`. |
| dark value | yes | An `oklch()` color on `.dark`. |
| light text value | yes | An `oklch()` color on `:root` for the text name. |
| dark text value | yes | An `oklch()` color on `.dark` for the text name. |

### Validation

- The catalog and `tokens.css` contain the same role names. A missing name, an extra color property, or a value that is not `oklch()` is incomplete.
- Text on its paired background has contrast of at least 4.5 to 1 in the light appearance and in the dark appearance.
- A role does not keep the other appearance's value after the page switches.
- Replacing the placeholder brand edits hue and chroma of `primary`, `ring`, `secondary`, `muted`, and `accent` in both appearances. It does not rename roles and it does not delete a dark value.

`background` is the page surface. Its paired text color is `foreground`, not `background-foreground`.

## Supporting appearance value

Not a text color. The contrast rule does not apply.

| Name | Required | Rules |
| --- | --- | --- |
| border | yes | `oklch()` on `:root` and on `.dark`. |
| input | yes | `oklch()` on `:root` and on `.dark`. |
| ring | yes | `oklch()` on `:root` and on `.dark`. Focus emphasis uses this value. |
| radius | yes | One length, shared by both appearances. The placeholder is `0.5rem`. |

## Appearance

The sample page is in exactly one appearance at a time.

| Appearance | How it is selected | Values used |
| --- | --- | --- |
| light | The root element does not have the class `dark`. This is the initial appearance. | `:root` |
| dark | The root element has the class `dark`. | `.dark` |

Switching adds or removes that class. The document address does not change.

## Sample page entry

One rendered row for each catalog item.

| Field | Source |
| --- | --- |
| role name | The catalog name, visible as text |
| surface | The role's color |
| text | The paired text color, showing the text name |
| supporting swatch | `border`, `input`, or `ring`, with no contrast assertion |

The page includes a control that switches appearance and shows which appearance is active.

## State

| Attempt | Result |
| --- | --- |
| Reviewer opens the sample page | Light appearance. Every role and its paired text are visible. |
| Reviewer switches appearance | The same page shows the other value set. |
| Style sheet contains a hexadecimal color, `rgb()`, `hsl()`, or a named color | The style-sheet check fails and names the offending text. |
| Sample page style uses only `var(--...)` | The style-sheet check passes. |
| Token file uses `oklch()` for the catalog | Allowed. `oklch()` outside `tokens.css` is a raw numeric color. |
| Screen source sets a raw or named color directly | The screen check fails. A passing style-sheet check does not clear that failure. |
| Screen source uses only the catalog | The screen check passes. |
| Photo organizer stylesheet | Not an input to either check. Its colors stay as they are. |

## Where the files live

```text
src/client/tokens.css
src/client/token-roles.js
src/client/token-preview.html
src/client/token-preview.css
src/client/token-preview.js
```

`src/client/styles.css` and `src/client/index.html` are not part of this model.
