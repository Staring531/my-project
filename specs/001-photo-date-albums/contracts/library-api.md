# Contract: Library API

Local HTTP interface used by the vanilla JavaScript client. Version 2.0.0. A breaking change to a field or status below requires a version bump and a list of callers, per Principle III (Maintainability).

Version 2.0.0 replaces 1.0.0. Album ids include the owner, and adding a photo requires a signed-in person. The caller that must change is `src/client`.

Album and photo field meanings are defined in [data-model.md](../data-model.md). This contract does not restate the date rule or the visibility rule.

Base URL in development is the Vite origin. `/api` and `/images` are forwarded to the local server. Configuration is the data directory and the port, both injectable. The browser sends the session cookie on same-origin requests.

## Person object

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Ada"
}
```

The secret and the secret hash are never returned.

## Photo object

```json
{
  "id": "6f1c0b4e-8a0d-4f0e-9c1a-2b3d4e5f6071",
  "ownerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "public": false,
  "albumId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890:2026-10-15:0",
  "albumDate": "2026-10-15",
  "dateAssigned": false,
  "takenAt": "2026-10-15T09:30:00",
  "addedAt": "2026-10-15T01:02:03.000Z",
  "imageUrl": "/images/6f1c0b4e-8a0d-4f0e-9c1a-2b3d4e5f6071.jpg"
}
```

`takenAt` is `null` and `dateAssigned` is `true` when the date was assigned. `albumId` uses `:1` in that case. `ownerId` is `null` and `public` is `true` for a photo that was already stored before any account existed. Its `albumId` starts with `unowned:`.

`public` records the photo's own flag. A photo can appear in a response with `public` false when its album is public.

## Album object

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890:2026-10-15:0",
  "ownerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "albumDate": "2026-10-15",
  "year": 2026,
  "month": 10,
  "photoCount": 2,
  "dateAssigned": false,
  "public": false,
  "coverImageUrl": "/images/6f1c0b4e-8a0d-4f0e-9c1a-2b3d4e5f6071.jpg"
}
```

`photoCount` and `coverImageUrl` include only photos this caller can see.

## Error object

Used for unexpected failures and for refused account or publication actions. Skip and duplicate are not errors.

```json
{
  "error": "Could not store the photo."
}
```

The message must say what failed. The server does not hide the failure. The sign-in failure is the one exception: unknown names and wrong secrets use the same message.

## `POST /api/accounts`

Creates one account. JSON body: `{ "name": "Ada", "secret": "..." }`.

**201**

```json
{
  "person": {}
}
```

No session cookie is set.

**400** when the name or secret is empty, or the name is longer than 64 characters.

```json
{
  "error": "Enter an account name and a secret."
}
```

**409** when the name is already used.

```json
{
  "error": "An account with that name already exists."
}
```

## `POST /api/session`

Signs a person in. JSON body: `{ "name": "Ada", "secret": "..." }`.

**200** with a person object, and a `Set-Cookie` header for `session`. The cookie is HttpOnly, `SameSite=Lax`, and `Path=/`.

**401** when the name is unknown, the secret is wrong, or either field is empty.

```json
{
  "error": "Could not sign in."
}
```

No session is created.

## `GET /api/session`

**200** with `{ "person": {} }` when the cookie matches a session.

**401** when the caller is not signed in.

```json
{
  "error": "Sign in to continue."
}
```

## `DELETE /api/session`

**204** with an empty body. The session row is deleted and the cookie is cleared. The same response is used when the caller was already signed out.

## `GET /api/albums`

Returns every album that has at least one photo this caller can see, in library order. A signed-out caller receives public albums, public photos, and unowned photos only.

**200**

```json
{
  "albums": []
}
```

An empty visible library is `200` with `albums` equal to `[]`. It is not an error.

## `GET /api/albums/{albumId}/photos`

Returns one album and every photo in it that this caller can see, in album photo order.

**200**

```json
{
  "album": {},
  "photos": []
}
```

`album` is an album object. `photos` contains only photos whose `albumId` equals the path and that this caller can see.

**404**

```json
{
  "error": "No album exists for that date."
}
```

The same 404 is used when the album exists but this caller can see none of its photos.

## `POST /api/albums/{albumId}/publication`

The signed-in owner marks that album public.

**200** with `{ "album": {} }` and `public` true. The album then includes the photos that belong to it for every caller.

**401** when the caller is not signed in.

**403** when the caller is not the owner.

```json
{
  "error": "Only the owner can mark that album public."
}
```

**404** when no such album exists. An `unowned:` album returns 403, because it has no owner who can mark it.

## `POST /api/photos/{photoId}/publication`

The signed-in owner marks that photo public.

**200** with `{ "photo": {} }` and `public` true.

**401** when the caller is not signed in.

**403** when the caller is not the owner, including a photo whose `ownerId` is null.

```json
{
  "error": "Only the owner can mark that photo public."
}
```

**404** when no such photo exists.

## `POST /api/photos`

Stores one file for the signed-in person. The body is the raw file bytes. `Content-Type` is a hint. The signature of the bytes decides the stored type.

**401** when the caller is not signed in.

```json
{
  "error": "Sign in to add photos."
}
```

No row and no file are written.

**201** when a new photo is stored. It is owned by the signed-in person and is not public.

```json
{
  "status": "added",
  "photo": {}
}
```

**200** when the bytes match a stored photo.

```json
{
  "status": "duplicate",
  "photo": {}
}
```

The existing photo is unchanged, including its owner and public flag. The response includes the photo object only when this caller can see that photo. When the caller cannot see it, the body is `{ "status": "duplicate" }` with no photo object.

**422** when the bytes are empty or not a JPEG, PNG, GIF, or WebP.

```json
{
  "status": "skipped",
  "reason": "unsupported-type"
}
```

`reason` is `unsupported-type` or `unreadable`.

**4xx/5xx** with an error object when the file cannot be stored for any other reason. No photo row and no image file are left behind.

## `GET /images/{storedName}`

Returns the image bytes for one `stored_name` when this caller can see that photo. `Content-Type` is the stored media type.

**200** with the file body.

**404** with an error object when the name is unknown, is not a single file name, has no file on disk, or the caller cannot see the photo.

```json
{
  "error": "That image is not available."
}
```

## Batch behavior the client must present

The picker may supply many files. The client sends one POST per file and then shows:

- Skipped count equal to the number of `422` responses, when that count is greater than zero.
- An error message from any error object, without discarding photos already added.
- No increase in an album count for a `duplicate` response.

The person sees one outcome for the selection, as required by the feature specification. The client does not show an add control while signed out.
