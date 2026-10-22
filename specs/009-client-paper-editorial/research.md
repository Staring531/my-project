# Research: Client Paper Editorial

## No new package

**Decision**: Add no package. The paper look stays in `src/client/tokens.css` and `src/client/styles.css`. The mark and the empty flourish are elements in the screens that already render the header and the empty sentences. Language and appearance memory stay in `src/client/preferences.js`.

**Rationale**: The constitution allows the React, Tailwind, and shadcn dependencies already in the project. A font package, a toast package, and an icon package would each repeat a face, a confirmation, or a mark the page can draw with the elements it has.

**Alternatives considered**: Downloading a serif or a monospace face would break the rule that type comes from the device. A second palette file would duplicate `tokens.css`.

## Retune the existing roles to warm paper

**Decision**: Keep the role names in `src/client/token-roles.js`. Change their `oklch()` values. Do not add a `link` role. `--accent` stays a neutral warm hover tint, so `hover:bg-accent` does not turn a button terracotta. `--primary` is the main-action terracotta. `--info` is the link terracotta. `--destructive`, `--success`, and `--warning` keep the pairs they have now, because those pairs already clear 4.5 to 1 and the danger treatment must stay distinct from the terracotta.

Light values, measured with the same conversion the contrast test uses:

| Role | Value | Why |
| --- | --- | --- |
| background, header | `oklch(0.968 0.009 84.6)` | Warm paper `#f7f4ee`, not pure white |
| foreground, card-foreground, popover-foreground, secondary-foreground, accent-foreground | `oklch(0.261 0.006 78.2)` | Warm ink `#262421` |
| card, popover, secondary | `oklch(0.994 0.006 84.6)` | Lighter warm white `#fffdf9` |
| muted, accent | `oklch(0.94 0.01 87.5)` | Warm panel `#eeebe4` |
| muted-foreground | `oklch(0.45 0.012 70)` | The source muted `#716d67` is 4.32 to 1 on the panel. `0.45` clears 6.25 to 1 |
| primary, info | `oklch(0.504 0.124 37.6)` | Deeper terracotta `#9e462b` |
| primary-foreground, info-foreground | `oklch(0.985 0.005 85)` | Light text. 5.98 to 1 on the deeper terracotta |
| border | `oklch(0.887 0.013 82.4)` | Warm hairline `#ded9d0` |
| input | `oklch(0.82 0.015 80)` | One step darker than the hairline |
| ring | `oklch(0.55 0.015 70)` | Warm gray, low chroma |
| primary-hover | `oklch(0.42 0.12 37)` | Deeper than the resting fill. Light text is 8.57 to 1 |

Dark values:

| Role | Value | Why |
| --- | --- | --- |
| background, header | `oklch(0.22 0.012 70)` | Warm near-black. Lightness 0.22 is not pure black and the hue is warm, not navy |
| foreground and the matching text roles | `oklch(0.95 0.012 85)` | Warm off-white. 14.98 to 1 on the page |
| card, popover, secondary | `oklch(0.27 0.012 70)` | A small lift above the page |
| muted, accent | `oklch(0.32 0.012 70)` | Neutral warm hover |
| muted-foreground | `oklch(0.8 0.012 80)` | 6.80 to 1 on the muted surface |
| primary, info | `oklch(0.78 0.11 40)` | Lighter terracotta. 8.34 to 1 as text on the dark page |
| primary-foreground, info-foreground | `oklch(0.25 0.02 50)` | Dark text. 6.95 to 1 on that lighter terracotta |
| border | `oklch(0.4 0.015 70)` | Warm hairline on the dark page |
| input | `oklch(0.45 0.015 70)` | One step lighter than the hairline |
| ring | `oklch(0.72 0.012 80)` | Warm gray, low chroma |
| primary-hover | `oklch(0.84 0.09 42)` | One step lighter. Dark text is 9.57 to 1 |

`--radius` becomes `5px`, so cards, dialogs, fields, buttons, and the confirmation share a 4-to-5 pixel corner. The privacy chip sets `border-radius: 9999px` directly. That length does not match the existing ban on `border-radius: 999px`.

`--shadow` is `oklch(0.4 0.04 50 / 16%)` in the light appearance and `oklch(0.12 0.02 50 / 50%)` in the dark appearance. Alpha stays on this supporting token. A semantic role the contrast parser reads does not take an alpha. `shadow` and `primary-hover` join `supportingAppearance` beside the existing `header`. The header is a solid fill equal to the page, so a scrolling bar does not need a translucent color.

**Rationale**: The published accent `#d6663f` is `oklch(0.638 0.151 39.4)`. Light text on it is 3.51 to 1, under the 4.5 requirement. The deeper terracotta passes both as a fill (5.98 to 1 with light text) and as a link on the paper (5.69 to 1). Using it for the resting main action, and a still darker shade for hover, keeps one hue and meets FR-002 and FR-012. Putting that hue in `--accent` would paint `hover:bg-accent` terracotta.

**Alternatives considered**: Painting the hexadecimal paper values into `styles.css` would fail the screen color check. A pure black dark page would fail FR-001. Keeping spec 008's cool near-black main action would fail FR-002.

## Type, shadow, and motion stay in the style sheet

**Decision**: Device faces only.

- Body and buttons: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif`, 14 pixels, line-height 1.5.
- `h1`, `h2`, and `.full-name`: `Georgia, "Times New Roman", "Songti SC", "Noto Serif SC", serif`, weight 500, letter-spacing `-0.025em`. Month and Albums headings stay 24 pixels. The product name stays 15 pixels. The card name stays 16 pixels.
- `.count`, `.assigned`, and `.privacy-control`: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, 12 pixels. No uppercase transform, so a Chinese label is not capitalized.

The header is 56 pixels tall with a 1-pixel warm hairline. Cards, the confirmation, and dialogs use `box-shadow: 0 10px 28px var(--shadow)`. Album cards and picture cards rise 2 pixels on hover and deepen that shadow. Buttons do not rise. Under reduced motion, those cards, the skeleton, and the confirmation lose animation and transition. The rule does not set `transform: none` on a dialog.

The skip sentence uses the muted pair instead of `--info`, so the terracotta info role stays on links. All albums and other text links use `color: var(--info)`. A card's name stays ink.

**Rationale**: The spec separates serif display titles, sans body, and monospaced micro-labels, and it forbids uppercasing Chinese. One font rule for both languages is simpler than a language-specific transform. The warm shadow cannot be written as `rgb()` in `styles.css`.

**Alternatives considered**: Uppercase English micro-labels would need a second rule to protect Chinese. A glass header would need a translucent color the paper spec does not ask for.

## Mark and flourish

**Decision**: The header renders one mark: a square filled with `var(--primary)`, three corners at 5 pixels and one corner tighter, holding 照 when the language is Chinese and P when it is English. The empty library and the empty named album render the flourish above the existing sentence: that mark centered in a circle, with one or two warm hairline arcs. The flourish is not repeated under Albums when date albums are already showing, and it is not used in the enlarged picture or the add-pictures dialog.

**Rationale**: FR-007 and FR-023 name those two shapes and those two initials. The sentences stay in `copy.js`. The initials are fixed by the spec, so they are not derived by taking an arbitrary first letter at runtime beyond the two named cases.

**Alternatives considered**: An image file for the mark would be a second source of the terracotta. Coloring one word inside an empty sentence would change a sentence the spec says stays unchanged.
