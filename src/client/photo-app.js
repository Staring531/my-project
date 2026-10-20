import { createElement as h, Fragment } from "react";
import { createRoot } from "react-dom/client";
import {
  addPhotoBatch,
  addPhotoToNamedAlbum,
  createAccount,
  createNamedAlbum,
  deletePhoto,
  getAlbumPhotos,
  getAlbums,
  getSession,
  makeAlbumPrivate,
  publishAlbum,
  publishPhoto,
  signIn,
  signOut,
} from "./api.js";
import { applyAppearance, nextAppearance } from "./appearance.js";
import { AlbumScreen } from "./album-view.js";
import {
  BatchNotice,
  LibraryScreen,
  SignedOutLibrary,
  renderDuplicateMessage,
  renderErrors,
  renderSkipMessage,
} from "./library-view.js";
import { consumePendingNotice, handoffBatchNotice } from "./notice.js";
import { PreviewScreen } from "./preview-view.js";
import { AccountPanel } from "./session-view.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function failedDeletion(photoId, error) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Could not delete the picture.";
  return { confirmingId: photoId, deleteError: message };
}

export function renderDeletionAlert(message) {
  if (!message) return "";
  return `<p class="error" role="alert">${escapeHtml(message)}</p>`;
}

let started = false;

export function startPhotoApp() {
  if (started) return;
  started = true;

  const app = document.getElementById("app");
  const addButton = document.getElementById("add-photos");
  const signOutButton = document.getElementById("sign-out");
  const appearanceButton = document.getElementById("appearance-switch");
  let appearance = "light";
  applyAppearance(document.documentElement, appearance);
  const fileInput = document.getElementById("file-input");
  let viewRoot = null;
  let pendingNotice = "";
  let pendingBatch = null;
  let person = null;
  let signInError = "";
  let accountError = "";
  let albumError = "";
  let confirmingId = null;
  let deleteError = "";
  let preview = null;
  let currentAlbum = null;

  function albumIdFromHash() {
    const match = /^#\/albums\/(.+)$/.exec(window.location.hash);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function show(node) {
    if (!viewRoot) viewRoot = createRoot(app);
    viewRoot.render(node);
  }

  function paintAlbum() {
    if (!currentAlbum) return;
    show(
      h(
        Fragment,
        null,
        deleteError
          ? h("p", { className: "error", role: "alert" }, deleteError)
          : null,
        h(AlbumScreen, {
          photos: currentAlbum.body.photos,
          person,
          album: currentAlbum.body.album,
          namedAlbums: currentAlbum.namedAlbums,
          ownedPhotos: currentAlbum.ownedPhotos,
          confirmingId,
        }),
        preview ? h(PreviewScreen, { picture: preview }) : null,
      ),
    );
  }

  async function refreshSession() {
    try {
      const { body } = await getSession();
      person = body.person;
    } catch {
      person = null;
    }
    addButton.hidden = !person;
    signOutButton.hidden = !person;
  }

  async function listOwnedPhotos(albums) {
    const mine = albums.filter((album) => album.ownerId === person.id);
    const lists = await Promise.all(
      mine.map((album) => getAlbumPhotos(album.id)),
    );
    return lists.flatMap((result) =>
      result.body.photos.filter((photo) => photo.ownerId === person.id),
    );
  }

  async function showLibrary() {
    currentAlbum = null;
    confirmingId = null;
    deleteError = "";
    preview = null;
    const consumed = consumePendingNotice(pendingNotice);
    pendingNotice = consumed.pendingNotice;
    const { body } = await getAlbums();
    const namedAlbums = body.namedAlbums ?? [];
    const batch = person && consumed.notice ? pendingBatch : null;
    pendingBatch = null;
    const notice = batch ? h(BatchNotice, batch) : null;
    const library = person
      ? h(LibraryScreen, {
          albums: body.albums,
          person,
          namedAlbums,
          albumError,
        })
      : h(
          Fragment,
          null,
          h(AccountPanel, { signInError, accountError }),
          h(SignedOutLibrary, { albums: body.albums, namedAlbums }),
        );
    show(h(Fragment, null, notice, library));
  }

  async function showAlbum(albumId) {
    try {
      const { body } = await getAlbumPhotos(albumId);
      const albums = await getAlbums();
      const namedAlbums = albums.body.namedAlbums ?? [];
      let ownedPhotos = [];
      if (
        person &&
        body.album?.ownerId === person.id &&
        String(body.album.id).startsWith("named:")
      ) {
        ownedPhotos = await listOwnedPhotos(albums.body.albums);
      }
      deleteError = "";
      currentAlbum = { body, namedAlbums, ownedPhotos };
      paintAlbum();
    } catch (error) {
      currentAlbum = null;
      if (error?.status === 404 && !albumId.startsWith("named:")) {
        if (window.location.hash !== "#/" && window.location.hash !== "") {
          window.location.hash = "#/";
          return;
        }
        await showLibrary();
        return;
      }
      const message =
        error instanceof Error ? error.message : "Could not open that album.";
      show(
        h(
          Fragment,
          null,
          h("p", { className: "error", role: "alert" }, message),
          h("p", null, h("a", { href: "#/" }, "Back")),
        ),
      );
    }
  }

  async function showCurrent() {
    const albumId = albumIdFromHash();
    if (albumId) await showAlbum(albumId);
    else await showLibrary();
  }

  function formValues(form) {
    const data = new FormData(form);
    return {
      name: String(data.get("name") ?? ""),
      secret: String(data.get("secret") ?? ""),
    };
  }

  function dismissPreview() {
    if (!preview) return;
    preview = null;
    paintAlbum();
  }

  addButton.addEventListener("click", () => {
    fileInput.click();
  });

  appearanceButton.addEventListener("click", () => {
    appearance = nextAppearance(appearance);
    applyAppearance(document.documentElement, appearance);
    appearanceButton.textContent = appearance;
  });

  signOutButton.addEventListener("click", async () => {
    await signOut();
    person = null;
    signInError = "";
    accountError = "";
    albumError = "";
    addButton.hidden = true;
    signOutButton.hidden = true;
    if (albumIdFromHash()) {
      window.location.hash = "#/";
      return;
    }
    await showLibrary();
  });

  app.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (
      form.id !== "create-account" &&
      form.id !== "sign-in" &&
      form.id !== "create-album"
    ) {
      return;
    }
    event.preventDefault();
    const values = formValues(form);
    if (form.id === "create-album") {
      try {
        await createNamedAlbum(values.name);
        albumError = "";
      } catch (error) {
        if (error?.status === 401) {
          person = null;
          albumError = "";
          addButton.hidden = true;
          signOutButton.hidden = true;
        } else {
          albumError =
            error instanceof Error
              ? error.message
              : "Could not create the album.";
        }
      }
      await showLibrary();
      return;
    }
    if (form.id === "create-account") {
      try {
        await createAccount(values.name, values.secret);
        accountError = "";
        signInError = "";
      } catch (error) {
        accountError =
          error instanceof Error
            ? error.message
            : "Could not create the account.";
      }
      await showLibrary();
      return;
    }
    try {
      await signIn(values.name, values.secret);
      signInError = "";
      accountError = "";
      await refreshSession();
    } catch (error) {
      signInError =
        error instanceof Error ? error.message : "Could not sign in.";
    }
    await showLibrary();
  });

  app.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const albumId = target.closest("[data-publish-album]")?.dataset
      .publishAlbum;
    const photoId = target.closest("[data-publish-photo]")?.dataset
      .publishPhoto;
    const privateId = target.closest("[data-private-album]")?.dataset
      .privateAlbum;
    const addExisting = target.closest("[data-add-existing]");
    const place = target.closest("[data-place-photo]");
    const remove = target.closest("[data-delete-photo]");
    const confirmDelete = target.closest("[data-confirm-delete]");
    const cancelDelete = target.closest("[data-cancel-delete]");
    const select = target.closest("[data-select-photo]");
    const closePreview = target.closest("[data-close-preview]");
    if (closePreview) {
      event.preventDefault();
      dismissPreview();
      return;
    }
    if (select) {
      event.preventDefault();
      preview = { imageUrl: select.dataset.selectUrl, failed: false };
      paintAlbum();
      return;
    }
    if (cancelDelete) {
      event.preventDefault();
      confirmingId = null;
      deleteError = "";
      paintAlbum();
      return;
    }
    if (remove) {
      event.preventDefault();
      confirmingId = remove.dataset.deletePhoto;
      deleteError = "";
      paintAlbum();
      return;
    }
    if (confirmDelete) {
      event.preventDefault();
      const photoId = confirmDelete.dataset.confirmDelete;
      try {
        await deletePhoto(photoId);
      } catch (error) {
        const failure = failedDeletion(photoId, error);
        confirmingId = failure.confirmingId;
        deleteError = failure.deleteError;
        paintAlbum();
        return;
      }
      confirmingId = null;
      deleteError = "";
      await showCurrent();
      return;
    }
    if (addExisting) {
      event.preventDefault();
      const currentId = albumIdFromHash();
      if (currentId) {
        await addPhotoToNamedAlbum(currentId, addExisting.dataset.addExisting);
      }
      await showCurrent();
      return;
    }
    if (place) {
      event.preventDefault();
      await addPhotoToNamedAlbum(
        place.dataset.placeAlbum,
        place.dataset.placePhoto,
      );
      await showCurrent();
      return;
    }
    if (privateId) {
      event.preventDefault();
      await makeAlbumPrivate(privateId);
      await showCurrent();
      return;
    }
    if (!albumId && !photoId) return;
    event.preventDefault();
    if (albumId) await publishAlbum(albumId);
    if (photoId) await publishPhoto(photoId);
    await showCurrent();
  });

  fileInput.addEventListener("change", async () => {
    const files = [...fileInput.files];
    fileInput.value = "";
    if (files.length === 0) return;
    const summary = await addPhotoBatch(files);
    pendingBatch = summary;
    const handed = handoffBatchNotice(
      renderDuplicateMessage(summary.duplicates) +
        renderSkipMessage(summary.skipped) +
        renderErrors(summary.errors),
      { fromAlbum: Boolean(albumIdFromHash()) },
    );
    pendingNotice = handed.pendingNotice;
    if (handed.nextHash && window.location.hash !== handed.nextHash) {
      window.location.hash = handed.nextHash;
      return;
    }
    await showLibrary();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismissPreview();
  });

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.closest(".preview") || !preview || preview.failed) return;
      preview = { imageUrl: preview.imageUrl, failed: true };
      paintAlbum();
    },
    true,
  );

  window.addEventListener("hashchange", () => {
    preview = null;
    confirmingId = null;
    deleteError = "";
    showCurrent().catch((error) => {
      show(h("p", { className: "error", role: "alert" }, error.message));
    });
  });

  refreshSession()
    .then(() => showCurrent())
    .catch((error) => {
      show(h("p", { className: "error", role: "alert" }, error.message));
    });
}
