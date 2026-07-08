"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  Gem,
  MessageSquareText,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from "lucide-react";
import AIChat from "@/components/AIChat";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";
import FloatingChat from "@/components/FloatingChat";

const trustedCompanies = ["Apex Dental", "Noura Beauty", "Urban Table", "Prime Realty", "Atlas Care"];

const features = [
  {
    icon: Bot,
    title: "AI lead qualification",
    text: "JOHAI asks the right questions, scores intent, and saves complete lead records automatically.",
  },
  {
    icon: CalendarCheck,
    title: "Calendly-aware booking",
    text: "Qualified prospects are guided toward real availability and every booked call is reflected in the CRM.",
  },
  {
    icon: Workflow,
    title: "Follow-up automation",
    text: "Friendly reminders continue until the prospect books, without flooding your team or your inbox.",
  },
  {
    icon: BarChart3,
    title: "Revenue visibility",
    text: "Track pipeline health, meeting conversion, email delivery, and AI recommendations in one command center.",
  },
];

const industries = [
  "Dental clinics",
  "Med spas",
  "Restaurants",
  "Real estate",
  "Home services",
  "Consultants",
];

const pricing = [
  {
    name: "Launch",
    price: "$299",
    text: "For a growing local business that wants AI lead capture live quickly.",
    features: ["AI chatbot", "CRM dashboard", "Calendly booking", "Email notifications"],
  },
  {
    name: "Scale",
    price: "$699",
    text: "For teams that need follow-ups, analytics, and a refined customer journey.",
    features: ["Everything in Launch", "Automated reminders", "Pipeline analytics", "Priority setup"],
    featured: true,
  },
  {
    name: "Platform",
    price: "Custom",
    text: "For multi-location brands and agencies preparing a full AI operations layer.",
    features: ["Multi-business structure", "Custom workflows", "Advanced reporting", "Dedicated support"],
  },
];

const testimonials = [
  {
    quote:
      "JOHAI turned our website chat into booked audits instead of random questions. The CRM makes follow-up obvious.",
    name: "Maya R.",
    role: "Clinic owner",
  },
  {
    quote:
      "The experience feels premium for prospects and practical for our team. We know exactly who needs attention.",
    name: "Daniel K.",
    role: "Agency founder",
  },
  {
    quote:
      "It captures context, sends the confirmation, and keeps the booking path clean. That saved us hours every week.",
    name: "Sofia L.",
    role: "Operations lead",
  },
];

const faqs = [
  {
    question: "Does JOHAI replace my website?",
    answer:
      "No. JOHAI sits on top of your current acquisition flow and turns visitor conversations into qualified CRM leads.",
  },
  {
    question: "Can it use my Calendly?",
    answer:
      "Yes. The dashboard connects to Calendly so prospects can book through your real scheduling link.",
  },
  {
    question: "Is the CRM included?",
    answer:
      "Yes. Leads, notes, status, conversations, reminders, meetings, and email activity are managed in one place.",
  },
];

const metrics = [
  ["42%", "higher booking intent"],
  ["3 min", "average audit capture"],
  ["24/7", "AI qualification"],
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050812] text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#06111f_0%,#071827_40%,#130b2a_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.14),transparent_28%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,auto,72px_72px,72px_72px]" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050812]/75 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#hero" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
              <Sparkles size={20} />
            </span>
            <span className="text-lg font-semibold tracking-tight">JOHAI</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
            <a href="#demo" className="transition hover:text-white">AI Demo</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#industries" className="transition hover:text-white">Industries</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:inline-flex"
            >
              Dashboard
            </a>
            <CalendlyBookingButton className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-100" />
          </div>
        </nav>
      </header>

      <section id="hero" className="relative px-5 pb-24 pt-36 lg:px-8 lg:pb-32 lg:pt-44">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              <Gem size={16} />
              Premium AI CRM for service businesses
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              JOHAI turns visitors into qualified booked calls.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              A premium AI assistant, CRM, Calendly booking flow, email notifications,
              and follow-up engine designed for modern service companies.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CalendlyBookingButton className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200" />
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Play size={17} />
                Watch AI demo
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {metrics.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-[32px] border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <AIChat />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
            Trusted by growing teams
          </p>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {trustedCompanies.map((company) => (
              <div key={company} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-slate-300">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="AI demo"
          title="A polished assistant that captures real buying intent."
          text="JOHAI qualifies leads conversationally, extracts the CRM fields your team needs, and guides serious prospects toward a booked audit."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <MessageSquareText className="text-cyan-300" />
              <h3 className="text-xl font-semibold">Live qualification flow</h3>
            </div>
            <div className="mt-6 space-y-4">
              {["Business type identified", "Pain point extracted", "Email captured", "Audit booking offered"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <Check size={17} className="text-emerald-300" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-3">
              {["New Lead", "AI Audit", "Booked Call"].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-sm text-slate-400">Step {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold">{step}</p>
                  <div className="mt-5 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${45 + index * 22}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything needed to move from chat to revenue."
          text="The frontend feels premium for prospects while your team gets the operational clarity of a modern SaaS CRM."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -6 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl"
            >
              <feature.icon className="text-cyan-300" size={26} />
              <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="industries" className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Industries
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Built for high-trust service businesses.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              JOHAI works best where every qualified conversation can become a consultation,
              audit, appointment, or local customer.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {industries.map((industry) => (
              <div key={industry} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <Building2 className="text-cyan-300" size={20} />
                <span className="font-semibold">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Plans for launch, scale, and platform growth."
          text="Start with a clean AI acquisition layer, then expand into automation and multi-business operations."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[28px] border p-7 backdrop-blur-xl ${
                plan.featured
                  ? "border-cyan-300/40 bg-cyan-300/10 shadow-2xl shadow-cyan-950/30"
                  : "border-white/10 bg-white/[0.05]"
              }`}
            >
              <p className="text-lg font-semibold">{plan.name}</p>
              <p className="mt-4 text-4xl font-semibold">{plan.price}</p>
              <p className="mt-4 min-h-16 text-sm leading-6 text-slate-300">{plan.text}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                    <Check size={16} className="text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="A better first impression for every serious prospect."
          text="Teams use JOHAI to make their website feel responsive, intelligent, and commercially focused."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-[28px] border border-white/10 bg-white/[0.05] p-7">
              <div className="flex gap-1 text-cyan-300">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-slate-200">&quot;{testimonial.quote}&quot;</p>
              <p className="mt-6 font-semibold">{testimonial.name}</p>
              <p className="text-sm text-slate-400">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions before your AI audit."
          text="Simple answers for teams that want a premium lead capture system without disrupting current operations."
        />
        <div className="mx-auto mt-12 max-w-4xl space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {faq.question}
                <ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-cyan-300/20 bg-cyan-300/10 p-8 text-center backdrop-blur-xl md:p-14">
          <ShieldCheck className="mx-auto text-cyan-200" size={34} />
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            Give every prospect a premium AI buying journey.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Book a free AI audit and see how JOHAI can qualify, capture, follow up,
            and book meetings for your business.
          </p>
          <div className="mt-8 flex justify-center">
            <CalendlyBookingButton className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-100" />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="font-semibold">JOHAI</p>
              <p className="text-sm text-slate-400">Premium AI CRM platform</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/dashboard" className="hover:text-white">Dashboard</a>
            <a href="#hero" className="inline-flex items-center gap-1 hover:text-white">
              Back to top <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </footer>

      <FloatingChat />
    </main>
  );
}
