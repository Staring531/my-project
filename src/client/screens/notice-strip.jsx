import { Button } from "@/components/ui/button";
import { duplicateSentence, skipSentence } from "../notice.js";

export function NoticeStrip({ notice, onClose, t = (sentence) => sentence }) {
  if (!notice) return null;
  const skipped = t(skipSentence(notice.skipped));
  const duplicate = t(duplicateSentence(notice.duplicates));
  return (
    <div className="notice-strip" role="status" data-region="strip">
      <div className="notice-copy">
        {skipped ? <p className="notice-skip">{skipped}</p> : null}
        {duplicate ? <p className="notice-skip">{duplicate}</p> : null}
        {notice.errors?.map((error) => (
          <p className="notice-error" role="alert" key={error}>
            {t(error)}
          </p>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="notice-close"
        onClick={() => {
          onClose();
          queueMicrotask(() => {
            const main =
              document.getElementById("add-photos") ||
              document.getElementById("sign-in");
            main?.focus();
          });
        }}
      >
        {t("Close")}
      </Button>
    </div>
  );
}
