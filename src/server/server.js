import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { authenticate, createAccount } from "./accounts.js";
import { openDatabase } from "./db.js";
import {
  imagesDirectory,
  isSingleFileName,
  mediaTypeForName,
} from "./files.js";
import {
  addPhoto,
  addPhotoToNamedAlbum,
  canSee,
  createNamedAlbum,
  deletePhoto,
  listAlbumPhotos,
  listAlbums,
  listNamedAlbums,
  makeAlbumPrivate,
  markAlbumPublic,
  markPhotoPublic,
  photoByStoredName,
} from "./library.js";
import {
  cookieHeader,
  createSession,
  deleteSession,
  personForToken,
  tokenFromRequest,
} from "./sessions.js";

const MISSING_ALBUM = "No album exists for that date.";
const MISSING_NAMED_ALBUM = "No album exists for that id.";
const MISSING_PHOTO = "No photo exists for that id.";
const MISSING_IMAGE = "That image is not available.";
const CREATE_ALBUM_REQUIRED = "Sign in to create an album.";
const ALBUM_NAME = "Enter an album name of 1 to 64 characters.";
const ALBUM_NAME_TAKEN = "An album with that name already exists.";
const ADD_TO_ALBUM_REQUIRED = "Sign in to add a picture to an album.";
const ADD_TO_ALBUM_OWNER = "Only the owner can add pictures to that album.";
const CHANGE_ALBUM_REQUIRED = "Sign in to change an album.";
const PRIVATE_OWNER = "Only the owner can make that album private.";
const DELETE_REQUIRED = "Sign in to delete a picture.";
const DELETE_OWNER = "Only the owner can delete that picture.";
const SIGN_IN_FAILED = "Could not sign in.";
const SIGN_IN_REQUIRED = "Sign in to continue.";
const ADD_REQUIRED = "Sign in to add photos.";
const ALBUM_OWNER = "Only the owner can mark that album public.";
const PHOTO_OWNER = "Only the owner can mark that photo public.";
const distDirectory = path.resolve("dist");

function errorMessage(error, dataDir) {
  const message =
    error instanceof Error ? error.message : "Could not store the photo.";
  if (!message.includes("readonly database")) return message;
  const databasePath = path.join(dataDir, "library.sqlite");
  return `Could not write the library database at ${databasePath}: ${message}`;
}

function sendJson(res, status, body, extra = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    ...extra,
  });
  res.end(payload);
}

function sendEmpty(res, status, extra = {}) {
  res.writeHead(status, extra);
  res.end();
}

async function readJsonBody(req) {
  const bytes = await readBody(req);
  try {
    return JSON.parse(bytes.toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function sendBytes(res, status, body, mediaType) {
  res.writeHead(status, {
    "content-type": mediaType,
    "content-length": body.length,
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function originalNameFrom(req) {
  const header = req.headers["x-original-name"];
  if (typeof header !== "string" || header.length === 0) return "photo";
  try {
    return decodeURIComponent(header);
  } catch {
    return header;
  }
}

function resolveImage(dataDir, name) {
  if (!isSingleFileName(name)) return null;
  const directory = path.resolve(imagesDirectory(dataDir));
  const full = path.resolve(directory, name);
  if (full !== path.join(directory, name)) return null;
  if (!existsSync(full)) return null;
  return full;
}

function contentTypeForStatic(filePath) {
  const extension = path.extname(filePath);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

function serveStatic(res, pathname) {
  if (!existsSync(distDirectory)) return false;
  const requested = pathname === "/" ? "/index.html" : pathname;
  const full = path.resolve(distDirectory, `.${requested}`);
  if (full !== distDirectory && !full.startsWith(`${distDirectory}${path.sep}`))
    return false;
  if (!existsSync(full) || !full.startsWith(distDirectory)) return false;
  sendBytes(res, 200, readFileSync(full), contentTypeForStatic(full));
  return true;
}

export function createHandler({ db, dataDir }) {
  return async function handle(req, res) {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      sendJson(res, 404, { error: MISSING_IMAGE });
      return;
    }
    const person = personForToken(db, tokenFromRequest(req));
    const viewerId = person?.id ?? null;

    if (req.method === "POST" && pathname === "/api/accounts") {
      const body = await readJsonBody(req);
      const created = createAccount(db, body);
      if (!created.ok) {
        sendJson(res, created.status, { error: created.error });
        return;
      }
      sendJson(res, 201, { person: created.person });
      return;
    }

    if (req.method === "POST" && pathname === "/api/session") {
      const body = await readJsonBody(req);
      const account = authenticate(db, body);
      if (!account) {
        sendJson(res, 401, { error: SIGN_IN_FAILED });
        return;
      }
      const token = createSession(db, account.id);
      sendJson(
        res,
        200,
        { person: account },
        { "set-cookie": cookieHeader(token) },
      );
      return;
    }

    if (req.method === "GET" && pathname === "/api/session") {
      if (!person) {
        sendJson(res, 401, { error: SIGN_IN_REQUIRED });
        return;
      }
      sendJson(res, 200, { person });
      return;
    }

    if (req.method === "DELETE" && pathname === "/api/session") {
      deleteSession(db, tokenFromRequest(req));
      sendEmpty(res, 204, { "set-cookie": cookieHeader(null) });
      return;
    }

    if (req.method === "GET" && pathname === "/api/albums") {
      sendJson(res, 200, {
        albums: listAlbums(db, viewerId, dataDir),
        namedAlbums: listNamedAlbums(db, viewerId),
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/albums") {
      const body = await readJsonBody(req);
      const created = createNamedAlbum(db, viewerId, body.name);
      if (created.status === "unauthorized") {
        sendJson(res, 401, { error: CREATE_ALBUM_REQUIRED });
        return;
      }
      if (created.status === "invalid") {
        sendJson(res, 400, { error: ALBUM_NAME });
        return;
      }
      if (created.status === "conflict") {
        sendJson(res, 409, { error: ALBUM_NAME_TAKEN });
        return;
      }
      sendJson(res, 201, { album: created.album });
      return;
    }

    const albumPublication = /^\/api\/albums\/([^/]+)\/publication$/.exec(
      pathname,
    );
    if (req.method === "DELETE" && albumPublication) {
      if (!person) {
        sendJson(res, 401, { error: CHANGE_ALBUM_REQUIRED });
        return;
      }
      const madePrivate = makeAlbumPrivate(db, viewerId, albumPublication[1]);
      if (madePrivate.status === "missing") {
        sendJson(res, 404, {
          error:
            madePrivate.scope === "named" ? MISSING_NAMED_ALBUM : MISSING_ALBUM,
        });
        return;
      }
      if (madePrivate.status !== "ok") {
        sendJson(res, 403, { error: PRIVATE_OWNER });
        return;
      }
      sendJson(res, 200, { album: madePrivate.album });
      return;
    }

    if (req.method === "POST" && albumPublication) {
      if (!person) {
        sendJson(res, 401, { error: SIGN_IN_REQUIRED });
        return;
      }
      const marked = markAlbumPublic(db, viewerId, albumPublication[1]);
      if (marked.status === "missing") {
        sendJson(res, 404, {
          error: marked.scope === "named" ? MISSING_NAMED_ALBUM : MISSING_ALBUM,
        });
        return;
      }
      if (marked.status !== "ok") {
        sendJson(res, 403, { error: ALBUM_OWNER });
        return;
      }
      sendJson(res, 200, { album: marked.album });
      return;
    }

    const albumPhotos = /^\/api\/albums\/([^/]+)\/photos$/.exec(pathname);
    if (req.method === "POST" && albumPhotos) {
      const body = await readJsonBody(req);
      const placed = addPhotoToNamedAlbum(
        db,
        viewerId,
        albumPhotos[1],
        body.photoId,
      );
      if (placed.status === "unauthorized") {
        sendJson(res, 401, { error: ADD_TO_ALBUM_REQUIRED });
        return;
      }
      if (placed.status === "forbidden") {
        sendJson(res, 403, { error: ADD_TO_ALBUM_OWNER });
        return;
      }
      if (placed.status === "missing-photo") {
        sendJson(res, 404, { error: MISSING_PHOTO });
        return;
      }
      if (placed.status === "missing") {
        sendJson(res, 404, { error: MISSING_NAMED_ALBUM });
        return;
      }
      const status = placed.status === "added" ? 201 : 200;
      sendJson(res, status, { status: placed.status, album: placed.album });
      return;
    }

    if (req.method === "GET" && albumPhotos) {
      const result = listAlbumPhotos(db, albumPhotos[1], viewerId);
      if (!result || result.missing) {
        sendJson(res, 404, {
          error:
            result?.missing === "named" ? MISSING_NAMED_ALBUM : MISSING_ALBUM,
        });
        return;
      }
      sendJson(res, 200, result);
      return;
    }

    const photoItem = /^\/api\/photos\/([^/]+)$/.exec(pathname);
    if (req.method === "DELETE" && photoItem) {
      if (!person) {
        sendJson(res, 401, { error: DELETE_REQUIRED });
        return;
      }
      const removed = deletePhoto(db, {
        dataDir,
        viewerId,
        photoId: photoItem[1],
      });
      if (removed.status === "missing") {
        sendJson(res, 404, { error: MISSING_PHOTO });
        return;
      }
      if (removed.status !== "deleted") {
        sendJson(res, 403, { error: DELETE_OWNER });
        return;
      }
      sendEmpty(res, 204);
      return;
    }

    const photoPublication = /^\/api\/photos\/([^/]+)\/publication$/.exec(
      pathname,
    );
    if (req.method === "POST" && photoPublication) {
      if (!person) {
        sendJson(res, 401, { error: SIGN_IN_REQUIRED });
        return;
      }
      const marked = markPhotoPublic(db, viewerId, photoPublication[1]);
      if (marked.status === "missing") {
        sendJson(res, 404, { error: MISSING_PHOTO });
        return;
      }
      if (marked.status !== "ok") {
        sendJson(res, 403, { error: PHOTO_OWNER });
        return;
      }
      sendJson(res, 200, { photo: marked.photo });
      return;
    }

    if (req.method === "POST" && pathname === "/api/photos") {
      if (!person) {
        sendJson(res, 401, { error: ADD_REQUIRED });
        return;
      }
      const bytes = await readBody(req);
      const result = await addPhoto(db, {
        dataDir,
        bytes,
        originalName: originalNameFrom(req),
        addedAt: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ownerId: viewerId,
      });
      if (result.status === "unauthorized") {
        sendJson(res, 401, { error: ADD_REQUIRED });
        return;
      }
      const status =
        result.status === "added"
          ? 201
          : result.status === "duplicate"
            ? 200
            : 422;
      sendJson(res, status, result);
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/images/")) {
      const name = pathname.slice("/images/".length);
      const filePath = resolveImage(dataDir, name);
      const row = photoByStoredName(db, name);
      if (!filePath || !canSee(db, row, viewerId)) {
        sendJson(res, 404, { error: MISSING_IMAGE });
        return;
      }
      sendBytes(res, 200, readFileSync(filePath), mediaTypeForName(name));
      return;
    }

    if (req.method === "GET" && serveStatic(res, pathname)) return;
    sendJson(res, 404, { error: "No route exists for that request." });
  };
}

export function startServer({ dataDir, port = 0 } = {}) {
  const db = openDatabase(dataDir);
  const server = http.createServer((req, res) => {
    Promise.resolve(createHandler({ db, dataDir })(req, res)).catch((error) => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: errorMessage(error, dataDir) });
      }
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        port: typeof address === "object" && address ? address.port : port,
        close() {
          db.close();
          return new Promise((done, fail) => {
            server.close((error) => (error ? fail(error) : done()));
          });
        },
      });
    });
  });
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const dataDir = process.env.DATA_DIR ?? "data";
  const port = Number(process.env.PORT ?? 3000);
  const started = await startServer({ dataDir, port });
  console.log(`Photo library listening on http://127.0.0.1:${started.port}`);
}
