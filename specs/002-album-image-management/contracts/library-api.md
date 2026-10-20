# Contract: Library API

Local HTTP interface for album and image management. Version 2.1.0.

Version 2.0.0, defined in [../../001-photo-date-albums/contracts/library-api.md](../../001-photo-date-albums/contracts/library-api.md), still applies to account, session, date-album publication, photo publication, `POST /api/photos`, and date-album objects. This contract adds named albums, private albums, and picture deletion. A breaking change to a field or status below requires a version bump and a list of callers, per Principle III (Maintainability).

The caller that must show the new responses is `src/client`. A client that only reads the version 2.0.0 `albums` array still receives the same date albums.

Field meanings are defined in [data-model.md](../data-model.md). This contract does not restate the date rule or the visibility rule.

Base URL in development is the Vite origin. `/api` and `/images` are forwarded to the local server. The browser sends the session cookie on same-origin requests.

## Named album object

```json
{
  "id": "named:6f1c0b4e-8a0d-4f0e-9c1a-2b3d4e5f6071",
  "ownerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Holiday",
  "photoCount": 2,
  "public": false,
  "coverImageUrl": "/images/6f1c0b4e-8a0d-4f0e-9c1a-2b3d4e5f6071.jpg"
}
```

`coverImageUrl` is `null` when `photoCount` is 0. `photoCount` counts only pictures included for this caller.

## `GET /api/albums`

Version 2.0.0 `albums` is unchanged: date albums with at least one visible picture, in the existing library order.

Version 2.1.0 adds `namedAlbums`: every named album this caller can see, including an empty one, in named-album order.

**200**

```json
{
  "albums": [],
  "namedAlbums": []
}
```

A library with no visible date albums and no visible named albums is `200` with both arrays empty.

## `POST /api/albums`

Creates one named album for the signed-in person. JSON body: `{ "name": "Holiday" }`. The stored name is trimmed.

**201**

```json
{
  "album": {}
}
```

`album` is a named album object with `photoCount` 0, `public` false, and `coverImageUrl` null.

**401** when the caller is not signed in.

```json
{
  "error": "Sign in to create an album."
}
```

**400** when the trimmed name is empty or longer than 64 characters.

```json
{
  "error": "Enter an album name of 1 to 64 characters."
}
```

**409** when this person already has a named album with that trimmed name.

```json
{
  "error": "An album with that name already exists."
}
```

No album row is written for 400, 401, or 409.

## `GET /api/albums/{albumId}/photos`

Unchanged for a date album id. For a `named:` id, returns that named album and its pictures in `member_seq` order when this caller can see the album.

**200**

```json
{
  "album": {},
  "photos": []
}
```

`album` is a named album object. `photos` are photo objects from version 2.0.0. Each photo still reports its date-album `albumId`. An empty named album the caller can see returns `photos` equal to `[]`.

**404** when the named album does not exist or this caller cannot see it.

```json
{
  "error": "No album exists for that id."
}
```

The date-album 404 text stays `No album exists for that date.`

## `POST /api/albums/{albumId}/photos`

Places one picture the caller already owns into a named album they own. JSON body: `{ "photoId": "..." }`. This route does not accept a date-album id and does not store new image bytes.

**201** when the link is new.

```json
{
  "status": "added",
  "album": {}
}
```

**200** when that picture is already in the named album.

```json
{
  "status": "present",
  "album": {}
}
```

The count and cover are unchanged for `present`.

**401** when the caller is not signed in.

```json
{
  "error": "Sign in to add a picture to an album."
}
```

**403** when the caller does not own the named album, does not own the picture, or the picture has no owner.

```json
{
  "error": "Only the owner can add pictures to that album."
}
```

**404** when no such named album or picture exists.

```json
{
  "error": "No album exists for that id."
}
```

A missing picture uses `No photo exists for that id.` No membership row is written for 401, 403, or 404.

## `DELETE /api/albums/{albumId}/publication`

The signed-in owner makes that date album or named album private by removing its publication row.

**200** with `{ "album": {} }` and `public` false. Pictures are still in the album. The same 200 is returned when the album was already private.

**401** when the caller is not signed in.

```json
{
  "error": "Sign in to change an album."
}
```

**403** when the caller is not the owner. An `unowned:` album uses this response.

```json
{
  "error": "Only the owner can make that album private."
}
```

**404** when no such album exists. A date album uses `No album exists for that date.` A named album uses `No album exists for that id.`

`POST /api/albums/{albumId}/publication` is unchanged and is still how the owner marks an album public.

## `DELETE /api/photos/{photoId}`

Deletes one picture owned by the signed-in person. The page must confirm first; this route itself does not ask.

**204** with an empty body. The picture is gone from every date album and named album, and its image file is gone. A later `GET /images/{storedName}` for that file is 404.

**401** when the caller is not signed in.

```json
{
  "error": "Sign in to delete a picture."
}
```

**403** when the caller is not the owner, including a picture whose `ownerId` is null.

```json
{
  "error": "Only the owner can delete that picture."
}
```

**404** when no such picture exists.

```json
{
  "error": "No photo exists for that id."
}
```

No row and no file are removed for 401, 403, or 404.

## `POST /api/photos` duplicate

Unchanged status. When the bytes match a stored picture, including a picture stored on another calendar day, the response remains:

```json
{
  "status": "duplicate",
  "photo": {}
}
```

The existing picture's `albumDate` is unchanged. No second file is written. The `photo` object is omitted when this caller cannot see that picture. The client must tell the person the picture is already in the library. The file name is not compared.

## `GET /images/{storedName}`

Unchanged response. The file is returned when this caller can see the picture in a date album or in a named album. Otherwise the response stays 404 `That image is not available.`
