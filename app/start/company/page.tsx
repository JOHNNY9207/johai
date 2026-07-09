"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Check, Sparkles } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function CompanyCreationPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-orange-50 px-5 py-8 text-slate-950 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <ArrowLeft size={16} />
            {t("nav.back")}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <section className="grid min-h-[calc(100vh-6rem)] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{t("onboarding.companyTitle")}</p>
            <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
              {t("onboarding.companyTitle")}
            </h1>
            <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
              {t("onboarding.companySubtitle")}
            </p>
            <Link href="/start/ai-onboarding" className="mt-9 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20">
              {t("buttons.continue")}
              <Sparkles size={17} />
            </Link>
          </div>

          <div className="rounded-[3rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800">
                <Building2 size={25} />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">Business profile</p>
                <h2 className="text-2xl font-semibold">Workspace setup preview</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-3">
              {["Business name", "Industry", "Website", "Owner contact", "Brand voice"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <span className="font-semibold">{item}</span>
                  <Check className="text-emerald-500" size={18} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
