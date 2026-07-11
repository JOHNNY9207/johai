import Link from "next/link";
import { ArrowRight, Brain, Check, Minus } from "lucide-react";

export type BrainArea = { label: string; learned: boolean };

export default function BusinessBrainSummary({ completeness, confidence, areas, recommendation }: { completeness: number; confidence: number; areas: BrainArea[]; recommendation: string }) {
  const missing = areas.filter((area) => !area.learned);
  return (
    <section aria-labelledby="business-brain" className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3"><Brain className="text-cyan-300" size={21} aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Business learned</p><h2 id="business-brain" className="mt-1 text-xl font-semibold">Business Brain</h2></div></div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">{confidence}% confidence</span>
      </div>
      <div className="mt-5 flex items-center gap-4"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-[width] motion-reduce:transition-none" style={{ width: `${completeness}%` }} /></div><span className="text-sm tabular-nums text-slate-300">{completeness}% complete</span></div>
      <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Business knowledge areas">
        {areas.map((area, index) => <li key={`brain-area-${area.label}-${index}`} className="flex items-center gap-2 rounded-xl bg-slate-950/30 px-3 py-2 text-xs text-slate-300">{area.learned ? <Check className="text-emerald-300" size={14} aria-label="Learned" /> : <Minus className="text-amber-300" size={14} aria-label="Missing" />}{area.label}</li>)}
      </ul>
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next learning task</p><p className="mt-2 text-sm text-slate-200">{missing.length ? recommendation : "Your core business knowledge is ready. Review it when services or policies change."}</p><Link href="/dashboard/knowledge" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Open Knowledge <ArrowRight size={14} aria-hidden="true" /></Link></div>
    </section>
  );
}
