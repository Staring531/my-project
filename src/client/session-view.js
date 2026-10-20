import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function SecretField({ autoComplete }) {
  return h(
    "label",
    null,
    "Secret ",
    h("input", {
      name: "secret",
      type: "password",
      autoComplete,
      required: true,
    }),
  );
}

export function AccountPanel({ signInError = "", accountError = "" }) {
  return h(
    "section",
    { className: "account" },
    h(
      "form",
      { id: "create-account" },
      h("h2", null, "Create an account"),
      accountError
        ? h("p", { className: "error", role: "alert" }, accountError)
        : null,
      h(
        "label",
        null,
        "Name ",
        h("input", { name: "name", autoComplete: "username", required: true }),
      ),
      h(SecretField, { autoComplete: "new-password" }),
      h("button", { type: "submit" }, "Create account"),
    ),
    h(
      "form",
      { id: "sign-in" },
      h("h2", null, "Sign in"),
      signInError
        ? h("p", { className: "error", role: "alert" }, signInError)
        : null,
      h(
        "label",
        null,
        "Name ",
        h("input", { name: "name", autoComplete: "username", required: true }),
      ),
      h(SecretField, { autoComplete: "current-password" }),
      h("button", { type: "submit" }, "Sign in"),
    ),
  );
}

export function renderAccountPanel(options = {}) {
  return renderToStaticMarkup(
    h(AccountPanel, {
      signInError: options.signInError ?? "",
      accountError: options.accountError ?? "",
    }),
  );
}
