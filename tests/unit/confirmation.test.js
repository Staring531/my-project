import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { armConfirmation } from "../../src/client/confirmation.js";

describe("confirmation clock", () => {
  it("clears the newest confirmation after four seconds", () => {
    const calls = [];
    const clock = {
      setTimeout(fn, delay) {
        calls.push({ fn, delay });
        return calls.length;
      },
    };
    const first = () => {};
    const second = () => {};
    armConfirmation(clock, first);
    const id = armConfirmation(clock, second);
    assert.equal(id, 2);
    assert.equal(calls[1].delay, 4000);
    let cleared = false;
    calls[1].fn();
    cleared = true;
    assert.equal(cleared, true);
    assert.equal(calls[0].fn, first);
  });
});
