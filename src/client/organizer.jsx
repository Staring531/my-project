import { useCallback, useEffect, useRef, useState } from "react";
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
import { text } from "./copy.js";
import { readPreferences, writePreference } from "./preferences.js";
import { failedDeletion } from "./photo-app.js";
import { closeNotice, replaceNotice } from "./notice.js";
import { isNarrow, openSurface } from "./screen-state.js";
import { AccountDialog } from "./screens/account-dialog.jsx";
import { Confirmation } from "./screens/confirmation.jsx";
import {
  AddPicturesDialog,
  AlbumScreen,
  DeleteDialog,
} from "./screens/album.jsx";
import { Header } from "./screens/header.jsx";
import { LibraryScreen } from "./screens/library.jsx";
import { NoticeStrip } from "./screens/notice-strip.jsx";
import { PreviewScreen } from "./screens/preview.jsx";

function browserStorage() {
  if (typeof window === "undefined") {
    return { getItem: () => null, setItem() {} };
  }
  return window.localStorage;
}

function albumIdFromHash() {
  const match = /^#\/albums\/(.+)$/.exec(window.location.hash);
  return match ? decodeURIComponent(match[1]) : null;
}

export function Organizer() {
  const [person, setPerson] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [namedAlbums, setNamedAlbums] = useState([]);
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [ownedPhotos, setOwnedPhotos] = useState([]);
  const [picture, setPicture] = useState(null);
  const previewOpener = useRef(null);
  const [notice, setNotice] = useState(null);
  const storage = useRef(browserStorage());
  const [preferences, setPreferences] = useState(() =>
    readPreferences(storage.current),
  );
  const appearance = preferences.appearance;
  const language = preferences.language;
  const t = (sentence) => text(language, sentence);
  const [libraryState, setLibraryState] = useState("loading");
  const [confirmation, setConfirmation] = useState("");
  const loaded = useRef(false);
  const clearConfirmation = useCallback(() => setConfirmation(""), []);
  const [narrow, setNarrow] = useState(false);
  const [menuPhotoId, setMenuPhotoId] = useState(null);
  const [newAlbumOpen, setNewAlbumOpen] = useState(false);
  const [albumMessage, setAlbumMessage] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState("sign-in");
  const [accountName, setAccountName] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [deletePhotoState, setDeletePhotoState] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addedIds, setAddedIds] = useState(() => new Set());

  const loadLibrary = useCallback(async () => {
    const { body } = await getAlbums();
    setAlbums(body.albums ?? []);
    setNamedAlbums(body.namedAlbums ?? []);
    return body;
  }, []);

  const loadAlbum = useCallback(
    async (albumId) => {
      try {
        const { body } = await getAlbumPhotos(albumId);
        const library = await loadLibrary();
        setAlbum(body.album);
        setPhotos(body.photos ?? []);
        return { body, library };
      } catch (error) {
        if (error?.status === 404 && !String(albumId).startsWith("named:")) {
          if (window.location.hash !== "#/" && window.location.hash !== "") {
            window.location.hash = "#/";
          }
          setAlbum(null);
          setPhotos([]);
          return null;
        }
        throw error;
      }
    },
    [loadLibrary],
  );

  const showCurrent = useCallback(async () => {
    try {
      const albumId = albumIdFromHash();
      if (albumId) await loadAlbum(albumId);
      else {
        setAlbum(null);
        setPhotos([]);
        await loadLibrary();
      }
      loaded.current = true;
      setLibraryState("ready");
    } catch {
      if (!loaded.current) setLibraryState("failed");
    }
  }, [loadAlbum, loadLibrary]);

  useEffect(() => {
    applyAppearance(document.documentElement, appearance);
    document.documentElement.lang = language === "zh" ? "zh" : "en";
  }, [appearance, language]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const apply = () => setNarrow(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (typeof narrow !== "boolean") return;
    setMenuPhotoId(null);
    setNewAlbumOpen(false);
  }, [narrow]);

  useEffect(() => {
    let gone = false;
    getSession()
      .then(({ body }) => {
        if (!gone) setPerson(body.person);
      })
      .catch(() => {
        if (!gone) setPerson(null);
      })
      .finally(() => {
        if (!gone) showCurrent();
      });
    const onHash = () => {
      setPicture(null);
      setDeletePhotoState(null);
      setDeleteError("");
      showCurrent();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      gone = true;
      window.removeEventListener("hashchange", onHash);
    };
  }, [showCurrent]);

  const closePicture = useCallback(() => {
    const opener = previewOpener.current;
    setPicture(null);
    queueMicrotask(() => {
      if (opener instanceof HTMLElement) opener.focus();
    });
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (picture) closePicture();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picture, closePicture]);

  useEffect(() => {
    const input = document.getElementById("file-input");
    if (!input) return undefined;
    const onChange = async () => {
      const files = [...input.files];
      input.value = "";
      if (files.length === 0) return;
      const summary = await addPhotoBatch(files);
      setNotice(replaceNotice(summary));
      if (albumIdFromHash()) {
        window.location.hash = "#/";
        return;
      }
      await showCurrent();
    };
    input.addEventListener("change", onChange);
    return () => input.removeEventListener("change", onChange);
  }, [showCurrent]);

  async function togglePrivacy(item) {
    if (item.public) {
      await makeAlbumPrivate(item.id);
      setConfirmation("Album is now private.");
    } else {
      await publishAlbum(item.id);
      setConfirmation("Album is now public.");
    }
    await showCurrent();
  }

  async function onPictureAction(action, photo, albumId) {
    if (action === "open-menu") {
      setMenuPhotoId(photo.id);
      return;
    }
    if (action === "close-menu") {
      setMenuPhotoId(null);
      return;
    }
    setMenuPhotoId(null);
    if (action === "publish") {
      await publishPhoto(photo.id);
      await showCurrent();
      return;
    }
    if (action === "place" && albumId) {
      await addPhotoToNamedAlbum(albumId, photo.id);
      await showCurrent();
      return;
    }
    if (action === "delete") {
      setDeleteError("");
      setDeletePhotoState(photo);
    }
  }

  async function confirmDelete() {
    if (!deletePhotoState) return;
    try {
      await deletePhoto(deletePhotoState.id);
    } catch (error) {
      const failure = failedDeletion(deletePhotoState.id, error);
      setDeleteError(failure.deleteError);
      return;
    }
    setDeletePhotoState(null);
    setDeleteError("");
    setConfirmation("Picture deleted.");
    await showCurrent();
  }

  const routeId = albumIdFromHash();
  const surface = openSurface({
    sessionUnauthorized: !person,
    route: routeId ? "album" : "library",
    album,
    picture: null,
  });

  return (
    <>
      <Header
        person={person}
        narrow={
          narrow ||
          isNarrow(typeof window === "undefined" ? 1024 : window.innerWidth)
        }
        appearance={appearance}
        language={language}
        t={t}
        newAlbumOpen={newAlbumOpen}
        albumMessage={albumMessage}
        onNewAlbumOpen={setNewAlbumOpen}
        onCreateAlbum={async (name) => {
          try {
            await createNamedAlbum(name);
            setAlbumMessage("");
            setNewAlbumOpen(false);
            setConfirmation("Album created.");
            await showCurrent();
          } catch (error) {
            setAlbumMessage(
              error instanceof Error
                ? error.message
                : "Could not create the album.",
            );
          }
        }}
        onAddPhotos={() => document.getElementById("file-input")?.click()}
        onAppearance={() =>
          setPreferences((current) =>
            writePreference(
              storage.current,
              "appearance",
              nextAppearance(current.appearance),
            ),
          )
        }
        onLanguage={() =>
          setPreferences((current) =>
            writePreference(
              storage.current,
              "language",
              current.language === "zh" ? "en" : "zh",
            ),
          )
        }
        onSignOut={async () => {
          await signOut();
          setPerson(null);
          setAccountOpen(false);
          if (albumIdFromHash()) window.location.hash = "#/";
          else await showCurrent();
        }}
        onSignIn={() => {
          setAccountMode("sign-in");
          setAccountMessage("");
          setAccountOpen(true);
        }}
      />
      <div className="page">
        <NoticeStrip
          notice={notice}
          t={t}
          onClose={() => setNotice(closeNotice())}
        />
        {surface === "Date album" || surface === "Named album" ? (
          <AlbumScreen
            album={album}
            photos={photos}
            person={person}
            namedAlbums={namedAlbums}
            narrow={narrow}
            loading={libraryState === "loading"}
            menuPhotoId={menuPhotoId}
            language={language}
            t={t}
            onOpen={(photo) => {
              previewOpener.current = document.activeElement;
              setPicture({ imageUrl: photo.imageUrl, failed: false });
            }}
            onAction={onPictureAction}
            onAddPictures={async () => {
              const lists = await Promise.all(
                albums
                  .filter((item) => person && item.ownerId === person.id)
                  .map((item) => getAlbumPhotos(item.id)),
              );
              const mine = lists.flatMap((result) =>
                result.body.photos.filter(
                  (photo) => photo.ownerId === person.id,
                ),
              );
              setOwnedPhotos(mine);
              setAddedIds(new Set(photos.map((photo) => photo.id)));
              setAddOpen(true);
            }}
          />
        ) : (
          <LibraryScreen
            albums={albums}
            namedAlbums={namedAlbums}
            person={person}
            loading={libraryState === "loading"}
            language={language}
            t={t}
            onTogglePrivacy={togglePrivacy}
            onAddPhotos={() => document.getElementById("file-input")?.click()}
            onSignIn={() => {
              setAccountMode("sign-in");
              setAccountMessage("");
              setAccountOpen(true);
            }}
          />
        )}
      </div>
      <PreviewScreen
        picture={
          picture
            ? {
                ...picture,
                onError: () =>
                  setPicture((current) =>
                    current ? { ...current, failed: true } : current,
                  ),
              }
            : null
        }
        onClose={closePicture}
        t={t}
      />
      <AccountDialog
        open={accountOpen}
        mode={accountMode}
        name={accountName}
        message={accountMessage}
        narrow={narrow}
        onOpenChange={setAccountOpen}
        onMode={setAccountMode}
        t={t}
        onSubmit={async ({ name, secret }) => {
          if (accountMode === "create") {
            try {
              await createAccount(name, secret);
              setAccountName(name);
              setAccountMode("sign-in");
              setAccountMessage("Account created. Sign in to continue.");
            } catch (error) {
              setAccountMessage(
                error instanceof Error
                  ? error.message
                  : "Could not create the account.",
              );
            }
            return;
          }
          try {
            await signIn(name, secret);
            const { body } = await getSession();
            setPerson(body.person);
            setAccountOpen(false);
            setAccountMessage("");
            await showCurrent();
          } catch (error) {
            setAccountMessage(
              error instanceof Error ? error.message : "Could not sign in.",
            );
          }
        }}
      />
      <DeleteDialog
        photo={deletePhotoState}
        error={deleteError}
        onCancel={() => {
          setDeletePhotoState(null);
          setDeleteError("");
        }}
        onConfirm={confirmDelete}
        t={t}
      />
      <AddPicturesDialog
        open={addOpen}
        photos={ownedPhotos}
        addedIds={addedIds}
        narrow={narrow}
        onClose={() => setAddOpen(false)}
        t={t}
        onAdd={async (photo) => {
          if (!album || addedIds.has(photo.id)) return;
          await addPhotoToNamedAlbum(album.id, photo.id);
          setAddedIds((current) => new Set([...current, photo.id]));
          await showCurrent();
        }}
      />
      <Confirmation
        message={confirmation ? t(confirmation) : ""}
        onClear={clearConfirmation}
      />
    </>
  );
}
