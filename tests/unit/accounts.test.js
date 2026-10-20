import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";
import {
  authenticate,
  createAccount,
  hashSecret,
} from "../../src/server/accounts.js";
import { openDatabase } from "../../src/server/db.js";
import { createSession } from "../../src/server/sessions.js";
import { removeDir, tempDataDir } from "../helpers.js";

const cheap = { N: 16, r: 1, p: 1 };

describe("accounts", () => {
  it("rejects an empty name or secret and a duplicate name", async () => {
    const dataDir = await tempDataDir();
    const db = openDatabase(dataDir);
    try {
      assert.equal(
        createAccount(db, { name: " ", secret: "secret" }, cheap).ok,
        false,
      );
      assert.equal(
        createAccount(db, { name: "Ada", secret: "" }, cheap).ok,
        false,
      );
      const created = createAccount(
        db,
        { name: " Ada ", secret: "secret" },
        cheap,
      );
      assert.equal(created.ok, true);
      assert.equal(created.person.name, "Ada");
      const row = db
        .prepare("SELECT secret_hash FROM people WHERE id = ?")
        .get(created.person.id);
      assert.notEqual(row.secret_hash, "secret");
      assert.match(row.secret_hash, /^scrypt\$/);
      assert.equal(hashSecret("secret", cheap).includes("secret"), false);
      const duplicate = createAccount(
        db,
        { name: "Ada", secret: "other" },
        cheap,
      );
      assert.equal(duplicate.ok, false);
      assert.equal(duplicate.status, 409);
      assert.equal(
        authenticate(db, { name: "missing", secret: "secret" }),
        null,
      );
      assert.equal(authenticate(db, { name: "Ada", secret: "wrong" }), null);
      const person = authenticate(db, { name: "Ada", secret: "secret" });
      assert.equal(person.id, created.person.id);
      const before = db
        .prepare("SELECT COUNT(*) AS count FROM sessions")
        .get().count;
      assert.equal(before, 0);
      createSession(db, person.id);
      assert.equal(
        db.prepare("SELECT COUNT(*) AS count FROM sessions").get().count,
        1,
      );
      assert.equal(randomUUID().length > 0, true);
    } finally {
      db.close();
      await removeDir(dataDir);
    }
  });
});
