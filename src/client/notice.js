export function handoffBatchNotice(notice, { fromAlbum }) {
  return {
    pendingNotice: notice,
    nextHash: fromAlbum ? "#/" : null,
  };
}

export function consumePendingNotice(pendingNotice) {
  return {
    notice: pendingNotice ?? "",
    pendingNotice: "",
  };
}
