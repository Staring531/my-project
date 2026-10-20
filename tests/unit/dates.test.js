import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  albumFieldsFromTaken,
  assignedAlbumDate,
  parts,
} from "../../src/server/dates.js";

describe("calendar dates", () => {
  it("keeps the recorded EXIF day, including a time near midnight", () => {
    assert.deepEqual(albumFieldsFromTaken("2026:10:15 23:30:00"), {
      albumDate: "2026-10-15",
      takenAt: "2026-10-15T23:30:00",
    });
    assert.deepEqual(albumFieldsFromTaken("2026:10:16 00:05:00"), {
      albumDate: "2026-10-16",
      takenAt: "2026-10-16T00:05:00",
    });
    assert.equal(parts("2026-10-15").year, 2026);
    assert.equal(parts("2026-10-15").month, 10);
  });

  it("assigns the calendar day of the add instant in the given timezone", () => {
    assert.equal(
      assignedAlbumDate("2026-10-15T02:30:00.000Z", "America/Los_Angeles"),
      "2026-10-14",
    );
    assert.equal(
      assignedAlbumDate("2026-10-15T02:30:00.000Z", "UTC"),
      "2026-10-15",
    );
  });
});
