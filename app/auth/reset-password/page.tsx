"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ResetPasswordPage() {
  const { configured, supabase } = useAuth();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Password updated. You can continue to your workspace.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-orange-50 px-5 text-slate-950">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <Sparkles className="text-cyan-700" size={32} />
        <h1 className="mt-5 text-3xl font-semibold">Create a new password.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Choose a secure password to restore access to your JOHAI workspace.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            updatePassword();
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">New password</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                minLength={6}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </label>

          {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</div>}
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div>}

          <button
            type="submit"
            disabled={!configured || loading}
            className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <Link href="/start/company" className="mt-4 inline-flex text-sm font-bold text-cyan-700">
          Continue to onboarding
        </Link>
      </div>
    </main>
  );
}
