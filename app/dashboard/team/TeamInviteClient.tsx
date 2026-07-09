"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Send, ShieldCheck, UsersRound } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TeamInviteClient() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function inviteMember() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not send invitation.");
        return;
      }

      setEmail("");
      setRole("member");
      setMessage("Invitation sent. The teammate will receive an email from Supabase Auth.");
    } catch (inviteError) {
      console.error(inviteError);
      setError("Could not send invitation right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050812] px-5 py-8 text-white lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(168,85,247,0.14),transparent_30%)]" />
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-slate-200 backdrop-blur-xl">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <LanguageSwitcher className="bg-white/[0.06]" compact />
        </div>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Team access
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight md:text-7xl">
              Invite your team into JOHAI.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Send secure Supabase Auth invitations so teammates can join onboarding, review CRM activity, and help configure the AI workspace.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Email invite", "Verified account", "Session persistence", "Role metadata"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold text-slate-200">
                  <ShieldCheck className="mb-3 text-emerald-300" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form
            className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl md:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              inviteMember();
            }}
          >
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                <UsersRound size={24} />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">Invite member</p>
                <h2 className="text-2xl font-semibold">Secure team access</h2>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/40 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                  placeholder="teammate@company.com"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {message && <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-100">{message}</div>}
            {error && <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm font-semibold text-rose-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send invitation"}
              <Send size={17} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
