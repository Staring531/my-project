import exifr from "exifr";

export async function readDateTimeOriginal(bytes) {
  try {
    const parsed = await exifr.parse(bytes, {
      pick: ["DateTimeOriginal"],
      reviveValues: false,
    });
    const value = parsed?.DateTimeOriginal;
    return typeof value === "string" ? value : null;
  } catch {
    // A picture can still be stored when its taken date cannot be read.
    // The caller then assigns the day the photo was added.
    return null;
  }
}
