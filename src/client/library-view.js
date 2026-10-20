import { createElement as h, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function PrivacyControl({ album, person }) {
  if (!person || album.ownerId !== person.id) return null;
  if (album.public === false) {
    return h(
      "button",
      { type: "button", "data-publish-album": album.id },
      "Mark album public",
    );
  }
  if (album.public === true) {
    return h(
      "button",
      { type: "button", "data-private-album": album.id },
      "Make album private",
    );
  }
  return null;
}

function DateTile({ album, person }) {
  return h(
    "div",
    { className: "tile-wrap" },
    h(
      "a",
      {
        className: "tile",
        href: `#/albums/${encodeURIComponent(album.id)}`,
        "data-album-id": album.id,
      },
      h("img", { src: album.coverImageUrl, alt: "", loading: "lazy" }),
      h("p", { className: "date" }, album.albumDate),
      h("p", { className: "count" }, album.photoCount),
      album.dateAssigned
        ? h("p", { className: "assigned" }, "Date assigned")
        : null,
    ),
    h(PrivacyControl, { album, person }),
  );
}

function NamedTile({ album, person }) {
  return h(
    "div",
    { className: "tile-wrap" },
    h(
      "a",
      {
        className: "tile",
        href: `#/albums/${encodeURIComponent(album.id)}`,
        "data-album-id": album.id,
      },
      album.coverImageUrl
        ? h("img", { src: album.coverImageUrl, alt: "", loading: "lazy" })
        : null,
      h("p", { className: "name" }, album.name),
      h("p", { className: "count" }, album.photoCount),
    ),
    h(PrivacyControl, { album, person }),
  );
}

function dateSections(albums) {
  const sections = [];
  for (const album of albums) {
    const key = `${album.year}-${album.month}`;
    const last = sections.at(-1);
    if (!last || last.key !== key) {
      sections.push({
        key,
        year: album.year,
        month: album.month,
        albums: [album],
      });
    } else {
      last.albums.push(album);
    }
  }
  return sections;
}

export function LibraryScreen({
  albums = [],
  person = null,
  namedAlbums = [],
  albumError = "",
  suppressEmptyDate = false,
}) {
  const dates =
    albums.length === 0
      ? suppressEmptyDate
        ? null
        : h(
            "section",
            { className: "empty" },
            h(
              "p",
              null,
              "Add photos to organize them by the day they were taken.",
            ),
          )
      : dateSections(albums).map((section) =>
          h(
            "section",
            { className: "month", key: section.key },
            h(
              "h2",
              { "data-year": section.year, "data-month": section.month },
              `${MONTHS[section.month - 1]} ${section.year}`,
            ),
            h(
              "div",
              { className: "grid" },
              section.albums.map((album) =>
                h(DateTile, { key: album.id, album, person }),
              ),
            ),
          ),
        );
  return h(
    "div",
    null,
    person
      ? h(
          "form",
          { id: "create-album", className: "create-album" },
          h("label", null, "Album name ", h("input", { name: "name" })),
          h("button", { type: "submit" }, "Create album"),
          albumError
            ? h("p", { className: "error", role: "alert" }, albumError)
            : null,
        )
      : null,
    namedAlbums.length > 0
      ? h(
          "section",
          { className: "named-albums" },
          h("h2", null, "Albums"),
          h(
            "div",
            { className: "grid" },
            namedAlbums.map((album) =>
              h(NamedTile, { key: album.id, album, person }),
            ),
          ),
        )
      : null,
    dates,
  );
}

export function SignedOutLibrary({ albums = [], namedAlbums = [] }) {
  if (albums.length === 0 && namedAlbums.length === 0) {
    return h(
      "section",
      { className: "empty" },
      h("p", null, "There are no public photos."),
    );
  }
  return h(LibraryScreen, {
    albums,
    namedAlbums,
    suppressEmptyDate: true,
  });
}

export function renderLibrary(albums, options = {}) {
  return renderToStaticMarkup(
    h(LibraryScreen, {
      albums,
      person: options.person ?? null,
      namedAlbums: options.namedAlbums ?? [],
      albumError: options.albumError ?? "",
      suppressEmptyDate: Boolean(options.suppressEmptyDate),
    }),
  );
}

export function renderSignedOutLibrary(albums, options = {}) {
  return renderToStaticMarkup(
    h(SignedOutLibrary, {
      albums,
      namedAlbums: options.namedAlbums ?? [],
    }),
  );
}

export function BatchNotice({ duplicates = 0, skipped = 0, errors = [] }) {
  const skippedText =
    skipped === 1
      ? "1 item was skipped."
      : skipped
        ? `${skipped} items were skipped.`
        : "";
  return h(
    Fragment,
    null,
    duplicates
      ? h(
          "p",
          { className: "duplicate", role: "status" },
          "This picture is already in the library.",
        )
      : null,
    skippedText
      ? h("p", { className: "skip", role: "status" }, skippedText)
      : null,
    errors.map((error) =>
      h("p", { className: "error", role: "alert", key: error }, error),
    ),
  );
}

export function renderSkipMessage(skipped) {
  if (!skipped) return "";
  const wording =
    skipped === 1 ? "1 item was skipped." : `${skipped} items were skipped.`;
  return renderToStaticMarkup(
    h("p", { className: "skip", role: "status" }, wording),
  );
}

export function renderDuplicateMessage(duplicates) {
  if (!duplicates) return "";
  return renderToStaticMarkup(
    h(
      "p",
      { className: "duplicate", role: "status" },
      "This picture is already in the library.",
    ),
  );
}

export function renderErrors(errors) {
  return renderToStaticMarkup(
    errors.map((error) =>
      h("p", { className: "error", role: "alert", key: error }, error),
    ),
  );
}
