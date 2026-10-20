import { createHash, randomBytes, randomUUID } from "node:crypto";

export function cookieHeader(token) {
  if (!token) {
    return "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
  }
  return `session=${token}; HttpOnly; SameSite=Lax; Path=/`;
}

export function tokenFromRequest(req) {
  const header = req.headers.cookie;
  if (typeof header !== "string") return null;
  const match = /(?:^|;\s*)session=([^;]+)/.exec(header);
  return match ? match[1] : null;
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession(db, personId) {
  const token = randomBytes(32).toString("hex");
  db.prepare(
    `INSERT INTO sessions (id, person_id, token_hash, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(randomUUID(), personId, tokenHash(token), new Date().toISOString());
  return token;
}

export function personForToken(db, token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT people.id AS id, people.name AS name
       FROM sessions
       JOIN people ON people.id = sessions.person_id
       WHERE sessions.token_hash = ?`,
    )
    .get(tokenHash(token));
  return row ?? null;
}

export function deleteSession(db, token) {
  if (!token) return;
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token));
}
