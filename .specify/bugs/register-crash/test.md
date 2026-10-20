# Bug Verification: Register shows a read-only database error

- **Slug**: register-crash
- **Tested**: 2026-10-16
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

A read-only `library.sqlite` no longer starts the library process, and the error names that database path instead of returning `{"error":"attempt to write a readonly database"}`. The same account request against a writable temporary library returns `201` and stores the person. The full suite and Biome stayed clean.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Start the server on a mode `444` `library.sqlite`, then `POST /api/accounts` with `{"name":"eee","secret":"eee"}` against a writable temporary library | pass | Read-only startup throws and names the database path. The writable request returned `201` with person `eee`. |
| New / updated tests | `node --test --test-name-pattern "does not create an account when the library database is not writable"` | pass | That storage test passed. |
| Regression suite | `npm test` | pass | 30 passed, 0 failed. |
| Lint / type-check | `npx biome check src tests` | pass | No issues. |

## Output Excerpts

```text
READONLY_START Could not open the library database at .../library.sqlite: the database file is not writable.
WRITABLE_STATUS 201
WRITABLE_BODY {"person":{"id":"...","name":"eee"}}
WRITABLE_PEOPLE 1
```

```text
✔ does not create an account when the library database is not writable
ℹ tests 30
ℹ pass 30
ℹ fail 0
Checked 26 files in 10ms. No fixes applied.
```

## Residual Risks

- The organizer already listening on port 5173 was not restarted, and the account form in that browser session was not opened. A process that opened the database before this fix can still return the SQLite sentence until it starts again.
- The workspace `data/library.sqlite` was not the database under test, and its mode was not changed. Both checks used temporary directories that were removed afterward.
- A database that becomes read-only after the process has opened it is still outside this check.

## Recommendation

Close the bug for the fixed process. Restart the library process before trying **Create account** again. If that restarted process still returns `attempt to write a readonly database`, rerun `$speckit-bug-assess` with the `DATA_DIR` it was using.
