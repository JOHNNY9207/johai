"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import {
  getCustomerPortalRedirectUrl,
  getSafePortalPath,
} from "@/app/lib/customer-portal-auth-client";
import { usePortalAuth } from "@/components/portal/PortalAuthProvider";
import { portalInput, portalPrimaryButton } from "@/components/portal/PortalUi";

type Mode = "login" | "forgot";

export function PortalLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeRecovery, configured, loading: authLoading, session, supabase } = usePortalAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const next = getSafePortalPath(searchParams.get("next"));

  useEffect(() => {
    if (!authLoading && session) router.replace(next);
  }, [authLoading, next, router, session]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError("Customer sign-in is temporarily unavailable.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getCustomerPortalRedirectUrl("/portal/reset-password"),
      });
      setBusy(false);
      if (resetError) {
        setError("We could not send the reset email. Please try again.");
        return;
      }
      setMessage("If an eligible portal account matches that address, a reset email is on its way.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (signInError) {
      setError("The email or password was not accepted.");
      return;
    }

    completeRecovery();
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#cffafe_0,_#f8fafc_42%,_#fff7ed_100%)] px-5 py-8 text-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="rounded-full bg-white/90 px-4 py-2 text-sm font-black tracking-[0.16em] shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
        >
          JOHAI
        </Link>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
          <ShieldCheck aria-hidden="true" size={17} />
          Customer Portal
        </span>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1fr_0.8fr]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-800">A clear view of what matters</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            Your service, in one calm place.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Review appointments, continue conversations, access shared documents, and ask for support securely.
          </p>
          <div className="mt-8 rounded-3xl border border-white/80 bg-white/65 p-5 text-sm leading-6 text-slate-600 backdrop-blur">
            Portal access is invitation-only. Use the email address provided by the business serving you.
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/90 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Reset your password"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mode === "login"
              ? "Sign in to your customer account."
              : "Enter your portal email and we will send recovery instructions."}
          </p>

          {!configured ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900" role="alert">
              Customer sign-in is temporarily unavailable.
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email address</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" size={17} />
                <input
                  className={`${portalInput} pl-11`}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </span>
            </label>

            {mode === "login" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" size={17} />
                  <input
                    className={`${portalInput} pl-11`}
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </span>
              </label>
            ) : null}

            <div aria-live="polite">
              {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800" role="alert">{error}</p> : null}
              {message ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</p> : null}
            </div>

            <button className={`${portalPrimaryButton} w-full`} type="submit" disabled={!configured || busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Send reset email"}
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          </form>

          <button
            type="button"
            className="mt-5 w-full rounded-xl py-2 text-sm font-bold text-cyan-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
            onClick={() => {
              setMode((current) => (current === "login" ? "forgot" : "login"));
              setError("");
              setMessage("");
            }}
          >
            {mode === "login" ? "Forgot your password?" : "Return to sign in"}
          </button>
        </div>
      </section>
    </main>
  );
}
