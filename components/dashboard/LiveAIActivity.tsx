"use client";

import { CheckCircle2, Clock3, LoaderCircle } from "lucide-react";

export type ActivityItem = {
  time: string;
  title: string;
  detail: string;
  status: "complete" | "working" | "waiting";
};

export default function LiveAIActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section aria-labelledby="live-ai-activity" className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Verified activity</p>
          <h2 id="live-ai-activity" className="mt-1 text-xl font-semibold">What JOHAI did</h2>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-300 motion-safe:animate-pulse" aria-hidden="true" />
          Updated from your data
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-5">
          <p className="font-medium text-slate-200">JOHAI is ready to start</p>
          <p className="mt-1 text-sm text-slate-400">New conversations, knowledge updates, and bookings will appear here.</p>
        </div>
      ) : (
        <ol className="mt-5 space-y-1" aria-label="Recent AI activity">
          {items.slice(0, 7).map((item, index) => {
            const Icon = item.status === "complete" ? CheckCircle2 : item.status === "working" ? LoaderCircle : Clock3;
            return (
              <li key={`${item.time}-${item.title}-${index}`} className="group grid grid-cols-[3.5rem_1.25rem_1fr] gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.04] motion-safe:animate-[fadeIn_.35s_ease-out_both]">
                <time className="pt-0.5 text-xs tabular-nums text-slate-500">{item.time}</time>
                <Icon className={item.status === "complete" ? "text-emerald-300" : item.status === "working" ? "text-cyan-300 motion-safe:animate-spin" : "text-slate-500"} size={17} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 sm:whitespace-normal">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
