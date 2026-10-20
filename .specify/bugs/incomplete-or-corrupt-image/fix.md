# Bug Fix: Incomplete or corrupt image

- **Slug**: incomplete-or-corrupt-image
- **Created**: 2026-10-15
- **Status**: applied

## Summary

A file the browser cannot decode is no longer uploaded. It is counted as skipped, and the existing skip notice is shown. Other files in the same batch are still uploaded. The server still accepts a signature-only body on a direct `POST /api/photos`.

## Changes

| File | What changed | Why |
|------|--------------|-----|
| `src/client/api.js` | `addPhotoBatch` decodes each file before posting. A decode failure becomes a skipped result and that file is not posted. | Stops a truncated or corrupt image from being stored and shown as a broken album picture. |
| `tests/unit/batch.test.js` | Adds a batch test with one rejected file and one accepted file. | Locks the skip-without-upload behavior. |

## Tests

- `node --test` — 20 passed, 0 failed. The new test checks that a rejected file is not posted, `skipped` is 1, and the accepted file is still posted.
- In the browser at `http://localhost:5173/`, a JPEG of only `FF D8 FF` failed `createImageBitmap`. Uploaded with a real one-pixel PNG, the page showed `1 item was skipped.` and the album count rose by one.

## Verification

- Before: a truncated file with a photo signature was posted, stored, and placed in an album with no skip notice.
- After: that file is not posted. The skip notice appears, and a displayable file in the same batch is stored.

## Deviations

- `src/client/main.js` was not changed. It already turns `summary.skipped` into the skip notice and already calls `addPhotoBatch`. The decode check belongs in that function.

## Follow-ups

- Photos already stored from an earlier truncated upload stay in the library. Removing them is out of scope.
- A direct `POST /api/photos` of truncated bytes can still be stored. The plan keeps image decoding out of the server.
