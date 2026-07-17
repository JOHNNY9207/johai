"use client";

import { useEffect, useRef, useState } from "react";
import { LifeBuoy, Plus, Send } from "lucide-react";
import type { PortalRequest } from "@/app/lib/customer-portal-types";
import {
  buildPortalSupportSuggestion,
  createPortalContextSnapshot,
} from "@/app/lib/customer-portal-contextual-intelligence";
import { usePortal } from "@/components/portal/PortalProvider";
import { PortalContextSuggestion } from "@/components/portal/PortalContextualUi";
import {
  PortalEmptyState,
  PortalInlineError,
  PortalPageHeader,
  PortalPageLoader,
  PortalStatusPill,
  formatPortalDate,
  getPortalLocale,
  portalDefaultTimeZone,
  portalInput,
  portalPrimaryButton,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

export function PortalSupport() {
  const { activeProfile, branding, context, dataVersion, initialData, referenceTime, repository } = usePortal();
  const [requests, setRequests] = useState<PortalRequest[] | null>(() =>
    initialData ? [...initialData.requests] : null
  );
  const [showForm, setShowForm] = useState(false);
  const [requestType, setRequestType] = useState("general");
  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState("");
  const [loadingError, setLoadingError] = useState(false);
  const [formError, setFormError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const locale = getPortalLocale(activeProfile.preferredLanguage);
  const contextSuggestion = requests
    ? buildPortalSupportSuggestion(
        createPortalContextSnapshot({
          acknowledgements: initialData?.acknowledgements,
          appointments: initialData?.appointments,
          branding,
          context,
          documents: initialData?.documents,
          messages: initialData?.messages,
          profile: activeProfile,
          referenceTime,
          requests,
        })
      )
    : null;

  useEffect(() => {
    let active = true;
    repository.listRequests()
      .then((result) => {
        if (active) {
          setLoadingError(false);
          setRequests(result);
        }
      })
      .catch(() => active && setLoadingError(true));
    return () => {
      active = false;
    };
  }, [dataVersion, repository, revision]);

  useEffect(() => {
    if (showForm) subjectRef.current?.focus();
  }, [showForm]);

  function openForm(type = "general", initialSubject = "") {
    setRequestType(type);
    setSubject(initialSubject);
    setFormError("");
    setSuccessNotice("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject.trim()) {
      setFormError("Add a short subject for your request.");
      return;
    }

    setBusy(true);
    setFormError("");
    setSuccessNotice("");
    try {
      const request = await repository.createRequest({
        requestType,
        subject: subject.trim(),
        customerVisibleDetail: detail.trim(),
      });
      setRequests((current) => [request, ...(current ?? [])]);
      setSubject("");
      setDetail("");
      setRequestType("general");
      setSuccessNotice("Your support request was created.");
      closeForm();
    } catch {
      setFormError("Your request could not be created. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Support"
        title="How can we help?"
        description={`Send a request to ${branding?.displayName || "the business serving you"} and follow its customer-visible status.`}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              ref={triggerRef}
              className={showForm ? portalSecondaryButton : portalPrimaryButton}
              type="button"
              aria-expanded={showForm}
              aria-controls="portal-support-form"
              onClick={() => (showForm ? closeForm() : openForm())}
            >
              <Plus aria-hidden="true" size={17} /> {showForm ? "Close form" : "New request"}
            </button>
            <button className={portalSecondaryButton} type="button" onClick={() => openForm("human_assistance", "Please have a person contact me")}>Request a person</button>
          </div>
        }
      />

      <div aria-live="polite">
        {successNotice ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {successNotice}
          </p>
        ) : null}
      </div>

      {contextSuggestion ? (
        <section aria-labelledby="contextual-support-title">
          <h2 id="contextual-support-title" className="sr-only">Contextual support suggestion</h2>
          <PortalContextSuggestion
            suggestion={contextSuggestion}
            onUse={(suggestion) => openForm("general", suggestion.value)}
          />
        </section>
      ) : null}

      {showForm ? (
        <form ref={formRef} id="portal-support-form" className="rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={submit}>
          <h2 className="text-xl font-semibold">Create a support request</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Do not include passwords, payment card information, or other secrets.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Request type</span>
              <select className={portalInput} value={requestType} onChange={(event) => setRequestType(event.target.value)}>
                <option value="general">General help</option>
                <option value="human_assistance">Human assistance</option>
                <option value="appointment">Appointment</option>
                <option value="document">Document</option>
                <option value="message">Message</option>
                <option value="profile">Profile</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Subject</span>
              <input ref={subjectRef} className={portalInput} value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={200} required />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">Details</span>
              <textarea className={`${portalInput} min-h-32 resize-y`} value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={5_000} placeholder="Tell us what you need help with." />
            </label>
          </div>
          <div aria-live="polite">{formError ? <p className="mt-4 text-sm font-semibold text-rose-700" role="alert">{formError}</p> : null}</div>
          <button className={`${portalPrimaryButton} mt-5`} type="submit" disabled={busy}>
            <Send aria-hidden="true" size={16} /> {busy ? "Sending..." : "Send request"}
          </button>
        </form>
      ) : null}

      {loadingError ? (
        <PortalInlineError message="Support requests could not be loaded." retry={() => setRevision((value) => value + 1)} />
      ) : !requests ? (
        <PortalPageLoader label="Loading support requests" />
      ) : requests.length === 0 ? (
        <PortalEmptyState icon={LifeBuoy} title="No support requests" description="Create a request when you need help and its status will appear here." action={<button className={portalPrimaryButton} type="button" onClick={() => openForm()}>Create your first request</button>} />
      ) : (
        <section aria-label="Support request history">
          <h2 className="text-xl font-semibold">Request history</h2>
          <div className="mt-4 grid gap-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">{request.requestType.replaceAll("_", " ")}</p>
                    <h3 className="mt-1 text-lg font-semibold">{request.subject}</h3>
                  </div>
                  <PortalStatusPill value={request.status} />
                </div>
                {request.customerVisibleDetail ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.customerVisibleDetail}</p> : null}
                <p className="mt-4 text-xs font-semibold text-slate-600">
                  Created {formatPortalDate(request.createdAt, {
                    locale,
                    timeZone: portalDefaultTimeZone,
                  })}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {branding?.supportEmail || branding?.contactPhone ? (
        <aside className="rounded-[2rem] bg-slate-950 p-6 text-white" aria-labelledby="business-support-title">
          <h2 id="business-support-title" className="text-lg font-semibold">{branding?.displayName || "Business"} service support</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Use these business contacts for appointments, care, documents, and service questions.</p>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            {branding.supportEmail ? <p>Support email: {branding.supportEmail}</p> : null}
            {branding.contactPhone ? <p>Phone: {branding.contactPhone}</p> : null}
          </div>
        </aside>
      ) : null}

      <section id="portal-faq" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="portal-faq-title">
        <h2 id="portal-faq-title" className="text-xl font-semibold">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          <details className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold">When will the business reply?</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">Replies are refresh-based in this portal. The business may also use your saved communication preference.</p>
          </details>
          <details className="rounded-2xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-bold">Who handles sign-in or portal-account problems?</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">Use password recovery on the portal sign-in page first. JOHAI platform-account support is separate from the business team and cannot answer dental-service questions.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
