export function nextAppearance(appearance) {
  return appearance === "dark" ? "light" : "dark";
}

export function applyAppearance(root, appearance) {
  const mode = appearance === "dark" ? "dark" : "light";
  root.classList.toggle("dark", mode === "dark");
  root.dataset.appearance = mode;
  return mode;
}
