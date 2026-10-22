import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, rm, stat } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { dateAlbum, libraryBody, person, photo } from "./fixtures.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
let built = false;

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function ensureBuild() {
  if (built) return;
  const lock = path.join(root, "dist", ".build-lock");
  await mkdir(path.dirname(lock), { recursive: true });
  for (;;) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 200));
      let locked = true;
      try {
        await stat(lock);
      } catch {
        locked = false;
      }
      if (!locked) {
        try {
          await stat(path.join(root, "dist", "index.html"));
          built = true;
          return;
        } catch {
          // The last build removed the output and has not written it yet.
        }
      }
    }
  }
  try {
    const viteBin = path.join(root, "node_modules", ".bin", "vite");
    const build = spawn(viteBin, ["build"], {
      cwd: root,
      stdio: "inherit",
    });
    const [code] = await once(build, "exit");
    if (code !== 0) throw new Error("vite build failed");
    built = true;
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

function fulfill(route, status, body) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function openOrganizer({
  signedIn = true,
  albums,
  namedAlbums,
  width = 960,
  height = 800,
  language = "en",
  allowCreate = false,
  allowDelete = false,
  pauseAlbums = false,
} = {}) {
  await ensureBuild();
  const port = await freePort();
  const preview = spawn(
    path.join(root, "node_modules", ".bin", "vite"),
    ["preview", "--port", String(port), "--strictPort", "--host", "127.0.0.1"],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );
  let previewLog = "";
  preview.stdout.on("data", (chunk) => {
    previewLog += chunk;
  });
  preview.stderr.on("data", (chunk) => {
    previewLog += chunk;
  });
  const started = Date.now();
  while (Date.now() - started < 10000) {
    if (preview.exitCode !== null) {
      throw new Error(`vite preview exited\n${previewLog}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.status < 500) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  let releaseAlbums = () => {};
  const albumsGate = pauseAlbums
    ? new Promise((resolve) => {
        releaseAlbums = resolve;
      })
    : null;
  if (language) {
    await page.addInitScript((value) => {
      localStorage.setItem("organizer-language", value);
    }, language);
  }
  const library = libraryBody({ albums, namedAlbums });
  await page.route("**/images/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("missing")) {
      return route.fulfill({ status: 404, body: "" });
    }
    return route.fulfill({
      status: 200,
      contentType: "image/png",
      body: png,
    });
  });
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === "/api/session" && route.request().method() === "GET") {
      if (!signedIn)
        return fulfill(route, 401, { error: "Sign in to continue." });
      return fulfill(route, 200, { person });
    }
    if (path === "/api/session" && route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      if (payload.secret !== "secret") {
        return fulfill(route, 401, { error: "Could not sign in." });
      }
      signedIn = true;
      return fulfill(route, 200, { person });
    }
    if (path === "/api/accounts" && route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      if (payload.name === "taken") {
        return fulfill(route, 409, {
          error: "An account with that name already exists.",
        });
      }
      return fulfill(route, 201, { person: { id: "new", name: payload.name } });
    }
    if (path === "/api/albums" && route.request().method() === "GET") {
      if (albumsGate) await albumsGate;
      return fulfill(route, 200, library);
    }
    if (path === "/api/albums" && route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      const name = String(payload?.name ?? "").trim();
      if (!name || name.length > 64) {
        return fulfill(route, 400, {
          error: "Enter an album name of 1 to 64 characters.",
        });
      }
      if (allowCreate) {
        const created = {
          id: `named:${name}`,
          name,
          photoCount: 0,
          coverImageUrl: null,
          ownerId: person.id,
          public: false,
        };
        library.namedAlbums = [...library.namedAlbums, created];
        return fulfill(route, 201, { album: created });
      }
      return fulfill(route, 409, {
        error: "An album with that name already exists.",
      });
    }
    if (path.endsWith("/photos") && route.request().method() === "GET") {
      return fulfill(route, 200, {
        album: { ...dateAlbum, photoCount: 1 },
        photos: [photo],
      });
    }
    if (
      path.startsWith("/api/photos/") &&
      route.request().method() === "DELETE"
    ) {
      if (allowDelete) return fulfill(route, 204, {});
      return fulfill(route, 404, { error: "No photo exists for that id." });
    }
    return fulfill(route, 204, {});
  });
  await page.goto(`http://127.0.0.1:${port}/`);
  return {
    page,
    releaseAlbums,
    async close() {
      await browser.close();
      preview.kill("SIGTERM");
    },
  };
}
