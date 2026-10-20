# Bug Assessment: Confirm delete does nothing

- **Slug**: click-confirm-delete-button-no-response
- **Created**: 2026-10-19
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> When click Confirm delete', no response

The signed-in library at `http://localhost:5173/#/albums/65b46269-3061-466f-b4a8-66aa25927fce%3A2026-10-16%3A1` already showed **Confirm delete** and **Cancel** for photo `8c0b70ff-151a-4016-b153-663e58f0705a`.

## Symptom

Choosing **Confirm delete** leaves that control on the picture and does not remove the picture. The page should send the delete request and then show the album the API returns, with that picture gone.

## Reproduction

1. Open the running library at `http://localhost:5173/` (API process on `127.0.0.1:3000`, started Fri Oct 16 14:50:01 2026).
2. Sign in as an owner and open a date album that contains one of that person's pictures.
3. Choose **Delete**, then **Confirm delete**.
4. The confirm and cancel controls stay, and the picture stays.

A direct `DELETE /api/photos/8c0b70ff-151a-4016-b153-663e58f0705a` against that process, with the owner's session cookie, returned `404` and `{"error":"No route exists for that request."}`. The row and image file were still present afterward.

The same request against a server started from the current `src/server/server.js` is handled by the photo route. For an id that is already gone it returns `404` with `{"error":"No photo exists for that id."}`. Calling `deletePhoto` from the current library module on a copy of the database returns `deleted` and removes the row.

## Suspected Code Paths

- `src/client/photo-app.js:280` — the confirm click sets `confirmingId` to null, awaits `deletePhoto`, then awaits `showCurrent`. There is no `catch`, so a rejected request never repaints the album and never writes an error.
- `src/client/api.js:91` — `deletePhoto` sends `DELETE /api/photos/{photoId}`. `requestJson` throws `Error` when the body contains `error`.
- `src/client/album-view.js:15` — **Confirm delete** is `data-confirm-delete` on the owner's picture. The markup matches the click selector.
- `src/server/server.js:312` — the current handler deletes on `DELETE /api/photos/{photoId}` and otherwise answers `No route exists for that request.`
- `src/server/library.js:482` — `deletePhoto` removes an owned picture and its file. This function succeeds on a copy of `data/library.sqlite`.

## Root Cause Hypothesis

The click reaches the confirm handler. The API process that has been listening on port 3000 since 2026-10-16 does not implement `DELETE /api/photos/{photoId}`, so it responds `404` with `No route exists for that request.` The client turns that body into a thrown error. The confirm branch does not catch it, so the album stays on the confirm step and no alert is shown. Confidence: high.

The delete implementation in the current source is not the failing part. A process started from that source recognizes the route, and the library function deletes the picture.

## Proposed Remediation

**Preferred**: Restart the API from the current `src/server/server.js` so confirm delete hits the photo route. In the confirm branch of `src/client/photo-app.js`, catch a failed delete, put the confirm step back for that picture, and show the server message with the existing error alert. A rejected delete must not look like an ignored click.

**Alternatives**:
- Restart only. The success path starts deleting, but any later `401`, `403`, `404`, or `500` still leaves the confirm controls unchanged.
- Show the error only. Until the process on port 3000 is replaced, the alert would be `No route exists for that request.` and the picture would still remain.

**Files likely to change**:
- `src/client/photo-app.js`

**Tests to add or update**:
- A client test that a rejected `DELETE /api/photos/{photoId}` keeps the picture and shows the server error after **Confirm delete**.
- The existing contract for `DELETE /api/photos/{photoId}` already expects `204` from the current handler. Run it against a newly started server, not the process that has been up since 2026-10-16.

## Risks & Considerations

- Restarting the API drops in-memory sessions only if sessions are stored in memory. Sessions for this app are in the database, so a restart should keep the signed-in person.
- Do not delete the owner's picture while proving the fix. The picture `8c0b70ff-151a-4016-b153-663e58f0705a` (`bbbbbbbbb.jpeg`) is still in `data/library.sqlite`.
- The confirm handler currently clears `confirmingId` before the request finishes. A failed request must not depend on a repaint that never runs.

## Open Questions

- None. The page that showed the stuck **Confirm delete** control was `http://localhost:5173/`, proxied to the API process started on 2026-10-16.
