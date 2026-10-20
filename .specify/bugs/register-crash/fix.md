# Bug Fix: Register shows a read-only database error

- **Slug**: register-crash
- **Fixed**: 2026-10-16
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The library process now stops while opening `library.sqlite` when that file or its directory cannot be written, and the error names the database path. Creating an account is not reported as a success in that case, and no person row is inserted.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/server/db.js` | modified | Checks that the directory and an existing database file are writable, then takes a write lock before applying the schema. A failure names the database path. |
| `tests/integration/library-storage.test.js` | added test | A read-only `library.sqlite` does not start the server and does not insert a person. |

## Diff Highlights (optional)

```javascript
if (existsSync(databasePath)) {
  try {
    accessSync(databasePath, constants.W_OK);
  } catch {
    refuseUnwritable(databasePath, "the database file is not writable.");
  }
}
```

## Tests Added or Updated

- `tests/integration/library-storage.test.js` — "does not create an account when the library database is not writable" pins down that startup fails with the database path in the message, the message is not only `attempt to write a readonly database`, and `people` stays empty.

## Local Verification

- Commands run: `npm test` → 30 passed, 0 failed. `npx biome check` on the edited files → clean after format.
- Manual checks: none. The workspace `data/library.sqlite` was left unchanged.

## Deviations from Assessment

None. `createAccount` still throws on a storage failure instead of returning `400` or `409`. A read-only file is refused in `openDatabase`, so the process never listens and `POST /api/accounts` cannot return `201`.

## Follow-ups

- Restart the library process after this change. If `library.sqlite` is still not writable, the process exits with the database path instead of showing the SQLite sentence on the account form.
- A file that becomes read-only after this process has already opened it can still fail until the database is opened again. The check runs when the database is opened.
- The assessment still does not know which `DATA_DIR` the process on port 5173 was using when the response was captured.
