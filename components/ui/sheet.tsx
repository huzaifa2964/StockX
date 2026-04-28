"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet components must be used within <Sheet />");
  }

  return context;
}

function Sheet({ open, onOpenChange, children }: React.PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void }>) {
  return <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({ children }: React.PropsWithChildren) {
  const { setOpen } = useSheetContext();

  return <div onClick={() => setOpen(true)}>{children}</div>;
}

function SheetClose({ children }: React.PropsWithChildren) {
  const { setOpen } = useSheetContext();

  return <div onClick={() => setOpen(false)}>{children}</div>;
}

function SheetContent({
  side = "right",
  className,
  children,
}: React.PropsWithChildren<{ side?: "right" | "left"; className?: string }>) {
  const { open, setOpen } = useSheetContext();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
      <button
        type="button"
        aria-label="Close sheet"
        className={cn(
          "absolute inset-0 w-full bg-slate-950/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "absolute inset-y-0 flex w-full max-w-full transition-transform duration-300 ease-out",
          side === "right" ? "right-0 justify-end" : "left-0 justify-start",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-hidden={!open}
          className={cn(
            "flex h-full w-full max-w-[44rem] flex-col border-l border-slate-200 bg-white shadow-2xl",
            side === "left" && "border-l-0 border-r",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-slate-200 px-6 py-5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold tracking-tight text-slate-950", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-slate-500", className)} {...props} />;
}

function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-6", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4", className)} {...props} />;
}

function SheetCloseButton() {
  const { setOpen } = useSheetContext();

  return (
    <button
      type="button"
      aria-label="Close panel"
      onClick={() => setOpen(false)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter, SheetCloseButton };
