import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export type AttentionItem = { title: string; detail: string; action: string; href: string };

export default function AttentionCenter({ items }: { items: AttentionItem[] }) {
  return (
    <section aria-labelledby="attention-center" className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="text-amber-300" size={20} aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Human decisions only</p>
          <h2 id="attention-center" className="mt-1 text-xl font-semibold">Needs your attention</h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] p-4">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} aria-hidden="true" />
            <div><p className="text-sm font-medium text-emerald-100">Nothing requires you right now</p><p className="mt-1 text-xs text-slate-400">JOHAI will surface only decisions it cannot safely make.</p></div>
          </div>
        ) : items.slice(0, 4).map((item, index) => (
          <div key={`attention-${item.title}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-sm font-medium text-slate-100">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
            <Link href={item.href} className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-cyan-200 outline-none hover:text-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              {item.action}<ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
