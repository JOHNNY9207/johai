"use client";

import { useRef, useState } from "react";
import { FlaskConical, RotateCcw, X } from "lucide-react";
import type { PortalDemoControls } from "@/components/portal/PortalProvider";
import {
  portalPrimaryButton,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

export function PortalDemoControlsDialog({
  controls,
}: {
  controls: PortalDemoControls;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [announcement, setAnnouncement] = useState("");

  function open() {
    setAnnouncement("");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function run(label: string, action: () => void) {
    action();
    setAnnouncement(label);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black text-amber-950 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
        onClick={open}
      >
        <FlaskConical aria-hidden="true" size={15} /> Pilot controls
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="portal-demo-controls-title"
        className="m-auto w-[min(92vw,42rem)] rounded-[2rem] border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/55"
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                Development only
              </p>
              <h2 id="portal-demo-controls-title" className="mt-2 text-2xl font-semibold">
                Pilot scenario controls
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These controls change only the in-memory fictional fixture. They never contact Supabase.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close pilot controls"
              className="shrink-0 rounded-full border border-slate-200 p-2.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
              onClick={close}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <section className="mt-7" aria-labelledby="demo-data-state-title">
            <h3 id="demo-data-state-title" className="font-semibold">Page data state</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {([
                ["normal", "Complete pilot"],
                ["empty", "Empty states"],
                ["error", "Load error"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={controls.dataMode === mode}
                  className={`min-h-11 rounded-2xl border px-4 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 ${
                    controls.dataMode === mode
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => run(`${label} selected.`, () => controls.setDataMode(mode))}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-7" aria-labelledby="demo-action-state-title">
            <h3 id="demo-action-state-title" className="font-semibold">Next action failure</h3>
            <p className="mt-1 text-sm text-slate-500">Each failure runs once, then retry can succeed.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                className={portalSecondaryButton}
                onClick={() => run("The next demo message will fail once.", controls.failNextMessage)}
              >
                Fail next message
              </button>
              <button
                type="button"
                className={portalSecondaryButton}
                onClick={() => run("The next demo download will fail once.", controls.failNextDownload)}
              >
                Fail next download
              </button>
              <button
                type="button"
                className={portalSecondaryButton}
                onClick={() => run("The next profile save will show a session error.", controls.failNextProfileSave)}
              >
                Expire next save
              </button>
            </div>
          </section>

          <div className="mt-7 flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              className={portalSecondaryButton}
              onClick={() => run("The fictional pilot was reset.", controls.reset)}
            >
              <RotateCcw aria-hidden="true" size={16} /> Reset fictional data
            </button>
            <button type="button" className={portalPrimaryButton} onClick={close}>Done</button>
          </div>
          <p className="mt-4 min-h-5 text-sm font-semibold text-emerald-700" aria-live="polite">
            {announcement}
          </p>
        </div>
      </dialog>
    </>
  );
}
