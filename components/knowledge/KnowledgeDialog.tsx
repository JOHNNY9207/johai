"use client";

import { useEffect, useRef } from "react";

export default function KnowledgeDialog({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: React.ReactNode; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button, input, select, textarea, [href]")?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]"));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", onKeyDown); returnFocusRef.current?.focus(); };
  }, [onClose, open]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation"><button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0" /><div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="knowledge-dialog-title" aria-describedby={description ? "knowledge-dialog-description" : undefined} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1421] p-6 shadow-2xl"><h2 id="knowledge-dialog-title" className="text-xl font-semibold text-white">{title}</h2>{description && <p id="knowledge-dialog-description" className="mt-2 text-sm leading-6 text-slate-400">{description}</p>}<div className="mt-6">{children}</div></div></div>;
}
