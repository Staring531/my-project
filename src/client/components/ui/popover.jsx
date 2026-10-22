import * as PopoverPrimitive from "@radix-ui/react-popover";
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

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = forwardRef(
  (
    {
      className,
      align = "end",
      sideOffset = 4,
      onInteractOutside,
      onPointerDownOutside,
      onFocusOutside,
      ...props
    },
    ref,
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
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
          "z-50 w-80 rounded-lg border border-border bg-popover p-4 text-popover-foreground outline-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverContent, PopoverTrigger };
