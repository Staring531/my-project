# Bug Assessment: Register shows a read-only database error

- **Slug**: register-crash
- **Created**: 2026-10-16
- **Source**: pasted text
- **Verdict**: likely valid, needs reproduction
- **Severity**: high

## Report (verbatim or summarized)

> When the user regiter newe user, the page show attempt to write a readonly database. when request http://localhost:5173/api/accounts with {"name":"eee","secret":"eee"}, the response {"error":"attempt to write a readonly database"}

URL: `http://localhost:5173/api/accounts`

Host: `localhost`

Fetch policy: `auto-refused: loopback`. The URL was not requested.

## Symptom

Creating an account returns `{"error":"attempt to write a readonly database"}` and the page shows that sentence. The person should get an account and then see the sign-in form. The name `eee` and a non-empty secret are a valid create-account request, so this is not the empty-field or duplicate-name response.

## Reproduction

1. Open the organizer at the Vite origin while signed out.
2. Send `POST /api/accounts` with `{"name":"eee","secret":"eee"}`, or submit **Create account** with those values.
3. The response body is `{"error":"attempt to write a readonly database"}` and no account is created.

A write through `openDatabase("data")` and `createAccount` succeeded during this assessment against the workspace `data/library.sqlite`. That file is mode `-rw-r--r--`, the `data/` directory is writable, `PRAGMA query_only` is 0, and the probe row was deleted. The reported refusal was not present on that file in this process.

[NEEDS CLARIFICATION: which process served port 5173, and which `DATA_DIR` it had open, when the response was captured.]

## Suspected Code Paths

- `src/server/accounts.js:57` — `createAccount` inserts into `people`. A SQLite write error other than a duplicate name is rethrown at line 65.
- `src/server/server.js:133` — `POST /api/accounts` calls `createAccount` on the process database.
- `src/server/server.js:280` — an exception becomes HTTP 500 `{ "error": <Error.message> }`. SQLite's message is `attempt to write a readonly database`, which matches the reported body.
- `src/client/api.js:49` — `createAccount` throws `Error` with `body.error`.
- `src/client/main.js:111` — the create-account form stores that message. `src/client/session-view.js:16` renders `accountError` on the page.
- `src/server/db.js:82` — `openDatabase` uses `new DatabaseSync(path)` with no `readOnly: true`. Nothing in `src/` sets `query_only`. The process still listens if a later write is refused.

## Root Cause Hypothesis

The reported JSON is the raw SQLite error copied onto the account form, not a client-side string. Confidence: high for that display path, medium for why the database the running server had open was read-only.

`POST /api/accounts` is the first write a new person triggers. Album listing only reads, so the organizer can open when `library.sqlite` cannot be updated. `createAccount` does not turn this storage failure into `400` or `409`. The current workspace file accepts writes, so the refusal depends on the file, directory, or process that answered `localhost:5173`. The same refusal would block sign-in, publication, and adding a photo, because those paths write through the same connection.

`.specify/bugs/register-crash/fix.md` describes a startup writability check in `src/server/db.js`. That check is not in the current `db.js`, and no test in `tests/` mentions a read-only database. The running server can still accept the request and return the SQLite sentence.

## Proposed Remediation

**Preferred**: In `openDatabase`, open `library.sqlite` for writing and fail startup when the database file or its directory cannot be written. Name the database path in that error. Do not report success and do not insert a person. Leave `createAccount` validation (`400` / `409`) unchanged so a storage failure is not described as a bad name or a duplicate.

**Alternatives**:
- Catch this SQLite error only on `POST /api/accounts` and replace the form text. Sign-in and add-photo would still fail, and the server would stay up while every write is impossible.

**Files likely to change**:
- `src/server/db.js`
- `tests/integration/library-storage.test.js`

**Tests to add or update**:
- A server pointed at a `library.sqlite` the process cannot write does not start, does not insert a person, and the failure names the database path rather than only `attempt to write a readonly database`.
- Existing empty-name, duplicate-name, and successful-create assertions stay as they are.

## Risks & Considerations

- Do not change the mode of the user's existing `data/library.sqlite` as part of the fix. A read-only file can be intentional.
- Failing at startup is louder than a 500 on the form. The server must not stay up for reads while account writes are impossible.
- The same connection is used for sessions and photos. A fix that only changes the account form leaves those writes broken.
- A file that becomes read-only after the process has opened it can still fail until the process opens the database again.

## Open Questions

- [NEEDS CLARIFICATION: which `DATA_DIR` the server on port 5173 was using.]
- [NEEDS CLARIFICATION: whether that process's `library.sqlite` or its directory was read-only when the response was captured. The workspace copy is writable now.]
- [NEEDS CLARIFICATION: whether sign-in or adding a photo returned the same message.]
