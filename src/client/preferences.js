const appearanceKey = "organizer-appearance";
const languageKey = "organizer-language";

export function readPreferences(storage) {
  return {
    appearance: storage.getItem(appearanceKey) === "dark" ? "dark" : "light",
    language: storage.getItem(languageKey) === "en" ? "en" : "zh",
  };
}

export function writePreference(storage, field, value) {
  if (field === "appearance") {
    storage.setItem(appearanceKey, value === "dark" ? "dark" : "light");
  }
  if (field === "language") {
    storage.setItem(languageKey, value === "en" ? "en" : "zh");
  }
  return readPreferences(storage);
}
