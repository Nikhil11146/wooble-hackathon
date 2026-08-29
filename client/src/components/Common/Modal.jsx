import { useEffect } from "react";
import Button from "./Button";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;

    const close = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-5 dark:bg-black/70"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/50"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <Button aria-label="Close dialog" variant="ghost" className="min-h-10 min-w-10 px-3" onClick={onClose}>
            x
          </Button>
        </header>
        <div>{children}</div>
        {footer && <footer className="mt-5">{footer}</footer>}
      </section>
    </div>
  );
}
