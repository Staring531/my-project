import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { composingEnter } from "../keyboard.js";

export function AccountDialog({
  open,
  mode,
  name,
  message,
  narrow,
  onOpenChange,
  onMode,
  onSubmit,
  t = (sentence) => sentence,
}) {
  const nameRef = useRef(null);
  const creating = mode === "create";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        placement={narrow ? "top" : "center"}
        className="account-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("sign-in")?.focus();
        }}
      >
        <Button
          type="button"
          variant="ghost"
          className="dialog-close"
          onClick={() => onOpenChange(false)}
        >
          {t("Close")}
        </Button>
        <DialogHeader>
          <DialogTitle>
            {t(creating ? "Create account" : "Sign in")}
          </DialogTitle>
        </DialogHeader>
        {message ? (
          <p className="error" role="alert">
            {t(message)}
          </p>
        ) : null}
        <form
          className="grid gap-3"
          onKeyDown={(event) => {
            if (composingEnter(event)) event.preventDefault();
          }}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onSubmit({
              name: String(data.get("name") ?? ""),
              secret: String(data.get("secret") ?? ""),
            });
          }}
        >
          <label htmlFor="account-name">{t("Name")}</label>
          <Input
            id="account-name"
            ref={nameRef}
            name="name"
            defaultValue={name}
          />
          <label htmlFor="account-secret">{t("Secret")}</label>
          <Input
            id="account-secret"
            name="secret"
            type="password"
            autoComplete={creating ? "new-password" : "current-password"}
          />
          <Button type="submit">
            {t(creating ? "Create account" : "Sign in")}
          </Button>
          <button
            type="button"
            className="text-button"
            onClick={() => onMode(creating ? "sign-in" : "create")}
          >
            {t(creating ? "Sign in instead" : "Create an account")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
