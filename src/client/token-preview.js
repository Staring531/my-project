import { applyAppearance, nextAppearance } from "./appearance.js";
import { semanticRoles, supportingAppearance } from "./token-roles.js";

export { nextAppearance };

export function renderTokenPreview(appearance = "light") {
  const mode = appearance === "dark" ? "dark" : "light";
  const rows = semanticRoles
    .map(
      (role) =>
        `<section class="role" data-role="${role.name}"><p>${role.name}</p><p class="surface" style="background: var(--${role.name}); color: var(--${role.textName})">${role.textName}</p></section>`,
    )
    .join("");
  const supports = supportingAppearance
    .map((item) => `<div data-support="${item.name}">${item.name}</div>`)
    .join("");
  return `<div class="token-page" data-appearance="${mode}"><div class="roles">${rows}</div><div class="supports">${supports}</div><button type="button" data-appearance-switch>${mode}</button></div>`;
}

function paint(root, appearance) {
  applyAppearance(document.documentElement, appearance);
  root.innerHTML = renderTokenPreview(appearance);
  root
    .querySelector("[data-appearance-switch]")
    .addEventListener("click", () => {
      paint(root, nextAppearance(appearance));
    });
}

if (typeof document !== "undefined") {
  const root = document.querySelector("#token-preview");
  if (root) paint(root, "light");
}
