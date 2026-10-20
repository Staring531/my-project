# Data Model: Album and Image Management

Person, session, photo, date album, and date-album publication fields stay as defined in [../001-photo-date-albums/data-model.md](../001-photo-date-albums/data-model.md). This feature adds named albums and the right to delete a picture or remove an album publication. Request shapes are in [contracts/library-api.md](contracts/library-api.md).

## Named album

An album a signed-in person creates. It is stored because it can contain no pictures.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| id | text | yes | Primary key. Generated UUID. The API id is `named:{id}`. |
| owner_id | text | yes | References `people.id`. |
| name | text | yes | Trimmed, 1 to 64 characters. Unique for that owner. Comparison is case-sensitive. |
| created_at | text | yes | UTC instant `YYYY-MM-DDTHH:MM:SS.SSSZ`. |

### Validation

- The stored name is the trimmed input. An empty name, a name of only spaces, or a trimmed name longer than 64 characters does not insert a row.
- A second named album for the same owner and the same trimmed name does not insert a row. Another owner's identical name does.

## Named album picture

The link that places one existing picture in one named album. It does not copy the picture and does not change the picture's date album.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| named_album_id | text | yes | References `named_albums.id`. Part of the primary key. |
| photo_id | text | yes | References `photos.id`. Part of the primary key. |
| member_seq | integer | yes | Unique within the named album. The first picture added has the lowest value. |

### Validation

- The picture's `owner_id` must equal the named album's `owner_id`. A picture with no owner cannot be linked.
- Linking the same picture again does not insert a second row and does not change `member_seq`.
- Deleting the picture deletes its links.

## Named album publication

The owner's choice that one named album is public. Membership stays on `named_album_photos`.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| named_album_id | text | yes | Primary key. References `named_albums.id`. |
| published_at | text | yes | UTC instant when the owner marked it public. |

A missing row means the named album is private. Setting the album private deletes the row. Deleting a row that is already absent leaves the album private.

## Changes to existing records

- **Photo**: The owner may delete their picture. That deletes the photo row, every named-album link, and the image file. A picture with a null `owner_id` is not deleted. `is_public` is still never set back to `0`.
- **Date-album publication**: The owner may delete the `album_publications` row for their date album. That makes the date album private. Pictures in it remain, on the same `album_date`. An unowned date album has no publication row to delete.
- **Content hash**: Still unique. Adding the same bytes on another calendar day does not insert a row, does not write a file, and does not change `album_date`.

## Derived named album

Returned for a viewer who can see the named album. It is not a date group.

| Field | Source |
| --- | --- |
| id | `named:` plus `named_albums.id` |
| owner_id | `named_albums.owner_id` |
| name | `named_albums.name` |
| photo_count | Count of linked pictures included for this viewer |
| public | True when a `named_album_publications` row exists |
| cover | The linked picture with the lowest `member_seq`. Null when the album has no pictures |

**Who can see a named album**: the owner, or anyone when a publication row exists. An empty named album is included for those viewers.

**Pictures included in a named album**: every linked picture, and only when the viewer can see that named album. This does not make the picture visible in a date album.

**Who can see a picture in a date album**: unchanged from the photo date albums model. Membership in a named album does not add the picture to someone else's view of a date album.

**Who can read image bytes**: a viewer who can see the picture in its date album, or in at least one named album. Both checks are in `src/server/library.js`.

**Named album order**: `created_at` descending, then `id` ascending. Date album order is unchanged. The client does not place a named album under a year or month heading.

**Cover and order inside a named album**: `member_seq` ascending. The cover is the first picture in that order.

## State

| Attempt | Result |
| --- | --- |
| Signed-in owner creates a new trimmed name | One named album, private, with no pictures and no cover. |
| Empty, blank, or over-long name | No row. |
| Same owner and same trimmed name | No row. The existing album is unchanged. |
| Another owner uses the same name | One new named album for that owner. |
| Signed-out person creates an album | No row. |
| Owner links their own picture | One membership. The picture's date album is unchanged. The cover is that picture when it is the first link. |
| Owner links a picture that is already in the named album | No new membership. Count and cover stay the same. |
| Owner links a picture they do not own, or a picture with no owner | No membership. |
| Someone else links a picture | No membership. |
| Owner confirms deletion of their picture | The photo row, its named-album links, and its image file are gone. Date-album counts exclude it. A date album with no pictures left is absent. A named album with no pictures left remains for the owner, with count 0 and no cover. |
| Owner cancels deletion | No request. The picture stays. |
| Someone else, or anyone for an unowned picture, deletes | No change. |
| Owner sets their public date album or named album private | The publication row is gone. Pictures remain. A picture with `is_public` 1 stays visible on its own. |
| Owner sets a private album private again | No publication row. The album stays private. |
| Someone else, or anyone for an unowned album, sets it private | No change. |
| Same picture bytes added on a later day | No new row and no new file. The original `album_date` stays. |

## Storage layout

```text
data/
├── library.sqlite
└── images/
    └── {id}.{ext}
```

New tables are created when the database opens. Existing photo, person, session, and date-publication rows are not rewritten. `data/` stays untracked.
