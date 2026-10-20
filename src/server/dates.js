export function isRealCalendarDay(albumDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(albumDate);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function parts(albumDate) {
  if (!isRealCalendarDay(albumDate)) {
    throw new Error(`Could not read a calendar day from ${albumDate}.`);
  }
  const [year, month] = albumDate.split("-");
  return { year: Number(year), month: Number(month) };
}

export function albumFieldsFromTaken(raw) {
  if (typeof raw !== "string") return null;
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(
    raw.trim(),
  );
  if (!match) return null;
  const albumDate = `${match[1]}-${match[2]}-${match[3]}`;
  if (!isRealCalendarDay(albumDate)) return null;
  return {
    albumDate,
    takenAt: `${albumDate}T${match[4]}:${match[5]}:${match[6]}`,
  };
}

export function assignedAlbumDate(addedAt, timeZone) {
  const instant = new Date(addedAt);
  if (Number.isNaN(instant.getTime())) {
    throw new Error(`Could not read the add time ${addedAt}.`);
  }
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
  if (!isRealCalendarDay(formatted)) {
    throw new Error(`Could not assign a calendar day for ${addedAt}.`);
  }
  return formatted;
}
