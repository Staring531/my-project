# Quickstart: Photo Date Albums

Validation guide for the local organizer. Field meanings live in [data-model.md](data-model.md). Request and response shapes live in [contracts/library-api.md](contracts/library-api.md). Screen behavior lives in [contracts/library-ui.md](contracts/library-ui.md).

## Prerequisites

- Node.js 24.20 or newer (`node:sqlite` is part of this runtime).
- A current desktop browser.
- JPEG, PNG, GIF, or WebP files whose taken dates you know. Include one JPEG with an EXIF taken date, one image with no taken date, and one file that is not a picture (for example a text file renamed to `.jpg`).

## Setup

From the repository root:

```bash
npm install
npm test
npm run dev
```

`npm test` runs the unit, integration, and contract tests. Integration tests use a temporary data directory, not `data/`.

`npm run dev` starts the local server and the Vite client. Open the URL Vite prints. The client is served by Vite and calls `/api` and `/images` on the local server. The browser sends the session cookie with those calls.

The library is stored in `data/library.sqlite` and `data/images/`. Set `DATA_DIR` and `PORT` to point a run at another directory or port. Do not commit `data/`.

## Checks

Confirm each outcome in the browser after `npm test` is green.

1. **Signed out, empty library.** Open the organizer with an empty data directory before creating an account. The screen says there are no public photos, offers account creation and sign-in, and shows no tiles and no add control.
2. **Create and sign in.** Create an account, then sign in with that name and secret. The screen explains how to add photos and shows an add control.
3. **Wrong secret.** Sign out. Sign in with the right name and a wrong secret. The screen stays signed out and says it could not sign in. A second person is not signed in as the first.
4. **Three days.** While signed in, add three JPEGs taken on three different days of one month. Three tiles appear under that month and year, newest day first. Each tile shows that date, a count of 1, and a preview.
5. **One day, several photos.** Add two photos taken on the same day, the earlier taken time first. One tile remains. The count is 2. The preview is the earlier photo. Add a third photo taken later that day. The count is 3 and the preview stays the earlier photo.
6. **Tie.** Add two photos with the same taken time, one after the other. The preview is the one added first.
7. **Gap day.** Add photos for Monday and Wednesday only. There is no Tuesday tile.
8. **Two years.** Add a photo from another year. Tiles are grouped under year and month headings, newest first.
9. **Assigned date.** Add an image with no taken date. Its tile shows the day it was added and states that the date was assigned.
10. **Open a tile.** Open a day that has several photos. Those photos appear earliest first, and no photo from another day appears. Go back. The tiles match the library from before the album was opened.
11. **Same photo again.** Add a file that is already in the library. The album count does not change.
12. **Skip.** Add a batch that mixes a real photo with a non-photo. The real photo appears in the correct album, and the screen says how many items were skipped. A batch of only non-photos adds no tile and says all of them were skipped.
13. **Private until published.** Sign out. The first person's tiles are gone. Sign in as a second account. That person does not see the first person's photos. The first person marks one album public and one photo public. The second person, and a signed-out visitor, see that album and that photo, and still do not see the unmarked ones.
14. **Only the owner publishes.** The second person has no control to mark the first person's album or photo public.
15. **Restart.** Stop the dev process, start it again, and open the organizer. The first person is still signed in. Dates, counts, previews, assigned-date labels, and which items are public match the previous visit.
16. **Photos from before accounts.** Open a data directory that already contains photos and no accounts. Those photos are visible without signing in. Create the first account and sign in. Those photos are still visible, and they do not appear as that account's private photos. A photo that account then adds is hidden after sign-out.
17. **Speed spot-check.** With about 1,000 photos the signed-in person can see, the first screen of tiles is visible within 3 seconds. An album of about 200 visible photos shows that day's photos within 5 seconds.

## What failure looks like

- A photo with a known taken date appears on a different calendar day, especially near midnight.
- Two tiles exist for the same owner and the same taken date, or a day with no visible photos has a tile.
- The cover changes after a later photo is added.
- A duplicate add increases the count.
- A signed-out visitor sees a photo that was added after accounts existed and was not marked public.
- Creating an account assigns the pre-existing photos to that account.
- Restarting loses a photo, a count, an assigned-date label, or a publication.
- `npm test` fails. Do not treat the browser session as passing while tests are red.
