# Contract: Visual Language

This contract is the rendered check for spec 009. Spec 005 `contracts/screen-layout.md` and spec 006 `contracts/interface-interaction.md` still decide region order, keyboard completion, and who can see a picture. Spec 008 `contracts/visual-language.md` still decides the sentences, the language switch, and the confirmation timing. This contract wins where the paint, the type, the mark, the flourish, and the dark paper page differ.

A task that changes a screen cites Principle IV and this contract.

## Paint

Checked on the library, a date album, and an enlarged picture, in both appearances.

| Fact | Light | Dark |
| --- | --- | --- |
| Page | Warm paper, not pure white | Warm near-black, not pure black and not navy |
| Card | Lighter warm white, 1-pixel warm hairline, 5-pixel corner, soft warm shadow | Lifted warm black, same hairline, corner, and shadow |
| Main action | Deeper terracotta fill, light text, 5-pixel corner | Lighter terracotta fill, dark text, 5-pixel corner |
| Main action hover | A deeper shade of that terracotta | A lighter shade of that terracotta |
| Secondary action | Card fill, 1-pixel warm hairline, no lift | Card fill, 1-pixel warm hairline, no lift |
| Link | Deeper terracotta text, not blue | Lighter terracotta text, not blue |
| Focus | 3-pixel ring, visible on the paper | 3-pixel ring, visible on the dark page |
| Header | 56 pixels, stays visible, mark beside the 15-pixel serif name, 1-pixel bottom hairline | Same |

Hovering a card lifts it about 2 pixels. Hovering a button does not. A photograph keeps its own colors. Text on its paired background is at least 4.5 to 1. The skip sentence uses the muted pair, not the terracotta.

## Type

| Fact | Rule |
| --- | --- |
| Display | Device serif, weight lighter than heavy bold, on the product name, month headings, Albums, dialog titles, and the card name |
| Body | Device sans, 14 pixels |
| Micro-labels | Device monospace, 12 pixels, for the count, Assigned, Public, and Private. Chinese labels are not uppercased |

## Mark, flourish, and choices

| Fact | Rule |
| --- | --- |
| Mark | Terracotta square, one tighter corner, initial 照 in Chinese and P in English |
| Flourish | Above the existing empty sentence on an empty library and an empty named album |
| First visit | Light paper and Chinese |
| Appearance switch | Still present, immediately after the language switch. It offers the other paper appearance |
| Next visit | The appearance and the language last chosen, independently |
| Not translated | Album names and stored dates |

Wide and signed in, the header order is New album, Add photos, language, appearance, Sign out. Wide and signed out: language, appearance, Sign in. Narrow and signed in, More lists New album, language, appearance, Sign out. Narrow and signed out, More lists language and appearance, and Sign in stays visible.
