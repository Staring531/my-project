import { createElement as h, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function isNamedAlbum(album) {
  return Boolean(album?.name);
}

function DeleteControls({ photo, person, confirmingId }) {
  if (!person || photo.ownerId !== person.id) return null;
  if (confirmingId === photo.id) {
    return h(
      Fragment,
      null,
      h(
        "button",
        {
          type: "button",
          className: "confirm-delete",
          "data-confirm-delete": photo.id,
        },
        "Confirm delete",
      ),
      h("button", { type: "button", "data-cancel-delete": photo.id }, "Cancel"),
    );
  }
  return h(
    "button",
    { type: "button", "data-delete-photo": photo.id },
    "Delete",
  );
}

function PlaceControls({ photo, person, album, namedAlbums }) {
  if (isNamedAlbum(album) || !person || photo.ownerId !== person.id)
    return null;
  return namedAlbums
    .filter((named) => named.ownerId === person.id)
    .map((named) =>
      h(
        "button",
        {
          type: "button",
          key: named.id,
          "data-place-photo": photo.id,
          "data-place-album": named.id,
        },
        `Place in ${named.name}`,
      ),
    );
}

export function AlbumScreen({
  photos = [],
  person = null,
  album = null,
  namedAlbums = [],
  ownedPhotos = [],
  confirmingId = null,
}) {
  const showAdd = isNamedAlbum(album) && person && album.ownerId === person.id;
  return h(
    "div",
    null,
    h("p", null, h("a", { href: "#/" }, "Back")),
    isNamedAlbum(album)
      ? h(
          "div",
          null,
          h("h2", null, album.name),
          h("p", { className: "count" }, album.photoCount),
        )
      : null,
    showAdd
      ? h(
          "div",
          { className: "photo-actions" },
          ownedPhotos.map((photo) =>
            h(
              "button",
              {
                type: "button",
                key: photo.id,
                "data-add-existing": photo.id,
              },
              "Add picture",
            ),
          ),
        )
      : null,
    h(
      "div",
      { className: "album-photos" },
      photos.map((photo) => {
        const canPublish =
          person && photo.ownerId === person.id && photo.public === false;
        return h(
          "figure",
          { key: photo.id, "data-photo-id": photo.id },
          h("img", { src: photo.imageUrl, alt: "", loading: "lazy" }),
          h(
            "div",
            { className: "photo-actions" },
            h(
              "button",
              {
                type: "button",
                "data-select-photo": photo.id,
                "data-select-url": photo.imageUrl,
              },
              "View",
            ),
            canPublish
              ? h(
                  "button",
                  { type: "button", "data-publish-photo": photo.id },
                  "Mark photo public",
                )
              : null,
            h(DeleteControls, { photo, person, confirmingId }),
            h(PlaceControls, { photo, person, album, namedAlbums }),
          ),
        );
      }),
    ),
  );
}

export function renderAlbum(photos, options = {}) {
  return renderToStaticMarkup(
    h(AlbumScreen, {
      photos,
      person: options.person,
      album: options.album,
      namedAlbums: options.namedAlbums ?? [],
      ownedPhotos: options.ownedPhotos ?? [],
      confirmingId: options.confirmingId ?? null,
    }),
  );
}
