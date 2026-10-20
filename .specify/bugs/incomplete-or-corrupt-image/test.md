# Bug Verification: Incomplete or corrupt image

- **Slug**: incomplete-or-corrupt-image
- **Tested**: 2026-10-15
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

A new JPEG that is only `FF D8 FF` is no longer stored. The page shows `1 item was skipped.`, and a displayable file in the same batch is still uploaded. The regression suite and lint both passed. Two photos stored before this fix still cannot be drawn.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Opened `http://localhost:5173/`, selected a JPEG of bytes `FF D8 FF`, then opened album `2026-10-15:1` | pass | Decode failed, no `POST /api/photos`, photo ids unchanged, notice `1 item was skipped.` |
| Same batch, other file | Selected `FF D8 FF` together with a 2×2 PNG | pass | Only `pixel-batch.png` was posted. Album count went from 5 to 6. Notice stayed `1 item was skipped.` |
| New / updated tests | `npm test` | pass | 20 passed, including `does not post a file the decoder cannot display` |
| Regression suite | `npm test` | pass | Contract and storage tests that store a signature-only body still pass |
| Lint / type-check | `npx biome check .` | pass | 23 files, no fixes applied |

## Output Excerpts

```text
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

```text
Checked 23 files in 20ms. No fixes applied.
```

Browser, truncated file alone:

```text
decodeError: InvalidStateError: The source image could not be decoded.
notice: 1 item was skipped.
posts: []
photo ids: unchanged (5)
```

Browser, truncated file plus a real PNG:

```text
notice: 1 item was skipped.
posts: ["pixel-batch.png"]
beforeCount: 5
afterCount: 6
```

## Residual Risks

- Two photos already in album `2026-10-15:1` (`5788c0be-1d6e-4963-8d6e-8c9ae5ffa3c5.jpg` and `95d9c5b8-b781-4b2b-a941-6a12e5661d42.jpg`) still load with `naturalWidth` 0. This fix does not remove files stored before the decode check.
- A direct `POST /api/photos` of truncated bytes was not sent to the running library, because that would store another undisplayable photo. The server tests still expect a signature-only body to be stored.
- A decoder can reject a rare file that an album image could still draw.

## Recommendation

Close the bug. New uploads of a file the browser cannot decode are skipped and announced, and the rest of the batch still uploads.
