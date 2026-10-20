import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function detectMediaType(bytes) {
  if (!bytes || bytes.length === 0) return null;
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 6) {
    const header = bytes.toString("ascii", 0, 6);
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function extensionForMediaType(mediaType) {
  const extension = EXTENSIONS[mediaType];
  if (!extension) {
    throw new Error(
      `Could not store the photo: ${mediaType} is not a supported picture.`,
    );
  }
  return extension;
}

export function imagesDirectory(dataDir) {
  return path.join(dataDir, "images");
}

export function isSingleFileName(name) {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name === path.basename(name) &&
    !name.includes("..") &&
    !name.includes("/") &&
    !name.includes("\\") &&
    /^[A-Za-z0-9.-]+$/.test(name)
  );
}

export function writeImage(dataDir, storedName, bytes) {
  if (!isSingleFileName(storedName)) {
    throw new Error(
      "Could not store the photo: stored name contained a path separator.",
    );
  }
  const directory = imagesDirectory(dataDir);
  mkdirSync(directory, { recursive: true });
  const destination = path.join(directory, storedName);
  const temporary = `${destination}.partial`;
  writeFileSync(temporary, bytes);
  renameSync(temporary, destination);
}

export function removeImage(dataDir, storedName) {
  if (!isSingleFileName(storedName)) return;
  const directory = imagesDirectory(dataDir);
  for (const name of [storedName, `${storedName}.partial`]) {
    try {
      rmSync(path.join(directory, name), { force: true });
    } catch {
      // A failed cleanup must not replace the error that stopped the add.
    }
  }
}

export function deleteImage(dataDir, storedName) {
  if (!isSingleFileName(storedName)) {
    throw new Error(
      "Could not delete the picture: stored name was not a single file.",
    );
  }
  const destination = path.join(imagesDirectory(dataDir), storedName);
  if (!existsSync(destination)) {
    throw new Error("Could not delete the picture: the image file is missing.");
  }
  rmSync(destination);
}

export function mediaTypeForName(storedName) {
  const extension = path.extname(storedName).slice(1);
  return (
    Object.entries(EXTENSIONS).find(([, value]) => value === extension)?.[0] ??
    "application/octet-stream"
  );
}
