import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { composingEnter } from "../keyboard.js";

function blockComposingSubmit(event) {
  if (composingEnter(event)) event.preventDefault();
}

function NewAlbumForm({ message, onSubmit, onCancel, t }) {
  return (
    <form
      className="grid gap-2"
      onKeyDown={blockComposingSubmit}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit(String(data.get("name") ?? ""));
      }}
    >
      <label htmlFor="album-name">{t("Name")}</label>
      <Input id="album-name" name="name" />
      {message ? (
        <p className="error" role="alert">
          {t(message)}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t("Cancel")}
        </Button>
        <Button type="submit">{t("Create")}</Button>
      </div>
    </form>
  );
}

function LanguageSwitch({ id, language, onLanguage }) {
  return (
    <Button id={id} type="button" variant="secondary" onClick={onLanguage}>
      {language === "zh" ? "English" : "中文"}
    </Button>
  );
}

export function Header({
  person,
  narrow,
  appearance,
  language = "en",
  newAlbumOpen,
  albumMessage,
  onNewAlbumOpen,
  onCreateAlbum,
  onAddPhotos,
  onAppearance,
  onLanguage,
  onSignOut,
  onSignIn,
  t = (sentence) => sentence,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const appearanceLabel = t(
    appearance === "dark" ? "Light appearance" : "Dark appearance",
  );
  const fileId = "file-input";
  return (
    <header data-region="bar">
      <div className="brand">
        <span className="mark" aria-hidden="true">
          {language === "zh" ? "照" : "P"}
        </span>
        <h1 className="truncate">{t("Photo Date Albums")}</h1>
      </div>
      <div className="header-actions">
        {person && !narrow ? (
          <Popover open={newAlbumOpen} onOpenChange={onNewAlbumOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="secondary">
                {t("New album")}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <NewAlbumForm
                message={albumMessage}
                t={t}
                onCancel={() => onNewAlbumOpen(false)}
                onSubmit={onCreateAlbum}
              />
            </PopoverContent>
          </Popover>
        ) : null}
        {person ? (
          <Button id="add-photos" type="button" onClick={onAddPhotos}>
            {t("Add photos")}
          </Button>
        ) : null}
        {!narrow ? (
          <LanguageSwitch
            id="language-switch"
            language={language}
            onLanguage={onLanguage}
          />
        ) : null}
        {!narrow && (
          <Button
            id="appearance-switch"
            type="button"
            variant="secondary"
            onClick={onAppearance}
          >
            {appearanceLabel}
          </Button>
        )}
        {person && !narrow ? (
          <Button
            id="sign-out"
            type="button"
            variant="secondary"
            onClick={onSignOut}
          >
            {t("Sign out")}
          </Button>
        ) : null}
        {!person && !narrow ? (
          <Button id="sign-in" type="button" onClick={onSignIn}>
            {t("Sign in")}
          </Button>
        ) : null}
        {narrow ? (
          <Button
            type="button"
            aria-label={t("More")}
            onClick={() => setMoreOpen(true)}
          >
            {t("More")}
          </Button>
        ) : null}
        {!person && narrow ? (
          <Button id="sign-in" type="button" onClick={onSignIn}>
            {t("Sign in")}
          </Button>
        ) : null}
        <input id={fileId} type="file" multiple hidden />
      </div>
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent placement="bottom">
          <DialogHeader>
            <DialogTitle>{t("More")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {person ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMoreOpen(false);
                  onNewAlbumOpen(true);
                }}
              >
                {t("New album")}
              </Button>
            ) : null}
            <LanguageSwitch
              id={narrow ? "language-switch" : undefined}
              language={language}
              onLanguage={onLanguage}
            />
            <Button
              id={narrow ? "appearance-switch" : undefined}
              type="button"
              variant="secondary"
              onClick={onAppearance}
            >
              {appearanceLabel}
            </Button>
            {person ? (
              <Button
                id={narrow ? "sign-out" : undefined}
                type="button"
                variant="secondary"
                onClick={() => {
                  setMoreOpen(false);
                  onSignOut();
                }}
              >
                {t("Sign out")}
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      {narrow && person ? (
        <Dialog open={newAlbumOpen} onOpenChange={onNewAlbumOpen}>
          <DialogContent placement="bottom">
            <DialogHeader>
              <DialogTitle>{t("New album")}</DialogTitle>
            </DialogHeader>
            <NewAlbumForm
              message={albumMessage}
              t={t}
              onCancel={() => onNewAlbumOpen(false)}
              onSubmit={onCreateAlbum}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </header>
  );
}
