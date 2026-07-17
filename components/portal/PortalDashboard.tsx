"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, FileText, LifeBuoy, MessageSquareText } from "lucide-react";
import type {
  PortalAppointment,
  PortalDocument,
  PortalDocumentAcknowledgement,
  PortalMessage,
  PortalRequest,
} from "@/app/lib/customer-portal-types";
import {
  buildPortalDashboardInsights,
  createPortalContextSnapshot,
} from "@/app/lib/customer-portal-contextual-intelligence";
import { PortalInsightPanel } from "@/components/portal/PortalContextualUi";
import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalEmptyState,
  PortalInlineError,
  PortalPageHeader,
  PortalPageLoader,
  formatPortalDate,
  getPortalLocale,
  getSafeHttpsUrl,
  portalDefaultTimeZone,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

type DashboardData = {
  acknowledgements: PortalDocumentAcknowledgement[];
  appointments: PortalAppointment[];
  documents: PortalDocument[];
  messages: PortalMessage[];
  requests: PortalRequest[];
};

export function PortalDashboard() {
  const { activeProfile, branding, context, dataVersion, initialData, referenceTime, repository, routeBase } = usePortal();
  const [data, setData] = useState<DashboardData | null>(() => initialData ? {
    acknowledgements: [...initialData.acknowledgements],
    appointments: [...initialData.appointments],
    documents: [...initialData.documents],
    messages: [...initialData.messages],
    requests: [...initialData.requests],
  } : null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      repository.listUpcomingAppointments(referenceTime, { limit: 50 }),
      repository.listDocuments({ limit: 50 }),
      repository.listMessages({ limit: 100 }),
      repository.listRequests({ limit: 50 }),
    ])
      .then(async ([appointments, documents, messages, requests]) => {
        const acknowledgements = await repository.listAcknowledgements(
          documents
            .filter((document) => document.availability === "available")
            .map((document) => document.id)
        );
        if (active) {
          setError(false);
          setData({ acknowledgements, appointments, documents, messages, requests });
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [dataVersion, referenceTime, repository, revision]);

  const upcoming = data?.appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "completed" &&
      appointment.status !== "no_show"
  ) ?? [];
  const openRequests = data?.requests.filter((request) => request.status === "open" || request.status === "in_progress") ?? [];
  const availableDocuments = data?.documents.filter((document) => document.availability === "available") ?? [];
  const bookingUrl = getSafeHttpsUrl(branding?.bookingUrl);
  const locale = getPortalLocale(activeProfile.preferredLanguage);
  const insights = data
    ? buildPortalDashboardInsights(
        createPortalContextSnapshot({
          acknowledgements: data.acknowledgements,
          appointments: data.appointments,
          branding,
          context,
          documents: data.documents,
          messages: data.messages,
          profile: activeProfile,
          referenceTime,
          requests: data.requests,
        }),
        routeBase
      )
    : [];
  const hasCompleteSnapshot = Boolean(
    data &&
      data.appointments.length < 50 &&
      data.documents.length < 50 &&
      data.messages.length < 100 &&
      data.requests.length < 50
  );

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow={branding?.displayName || "Customer Portal"}
        title={`Hello, ${activeProfile.fullName.split(" ")[0] || "there"}.`}
        description="Here is the latest information shared with you."
        action={
          <div className="flex flex-wrap gap-2">
            {bookingUrl ? (
              <a className={portalSecondaryButton} href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <CalendarDays aria-hidden="true" size={16} /> Book <ExternalLink aria-hidden="true" size={13} />
              </a>
            ) : null}
            <Link className={portalSecondaryButton} href={`${routeBase}/support`}>Contact support</Link>
          </div>
        }
      />

      {error ? (
        <PortalInlineError message="Your overview could not be loaded." retry={() => setRevision((value) => value + 1)} />
      ) : !data ? (
        <PortalPageLoader label="Loading your overview" />
      ) : (
        <>
          <PortalInsightPanel
            insights={insights}
            emptyMessage={
              hasCompleteSnapshot
                ? "Everything is up to date."
                : "No suggestions are available right now."
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portal summary">
            {[
              { href: `${routeBase}/appointments`, label: "Upcoming", value: `${upcoming.length}${data.appointments.length === 50 ? "+" : ""}`, icon: CalendarDays, tone: "bg-cyan-50 text-cyan-800" },
              { href: `${routeBase}/messages`, label: "Recent messages", value: `${data.messages.length}${data.messages.length === 100 ? "+" : ""}`, icon: MessageSquareText, tone: "bg-violet-50 text-violet-800" },
              { href: `${routeBase}/documents`, label: "Shared documents", value: `${availableDocuments.length}${data.documents.length === 50 ? "+" : ""}`, icon: FileText, tone: "bg-amber-50 text-amber-800" },
              { href: `${routeBase}/support`, label: "Open requests", value: `${openRequests.length}${data.requests.length === 50 ? "+" : ""}`, icon: LifeBuoy, tone: "bg-emerald-50 text-emerald-800" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}><Icon aria-hidden="true" size={19} /></span>
                  <span className="mt-5 block text-3xl font-semibold">{item.value}</span>
                  <span className="mt-1 block text-sm font-bold text-slate-500">{item.label}</span>
                </Link>
              );
            })}
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Recent messages</h2>
              <Link className="text-sm font-bold text-cyan-800 hover:underline" href={`${routeBase}/messages`}>Open messages</Link>
            </div>
            {data.messages.length === 0 ? (
              <div className="mt-5"><PortalEmptyState icon={MessageSquareText} title="No messages yet" description="Messages shared with you will appear here." /></div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {data.messages.slice(-3).reverse().map((message) => (
                  <article key={message.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="line-clamp-2 text-sm leading-6 text-slate-700">{message.body}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      {formatPortalDate(message.createdAt, {
                        locale,
                        timeZone: portalDefaultTimeZone,
                      })}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="text-xl font-semibold">Need help with your service?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Send a support request without sharing sensitive information by email.</p>
            </div>
            <Link href={`${routeBase}/support`} className={`${portalSecondaryButton} mt-5 shrink-0 sm:mt-0`}>Contact support</Link>
          </section>
        </>
      )}
    </div>
  );
}
