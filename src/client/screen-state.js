export const NARROW_MAX = 639;

const MENU_OVERLAYS = new Set(["picture-menu", "more", "new-album"]);

export function openSurface({ sessionUnauthorized, route, album, picture }) {
  if (picture) return "Enlarged picture";
  if (route === "album" && album?.name) return "Named album";
  if (route === "album") return "Date album";
  if (sessionUnauthorized) return "Signed-out library";
  return "Signed-in library";
}

export function isNarrow(width) {
  return width <= NARROW_MAX;
}

const DIALOG_OVERLAYS = new Set(["sign-in", "delete", "add-pictures"]);

export function overlayAfterResize(overlay, fromWidth, toWidth) {
  const crossed = isNarrow(fromWidth) !== isNarrow(toWidth);
  if (!crossed || !overlay) return overlay;
  if (MENU_OVERLAYS.has(overlay.type)) return null;
  return overlay;
}

export function underlyingSurface(input) {
  if (!input.picture) return openSurface(input);
  return openSurface({ ...input, picture: null });
}

export function openOverlay(current, next) {
  if (!next) return null;
  if (current?.type === "enlarged-picture" && DIALOG_OVERLAYS.has(next.type)) {
    return { type: next.type, under: { type: "enlarged-picture" } };
  }
  return { type: next.type };
}

export function overlaysOpen(overlay) {
  if (!overlay) return [];
  return overlay.under ? [overlay.under.type, overlay.type] : [overlay.type];
}

export function presentNotice(batch) {
  if (!batch) return null;
  const duplicates = batch.duplicates ?? 0;
  const skipped = batch.skipped ?? 0;
  const errors = batch.errors ?? [];
  if (!duplicates && !skipped && errors.length === 0) return null;
  return { duplicates, skipped, errors };
}
