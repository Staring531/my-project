import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

function keepAppearanceOpen(event) {
  const target = event.target;
  if (
    target instanceof Element &&
    target.closest("#appearance-switch, #language-switch")
  ) {
    event.preventDefault();
  }
}

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogContent = forwardRef(
  (
    {
      className,
      placement = "center",
      children,
      onInteractOutside,
      onPointerDownOutside,
      onFocusOutside,
      ...props
    },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/40" />
      <DialogPrimitive.Content
        ref={ref}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          keepAppearanceOpen(event);
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          keepAppearanceOpen(event);
        }}
        onFocusOutside={(event) => {
          onFocusOutside?.(event);
          keepAppearanceOpen(event);
        }}
        className={cn(
          "fixed z-50 grid gap-4 border border-border bg-popover p-6 text-popover-foreground shadow-[0_10px_28px_var(--shadow)]",
          placement === "bottom"
            ? "inset-x-4 bottom-4 max-h-[85vh] overflow-y-auto rounded-[5px]"
            : placement === "top"
              ? "inset-x-4 top-4 max-h-[85vh] overflow-y-auto rounded-[5px]"
              : "left-1/2 top-1/2 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[5px]",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-medium", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
