async function readJson(response) {
  if (response.status === 204) return { status: response.status, body: {} };
  const body = await response.json();
  return { status: response.status, body };
}

export async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
  });
  const result = await readJson(response);
  if (!response.ok && result.body.error) {
    const error = new Error(result.body.error);
    error.status = response.status;
    error.body = result.body;
    throw error;
  }
  return result;
}

export function summarizeBatch(results) {
  const summary = { added: 0, duplicates: 0, skipped: 0, errors: [] };
  for (const result of results) {
    if (result.statusCode === 201 && result.body.status === "added")
      summary.added += 1;
    else if (result.statusCode === 200 && result.body.status === "duplicate")
      summary.duplicates += 1;
    else if (result.statusCode === 422 && result.body.status === "skipped")
      summary.skipped += 1;
    else if (result.body?.error) summary.errors.push(result.body.error);
    else summary.errors.push("Could not store the photo.");
  }
  return summary;
}

export function getAlbums() {
  return requestJson("/api/albums");
}

export function getAlbumPhotos(albumId) {
  return requestJson(`/api/albums/${encodeURIComponent(albumId)}/photos`);
}

export function getSession() {
  return requestJson("/api/session");
}

export function createAccount(name, secret) {
  return requestJson("/api/accounts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, secret }),
  });
}

export function signIn(name, secret) {
  return requestJson("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, secret }),
  });
}

export function signOut() {
  return requestJson("/api/session", { method: "DELETE" });
}

export function publishAlbum(albumId) {
  return requestJson(`/api/albums/${encodeURIComponent(albumId)}/publication`, {
    method: "POST",
  });
}

export function createNamedAlbum(name) {
  return requestJson("/api/albums", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function addPhotoToNamedAlbum(albumId, photoId) {
  return requestJson(`/api/albums/${encodeURIComponent(albumId)}/photos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ photoId }),
  });
}

export function deletePhoto(photoId) {
  return requestJson(`/api/photos/${encodeURIComponent(photoId)}`, {
    method: "DELETE",
  });
}

export function makeAlbumPrivate(albumId) {
  return requestJson(`/api/albums/${encodeURIComponent(albumId)}/publication`, {
    method: "DELETE",
  });
}

export function publishPhoto(photoId) {
  return requestJson(`/api/photos/${encodeURIComponent(photoId)}/publication`, {
    method: "POST",
  });
}

export async function decodeDisplayableImage(file) {
  if (typeof createImageBitmap !== "function") return;
  const bitmap = await createImageBitmap(file);
  if (typeof bitmap.close === "function") bitmap.close();
}

async function postPhotoFile(file) {
  const bytes = await file.arrayBuffer();
  try {
    const response = await fetch("/api/photos", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": file.type || "application/octet-stream",
        "x-original-name": encodeURIComponent(file.name),
      },
      body: bytes,
    });
    const { body } = await readJson(response);
    return { statusCode: response.status, body };
  } catch (error) {
    return {
      statusCode: 0,
      body: {
        error:
          error instanceof Error ? error.message : "Could not store the photo.",
      },
    };
  }
}

export async function addPhotoBatch(files, options = {}) {
  const decode = options.decode ?? decodeDisplayableImage;
  const post = options.post ?? postPhotoFile;
  const results = [];
  for (const file of files) {
    try {
      await decode(file);
    } catch {
      results.push({
        statusCode: 422,
        body: { status: "skipped", reason: "unreadable" },
      });
      continue;
    }
    results.push(await post(file));
  }
  return summarizeBatch(results);
}
