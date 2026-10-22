import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readPreferences,
  writePreference,
} from "../../src/client/preferences.js";

function memory(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    data,
  };
}

describe("preferences", () => {
  it("starts on light appearance and Chinese", () => {
    assert.deepEqual(readPreferences(memory()), {
      appearance: "light",
      language: "zh",
    });
  });

  it("remembers each choice and leaves the other one in place", () => {
    const storage = memory();
    assert.deepEqual(writePreference(storage, "language", "en"), {
      appearance: "light",
      language: "en",
    });
    assert.equal(storage.data.has("organizer-appearance"), false);
    assert.deepEqual(writePreference(storage, "appearance", "dark"), {
      appearance: "dark",
      language: "en",
    });
    assert.equal(storage.data.get("organizer-language"), "en");
    assert.deepEqual(readPreferences(storage), {
      appearance: "dark",
      language: "en",
    });
  });

  it("keeps only light, dark, Chinese, and English", () => {
    const storage = memory({
      "organizer-appearance": "blue",
      "organizer-language": "fr",
    });
    assert.deepEqual(readPreferences(storage), {
      appearance: "light",
      language: "zh",
    });
    writePreference(storage, "appearance", "blue");
    writePreference(storage, "language", "fr");
    assert.deepEqual(readPreferences(storage), {
      appearance: "light",
      language: "zh",
    });
  });
});
