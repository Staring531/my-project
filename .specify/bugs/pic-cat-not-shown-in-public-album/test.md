# Bug Verification: Pictures in the public album do not display

- **Slug**: pic-cat-not-shown-in-public-album
- **Tested**: 2026-10-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The public album cover is now a picture that paints, and the two marker files inside that album still say `This picture cannot be shown.` The new tests and the linter passed. One full suite run timed out on two unrelated page loads; those two tests passed when run again.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Start the current server on the local library and open it in Chromium, signed out | pass | Cover is `/images/27e0b294-150a-44cb-9ea2-26813c498cc6.jpg` and paints at 1216 pixels wide. The album still lists 6 pictures. Two say the failure sentence. Four paint. |
| New / updated tests | `npm test` entries `uses a readable picture as the public album cover` and `says the cover cannot be shown when its image fails` | pass | Both passed inside the full suite |
| Regression suite | `npm test` | fail | 63 passed, 2 failed. Both failures were 30s timeouts waiting for a page heading, not cover assertions |
| Regression rerun | `node --test --test-name-pattern "does not scroll sideways at 375\|explains how to add photos" tests/layout/geometry-layout.test.js tests/layout/library-layout.test.js` | pass | Both timed-out tests passed in under 1s |
| Lint / type-check | `npx biome check` on the six files changed by the fix | pass | No fixes applied |

## Output Excerpts

Live public album:

```
{"photoCount":6,"cover":"/images/27e0b294-150a-44cb-9ea2-26813c498cc6.jpg","listed":6,"coverStatus":200,"coverType":"image/jpeg"}
{"coverInfo":{"src":"/images/27e0b294-150a-44cb-9ea2-26813c498cc6.jpg","width":1216},"failed":2,"images":[1216,1408,1,2],"cards":6}
```

First full suite:

```
✔ uses a readable picture as the public album cover
✔ says the cover cannot be shown when its image fails
✖ does not scroll sideways at 375 pixels
  locator.waitFor: Timeout 30000ms exceeded.
✖ explains how to add photos when the signed-in library is empty
  locator.waitFor: Timeout 30000ms exceeded.
ℹ pass 63
ℹ fail 2
```

Rerun of the two timeouts:

```
✔ does not scroll sideways at 375 pixels
✔ explains how to add photos when the signed-in library is empty
ℹ pass 2
ℹ fail 0
```

## Residual Risks

- The two marker files remain in the public album. They are explained, not removed.
- A published named album can still use an unshowable first picture as its cover.
- The first full layout run waited 30s twice for a page that loaded immediately on the next run. That looks like contention between preview servers, not a cover regression.

## Recommendation

Close the bug. The signed-out public album now uses a readable cover, the unshowable pictures inside it are explained, and the two suite timeouts did not reproduce.
