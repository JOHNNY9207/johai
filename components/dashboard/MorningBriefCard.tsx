import Link from "next/link";
import { ArrowRight, Sunrise } from "lucide-react";

export type BriefLine = { label: string; text: string };

export default function MorningBriefCard({ greeting, lines }: { greeting: string; lines: BriefLine[] }) {
  return (
    <section aria-labelledby="morning-brief" className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex items-center gap-3"><Sunrise className="text-amber-300" size={21} aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Today&apos;s brief</p><h2 id="morning-brief" className="mt-1 text-xl font-semibold">{greeting}</h2></div></div>
      <dl className="mt-5 space-y-3">{lines.map((line, index) => <div key={`brief-${line.label}-${index}`} className="grid gap-1 border-b border-white/[0.07] pb-3 last:border-0 last:pb-0 sm:grid-cols-[7.5rem_1fr]"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{line.label}</dt><dd className="text-sm leading-5 text-slate-200">{line.text}</dd></div>)}</dl>
      <Link href="#crm" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Review the work below <ArrowRight size={14} aria-hidden="true" /></Link>
    </section>
  );
}
