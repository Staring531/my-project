# Bug Assessment: Registration still returns a read-only database error

- **Slug**: register-remain-crash-after-bug-fix
- **Created**: 2026-10-16
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> When registering a user on the page, the application returns the error: "attempt to write a readonly database." Debugging via F5 reveals that when a request is sent to `http://localhost:5173/api/accounts` with the parameters `{name: "ttt", secret: "ttt"}`, the response is `{"error":"attempt to write a readonly database"}`. Although a bug fix for this issue has been submitted, the problem persists, preventing user registration.

URL: `http://localhost:5173/api/accounts`

Host: `localhost`

Fetch policy: `auto-refused: loopback`. The URL was not requested.

## Symptom

Creating an account from the page still returns `{"error":"attempt to write a readonly database"}` for `{"name":"ttt","secret":"ttt"}`. That name and secret are valid. The person should get an account and then see the sign-in form. The startup check added for `register-crash` did not stop this response.

## Reproduction

1. Open `http://localhost:5173/` and submit **Create account**, or send `POST /api/accounts` with `{"name":"ttt","secret":"ttt"}`.
2. The response body is `{"error":"attempt to write a readonly database"}`.

The page on `[::1]:5173` is a Vite process started at 13:49. Its proxy target is `127.0.0.1:3010` (`vite.config.js` uses `PORT`). The library process on port 3010 was also started at 13:49 with `DATA_DIR=tmp/browser-auth`. `src/server/db.js` was written at 14:29, so that process never loaded the startup check. `tmp/browser-auth` is no longer a directory, while that process still has `tmp/browser-auth/library.sqlite` open. SQLite then refuses the insert with this exact sentence.

A separate Vite process from Oct 15 is bound to `127.0.0.1:5173` and proxies to port 3000. That library process also started Oct 15, before `accounts.js` and the startup check were saved.

## Suspected Code Paths

- `vite.config.js:10` — `/api/` is proxied to `127.0.0.1:$PORT`. The Vite process on `[::1]:5173` was started with `PORT=3010`.
- `src/server/accounts.js:57` — `createAccount` inserts into `people`. A SQLite write error other than a duplicate name is rethrown at line 65.
- `src/server/server.js:280` — that exception becomes HTTP 500 `{ "error": <Error.message> }`, which is the reported body.
- `src/client/main.js:111` — the create-account form shows `error.message`.
- `src/server/db.js:85` — the writability check runs only when `openDatabase` is called. The process on port 3010 started before this function existed and does not call it again.

## Root Cause Hypothesis

The reported JSON is still SQLite's write refusal, copied onto the account form by a library process that is already listening. Confidence: high.

The startup check cannot run until that process opens the database again. Its `DATA_DIR` directory has been removed since the open, so a later insert cannot create its journal and SQLite reports `attempt to write a readonly database`. The workspace `data/library.sqlite` is not the file that process has open. A writable temporary library created after the check returns `201` for this same request; the page is not using that process.

## Proposed Remediation

**Preferred**: Stop the library and Vite processes that are still listening from before `db.js` was saved, including the one whose `DATA_DIR` is `tmp/browser-auth`. Start one library process and one Vite process so both `127.0.0.1:5173` and `[::1]:5173` reach a server that opens a writable directory. In the request path, when a write fails because the open database can no longer be written, do not return only `attempt to write a readonly database`. Name the database path, create no person, and leave the `400` and `409` account responses unchanged.

**Alternatives**:
- Restart the processes and change nothing else. Registration works again, but any later removal of the open database file still puts the SQLite sentence on the form.

**Files likely to change**:
- `src/server/server.js`
- `src/server/accounts.js`
- `tests/integration/library-storage.test.js`

**Tests to add or update**:
- After the server is listening, making its database unwritable and posting `{"name":"ttt","secret":"ttt"}` does not insert a person. The response names the database path and is not only `attempt to write a readonly database`.
- A writable library still returns `201` for a new account. Empty-name and duplicate-name assertions stay as they are.

## Risks & Considerations

- Do not change the mode of `data/library.sqlite`, and do not delete that file to reproduce this.
- Stopping the stale processes drops their in-memory connections. Accounts created only in the removed `tmp/browser-auth` database are not in `data/library.sqlite`.
- Two listeners on port 5173, one IPv4 and one IPv6, send the browser to different library processes. A restart that replaces only one of them leaves the other in place.

## Open Questions

- None. The serving process, its start time, its `DATA_DIR`, and the missing directory were read from the local process table.
