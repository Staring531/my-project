# Data Model: Client Token Appearance

The photo library model is unchanged. Accounts, albums, pictures, and publications stay as they are. This feature adds no table and no request field.

The semantic roles and their values stay the model in `specs/003-design-token-foundation/data-model.md`. This feature does not add a role and does not change a value.

## Organizer screen

A surface the person already uses. It is painted only from the catalog.

| Screen | What stays the same | Color source |
| --- | --- | --- |
| Library, including empty states and the account forms | Create account, sign in, add photos, named albums, month albums | Catalog pairs in `src/client/styles.css` |
| Album | Open pictures, place, publish, delete confirmation | Catalog pairs in `src/client/styles.css` |
| Enlarged picture | Fit the picture, close, failure sentence | `--popover` and `--popover-foreground` |
| Notices | Duplicate, skip, and error sentences | `--info` or `--destructive` with their paired text |

A photograph is not a screen color. Its pixels are not a catalog value.

## Appearance choice

The organizer is in exactly one appearance at a time.

| Field | Required | Rules |
| --- | --- | --- |
| appearance | yes | `light` or `dark`. |
| where it lives | yes | The document element. `light` has no class `dark`. `dark` has the class `dark`. |
| first value | yes | `light` when the page opens. |
| persistence | yes | Not stored. A reload starts at `light`. Sign-out does not clear it. |

### Transitions

| From | Event | To | What must not change |
| --- | --- | --- | --- |
| light | The person activates the switch | dark | Open album, enlarged picture, pending delete, signed-in person, address |
| dark | The person activates the switch | light | The same list |
| either | Sign in, sign out, add a photo, open an album, enlarge a picture, close it | either | The appearance |

Switching adds or removes the class `dark`. It does not replace the document and it does not render the library or the album again.

## Pairing rule

A surface and the text on it are one catalog pair.

- The page uses `background` with `foreground`.
- `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, and `info` each use their own `-foreground`.
- A text color from one pair on a surface from another pair is incomplete.
- `border`, `input`, `ring`, and `radius` are supporting values. They are not text pairs and they are not measured for 4.5 to 1.
- `oklch()` outside `src/client/tokens.css` is a raw numeric color, including inside `src/client/styles.css`.

## Where the files live

```text
src/client/tokens.css          # values, unchanged
src/client/token-roles.js      # catalog, unchanged
src/client/appearance.js       # the switch
src/client/index.html          # loads the tokens, hosts the switch
src/client/styles.css          # var(--...) only
src/client/main.js             # wires the switch
src/client/album-view.js       # class on confirm delete
```

`src/server/` is not part of this model.
