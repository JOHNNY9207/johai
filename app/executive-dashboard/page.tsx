import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  Clock3,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const kpis = [
  ["Business Health", "92%", BarChart3],
  ["Revenue Forecast", "$18k", TrendingUp],
  ["Missed Opportunities", "7", Target],
  ["Bookings", "14", CalendarCheck],
  ["Today's Conversations", "38", MessageCircle],
  ["Avg Response", "11s", Clock3],
] as const;

const feed = [
  "Knowledge searched for private event pricing.",
  "Lead score increased to 91.",
  "Appointment booked for 2:30 PM.",
  "Owner notification prepared.",
  "Follow-up scheduled for tomorrow morning.",
];

export default function ExecutiveDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">
          <ArrowLeft size={16} />
          Back
        </Link>

        <section className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-200">Executive Dashboard</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            The operating view business owners open every morning.
          </h1>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {kpis.map(([label, value, Icon]) => (
              <div key={label} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <Icon className="text-cyan-200" size={24} />
                <p className="mt-5 text-4xl font-semibold">{value}</p>
                <p className="mt-2 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="text-cyan-200" />
                <h2 className="text-2xl font-semibold">Urgent recommendations</h2>
              </div>
              <div className="mt-6 grid gap-3">
                {["Call the high-intent restaurant lead before 2 PM.", "Upload updated pricing to improve AI confidence.", "Confirm tomorrow's booked consultation."].map((item) => (
                  <div key={item} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-cyan-50">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold">Live activity feed</h2>
              <div className="mt-6 space-y-3">
                {feed.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
