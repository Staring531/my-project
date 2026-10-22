# Bug Assessment: Pictures in an album do not display

- **Slug**: picture-can-not-shown-in-user-album
- **Created**: 2026-10-20
- **Source**: pasted text
- **Verdict**: likely valid, needs reproduction
- **Severity**: medium

## Report (verbatim or summarized)

> There are many pics that can't shown in album

No URL was supplied.

## Symptom

Many pictures that belong in an album are not visible there. The album is expected to show each picture the viewer is allowed to see, and a picture that cannot be loaded is expected to say `This picture cannot be shown.`

## Reproduction

1. [NEEDS CLARIFICATION: which album — a date album or a named album the signed-in person owns — and whether the person is signed in.]
2. [NEEDS CLARIFICATION: whether the pictures are missing from the grid, present as blank squares, or show the sentence `This picture cannot be shown.` after they are opened.]
3. [NEEDS CLARIFICATION: whether Add photos reported those files as skipped.]

The current local library was inspected only as supporting evidence, not as a confirmed reproduction of this report. It contains six photo rows, all with a null `owner_id`, `is_public = 1`, and album date `2026-10-15`. Three named albums exist for one person and `named_album_photos` has no rows. Two stored files are JPEG markers with no image payload (`FF D8 FF D9` and `FF D8 FF 00 D9`).

## Suspected Code Paths

- `src/client/screens/album.jsx:199` — each album picture is an `<img src={photo.imageUrl}>` inside `picture-open`, with no `onError`. A failed load stays a blank card.
- `src/client/screens/album.jsx:303` — the Add pictures grid uses the same image URL and also has no load-failure state.
- `src/client/screens/preview.jsx:22` — `This picture cannot be shown.` is rendered only after the enlarged picture sets `picture.failed`.
- `src/client/organizer.jsx:276` — opening a picture starts with `failed: false`; `onError` at line 316 is the only path that sets `failed`.
- `src/server/library.js:115` — `toPhoto` sets `imageUrl` to `/images/${stored_name}` for every listed row.
- `src/server/library.js:239` — a named album lists every membership, with no per-picture check that the file can be painted.
- `src/server/library.js:261` — a date album lists rows that match `VISIBLE`.
- `src/server/server.js:384` — `GET /images/{stored_name}` returns 404 JSON when the file is missing or `canSee` is false. An `<img>` cannot paint that body.
- `src/server/files.js:17` — `detectMediaType` treats any buffer starting `FF D8 FF` as JPEG, including a file that is only the start and end markers.
- `src/server/library.js:362` — `addPhoto` stores that media type and inserts the row with `is_public = 0`.
- `src/client/api.js:109` — `decodeDisplayableImage` skips a file the browser cannot decode before upload. Files already stored, or posted without that decode step, still appear in the album.

## Root Cause Hypothesis

The album grid assumes every `imageUrl` will paint. The enlarged layer is the only place that turns a failed load into `This picture cannot be shown.` A picture whose file is missing, whose `GET /images/...` is 404, or whose bytes are a JPEG marker with no image data stays in the album as a card the person cannot see. `detectMediaType` accepts those empty JPEG bytes, so they can be stored and listed. Confidence: medium that this is a real display gap; low that it is the only cause of this report, because the report does not say whether the cards are absent, blank, or replaced by the failure sentence.

## Proposed Remediation

**Preferred**: Keep a picture in the album only when its stored bytes can be shown, and say so on the album card when they cannot. Reject a JPEG, PNG, GIF, or WEBP payload that matches the current magic-byte check but has no decodable image, using the existing `skipped` / `unreadable` result from `addPhoto`, so a new upload does not become a dead card. On the album picture and the Add pictures square, handle `img` `onError` the same way the enlarged layer does: show `This picture cannot be shown.` in that card. Do not change who is allowed to see a picture.

**Alternatives**:
- Show the failure sentence on the card and leave `detectMediaType` unchanged. Existing empty files stay in the album, but the person is told. Trade-off: the album still fills with pictures that can never be painted.
- Delete or hide rows whose files fail to decode. Trade-off: that removes pictures the owner did not ask to delete, and it can drop a file that is temporarily unreadable.

**Files likely to change**:
- `src/server/files.js`
- `src/server/library.js`
- `src/client/screens/album.jsx`
- `tests/integration/library-storage.test.js`
- `tests/layout/album-layout.test.js`

**Tests to add or update**:
- An upload whose bytes are only `FF D8 FF D9` is skipped as unreadable and does not gain a photo row or an image file.
- A picture the album lists, whose image request fails, shows `This picture cannot be shown.` on the album card and again when it is enlarged.
- A picture with a readable JPEG, PNG, GIF, or WEBP file still appears in the album for a viewer who passes `VISIBLE` and `canSee`.

## Risks & Considerations

- A stricter JPEG check can reject an unusual but valid file if it requires more than a decodable image. Keep the check to "the browser can paint this," not a new format list.
- A thumbnail error state must not hide a picture the viewer is allowed to see, and must not change `is_public` or album publication.
- Image responses that return JSON 404 should stay 404. The client should explain that response; the server should not start returning a placeholder image.

## Open Questions

- [NEEDS CLARIFICATION: date album or named album, and is the person signed in?]
- [NEEDS CLARIFICATION: are the pictures missing from the list, blank in the grid, or showing `This picture cannot be shown.`?]
- [NEEDS CLARIFICATION: did Add photos say those files were skipped?]
- [NEEDS CLARIFICATION: do the failing pictures include phone formats such as HEIC, which the client already skips as unreadable before they are stored?]
