"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CreditCard,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";

const planDetails = {
  starter: {
    name: "Starter",
    price: 299,
    audience: "Small businesses starting automation.",
    promise: "JOHAI captures your first qualified conversations and keeps the CRM clean.",
    cta: "Start Starter Plan",
    roi: "$1.8k+ monthly pipeline influence",
    features: [
      "AI chatbot",
      "Lead capture",
      "CRM dashboard",
      "Calendly booking",
      "Email notification",
      "Basic follow-up",
      "1 business",
      "Basic AI audit",
    ],
    limits: ["1 business", "500 conversations", "50 knowledge items", "Basic follow-up sequence"],
    setup: ["Create account", "Add business profile", "Connect booking link", "Launch AI chatbot"],
    results: ["First leads captured", "Booking path active", "Owner notifications live"],
  },
  professional: {
    name: "Professional",
    price: 699,
    audience: "Businesses that want serious automation.",
    promise: "JOHAI learns your business, recommends actions, and runs deeper follow-up workflows.",
    cta: "Start Professional Plan",
    roi: "$5k+ monthly pipeline influence",
    features: [
      "Everything in Starter",
      "Advanced follow-ups",
      "Knowledge Center",
      "Business Brain",
      "AI audit engine",
      "AI recommendations",
      "Analytics",
      "More automations",
    ],
    limits: ["1 business", "2,500 conversations", "250 knowledge items", "Advanced follow-up automations"],
    setup: ["Create account", "Complete Business Brain", "Upload knowledge", "Connect Calendly and email", "Run first AI audit"],
    results: ["Knowledge-aware AI", "Audit recommendations", "Follow-up engine active"],
  },
  enterprise: {
    name: "Enterprise",
    price: 1499,
    audience: "Multi-location businesses or agencies.",
    promise: "JOHAI prepares a scalable AI operations layer across businesses, teams, and workflows.",
    cta: "Start Enterprise Plan",
    roi: "$12k+ monthly pipeline influence",
    features: [
      "Everything in Professional",
      "Multi-business management",
      "Advanced analytics",
      "Custom workflows",
      "Priority support",
      "Dedicated setup",
      "Advanced integrations placeholder",
    ],
    limits: ["Multiple businesses", "Custom conversation volume", "Expanded knowledge storage", "Priority automation planning"],
    setup: ["Strategy call", "Dedicated setup plan", "Business migration", "Workflow mapping", "Launch command center"],
    results: ["Multi-business visibility", "Custom workflows scoped", "Priority support path active"],
  },
} as const;

type PlanSlug = keyof typeof planDetails;

export default function PlanDetailClient({ slug }: { slug: PlanSlug }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const plan = planDetails[slug];

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-orange-50 text-slate-950">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/product" className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70 sm:inline-flex">
            Product
          </Link>
          <CalendlyBookingButton
            label="Book strategy call"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800"
          />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65 }}
          className="self-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{plan.name} Plan</p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
            ${plan.price}
            <span className="block text-2xl text-slate-500 md:text-3xl">per month</span>
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">{plan.audience}</p>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-500">{plan.promise}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800"
            >
              <Sparkles size={17} />
              {plan.cta}
            </button>
            <Link href="/#experience" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:bg-white">
              Compare plans
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65 }}
          className="rounded-[3rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {["Expected ROI", "Setup", "First result"].map((label, index) => (
              <div key={label} className="rounded-[2rem] border border-slate-200 bg-white/80 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{label}</p>
                <p className="mt-3 text-lg font-semibold">{index === 0 ? plan.roi : index === 1 ? "7 days" : plan.results[0]}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DetailBlock title="What JOHAI will do" items={plan.features} />
            <DetailBlock title="Monthly limits" items={plan.limits} />
            <DetailBlock title="Setup process" items={plan.setup} />
            <DetailBlock title="Example results" items={plan.results} />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="rounded-[3rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-700">First 7 days</p>
          <div className="mt-6 grid gap-3 md:grid-cols-7">
            {["Account", "Profile", "Booking", "Knowledge", "AI Audit", "Follow-up", "Launch"].map((day, index) => (
              <div key={day} className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <p className="text-xs font-bold text-slate-400">Day {index + 1}</p>
                <p className="mt-2 font-semibold">{day}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="checkout" className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[3rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">Checkout preparation</p>
              <h2 className="mt-4 text-4xl font-semibold">Start {plan.name}</h2>
              <p className="mt-3 text-slate-300">${plan.price}/month. Account creation and payment setup are prepared visually.</p>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-slate-950"
            >
              Continue
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.96 }}
              className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/20"
            >
              {/* Stripe checkout coming next. */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">Selected plan</p>
                  <h3 className="mt-2 text-3xl font-semibold">{plan.name} - ${plan.price}/month</h3>
                </div>
                <button type="button" onClick={() => setCheckoutOpen(false)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">
                  Close
                </button>
              </div>
              <div className="mt-6 grid gap-3">
                <CheckoutStep icon={<UserRound size={18} />} title="Create your JOHAI account" detail="Account creation is prepared as the first step." />
                <CheckoutStep icon={<CreditCard size={18} />} title="Prepare payment" detail="Payment setup will connect to the checkout provider next." />
                <CheckoutStep icon={<CalendarCheck size={18} />} title="Start onboarding" detail="After checkout, the business workspace setup begins." />
              </div>
              <Link
                href={`/start/company?plan=${slug}`}
                className="mt-6 block w-full rounded-full bg-slate-950 px-6 py-4 text-center text-sm font-bold text-white"
              >
                Continue
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DetailBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/75 p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <p key={item} className="flex items-center gap-2 text-sm text-slate-600">
            <Check size={15} className="text-emerald-500" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function CheckoutStep({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}
