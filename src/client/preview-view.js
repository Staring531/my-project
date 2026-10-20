import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export function PreviewScreen({ picture }) {
  if (!picture) return null;
  const close = h(
    "button",
    { type: "button", "data-close-preview": "" },
    "Close",
  );
  if (picture.failed) {
    return h(
      "div",
      { className: "preview", "data-preview-fit": "contain" },
      h("p", null, "This picture cannot be shown."),
      close,
    );
  }
  return h(
    "div",
    { className: "preview", "data-preview-fit": "contain" },
    h("img", { src: picture.imageUrl, alt: "" }),
    close,
  );
}

export function renderPreview(picture) {
  if (!picture) return "";
  return renderToStaticMarkup(h(PreviewScreen, { picture }));
}
