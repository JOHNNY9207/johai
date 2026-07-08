"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

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

export default function SettingsClient() {
  const [settings, setSettings] = useState<CalendlySettingsResponse | null>(
    null
  );
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
    <main className="min-h-screen bg-[#f6f7fb] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-600 hover:text-blue-500"
        >
          Back to CRM
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            JOHAI Settings
          </p>
          <h1 className="mt-2 text-3xl font-bold">Calendly Integration</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Paste a Calendly Personal Access Token once. JOHAI will detect the
            account, save the User URI automatically, and keep the token
            server-side only.
          </p>

          <div
            className={`mt-6 rounded-xl border p-4 ${
              settings?.calendly_connected
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <p className="font-bold">
              {settings?.calendly_connected
                ? "Calendly Connected"
                : "Calendly Not Connected"}
            </p>
            {settings?.calendly_connected && (
              <div className="mt-2 space-y-1 text-sm">
                <p>{settings.calendly_account_name}</p>
                <p>{settings.calendly_account_email}</p>
                <p className="break-all font-mono text-xs">
                  {settings.calendly_user_uri}
                </p>
              </div>
            )}
          </div>

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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Leave blank when saving a new token to use Calendly&apos;s
                scheduling URL automatically.
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Required to verify `/api/calendly/webhook` signatures.
              </p>
            </label>

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Webhook endpoint:
              <span className="ml-1 font-mono text-slate-950">
                /api/calendly/webhook
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">{message}</p>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
