import {
  existsSync,
  mkdirSync,
  readFileSync,
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

const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function readU16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32BE(bytes, offset) {
  return (
    bytes[offset] * 0x1000000 +
    ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
  );
}

function readU32LE(bytes, offset) {
  return (
    (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)) +
    bytes[offset + 3] * 0x1000000
  );
}

function ascii(bytes, start, end) {
  let text = "";
  for (let index = start; index < end; index += 1) {
    text += String.fromCharCode(bytes[index]);
  }
  return text;
}

function jpegIsShowable(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return false;
  let offset = 2;
  let hasFrame = false;
  let sawEntropy = false;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return false;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return false;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9) return hasFrame && sawEntropy;
    if (marker === 0x00) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) return false;
    const size = readU16BE(bytes, offset);
    if (size < 2 || offset + size > bytes.length) return false;
    if (SOF_MARKERS.has(marker)) {
      if (size < 7) return false;
      const height = readU16BE(bytes, offset + 3);
      const width = readU16BE(bytes, offset + 5);
      if (width === 0 || height === 0) return false;
      hasFrame = true;
    }
    if (marker === 0xda) {
      offset += size;
      while (offset < bytes.length) {
        if (bytes[offset] !== 0xff) {
          sawEntropy = true;
          offset += 1;
          continue;
        }
        if (offset + 1 >= bytes.length) return false;
        const next = bytes[offset + 1];
        if (next === 0x00) {
          sawEntropy = true;
          offset += 2;
          continue;
        }
        if (next >= 0xd0 && next <= 0xd7) {
          offset += 2;
          continue;
        }
        break;
      }
      continue;
    }
    offset += size;
  }
  return false;
}

function pngIsShowable(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < signature.length) return false;
  for (let index = 0; index < signature.length; index += 1) {
    if (bytes[index] !== signature[index]) return false;
  }
  let offset = signature.length;
  let width = 0;
  let height = 0;
  let hasPixels = false;
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const length = readU32BE(bytes, offset);
    const type = ascii(bytes, offset + 4, offset + 8);
    const next = offset + 12 + length;
    if (next > bytes.length) return false;
    if (type === "IHDR" && length >= 8) {
      width = readU32BE(bytes, offset + 8);
      height = readU32BE(bytes, offset + 12);
    } else if (type === "IDAT" && length > 0) {
      hasPixels = true;
    } else if (type === "IEND") {
      ended = true;
      break;
    }
    offset = next;
  }
  return width > 0 && height > 0 && hasPixels && ended;
}

function gifIsShowable(bytes) {
  if (bytes.length < 13) return false;
  const header = ascii(bytes, 0, 6);
  if (header !== "GIF87a" && header !== "GIF89a") return false;
  const width = readU16LE(bytes, 6);
  const height = readU16LE(bytes, 8);
  if (width === 0 || height === 0) return false;
  for (let index = 13; index < bytes.length; index += 1) {
    if (bytes[index] === 0x2c) return true;
  }
  return false;
}

function webpFrameIsShowable(bytes, type, offset, size) {
  if (type === "VP8 ") {
    if (size < 10 || offset + 10 > bytes.length) return false;
    if ((bytes[offset] & 1) !== 0) return false;
    if (
      bytes[offset + 3] !== 0x9d ||
      bytes[offset + 4] !== 0x01 ||
      bytes[offset + 5] !== 0x2a
    ) {
      return false;
    }
    const width = readU16LE(bytes, offset + 6) & 0x3fff;
    const height = readU16LE(bytes, offset + 8) & 0x3fff;
    return width > 0 && height > 0;
  }
  if (type === "VP8L") {
    if (size < 5 || offset + 5 > bytes.length || bytes[offset] !== 0x2f) {
      return false;
    }
    const first = bytes[offset + 1];
    const second = bytes[offset + 2];
    const third = bytes[offset + 3];
    const fourth = bytes[offset + 4];
    const width = 1 + (((second & 0x3f) << 8) | first);
    const height =
      1 + (((fourth & 0x0f) << 10) | (third << 2) | ((second & 0xc0) >> 6));
    return width > 0 && height > 0;
  }
  return false;
}

function webpIsShowable(bytes) {
  if (bytes.length < 16) return false;
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 12) !== "WEBP") {
    return false;
  }
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, offset + 4);
    const size = readU32LE(bytes, offset + 4);
    const data = offset + 8;
    if (data + size > bytes.length) return false;
    if (webpFrameIsShowable(bytes, type, data, size)) return true;
    offset = data + size + (size % 2);
  }
  return false;
}

export function imageIsShowable(bytes) {
  const mediaType = detectMediaType(bytes);
  if (mediaType === "image/jpeg") return jpegIsShowable(bytes);
  if (mediaType === "image/png") return pngIsShowable(bytes);
  if (mediaType === "image/gif") return gifIsShowable(bytes);
  if (mediaType === "image/webp") return webpIsShowable(bytes);
  return false;
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

export function readStoredImage(dataDir, storedName) {
  if (!isSingleFileName(storedName)) return null;
  const full = path.join(imagesDirectory(dataDir), storedName);
  if (!existsSync(full)) return null;
  return readFileSync(full);
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
