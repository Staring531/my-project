# Bug Verification: Registration still returns a read-only database error

- **Slug**: register-remain-crash-after-bug-fix
- **Tested**: 2026-10-16
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

`POST /api/accounts` with `{"name":"ttt","secret":"ttt"}` through `http://localhost:5173` no longer returns `{"error":"attempt to write a readonly database"}`. The account already exists, so the response is the duplicate-name error. The post-startup regression test, the full suite, and Biome passed.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | `POST http://[::1]:5173/api/accounts` with `{"name":"ttt","secret":"ttt"}` | pass | HTTP 409 `{"error":"An account with that name already exists."}`. The body is not the SQLite sentence. |
| New / updated tests | `node --test --test-name-pattern "names the database path when a write is refused after startup"` | pass | That storage test passed. |
| Regression suite | `npm test` | pass | 31 passed, 0 failed. |
| Lint / type-check | `npx biome check src tests` | pass | No issues. |

## Output Excerpts

```text
{"error":"An account with that name already exists."}
HTTP_STATUS 409
```

```text
✔ names the database path when a write is refused after startup
ℹ tests 31
ℹ pass 31
ℹ fail 0
Checked 26 files in 20ms. No fixes applied.
```

## Residual Risks

- `127.0.0.1:5173` is not listening. `http://localhost:5173` on this machine uses `[::1]:5173`, which is the address that returned 409.
- The organizer process had stopped before this check. It was started again, then the request was sent. A process left over from before the fix is not what answered.
- The page form was not submitted in the browser during this check. The response body is the same JSON the page displays.

## Recommendation

Close the bug. Register again at `http://localhost:5173/`. A new name should create an account. `ttt` already exists, so that name correctly reports that the account is already there.
