"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  Sparkles,
} from "lucide-react";
import { getAuthRedirectUrl } from "@/app/lib/supabase-auth-client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/components/AuthProvider";

type AuthMode = "login" | "signup" | "forgot";

export default function AuthClient({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { configured, supabase } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") || "/start/company";

  async function submitEmailPassword() {
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getAuthRedirectUrl("/auth/reset-password"),
        });

        if (resetError) throw resetError;
        setMessage("Password reset email sent. Check your inbox.");
        return;
      }

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: getAuthRedirectUrl("/auth/callback"),
          },
        });

        if (signUpError) throw signUpError;
        setMessage("Account created. Check your email to verify your address.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      router.push(next);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithProvider(provider: "google" | "azure") {
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: providerError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectUrl(`/auth/callback?next=${encodeURIComponent(next)}`),
      },
    });

    if (providerError) {
      setError(providerError.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-orange-50 px-5 py-8 text-slate-950 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-bold shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <Sparkles size={17} />
          JOHAI
        </Link>
        <LanguageSwitcher compact />
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">
            Secure workspace
          </p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight md:text-8xl">
            Sign in to your AI operating system.
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
            Access your dashboard, onboarding, team invitations, customer data, and AI employee workspace with Supabase Auth.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Email verification", "Session persistence", "Protected routes"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-bold shadow-lg shadow-slate-900/5 backdrop-blur-xl">
                <CheckCircle2 className="mb-3 text-emerald-500" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[3rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl md:p-8">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            {[
              ["login", "Log in"],
              ["signup", "Sign up"],
              ["forgot", "Forgot"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value as AuthMode);
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
                  mode === value ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!configured && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Supabase Auth is not configured yet.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!configured || loading}
              onClick={() => signInWithProvider("google")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Google Sign-In
            </button>
            <button
              type="button"
              disabled={!configured || loading}
              onClick={() => signInWithProvider("azure")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Microsoft Sign-In
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitEmailPassword();
            }}
          >
            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Jane Smith"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder="you@company.com"
                />
              </div>
            </label>

            {mode !== "forgot" && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    required
                    minLength={6}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder="At least 6 characters"
                  />
                </div>
              </label>
            )}

            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!configured || loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Working..." : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset email" : "Log in"}
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
