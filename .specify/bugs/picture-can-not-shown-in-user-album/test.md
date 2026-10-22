# Bug Verification: Pictures in an album do not display

- **Slug**: picture-can-not-shown-in-user-album
- **Tested**: 2026-10-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The hypothesized failure no longer leaves a blank card. A new JPEG that is only `FF D8 FF D9` is skipped, and the local public album's two marker-only files now say `This picture cannot be shown.` while the four readable pictures still paint. The full suite and the linter passed.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Open `http://127.0.0.1:3000/#/albums/unowned:2026-10-15:1` in Chromium | pass | 6 cards. Two say the failure sentence. Four images paint. Enlarging a failed card shows the sentence again. Enlarging a readable picture uses `object-fit: contain`. |
| New / updated tests | `node --test --test-name-pattern "skips an empty jpeg\|says a listed picture" tests/integration/library-storage.test.js tests/layout/album-layout.test.js` | pass | 2 passed, 0 failed |
| Regression suite | `npm test` | pass | 63 passed, 0 failed |
| Lint / type-check | `npx biome check` on the seven files changed by the fix | pass | No fixes applied |

## Output Excerpts

Targeted tests:

```
✔ skips an empty jpeg and lists pictures that can be shown
✔ says a listed picture cannot be shown when its image fails
ℹ pass 2
ℹ fail 0
```

Local album after the fix:

```
{ "failed": 2, "images": 4, "cards": 6 }
{ "before": 2, "during": 3, "enlargedSrc": "/images/27e0b294-150a-44cb-9ea2-26813c498cc6.jpg", "fit": "contain" }
```

Regression suite:

```
ℹ tests 63
ℹ pass 63
ℹ fail 0
```

## Residual Risks

- The original report did not name the album or the session. This check used the only public album in the local library, `unowned:2026-10-15:1`. The three named albums still have no pictures.
- The two marker-only files (`day.jpg`, `later.jpg`) stay in that album. They are not deleted; the card tells the person they cannot be shown.
- The server accepts a file with a valid frame and corrupt scan data. The card covers that case only when the browser fires an image error.
- Phone formats such as HEIC are still skipped before they are stored. That path was not part of this check.

## Recommendation

Close the bug. The empty-upload path and the album display path both hold on the local library, and the regression suite is clean.
