"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, RotateCcw, Save, UserRound } from "lucide-react";
import {
  buildPortalProfileGuidance,
  createPortalContextSnapshot,
} from "@/app/lib/customer-portal-contextual-intelligence";
import { PortalRepositoryError } from "@/app/lib/customer-portal-repository";
import type { JsonObject, JsonValue } from "@/app/lib/customer-portal-types";
import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalInlineError,
  PortalPageHeader,
  portalInput,
  portalPrimaryButton,
} from "@/components/portal/PortalUi";

function textValue(value: JsonValue | undefined) {
  return typeof value === "string" ? value : "";
}

function booleanValue(value: JsonValue | undefined, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

export function PortalProfile() {
  const { activeProfile, branding, context, referenceTime, replaceProfile, repository } = usePortal();
  const [fullName, setFullName] = useState(() => activeProfile.fullName);
  const [email, setEmail] = useState(() => activeProfile.email);
  const [phone, setPhone] = useState(() => activeProfile.phone);
  const [language, setLanguage] = useState(() => activeProfile.preferredLanguage);
  const [communication, setCommunication] = useState(() => activeProfile.communicationPreference);
  const [address, setAddress] = useState(() => ({
    line1: textValue(activeProfile.address.line1),
    line2: textValue(activeProfile.address.line2),
    city: textValue(activeProfile.address.city),
    region: textValue(activeProfile.address.region),
    postalCode: textValue(activeProfile.address.postalCode),
    country: textValue(activeProfile.address.country),
  }));
  const [notifications, setNotifications] = useState(() => ({
    appointments: booleanValue(activeProfile.notificationPreferences.appointments, false),
    messages: booleanValue(activeProfile.notificationPreferences.messages, false),
    documents: booleanValue(activeProfile.notificationPreferences.documents, false),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const mountedRef = useRef(true);
  const profileGuidance = buildPortalProfileGuidance(
    createPortalContextSnapshot({
      branding,
      context,
      profile: activeProfile,
      referenceTime,
    })
  )[0];

  const dirty =
    fullName !== activeProfile.fullName ||
    email !== activeProfile.email ||
    phone !== activeProfile.phone ||
    language !== activeProfile.preferredLanguage ||
    communication !== activeProfile.communicationPreference ||
    JSON.stringify(address) !== JSON.stringify({
      line1: textValue(activeProfile.address.line1),
      line2: textValue(activeProfile.address.line2),
      city: textValue(activeProfile.address.city),
      region: textValue(activeProfile.address.region),
      postalCode: textValue(activeProfile.address.postalCode),
      country: textValue(activeProfile.address.country),
    }) ||
    JSON.stringify(notifications) !== JSON.stringify({
      appointments: booleanValue(activeProfile.notificationPreferences.appointments, false),
      messages: booleanValue(activeProfile.notificationPreferences.messages, false),
      documents: booleanValue(activeProfile.notificationPreferences.documents, false),
    });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function resetForm() {
    setFullName(activeProfile.fullName);
    setEmail(activeProfile.email);
    setPhone(activeProfile.phone);
    setLanguage(activeProfile.preferredLanguage);
    setCommunication(activeProfile.communicationPreference);
    setAddress({
      line1: textValue(activeProfile.address.line1),
      line2: textValue(activeProfile.address.line2),
      city: textValue(activeProfile.address.city),
      region: textValue(activeProfile.address.region),
      postalCode: textValue(activeProfile.address.postalCode),
      country: textValue(activeProfile.address.country),
    });
    setNotifications({
      appointments: booleanValue(activeProfile.notificationPreferences.appointments, false),
      messages: booleanValue(activeProfile.notificationPreferences.messages, false),
      documents: booleanValue(activeProfile.notificationPreferences.documents, false),
    });
    setError("");
    setSaved(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const nextAddress: JsonObject = { ...activeProfile.address, ...address };
    const nextNotifications: JsonObject = { ...activeProfile.notificationPreferences, ...notifications };

    try {
      const updated = await repository.updateProfile({
        fullName,
        email,
        phone,
        preferredLanguage: language,
        communicationPreference: communication,
        address: nextAddress,
        notificationPreferences: nextNotifications,
      });
      if (!mountedRef.current) return;
      replaceProfile(updated);
      setSaved(true);
    } catch (cause) {
      if (!mountedRef.current) return;
      setError(
        cause instanceof PortalRepositoryError && cause.code === "SESSION_EXPIRED"
          ? "Your session is no longer valid. Sign in again before saving your profile."
          : cause instanceof Error && cause.message
            ? cause.message
            : "Your profile could not be saved. Check the fields and try again."
      );
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PortalPageHeader eyebrow="Profile" title="Your details" description="Keep the contact information used for your customer service up to date." />

      {profileGuidance ? (
        <section className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-5" aria-labelledby="profile-guidance-title">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Contextual guidance</p>
          <h2 id="profile-guidance-title" className="mt-2 text-lg font-semibold">{profileGuidance.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{profileGuidance.detail}</p>
          <details className="mt-3 text-xs leading-5 text-slate-600">
            <summary className="cursor-pointer font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100">Why this guidance appears</summary>
            <p className="mt-2">{profileGuidance.reason}</p>
          </details>
        </section>
      ) : null}

      <form className="space-y-6" onSubmit={submit}>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800"><UserRound aria-hidden="true" size={19} /></span>
            <h2 className="text-xl font-semibold">Contact information</h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">Full name</span>
              <input className={portalInput} value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={200} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Contact email</span>
              <input className={portalInput} type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={320} />
              <span className="mt-2 block text-xs leading-5 text-slate-500">This does not change the email you use to sign in.</span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Phone</span>
              <input className={portalInput} type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={64} autoComplete="tel" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Preferred language</span>
              <input className={portalInput} value={language} onChange={(event) => setLanguage(event.target.value)} maxLength={35} required placeholder="en" aria-describedby="language-help" />
              <span id="language-help" className="mt-2 block text-xs text-slate-500">Use a language code such as en, es, or fr.</span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Preferred communication</span>
              <select className={portalInput} value={communication} onChange={(event) => setCommunication(event.target.value)} required>
                {!['email', 'phone', 'sms', 'portal'].includes(communication) && communication ? <option value={communication}>{communication}</option> : null}
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="sms">Text message</option>
                <option value="portal">Portal message</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">Address</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {([
              ["line1", "Address line 1"], ["line2", "Address line 2"], ["city", "City"], ["region", "State or region"], ["postalCode", "Postal code"], ["country", "Country"],
            ] as const).map(([key, label]) => (
              <label className="block" key={key}>
                <span className="mb-2 block text-sm font-bold">{label}</span>
                <input className={portalInput} value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} maxLength={200} />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-800"><Bell aria-hidden="true" size={19} /></span>
            <div><h2 className="text-xl font-semibold">Portal notifications</h2><p className="mt-1 text-sm text-slate-500">Store your preferences for customer updates.</p></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(Object.keys(notifications) as Array<keyof typeof notifications>).map((key) => (
              <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold capitalize">
                <input type="checkbox" checked={notifications[key]} onChange={(event) => setNotifications((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500" />
                {key}
              </label>
            ))}
          </div>
        </section>

        <div aria-live="polite">
          {dirty ? (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">You have unsaved changes.</p>
              <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200" onClick={resetForm}>
                <RotateCcw aria-hidden="true" size={15} /> Discard changes
              </button>
            </div>
          ) : null}
          {error ? <PortalInlineError message={error} /> : null}
          {saved && !dirty ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Your profile has been saved.</p> : null}
        </div>
        <button className={portalPrimaryButton} type="submit" disabled={busy || !dirty}>
          <Save aria-hidden="true" size={16} /> {busy ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
