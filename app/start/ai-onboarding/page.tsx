"use client";

import Link from "next/link";
import { Brain, CalendarCheck, Check, MessageCircle, Sparkles } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthGuard from "@/components/AuthGuard";

const steps = [
  ["AI identity", Brain],
  ["Knowledge upload", Sparkles],
  ["Booking setup", CalendarCheck],
  ["Conversation launch", MessageCircle],
] as const;

export default function AiOnboardingPage() {
  const { t } = useI18n();

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-orange-50 px-5 py-8 text-slate-950 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-end">
        <LanguageSwitcher compact />
      </div>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{t("onboarding.aiTitle")}</p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
            {t("onboarding.aiSubtitle")}
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
            The AI is prepared with services, tone, rules, FAQs, booking flow, and follow-up behavior before the dashboard opens.
          </p>
          <Link href="/dashboard" className="mt-9 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20">
            {t("buttons.openDashboard")}
            <Sparkles size={17} />
          </Link>
        </div>

        <div className="rounded-[3rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
          <div className="space-y-4">
            {steps.map(([label, Icon], index) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800">
                  <Icon size={21} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Step {index + 1}</p>
                  <p className="mt-1 font-semibold">{label}</p>
                </div>
                <Check className="text-emerald-500" size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>
    </AuthGuard>
  );
}
