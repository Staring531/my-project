import { presentNotice } from "./screen-state.js";

export function skipSentence(skipped) {
  if (!skipped) return "";
  return skipped === 1
    ? "1 item was skipped."
    : `${skipped} items were skipped.`;
}

export function duplicateSentence(duplicates) {
  if (!duplicates) return "";
  return "This picture is already in the library.";
}

export function handoffBatchNotice(notice, { fromAlbum }) {
  return {
    pendingNotice: notice,
    nextHash: fromAlbum ? "#/" : null,
  };
}

export function consumePendingNotice(pendingNotice) {
  return {
    notice: pendingNotice ?? null,
    pendingNotice: pendingNotice ?? null,
  };
}

export function noticeFromBatch(batch) {
  return presentNotice(batch);
}

export function closeNotice() {
  return null;
}

export function replaceNotice(batch) {
  return presentNotice(batch);
}
