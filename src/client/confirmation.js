export function confirmationClock() {
  if (typeof window !== "undefined" && window.__confirmationClock) {
    return window.__confirmationClock;
  }
  return globalThis;
}

export function armConfirmation(clock, onClear) {
  return clock.setTimeout(onClear, 4000);
}
