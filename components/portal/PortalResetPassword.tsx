"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { usePortalAuth } from "@/components/portal/PortalAuthProvider";
import { PortalScreenLoader, portalInput, portalPrimaryButton } from "@/components/portal/PortalUi";

export function PortalResetPassword() {
  const router = useRouter();
  const { completeRecovery, configured, loading, recoveryMode, session, supabase } = usePortalAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <PortalScreenLoader label="Verifying your recovery link" />;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session || !recoveryMode) {
      setError("This recovery link is no longer valid. Request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError("Your password could not be updated. Request a new recovery link and try again.");
      return;
    }
    completeRecovery();
    router.replace("/portal");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <ShieldCheck className="text-cyan-700" aria-hidden="true" size={30} />
        <h1 className="mt-5 text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use a unique password with at least 8 characters.</p>

        {!configured || !session || !recoveryMode ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
            This recovery link is unavailable or has expired. <Link className="font-bold underline" href="/portal/login">Request another email</Link>.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">New password</span>
              <span className="relative block">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" size={17} />
                <input className={`${portalInput} pl-11`} type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Confirm password</span>
              <input className={portalInput} type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800" role="alert">{error}</p> : null}
            <button className={`${portalPrimaryButton} w-full`} type="submit" disabled={busy}>
              {busy ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
