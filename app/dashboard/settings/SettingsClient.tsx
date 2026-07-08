"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  CreditCard,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";

type CalendlySettingsResponse = {
  calendly_pat_set: boolean;
  calendly_pat_masked: string;
  calendly_user_uri: string;
  calendly_account_name: string;
  calendly_account_email: string;
  calendly_connected: boolean;
  default_booking_url: string;
  webhook_signing_key_set: boolean;
  webhook_signing_key_masked: string;
};

const tabs = [
  { id: "company", label: "Company", icon: BriefcaseBusiness },
  { id: "ai", label: "AI", icon: Bot },
  { id: "calendly", label: "Calendly", icon: CalendarDays },
  { id: "email", label: "Email", icon: Mail },
  { id: "automation", label: "Automation", icon: Workflow },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "team", label: "Team", icon: UsersRound },
  { id: "security", label: "Security", icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsClient() {
  const [settings, setSettings] = useState<CalendlySettingsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("calendly");
  const [calendlyPat, setCalendlyPat] = useState("");
  const [defaultBookingUrl, setDefaultBookingUrl] = useState("");
  const [webhookSigningKey, setWebhookSigningKey] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      const res = await fetch("/api/calendly/settings");

      if (!res.ok) {
        setMessage("Calendly settings could not be loaded.");
        return;
      }

      const data = (await res.json()) as CalendlySettingsResponse;

      setSettings(data);
      setDefaultBookingUrl(data.default_booking_url);
    }

    loadSettings();
  }, []);

  function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/calendly/settings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendly_pat: calendlyPat,
            default_booking_url: defaultBookingUrl,
            webhook_signing_key: webhookSigningKey,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error ?? "Calendly settings could not be saved.");
          return;
        }

        setSettings(data as CalendlySettingsResponse);
        setCalendlyPat("");
        setWebhookSigningKey("");
        setMessage("Calendly settings saved.");
      } catch {
        setMessage("Calendly settings could not be saved.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#050812] text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#050812_0%,#071827_50%,#130a23_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(168,85,247,0.12),transparent_28%)]" />

      <header className="border-b border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
            >
              <ChevronLeft size={16} />
              Back to CRM
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                <Sparkles size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  JOHAI Settings
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Platform configuration
                </h1>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              settings?.calendly_connected
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : "border-amber-300/30 bg-amber-300/10 text-amber-100"
            }`}
          >
            {settings?.calendly_connected ? "Calendly Connected" : "Calendly Not Connected"}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl">
          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-cyan-300 text-slate-950"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:p-8">
          {activeTab === "calendly" ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                    Scheduling
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">Calendly integration</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    Paste a Calendly Personal Access Token once. JOHAI detects the account,
                    saves the User URI automatically, and keeps the token server-side only.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">
                    {settings?.calendly_account_name || "No account connected"}
                  </p>
                  <p className="mt-1">{settings?.calendly_account_email || "Connect Calendly to show account email"}</p>
                </div>
              </div>

              {settings?.calendly_connected && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">User URI</p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-300">
                      {settings.calendly_user_uri}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Default booking URL</p>
                    <p className="mt-2 break-all text-sm text-slate-300">
                      {settings.default_booking_url || "No booking URL saved"}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={saveSettings} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Calendly Personal Access Token
                  </span>
                  <input
                    value={calendlyPat}
                    onChange={(event) => setCalendlyPat(event.target.value)}
                    type="password"
                    placeholder={
                      settings?.calendly_pat_set
                        ? `Saved: ${settings.calendly_pat_masked}`
                        : "Paste token"
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Default Booking URL
                  </span>
                  <input
                    value={defaultBookingUrl}
                    onChange={(event) => setDefaultBookingUrl(event.target.value)}
                    placeholder="https://calendly.com/..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Leave blank when saving a new token to use Calendly&apos;s scheduling URL automatically.
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Webhook Signing Key
                  </span>
                  <input
                    value={webhookSigningKey}
                    onChange={(event) => setWebhookSigningKey(event.target.value)}
                    type="password"
                    placeholder={
                      settings?.webhook_signing_key_set
                        ? `Saved: ${settings.webhook_signing_key_masked}`
                        : "Paste Calendly webhook signing key"
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Required to verify `/api/calendly/webhook` signatures.
                  </p>
                </label>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
                  Webhook endpoint:
                  <span className="ml-1 font-mono text-cyan-200">
                    /api/calendly/webhook
                  </span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-400">{message}</p>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />
                    {isPending ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div>
              {(() => {
                const tab = tabs.find((item) => item.id === activeTab)!;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                        <tab.icon size={22} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                          {tab.label}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold">
                          {tab.label} settings
                        </h2>
                      </div>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      {["Configuration", "Access", "Defaults", "Activity"].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                          <div className="flex items-center gap-3">
                            <KeyRound size={18} className="text-cyan-300" />
                            <p className="font-semibold">{item}</p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            This interface section is prepared for the next SaaS phase. Existing business logic is unchanged.
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
