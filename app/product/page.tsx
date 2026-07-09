"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  CalendarCheck,
  Check,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const modules = [
  {
    title: "Command Center",
    icon: Sparkles,
    detail: "The owner sees what happened, what matters, and what JOHAI recommends next.",
  },
  {
    title: "AI Employee",
    icon: MessageCircle,
    detail: "Answers questions, qualifies intent, and moves prospects through the journey.",
  },
  {
    title: "CRM",
    icon: UsersRound,
    detail: "Leads, conversations, notes, statuses, meetings, and follow-up context stay organized.",
  },
  {
    title: "Knowledge",
    icon: Brain,
    detail: "Business documents, FAQs, services, policies, and procedures become AI-ready context.",
  },
  {
    title: "Follow-up engine",
    icon: CalendarCheck,
    detail: "Friendly reminders continue until qualified prospects book or need human help.",
  },
  {
    title: "Audit engine",
    icon: ClipboardCheck,
    detail: "JOHAI prepares recommendations, gaps, priorities, and business readiness insights.",
  },
];

const dailyFlow = [
  "Open Today's Brief",
  "Review priority leads",
  "Check appointments booked",
  "Approve recommendations",
  "Upload missing knowledge",
  "Let JOHAI follow up",
];

export default function ProductPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-orange-50 text-slate-950">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <ArrowLeft size={16} />
          {t("nav.back")}
        </Link>
        <LanguageSwitcher className="hidden sm:inline-flex" compact />
        <CalendlyBookingButton
          label={t("nav.bookCall")}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800"
        />
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{t("product.eyebrow")}</p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
            {t("product.title")}
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
            {t("product.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65 }}
          className="relative"
        >
          {/* Replace with a real product/founder screenshot at /public/images/photo-product-command-center.jpg later. */}
          <Image
            src="/images/photo-modern-office.jpg"
            alt="JOHAI product command center mockup"
            width={1600}
            height={1100}
            priority
            className="h-[58vh] min-h-[420px] w-full rounded-[3rem] border border-white/70 object-cover shadow-2xl shadow-slate-900/15"
          />
          <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">{t("product.commandCenter")}</p>
            <p className="mt-3 text-3xl font-semibold">12 conversations, 4 qualified leads, 2 meetings booked.</p>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["42%", "higher booking intent"],
            ["21h", "saved monthly"],
            ["7 days", "to launch"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-xl">
              <p className="text-4xl font-semibold">{value}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <motion.div
              key={module.title}
              whileHover={{ y: -8 }}
              className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-xl"
            >
              <module.icon className="text-cyan-700" size={26} />
              <h2 className="mt-5 text-xl font-semibold">{module.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{module.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[3rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-2xl md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-700">{t("product.dailyUse")}</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                {t("product.dailyTitle")}
              </h2>
            </div>
            <Link href="/pricing/professional" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white">
              {t("product.viewProfessional")}
              <Zap size={17} />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {dailyFlow.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
                <Check size={16} className="text-emerald-500" />
                <p className="font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
