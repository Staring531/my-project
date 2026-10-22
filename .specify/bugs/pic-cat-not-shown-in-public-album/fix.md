# Bug Fix: Pictures in the public album do not display

- **Slug**: pic-cat-not-shown-in-public-album
- **Fixed**: 2026-10-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The public album cover is now the first listed picture whose stored file can be shown. A library card whose cover fails to load says `This picture cannot be shown.` The two marker files stay in the album, and visibility is unchanged.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/server/files.js` | modified | `readStoredImage` reads one stored file when the name is a single file |
| `src/server/library.js` | modified | `listAlbums` skips a file that exists and fails `imageIsShowable`, and uses no cover when every file fails |
| `src/server/server.js` | modified | `GET /api/albums` passes the data directory so the cover check can read the files |
| `src/client/screens/library.jsx` | modified | A failed cover shows `This picture cannot be shown.` |
| `tests/integration/library-storage.test.js` | added test | A public album whose first file is `FF D8 FF D9` uses the next readable picture as the cover |
| `tests/layout/library-layout.test.js` | added test | A library card shows the failure sentence when the cover request fails |

## Diff Highlights (optional)

The cover walk stops at the first file that can be shown:

```javascript
const bytes = readStoredImage(dataDir, name);
if (!bytes) {
  if (!missing) missing = name;
  continue;
}
if (imageIsShowable(bytes)) return name;
```

The library card uses the same sentence as the album grid:

```jsx
if (failed) {
  return (
    <span className="picture-failed">This picture cannot be shown.</span>
  );
}
return <img src={src} alt="" onError={() => setFailed(true)} />;
```

## Tests Added or Updated

- `tests/integration/library-storage.test.js` — `uses a readable picture as the public album cover` pins down the cover URL, the unchanged count of two pictures, and a 200 image response for the readable public picture.
- `tests/layout/library-layout.test.js` — `says the cover cannot be shown when its image fails` pins down the sentence on the library card.

## Local Verification

- Commands run: `node --test --test-name-pattern "uses a readable picture as the public album cover|says the cover cannot be shown" tests/integration/library-storage.test.js tests/layout/library-layout.test.js` → 2 passed.
- Commands run: `npm test` → 65 passed, 0 failed.

## Deviations from Assessment

- `src/server/server.js` changed. `listAlbums` cannot see the image files unless the request passes the data directory. That is the path the library card uses.
- `src/client/styles.css` was not changed. `.picture-failed` already uses the picture square.
- A stored name whose file is missing still remains the cover. Existing albums seeded without files keep their cover URL. Only a file that exists and fails `imageIsShowable` is skipped.
- Named-album covers still use the first membership. This fix covers date albums, which is the public album in the local library.

## Follow-ups

- The two marker files remain inside the public album and still say they cannot be shown.
- A published named album can still use an unshowable first picture as its cover.
