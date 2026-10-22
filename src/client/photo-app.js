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
