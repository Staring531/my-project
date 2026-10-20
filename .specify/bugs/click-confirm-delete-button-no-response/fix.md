# Bug Fix: Confirm delete does nothing

- **Slug**: click-confirm-delete-button-no-response
- **Fixed**: 2026-10-19
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

A rejected delete now puts the confirm step back and shows the server message. The library API was restarted from the current server, which implements `DELETE /api/photos/{photoId}`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/client/photo-app.js` | modified | Confirm delete catches a failed request, restores the confirm step, and paints an error alert. |
| `tests/unit/photo-app.test.js` | added test | Pins the picture, confirm control, and server message after a rejected delete. |

## Diff Highlights (optional)

```javascript
try {
  await deletePhoto(photoId);
} catch (error) {
  const failure = failedDeletion(photoId, error);
  confirmingId = failure.confirmingId;
  deleteError = failure.deleteError;
  paintAlbum();
  return;
}
```

## Tests Added or Updated

- `tests/unit/photo-app.test.js` — a rejected delete keeps the picture, keeps **Confirm delete**, and shows the server error.
- `tests/contract/library-api.test.js` — existing delete contract, run against a server started from the current code.

## Local Verification

- Commands run: `node --test tests/unit/photo-app.test.js tests/contract/library-api.test.js` → 12 passed.
- Manual checks: restarted the library dev process. `DELETE /api/photos/does-not-exist` on port 3000 now returns `No photo exists for that id.` The owned picture is still in the database and on disk. In the browser, a rejected confirm shows that alert, leaves the picture and **Confirm delete** in place, and **Cancel** clears the alert.

## Deviations from Assessment

The dev runner stops Vite when the API process exits, so the restart replaced both the API on port 3000 and Vite on port 5173. The page is still `http://localhost:5173/`.

The test file was not in the assessment's file list. The assessment asked for that client test, so it was added.

## Follow-ups

- None.
