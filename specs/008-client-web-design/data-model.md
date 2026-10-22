# Data Model: Client Web Design

No database table and no API field changes. The server still returns the English sentences. The new facts live in the browser.

## Preference

Remembered on this browser. Independent fields.

| Field | Values | First visit |
| --- | --- | --- |
| Appearance | `light`, `dark` | `light` |
| Language | `zh`, `en` | `zh` |

Writing either field leaves the other as it was. The document class follows Appearance. The document language follows Language: `zh` or `en`.

## Interface sentence

One row in the copy module for each Interface copy line in the spec.

| Field | Rule |
| --- | --- |
| English | The sentence specs 001 through 006 already use. Also the lookup key when the server sends that sentence. |
| Chinese | The default shown sentence. |
| Month heading | Not a fixed row. English is the month name and the year. Chinese is the year, 年, the month number, and 月. |

A server sentence with no row is shown unchanged. An album name and a stored date are not rows.

## Library load

| State | What the person sees |
| --- | --- |
| Loading | Quiet blocks in the shape of the missing cards. Empty sentences stay hidden. |
| Ready | The library or album from specs 005 and 006, in the active language. |
| Failed | The sentence the server sent, mapped through Interface sentence when a row exists. |

The first response settles Loading. A later refresh does not replace a visible library with blocks.

## Confirmation

| Field | Rule |
| --- | --- |
| Kind | Album created, picture deleted, album now public, album now private. |
| Shown | After that action succeeds. |
| Cleared | Four seconds after it is shown, or when a newer confirmation replaces it. The newer one is the lower one. |

A skipped-file notice is not a confirmation. A field error is not a confirmation. Switching appearance or language does not clear or confirm a pending delete.

## Validation

- Text on its paired role meets a contrast of 4.5 to 1 in both appearances.
- The main action is the primary role, not the blue info role.
- A link may use the info role as text. A button fill does not.
- Card corners are 12 pixels. Button and field corners are 6 pixels.
- The focus ring is 3 pixels and uses the gray ring role.
