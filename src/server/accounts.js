import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const INVALID_ACCOUNT = "Enter an account name and a secret.";
const DUPLICATE_ACCOUNT = "An account with that name already exists.";

export function hashSecret(secret, cost = {}) {
  const N = cost.N ?? 16384;
  const r = cost.r ?? 8;
  const p = cost.p ?? 1;
  const salt = cost.salt ?? randomBytes(16);
  const hash = scryptSync(secret, salt, 32, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifySecret(secret, stored) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltHex, hashHex] = parts;
  const actual = scryptSync(secret, Buffer.from(saltHex, "hex"), 32, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  const expected = Buffer.from(hashHex, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function normalizeName(name) {
  return typeof name === "string" ? name.trim() : "";
}

export function accountError(name, secret) {
  if (name.length < 1 || name.length > 64 || secret.length < 1) {
    return INVALID_ACCOUNT;
  }
  return null;
}

export function createAccount(db, { name, secret }, cost) {
  const trimmed = normalizeName(name);
  const secretText = typeof secret === "string" ? secret : "";
  const invalid = accountError(trimmed, secretText);
  if (invalid) return { ok: false, status: 400, error: invalid };
  const existing = db
    .prepare("SELECT id FROM people WHERE name = ?")
    .get(trimmed);
  if (existing) return { ok: false, status: 409, error: DUPLICATE_ACCOUNT };
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  try {
    db.prepare(
      `INSERT INTO people (id, name, secret_hash, created_at)
       VALUES (?, ?, ?, ?)`,
    ).run(id, trimmed, hashSecret(secretText, cost), createdAt);
  } catch (error) {
    if (String(error?.message).includes("UNIQUE")) {
      return { ok: false, status: 409, error: DUPLICATE_ACCOUNT };
    }
    throw error;
  }
  return { ok: true, person: { id, name: trimmed } };
}

export function authenticate(db, { name, secret }) {
  const trimmed = normalizeName(name);
  const secretText = typeof secret === "string" ? secret : "";
  if (trimmed.length < 1 || secretText.length < 1) return null;
  const row = db
    .prepare("SELECT id, name, secret_hash FROM people WHERE name = ?")
    .get(trimmed);
  if (!row || !verifySecret(secretText, row.secret_hash)) return null;
  return { id: row.id, name: row.name };
}
