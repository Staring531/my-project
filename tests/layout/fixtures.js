export const person = { id: "owner-1", name: "Ada" };

export const dateAlbum = {
  id: "owner-1:2026-10-16:0",
  albumDate: "2026-10-16",
  year: 2026,
  month: 10,
  photoCount: 1,
  dateAssigned: true,
  coverImageUrl: "/images/cover.jpg",
  ownerId: "owner-1",
  public: true,
};

export const namedAlbum = {
  id: "named:one",
  name: "Trip",
  photoCount: 0,
  coverImageUrl: null,
  ownerId: "owner-1",
  public: false,
};

export const photo = {
  id: "pic-1",
  albumId: dateAlbum.id,
  imageUrl: "/images/pic-1.jpg",
  ownerId: "owner-1",
  public: false,
  takenAt: "2026-10-16T09:30:00",
};

export function libraryBody({
  albums = [dateAlbum],
  namedAlbums = [namedAlbum],
} = {}) {
  return { albums, namedAlbums };
}
