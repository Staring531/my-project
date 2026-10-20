# Bug Assessment: Incomplete or corrupt image

- **Slug**: incomplete-or-corrupt-image
- **Created**: 2026-10-15
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> Image upload incomplete or corrupted; cannot be displayed

No URL was supplied.

## Symptom

A person can add an image file that is incomplete or corrupt. If the file still begins with a JPEG, PNG, GIF, or WebP signature, it is stored and placed in a date album. The tile or the opened album then cannot show that picture. The person is not told that the item was skipped. The specification says an item that cannot be shown as a photo must be skipped, the other photos must stay usable, and the skip count must be shown.

## Reproduction

1. Open the organizer and choose **Add photos**.
2. Select a file whose first bytes are a supported signature and whose remaining bytes are truncated or corrupt. A JPEG that is only the start-of-image marker (`FF D8 FF`) followed by an incomplete body is enough.
3. The client posts those bytes unchanged to `POST /api/photos`.
4. The server stores a photo row and an image file and returns `201`.
5. Open that date album. The picture cannot be displayed, and no skip notice appears.

A file with no supported signature, or a file of 0 bytes, is already skipped and is not this case. The exact bytes from the report are [NEEDS CLARIFICATION: no sample file was attached].

## Suspected Code Paths

- `src/server/files.js:11` — `detectMediaType` accepts a file from the first few signature bytes only. It does not check that the rest of the file can be shown.
- `src/server/library.js:94` — once a signature matches, `addPhoto` stores the bytes. A later failure to read EXIF does not reject the file.
- `src/server/exif-date.js:11` — an EXIF parse error is treated as "no taken date", and the photo is still stored.
- `src/client/api.js:41` — `addPhotoBatch` uploads the original file bytes and does not try to display them first.
- `src/client/library-view.js:29` and `src/client/album-view.js:13` — the cover and album pictures are plain images with no failure handler, so a broken file stays in the album with no notice.
- `tests/helpers.js:25` — `jpegBytes()` is only `FF D8 FF D9`, and the contract and library tests expect that body to be stored.

## Root Cause Hypothesis

The upload path decides "this is a photo" from a file signature, not from whether the image can be displayed. Confidence: high. A truncated or corrupt file that still has a JPEG, PNG, GIF, or WebP header is stored, counted in a date album, and requested as an image. Nothing on the page removes it or adds it to the skip count when the browser cannot draw it. Empty files and non-photo signatures are a different, already handled path.

## Proposed Remediation

**Preferred**: Before posting a file, the client tries to decode it as an image. If decoding fails, do not upload that file. Count it as skipped and keep the existing `1 item was skipped.` / `N items were skipped.` notice. Other files in the same batch are still uploaded. This uses the browser the person is already using and does not add an image-processing library on the server.

**Alternatives** (optional):
- Decode on the server and reject there. That would also stop a direct API upload, but the plan already rejected a native decode library for this app.
- Leave stored files in place and only hide an image after it fails to load. The broken file would remain in the album and in the photo count.

**Files likely to change**:
- `src/client/api.js`
- `src/client/main.js`
- `tests/unit/batch.test.js`

**Tests to add or update**:
- A batch test where the decoder rejects one file: that file is not posted, `skipped` increases, and a file the decoder accepts is still posted.
- Keep the current server tests that store a signature-only body. Those tests describe the API, not the browser display check.

## Risks & Considerations

- A decoder can reject a rare but displayable file, or accept a file the album image still cannot draw.
- Photos already stored from a truncated upload stay in the library until they are removed. Removal is out of scope for this feature.
- A direct `POST /api/photos` of truncated bytes can still be stored, because the check is in the page rather than the server.
- Decoding a large file in the browser adds a delay before the upload of that file. It does not change the album-list payload.

## Open Questions

- [NEEDS CLARIFICATION: was the broken file given a skip notice, or did it appear in an album and fail to draw?]
