# Bug Assessment: Unsupported file notice

- **Slug**: unsupported-file-notice
- **Created**: 2026-10-15
- **Source**: pasted text
- **Verdict**: invalid
- **Severity**: low

## Report (verbatim or summarized)

> No notification is provided when a user submits a file type that is not supported (e.g., .zip, .dmg, etc.)

No URL was supplied.

## Symptom

The report says that choosing an unsupported file, such as a `.zip` or `.dmg`, produces no notification. The library is specified to skip files that cannot be shown as photos and to tell the person how many items were skipped. The current screen does that with a status line, `1 item was skipped.` or `N items were skipped.`

## Reproduction

1. Open the organizer and choose **Add photos**.
2. Select a `.zip` or `.dmg` file. The file input accepts any file type.
3. The client posts the raw bytes to `POST /api/photos`.
4. Those signatures are not JPEG, PNG, GIF, or WebP, so the server responds `422` with `{ "status": "skipped", "reason": "unsupported-type" }`.
5. The library screen then shows `1 item was skipped.`

The reported absence of a notification does not match this path. Whether a particular session failed to show that line is [NEEDS CLARIFICATION: the report does not include the build, the exact files, or a screenshot].

## Suspected Code Paths

- `src/client/index.html:13` — the add control is a file input with no type filter, so `.zip` and `.dmg` can be chosen.
- `src/server/files.js:11` — `detectMediaType` accepts only JPEG, PNG, GIF, and WebP signatures. Zip and disk-image bytes return null.
- `src/server/library.js:94` — a null media type returns `{ status: "skipped", reason: "unsupported-type" }` and does not store a row or file.
- `src/server/server.js:118` — any result that is not `added` or `duplicate`, including `skipped`, is sent as HTTP 422 with that body.
- `src/client/api.js:25` — `summarizeBatch` counts a 422 `skipped` body toward `summary.skipped`.
- `src/client/library-view.js:58` — `renderSkipMessage` turns a non-zero skip count into a `role="status"` paragraph.
- `src/client/main.js:52` — after the batch, that paragraph is placed above the library.

## Root Cause Hypothesis

There is no missing notification on this path. Confidence: high. A `.zip` or `.dmg` fails the signature check, the API marks it skipped, and the library view states how many items were skipped. The message does not name the extension or the words "unsupported type"; it states the skip count required by the feature specification. That wording is expected behavior, not a silent failure.

## Proposed Remediation

**Preferred**: Do not change the code. The skip status is the notification for an unsupported file.

**Alternatives** (optional):
- If the desired copy is the file name and the words "not supported", that is a wording change beyond the current specification. It would touch `renderSkipMessage` and the batch summary, and it would need a specification change before it is treated as a defect.

**Files likely to change**:
- None for the preferred outcome.

**Tests to add or update**:
- None. `tests/unit/library.test.js`, `tests/contract/library-api.test.js`, `tests/unit/batch.test.js`, and `tests/unit/library-view.test.js` already cover an unsupported body, the 422 `skipped` response, the skip count, and the status text.

## Risks & Considerations

- Treating this report as a defect and renaming the message would change copy that the specification and tests already lock to a skip count.
- Zip and disk-image bytes are not special-cased. They use the same unsupported-signature path as any other non-photo.

## Open Questions

- [NEEDS CLARIFICATION: did the reporter see no message at all, or a skip count that did not name `.zip` or `.dmg`?]
