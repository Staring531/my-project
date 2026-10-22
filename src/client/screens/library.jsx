import { useState } from "react";
import { monthHeading } from "../copy.js";

function monthGroups(albums, language) {
  const groups = [];
  for (const album of albums) {
    const key = `${album.year}-${album.month}`;
    const last = groups.at(-1);
    if (!last || last.key !== key) {
      groups.push({
        key,
        year: album.year,
        month: album.month,
        label: monthHeading(language, album.year, album.month),
        albums: [album],
      });
    } else last.albums.push(album);
  }
  return groups;
}

function LoadingCards() {
  return (
    <div className="skeleton-grid" aria-busy="true">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

function CoverImage({ src, photoCount, t }) {
  const [failed, setFailed] = useState(false);
  if (!src && !(photoCount > 0)) return <span className="album-placeholder" />;
  if (!src || failed) {
    return (
      <span className="picture-failed">
        {t("This picture cannot be shown.")}
      </span>
    );
  }
  return <img src={src} alt="" onError={() => setFailed(true)} />;
}

function AlbumCard({ album, person, onTogglePrivacy, t }) {
  const owned = person && album.ownerId === person.id;
  const named = Boolean(album.name);
  const fullName = named ? album.name : album.albumDate;
  const href = `#/albums/${encodeURIComponent(album.id)}`;
  return (
    <article className="album-card" data-region="card" data-album-id={album.id}>
      <div className="album-cover">
        <a
          className="album-link"
          href={href}
          data-album-id={album.id}
          aria-label={fullName}
        >
          <CoverImage
            src={album.coverImageUrl}
            photoCount={album.photoCount}
            t={t}
          />
          <span className="album-line">
            <span className="truncate full-name" data-full={fullName}>
              {fullName}
            </span>
            {album.dateAssigned ? (
              <abbr className="assigned" title="Date assigned">
                {t("Assigned")}
              </abbr>
            ) : null}
            <span className="count">{album.photoCount}</span>
          </span>
        </a>
        {owned && typeof album.public === "boolean" ? (
          <button
            type="button"
            className="privacy-control"
            aria-label={t(
              album.public ? "Make album private" : "Mark album public",
            )}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onTogglePrivacy(album);
            }}
          >
            {t(album.public ? "Public" : "Private")}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function DateGroups({ albums, person, onTogglePrivacy, t, language }) {
  return monthGroups(albums, language).map((group) => (
    <section className="month" key={group.key}>
      <h2 data-year={group.year} data-month={group.month}>
        {group.label}
      </h2>
      <div className="album-grid">
        {group.albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            person={person}
            onTogglePrivacy={onTogglePrivacy}
            t={t}
          />
        ))}
      </div>
    </section>
  ));
}

function EmptyFlourish({ language }) {
  return (
    <div className="flourish" aria-hidden="true">
      <span className="flourish-arc" />
      <span className="flourish-arc flourish-arc-inner" />
      <span className="mark">{language === "zh" ? "照" : "P"}</span>
    </div>
  );
}

export function LibraryScreen({
  albums = [],
  namedAlbums = [],
  person = null,
  loading = false,
  language = "en",
  onTogglePrivacy,
  onAddPhotos,
  onSignIn,
  t = (sentence) => sentence,
}) {
  if (loading) return <LoadingCards />;
  const noPictures = albums.length === 0;
  const noNamed = namedAlbums.length === 0;
  if (!person && noPictures && noNamed) {
    return (
      <section className="empty">
        <EmptyFlourish language={language} />
        <p>{t("There are no public photos.")}</p>
        <button type="button" onClick={onSignIn}>
          {t("Sign in")}
        </button>
      </section>
    );
  }
  if (person && noPictures && noNamed) {
    return (
      <section className="empty">
        <EmptyFlourish language={language} />
        <p>{t("Add photos to organize them by the day they were taken.")}</p>
        <button type="button" onClick={onAddPhotos}>
          {t("Add photos")}
        </button>
      </section>
    );
  }
  return (
    <div>
      {noPictures ? (
        <section className="empty">
          <EmptyFlourish language={language} />
          <p>{t("Add photos to organize them by the day they were taken.")}</p>
          {person ? (
            <button type="button" onClick={onAddPhotos}>
              {t("Add photos")}
            </button>
          ) : null}
        </section>
      ) : (
        <DateGroups
          albums={albums}
          person={person}
          onTogglePrivacy={onTogglePrivacy}
          t={t}
          language={language}
        />
      )}
      {person || namedAlbums.length > 0 ? (
        <section className="named-albums">
          <h2>{t("Albums")}</h2>
          {noNamed ? (
            <p>{t("No named albums yet. Use New album to make one.")}</p>
          ) : (
            <div className="album-grid">
              {namedAlbums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  person={person}
                  onTogglePrivacy={onTogglePrivacy}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
