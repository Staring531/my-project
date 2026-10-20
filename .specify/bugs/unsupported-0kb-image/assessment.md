# Bug Assessment: 0KB image upload

- **Slug**: unsupported-0kb-image
- **Created**: 2026-10-15
- **Source**: pasted text
- **Verdict**: invalid
- **Severity**: low

## Report (verbatim or summarized)

> User uploaded a 0KB image

No URL was supplied. The report does not say what went wrong after the upload.

## Symptom

A person can choose a file whose size is 0KB. The library is specified to skip an item that cannot be shown as a photo and to say how many items were skipped. An empty body is that case: it is not stored, and the screen shows `1 item was skipped.`

## Reproduction

1. Open the organizer and choose **Add photos**.
2. Select a file that is 0 bytes, including one named like an image.
3. The client posts that empty body to `POST /api/photos`.
4. The server responds `422` with `{ "status": "skipped", "reason": "unreadable" }`.
5. No photo row and no image file are created.
6. The library screen shows `1 item was skipped.`

What the reporter saw instead is [NEEDS CLARIFICATION: the report only states that a 0KB image was uploaded].

## Suspected Code Paths

- `src/client/index.html:13` — the file input can select a 0-byte file. There is no size check in the browser.
- `src/server/library.js:91` — `addPhoto` returns `{ status: "skipped", reason: "unreadable" }` when the body is missing or has length 0, before any signature or date rule runs.
- `src/server/server.js:118` — a `skipped` result is sent as HTTP 422 with that body.
- `src/client/api.js:25` — `summarizeBatch` counts that 422 toward `summary.skipped`.
- `src/client/library-view.js:58` — `renderSkipMessage` renders `1 item was skipped.` when the count is 1.
- `src/client/main.js:52` — that status line is shown above the library after the batch.

## Root Cause Hypothesis

Uploading a 0KB file is handled on purpose. Confidence: high. An empty body cannot be shown as a photo, so it is skipped as unreadable and counted in the skip notice. The report does not describe a crash, a stored broken image, or a missing message. That path matches the feature specification and the library API contract.

## Proposed Remediation

**Preferred**: Do not change the code. A 0KB upload stays a skipped, unreadable item, with the existing skip count on screen.

**Alternatives** (optional):
- If the desired result is to accept a 0-byte file as a photo, that conflicts with the rule that an item which cannot be shown is skipped. It would need a specification change, not a defect fix.

**Files likely to change**:
- None for the preferred outcome.

**Tests to add or update**:
- None. `tests/unit/library.test.js` expects an empty buffer to return `skipped` / `unreadable`. `tests/contract/library-api.test.js` expects HTTP 422 and reason `unreadable` for `empty.jpg`. `tests/unit/batch.test.js` counts a 422 `unreadable` body as a skip.

## Risks & Considerations

- Storing a 0-byte file would put a photo in an album whose image cannot be displayed.
- The skip copy does not say "0KB" or "empty file". It states the skip count, which is what the specification requires.

## Open Questions

- [NEEDS CLARIFICATION: was the 0KB file stored, did the upload fail with an error, or was the objection that the skip line does not mention the file size?]
