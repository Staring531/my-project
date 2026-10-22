# Data Model: Client Paper Editorial

No database table and no API field changes. The preference record from spec 008 stays the only stored choice.

## Paper appearance

One language with two values.

| Field | Light | Dark |
| --- | --- | --- |
| Page | Warm paper | Warm near-black, not pure black and not navy |
| Card | Lighter warm white | A small lift above the page |
| Ink | Warm near-black | Warm off-white |
| Accent | Deeper terracotta for the mark, the main action, and links | Lighter terracotta of the same hue, with dark text on the main action |
| Hairline | Warm, 1 pixel | Warm, 1 pixel |
| Corner | 5 pixels on cards, buttons, fields, dialogs, and the confirmation | Same |
| Privacy chip | Fully round | Fully round |
| Shadow | Soft and warm | Soft and warm |

The first visit is the light value. A later visit uses the value last chosen. Switching it does not change the language and does not close an open layer.

## Signature mark

| Field | Rule |
| --- | --- |
| Place | Beside the product name in the header |
| Shape | Terracotta square, three corners equal, one corner tighter |
| Initial | 照 while Chinese is active. P while English is active |
| Follows | The language, in both appearances |

## Empty flourish

| Field | Rule |
| --- | --- |
| Shape | The mark centered in a circle, with one or two warm hairline arcs on one side |
| Shown above | `There are no public photos.`, `Add photos to organize them by the day they were taken.`, and `This album has no pictures.` |
| Not shown | Under Albums when date albums are already on the page. Inside the enlarged picture. Inside the add-pictures dialog |
| Sentence | The existing sentence stays, in the active language |

## Preference

Unchanged from spec 008.

| Field | Values | First visit |
| --- | --- | --- |
| appearance | `light` or `dark` | `light` |
| language | `zh` or `en` | `zh` |

Writing one field leaves the other stored value in place. `light` means the light paper page. `dark` means the dark paper page. Neither value selects the cool white or pure black page from spec 008.

## Validation

- Every semantic text pair clears 4.5 to 1 in both appearances.
- A card corner is 5 pixels and has a visible shadow.
- Hover lifts a card about 2 pixels and does not lift a button.
- Reduced motion removes the lift, the skeleton pulse, and the confirmation's rise, and does not clear a dialog's position.
- Album names and stored dates are not translated. Month headings still follow the active language.
