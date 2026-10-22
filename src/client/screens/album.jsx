import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function EmptyFlourish({ language }) {
  return (
    <div className="flourish" aria-hidden="true">
      <span className="flourish-arc" />
      <span className="flourish-arc flourish-arc-inner" />
      <span className="mark">{language === "zh" ? "照" : "P"}</span>
    </div>
  );
}

function pictureLine(photo) {
  if (photo.takenAt) return photo.takenAt.slice(11, 16) || photo.takenAt;
  return "";
}

function PictureMenu({ photo, items, narrow, onAction, t }) {
  const [listing, setListing] = useState(false);
  if (items.length === 0) return null;
  if (narrow) {
    const place = items.find((item) => item.children);
    return (
      <Dialog
        open={photo.menuOpen}
        onOpenChange={(open) => {
          if (!open) setListing(false);
          onAction(open ? "open-menu" : "close-menu", photo);
        }}
      >
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label={t("Picture actions")}
          data-picture-actions=""
          onClick={() => onAction("open-menu", photo)}
        >
          ⋯
        </Button>
        <DialogContent placement="bottom">
          <DialogHeader>
            <DialogTitle>
              {listing ? t("Add to album") : t("Picture actions")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {listing
              ? place.children.map((child) => (
                  <Button
                    key={child.albumId}
                    type="button"
                    variant="secondary"
                    onClick={() => onAction("place", photo, child.albumId)}
                  >
                    {child.label}
                  </Button>
                ))
              : items.map((item) =>
                  item.destructive ? (
                    <div key={item.id} className="grid gap-2">
                      <hr />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => onAction(item.id, photo)}
                      >
                        {item.label}
                      </Button>
                    </div>
                  ) : item.children ? (
                    <Button
                      key={item.id}
                      type="button"
                      variant="secondary"
                      onClick={() => setListing(true)}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      key={item.id}
                      type="button"
                      variant={item.destructive ? "destructive" : "secondary"}
                      onClick={() => onAction(item.id, photo)}
                    >
                      {item.label}
                    </Button>
                  ),
                )}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                listing ? setListing(false) : onAction("close-menu", photo)
              }
            >
              {listing ? t("Back") : t("Cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <DropdownMenu
      open={photo.menuOpen}
      onOpenChange={(open) =>
        onAction(open ? "open-menu" : "close-menu", photo)
      }
    >
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label={t("Picture actions")}
          data-picture-actions=""
        >
          ⋯
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => {
          const separator = item.destructive;
          if (item.children) {
            return (
              <DropdownMenuSub key={item.id}>
                <DropdownMenuSubTrigger>{item.label}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {item.children.map((child) => (
                    <DropdownMenuItem
                      key={child.albumId}
                      onSelect={() => onAction(item.id, photo, child.albumId)}
                    >
                      {child.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          }
          return (
            <span key={item.id}>
              {separator ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                className={item.destructive ? "confirm-delete" : undefined}
                onSelect={() => onAction(item.id, photo)}
              >
                {item.label}
              </DropdownMenuItem>
            </span>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function pictureActions({
  photo,
  person,
  album,
  namedAlbums,
  t = (sentence) => sentence,
}) {
  const items = [];
  const owned = person && photo.ownerId === person.id;
  if (owned && photo.public === false) {
    items.push({ id: "publish", label: t("Mark picture public") });
  }
  const mine = (namedAlbums ?? []).filter(
    (named) => person && named.ownerId === person.id,
  );
  if (owned && album && !album.name && mine.length > 0) {
    items.push({
      id: "place",
      label: t("Add to album"),
      children: mine.map((named) => ({
        albumId: named.id,
        label: named.name,
      })),
    });
  }
  if (owned)
    items.push({ id: "delete", label: t("Delete"), destructive: true });
  return items;
}

function PictureFace({ src, t }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="picture-failed">
        {t("This picture cannot be shown.")}
      </span>
    );
  }
  return <img src={src} alt="" onError={() => setFailed(true)} />;
}

function PictureCard({ photo, items, narrow, onOpen, onAction, t }) {
  const line = pictureLine(photo);
  return (
    <figure className="picture-card" data-photo-id={photo.id}>
      <button
        type="button"
        className="picture-open"
        onClick={() => onOpen(photo)}
      >
        <PictureFace src={photo.imageUrl} t={t} />
      </button>
      <div className="picture-line">
        {line ? (
          <span className="truncate">{line}</span>
        ) : (
          <abbr className="assigned truncate" title="Date assigned">
            {t("Assigned")}
          </abbr>
        )}
        <PictureMenu
          photo={photo}
          items={items}
          narrow={narrow}
          onAction={onAction}
          t={t}
        />
      </div>
    </figure>
  );
}

function DeleteCopy({ src, t }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <p>{t("This picture cannot be shown.")}</p>;
  }
  return (
    <img
      className="delete-thumb"
      src={src}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

export function DeleteDialog({
  photo,
  error,
  onCancel,
  onConfirm,
  t = (sentence) => sentence,
}) {
  const cancelRef = useRef(null);
  return (
    <Dialog open={Boolean(photo)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        placement="center"
        data-region="dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (!photo?.id) return;
          document
            .querySelector(
              `[data-photo-id="${CSS.escape(photo.id)}"] [data-picture-actions]`,
            )
            ?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("Delete this picture?")}</DialogTitle>
          <DialogDescription>
            {t("It will be removed from every album.")}
          </DialogDescription>
        </DialogHeader>
        {photo ? <DeleteCopy src={photo.imageUrl} t={t} /> : null}
        {error ? (
          <p className="error" role="alert">
            {t(error)}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            {t("Cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="confirm-delete"
            onClick={onConfirm}
          >
            {t("Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddPicturesDialog({
  open,
  photos,
  addedIds,
  narrow,
  onAdd,
  onClose,
  t = (sentence) => sentence,
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent placement={narrow ? "bottom" : "center"}>
        <Button
          type="button"
          variant="ghost"
          className="dialog-close"
          onClick={onClose}
        >
          {t("Close")}
        </Button>
        <DialogHeader>
          <DialogTitle>{t("Add pictures")}</DialogTitle>
        </DialogHeader>
        {photos.length === 0 ? (
          <p>{t("No pictures to add.")}</p>
        ) : (
          <div className={narrow ? "add-grid add-grid-narrow" : "add-grid"}>
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className={
                  addedIds.has(photo.id) ? "added-square" : "add-square"
                }
                aria-label={t(
                  addedIds.has(photo.id) ? "Already added" : "Add picture",
                )}
                onClick={() => onAdd(photo)}
              >
                <PictureFace src={photo.imageUrl} t={t} />
              </button>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t("Done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoadingCards() {
  return (
    <div className="skeleton-grid" aria-busy="true">
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

export function AlbumScreen({
  album,
  photos,
  person,
  namedAlbums,
  narrow,
  menuPhotoId,
  loading = false,
  language = "en",
  onOpen,
  onAction,
  onAddPictures,
  t = (sentence) => sentence,
}) {
  if (loading && !album) return <LoadingCards />;
  const named = Boolean(album?.name);
  return (
    <div>
      <div className="album-title">
        <a className="album-back" href="#/">
          <span aria-hidden="true">← </span>
          <span className={narrow ? "sr-only" : undefined}>
            {t("All albums")}
          </span>
        </a>
        <h2 className="truncate">
          {album ? (
            <a
              className="full-name"
              href={`#/albums/${encodeURIComponent(album.id)}`}
              data-full={named ? album.name : album.albumDate}
            >
              {named ? album.name : album.albumDate}
            </a>
          ) : null}
        </h2>
        <p className="count">{album?.photoCount}</p>
        {album?.dateAssigned ? (
          <abbr className="assigned" title="Date assigned">
            {t("Assigned")}
          </abbr>
        ) : null}
        {named && person && album.ownerId === person.id ? (
          <Button
            type="button"
            className="add-pictures"
            aria-label={t("Add pictures")}
            onClick={onAddPictures}
          >
            {narrow ? "+" : t("Add pictures")}
          </Button>
        ) : null}
      </div>
      {photos.length === 0 ? (
        <section className="empty">
          <EmptyFlourish language={language} />
          <p>{t("This album has no pictures.")}</p>
          {named && person && album.ownerId === person.id ? (
            <Button type="button" onClick={onAddPictures}>
              {t("Add pictures")}
            </Button>
          ) : null}
        </section>
      ) : (
        <div className="album-grid">
          {photos.map((photo) => (
            <PictureCard
              key={photo.id}
              photo={{ ...photo, menuOpen: menuPhotoId === photo.id }}
              items={pictureActions({ photo, person, album, namedAlbums, t })}
              narrow={narrow}
              onOpen={onOpen}
              onAction={onAction}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
