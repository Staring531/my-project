# Bug Fix: Pictures in an album do not display

- **Slug**: picture-can-not-shown-in-user-album
- **Fixed**: 2026-10-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

An upload whose bytes match a picture type but have no showable image is skipped as unreadable, so it does not become a photo row or an image file. A picture that is already listed shows `This picture cannot be shown.` on the album card and in the Add pictures square when its image fails to load.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/server/files.js` | modified | `imageIsShowable` requires a JPEG frame with scan data, a PNG with pixels, a GIF image descriptor, or a WebP frame, each with a positive size |
| `src/server/library.js` | modified | `addPhoto` returns `skipped` / `unreadable` when the type matches but the bytes are not showable |
| `src/client/screens/album.jsx` | modified | Album cards and Add pictures squares replace a failed image with the failure sentence |
| `src/client/styles.css` | modified | The failure sentence occupies the same square as a picture |
| `tests/helpers.js` | modified | JPEG, PNG, GIF, and WebP fixtures are pictures a decoder can paint, including a second JPEG |
| `tests/integration/library-storage.test.js` | modified | Empty JPEG is skipped; four showable types still list and load for their owner |
| `tests/layout/album-layout.test.js` | added test | A 404 image shows the sentence on the card and again when enlarged |

## Diff Highlights (optional)

`addPhoto` refuses a typed payload that cannot be shown, before any row or file is written:

```javascript
if (!imageIsShowable(bytes)) {
  return { status: "skipped", reason: "unreadable" };
}
```

The album card uses the same sentence as the enlarged picture:

```jsx
if (failed) {
  return (
    <span className="picture-failed">This picture cannot be shown.</span>
  );
}
return <img src={src} alt="" onError={() => setFailed(true)} />;
```

## Tests Added or Updated

- `tests/integration/library-storage.test.js` — `skips an empty jpeg and lists pictures that can be shown` pins down a `FF D8 FF D9` upload (422, no photo row, no image file) and a readable JPEG, PNG, GIF, and WebP still appearing for the owner who passes `VISIBLE` and `canSee`.
- `tests/layout/album-layout.test.js` — `says a listed picture cannot be shown when its image fails` pins down the sentence on the album card and again in the enlarged layer.

## Local Verification

- Commands run: `npm test` → 63 passed, 0 failed.
- Manual checks: the layout test loads the album in Chromium, fails the image request, and reads the sentence on the card and in the enlarged picture. The in-IDE browser could not open the local dev server.

## Deviations from Assessment

- `tests/helpers.js` changed. The old JPEG, PNG, GIF, and WebP fixtures were only type markers. The new check rejects those markers, so the fixtures are now real 1×1 pictures. Without that, the existing upload tests would treat a successful add as a failure.
- Two integration uploads used `FF D8 FF 00 D9` and `FF D8 FF 11 D9` as a second distinct photo. Those are the same kind of undecodable JPEG as `FF D8 FF D9`, so they now use `jpegBytes(1)`.
- `src/client/styles.css` gives the failure sentence the picture square. The assessment did not list that file.
- The check is the file structure a decoder needs (frame, positive dimensions, and pixel data), not a full browser decode. The server has no image decoder, and the assessment did not call for a new dependency. A corrupt scan that still has that structure can be stored; the album card then shows the sentence when the browser cannot paint it.
- The images directory is created when the database opens, so the new test asserts that directory is empty rather than absent. No image file is written for the empty JPEG.

## Follow-ups

- Pictures already stored as empty JPEG markers stay in the album. Opening them shows the sentence; this fix does not delete them.
- Phone formats such as HEIC are still skipped before they are stored. The open questions in the assessment were not answered.
