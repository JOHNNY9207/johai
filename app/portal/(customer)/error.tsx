"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function PortalError({ reset }: { reset: () => void }) {
  return (
    <section className="rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-sm" role="alert">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
        <AlertTriangle aria-hidden="true" size={24} />
      </span>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">This page could not be loaded.</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Your account data remains protected. Try again, or contact the business if the problem continues.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
      >
        <RotateCcw aria-hidden="true" size={16} /> Try again
      </button>
    </section>
  );
}
