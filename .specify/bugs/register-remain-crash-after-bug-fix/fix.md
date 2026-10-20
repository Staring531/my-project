# Bug Fix: Registration still returns a read-only database error

- **Slug**: register-remain-crash-after-bug-fix
- **Fixed**: 2026-10-16
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

A write that fails after the library process is already listening no longer returns only `attempt to write a readonly database`. The response names the database path and does not insert a person. The stale library and Vite processes were stopped, and one new pair was started against the writable `data` directory.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/server/server.js` | modified | A read-only SQLite write is reported with the `library.sqlite` path. Account `400` and `409` responses are unchanged. |
| `tests/integration/library-storage.test.js` | added test | After startup, a directory that cannot be written refuses `POST /api/accounts` for `ttt` and inserts no person. |

## Diff Highlights (optional)

```javascript
if (!message.includes("readonly database")) return message;
const databasePath = path.join(dataDir, "library.sqlite");
return `Could not write the library database at ${databasePath}: ${message}`;
```

## Tests Added or Updated

- `tests/integration/library-storage.test.js` — "names the database path when a write is refused after startup" posts `{"name":"ttt","secret":"ttt"}` after the database directory is made unwritable, requires the database path in the error, rejects a body that is only `attempt to write a readonly database`, and checks that `ttt` was not inserted.

## Local Verification

- Commands run: `npm test` → 31 passed, 0 failed. `npx biome check` on the edited files → clean.
- Manual checks: stopped the pre-fix listeners, then started one library process on port 3000 and one Vite process. `POST http://[::1]:5173/api/accounts` with `{"name":"ttt","secret":"ttt"}` returned `201`. The page then showed `An account with that name already exists.` and did not show the SQLite sentence. `data/library.sqlite` was not chmodded or deleted. The account `ttt` is now in that file.

## Deviations from Assessment

- `src/server/accounts.js` was not changed. The insert already throws before a person row is committed, and the `400` and `409` results never reach the new error text. The path is added in `src/server/server.js`, which has the data directory.
- The new Vite process listens on `[::1]:5173` only. `127.0.0.1:5173` is not bound. `http://localhost:5173` on this machine uses the IPv6 listener, which is the address that was returning the SQLite error.

## Follow-ups

- Use `http://localhost:5173/`. A request sent straight to `127.0.0.1:5173` does not reach this Vite process.
- Account `ttt` was created in `data/library.sqlite` while checking the page.
