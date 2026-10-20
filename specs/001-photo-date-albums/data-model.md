# Data Model: Photo Date Albums

Albums and date groups are not stored as membership. They are defined in [research.md](research.md) and returned in the shape documented in [contracts/library-api.md](contracts/library-api.md). Publication of an album is stored, because that choice cannot be derived from the photo rows.

## Person

Someone who creates their own account and then signs in.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| id | text | yes | Primary key. Generated UUID. |
| name | text | yes | Trimmed, 1 to 64 characters. Unique. |
| secret_hash | text | yes | scrypt hash of the secret. The secret itself is never stored. |
| created_at | text | yes | UTC instant `YYYY-MM-DDTHH:MM:SS.SSSZ`. |

### Validation

- An empty name or an empty secret does not create a person.
- A second account with the same name does not create a person.

## Session

The record that a person is signed in.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| id | text | yes | Primary key. Generated UUID. |
| person_id | text | yes | References `people.id`. |
| token_hash | text | yes | SHA-256 of the cookie token. Unique. The cookie value is never stored. |
| created_at | text | yes | UTC instant. |

A session stays until that person signs out. Signing out deletes the session row.

## Photo

A still image. The row is metadata. The bytes live only in the image directory.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| id | text | yes | Primary key. Generated UUID. Also the stable identity in API responses. |
| owner_id | text | no | References `people.id`. Null only for a photo that was already stored before any account existed. |
| is_public | integer | yes | `0` or `1`. A photo added after an account exists starts at `0`. A photo with a null owner is `1`. |
| content_hash | text | yes | SHA-256 of the file bytes. Unique. A second add of the same bytes returns this row and does not insert another. |
| stored_name | text | yes | File name under the image directory, `{id}.{ext}`. Unique. Never taken from the user's file name. |
| media_type | text | yes | One of `image/jpeg`, `image/png`, `image/gif`, `image/webp`, matching the file signature. |
| original_name | text | yes | Name the user chose, kept for diagnosis. Not used as a path or as the album label. |
| taken_at | text | no | Local EXIF timestamp `YYYY-MM-DDTHH:MM:SS` with no offset. Null when the file has no `DateTimeOriginal`. |
| added_at | text | yes | UTC instant `YYYY-MM-DDTHH:MM:SS.SSSZ` when the add succeeded. |
| added_seq | integer | yes | Unique. Greater than every previously stored photo. Tie-break for "added first". |
| album_date | text | yes | `YYYY-MM-DD`. The calendar day of `taken_at` when the date was taken from the photo. Otherwise the calendar day of `added_at` in the timezone passed to the date rule. |
| date_assigned | integer | yes | `0` when `taken_at` is present. `1` when the date was assigned. |

### Validation

- `album_date` is a real calendar day. The date rule is the only writer of this field.
- When `date_assigned` is `0`, `taken_at` is present and its first 10 characters equal `album_date`.
- When `date_assigned` is `1`, `taken_at` is null.
- `media_type` is one of the four types above. Any other file is not a row.
- `stored_name` contains no path separators.
- A stored photo has exactly one row and exactly one file. A failed add leaves neither.
- A new photo has `owner_id` set to the signed-in person and `is_public` set to `0`.
- A photo with a null `owner_id` has `is_public` set to `1`.
- Only the owner can set `is_public` from `0` to `1`. Nothing sets it back to `0`.

### Relationships

- Many photos share one album. The album key is (`owner_id`, `album_date`, `date_assigned`). A null owner is its own key, not a match for any person.
- A photo belongs to exactly one album.
- The cover of an album, for a given viewer, is the first visible photo in album order, not a separate stored field.

## Album publication

The owner's choice that one of their albums is public. Membership stays on the photo rows.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| owner_id | text | yes | References `people.id`. Part of the primary key. |
| album_date | text | yes | `YYYY-MM-DD`. Part of the primary key. |
| date_assigned | integer | yes | `0` or `1`. Part of the primary key. |
| published_at | text | yes | UTC instant when the owner marked it public. |

A missing row means the album is not public. No row is deleted by this feature. Photos with a null owner do not use this table.

## Album (derived)

The set of photos with the same `owner_id`, `album_date`, and `date_assigned`.

| Field | Source |
| --- | --- |
| id | `{ownerId}:{albumDate}:0` or `:1`. Photos with a null owner use `unowned:{albumDate}:0` or `:1`. |
| owner_id | Photo field. Null for an unowned album. |
| album_date | Photo field |
| year, month | The year and month parts of `album_date` |
| photo_count | Count of photos in the album that this viewer can see |
| date_assigned | `1` only for the assigned-date album, which carries the assigned-date label |
| public | True when an `album_publications` row exists for this key. An unowned album is public because its photos are public. |
| cover | First visible photo in album order |

A viewer can see a photo when any of these is true:

- The viewer is signed in and `owner_id` is that person.
- `is_public` is `1`.
- An `album_publications` row exists for that photo's owner, `album_date`, and `date_assigned`.

A calendar day with no visible photos has no album for that viewer. A day with both taken-date and assigned-date photos has two albums for that owner. Two owners on the same day have two albums.

**Album order for the library**: `album_date` descending, then taken-date before assigned-date on the same day, then a null owner before any person id, then `owner_id` ascending.

**Photo order inside an album**: `taken_at` ascending, then `added_seq` ascending. This same order selects the cover from the visible photos.

## Date group (derived)

A year and month heading over album tiles. It is not a record. The client inserts a heading when the year or month changes while walking the album list in API order. It does not recompute which photos belong together, and it does not recompute visibility.

## State

| Attempt | Result |
| --- | --- |
| Create account with a new name and a secret | One person. No session yet. |
| Create account with a name that already exists, or with an empty name or secret | No person. |
| Sign in with the right name and secret | One session. |
| Sign in with an unknown name or the wrong secret | No session. |
| Sign out | That session is deleted. |
| New supported image while signed in | One new photo owned by that person, not public. Creates the album only by being the first row with that album key. |
| Same bytes again | No new row, no new file, album count unchanged. The existing owner stays. |
| Add while signed out | No row and no file. |
| Unsupported or empty file | No row and no file. The attempt counts as skipped. |
| Owner marks their album or photo public | The publication row or `is_public` becomes `1`. |
| Someone else marks it public | No change. |
| Write or database failure | No new row and no new file. The error is returned to the caller. |

Photos already stored before any account exists are updated once: `owner_id` stays null and `is_public` becomes `1`.

## Storage layout

```text
data/
├── library.sqlite
└── images/
    └── {id}.{ext}
```

`data/` is local runtime state. It is not source and it is not committed. Tests supply their own data directory. Secret hashes and session token hashes live in the database. The secrets and cookie tokens do not.
