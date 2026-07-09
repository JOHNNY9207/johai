"use client";

import Link from "next/link";
import { ArrowRight, Brain, Building2, CalendarCheck, Check, Sparkles } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";

const nextSteps = [
  ["Company profile", Building2, "Add business name, industry, website, and voice."],
  ["AI employee setup", Brain, "Define tone, allowed actions, goals, and limits."],
  ["Booking and follow-up", CalendarCheck, "Connect scheduling and launch the first workflow."],
] as const;

function WelcomeContent() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email || "there";

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-orange-50 px-5 py-8 text-slate-950 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">
            Welcome to JOHAI
          </p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
            Nice to see you, {name}.
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
            Let&apos;s configure your AI workspace so JOHAI can start capturing leads, answering questions, and preparing your first business audit.
          </p>
          <Link href="/start/company" className="mt-9 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20">
            Start onboarding
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="rounded-[3rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800">
              <Sparkles size={24} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">First login</p>
              <h2 className="text-2xl font-semibold">Your setup path</h2>
            </div>
          </div>
          <div className="space-y-3">
            {nextSteps.map(([label, Icon, detail]) => (
              <div key={label} className="flex gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                </div>
                <Check className="text-emerald-500" size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <AuthGuard>
      <WelcomeContent />
    </AuthGuard>
  );
}
