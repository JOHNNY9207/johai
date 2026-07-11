import { CalendarCheck, Clock3, Gauge, MailCheck, MessageSquareText, Target } from "lucide-react";

export type ImpactMetric = { label: string; value: string; detail: string };
const icons = [MessageSquareText, CalendarCheck, MailCheck, Clock3, Target, Gauge];

export default function BusinessImpact({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <section aria-labelledby="business-impact" className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Measured outcomes</p>
      <h2 id="business-impact" className="mt-1 text-xl font-semibold">Business impact</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = icons[index] ?? Gauge;
          return <div key={`impact-${metric.label}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <Icon className="text-slate-400" size={17} aria-hidden="true" />
            <p className="mt-3 text-2xl font-semibold tabular-nums text-white">{metric.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-300">{metric.label}</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">{metric.detail}</p>
          </div>;
        })}
      </div>
    </section>
  );
}
