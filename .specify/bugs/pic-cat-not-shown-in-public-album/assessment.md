# Bug Assessment: Pictures in the public album do not display

- **Slug**: pic-cat-not-shown-in-public-album
- **Created**: 2026-10-20
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> there are also some pics that can't shown in public album

No URL was supplied.

## Symptom

The public album still contains pictures that cannot be painted. A signed-out person is expected to see each public picture, and a picture that cannot be loaded is expected to say `This picture cannot be shown.` The public album card on the library is also expected to show a picture, or that same sentence when the cover cannot load.

## Reproduction

1. Open the library while signed out. The only public date album is `unowned:2026-10-15:1` (2026-10-15, six pictures, no owner, `is_public` 1).
2. The album cover is `day.jpg`, the first picture by `added_seq`. That file is the four bytes `FF D8 FF D9`. The library cover image has no load-failure state, so the card does not explain the failure.
3. Open that album. Two of the six pictures cannot be decoded: `day.jpg` (`FF D8 FF D9`) and `later.jpg` (`FF D8 FF 00 D9`). The album grid says `This picture cannot be shown.` The other four pictures paint.

[NEEDS CLARIFICATION: whether the report means this signed-out date album, a published named album, or the failure sentence itself.]

## Suspected Code Paths

- `src/server/library.js:172` — the cover is the first visible row by `taken_at ASC, added_seq ASC`. With null taken dates, that is `day.jpg`, which has no image payload.
- `src/server/library.js:14` — `VISIBLE` includes every row with `is_public = 1`, so both marker files stay in the public album for a signed-out viewer.
- `src/server/library.js:106` — `canSee` returns true for `is_public = 1`, so `GET /images/...` returns the marker bytes with status 200 instead of hiding them.
- `src/client/screens/library.jsx:43` — the public album cover is an `<img>` with no `onError`. A failed cover stays blank.
- `src/client/screens/album.jsx:190` — `PictureFace` already replaces a failed picture inside the album with `This picture cannot be shown.`
- `src/server/files.js` — `imageIsShowable` rejects these marker files, but `addPhoto` uses that check only for a new upload. Rows already stored are left in place.

## Root Cause Hypothesis

The public album is the unowned date album. Its first two stored files are JPEG markers with no image data, and both are public, so they are listed and their bytes are served. The album grid now explains that failure. The library cover is chosen from those same rows and has no failure state, so the public album card shows a blank picture. Confidence: high for this local library. The report does not say whether another public album is involved.

## Proposed Remediation

**Preferred**: Choose the public album cover from the first visible picture whose stored bytes pass `imageIsShowable`. If every candidate fails, use the existing album placeholder. On the library card, handle a failed cover the same way the album grid does: show `This picture cannot be shown.` Do not drop the rows from the album, and do not change `VISIBLE` or `canSee`. The two marker files stay explained inside the album, and the public album card no longer depends on a file that cannot paint.

**Alternatives**:
- Leave the cover query as it is and only add `onError` on the library image. Trade-off: the card explains the failure, but the cover is still the unshowable file rather than one of the four pictures that paint.
- Delete the two stored marker files. Trade-off: a picture with a null owner is not deleted by the owner delete path, and removing it would change the public count without a person asking to delete it.

**Files likely to change**:
- `src/server/library.js`
- `src/server/files.js`
- `src/client/screens/library.jsx`
- `src/client/styles.css`
- `tests/integration/library-storage.test.js`
- `tests/layout/library-layout.test.js`

**Tests to add or update**:
- A public album whose first stored file is `FF D8 FF D9`, and whose next file is a readable picture, uses the readable picture as `coverImageUrl`.
- A library card whose cover request fails shows `This picture cannot be shown.`
- A readable public picture is still listed and its image request still returns 200 for a signed-out viewer.

## Risks & Considerations

- Reading every candidate file while choosing a cover can get expensive for a large album. Stop at the first file that passes `imageIsShowable`.
- Skipping an unshowable file for the cover must not change `photoCount`, `is_public`, or who can open the album.
- The album grid already explains these two files. A second sentence on the library card should use the same words.

## Open Questions

- [NEEDS CLARIFICATION: is the public album the signed-out date album `unowned:2026-10-15:1`, or a named album marked public?]
- [NEEDS CLARIFICATION: is the problem the blank cover, the sentence inside the album, or pictures missing from the list?]
