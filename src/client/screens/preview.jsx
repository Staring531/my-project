import { Button } from "@/components/ui/button";

export function PreviewScreen({
  picture,
  onClose,
  t = (sentence) => sentence,
}) {
  if (!picture) return null;
  return (
    <div className="preview" role="dialog" aria-label="Enlarged picture">
      <Button
        type="button"
        className="preview-close"
        variant="secondary"
        data-close-preview=""
        onClick={onClose}
      >
        {t("Close")}
      </Button>
      <button
        type="button"
        className="preview-backdrop"
        aria-label="Close enlarged picture"
        onClick={onClose}
      />
      {picture.failed ? (
        <p>{t("This picture cannot be shown.")}</p>
      ) : (
        <img
          src={picture.imageUrl}
          alt=""
          data-preview-fit="contain"
          onError={picture.onError}
        />
      )}
    </div>
  );
}
