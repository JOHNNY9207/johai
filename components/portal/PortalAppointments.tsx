"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, ExternalLink, MapPin, Video } from "lucide-react";
import type { PortalAppointment } from "@/app/lib/customer-portal-types";
import {
  buildPortalAppointmentSuggestion,
  createPortalContextSnapshot,
  type PortalContextSnapshot,
} from "@/app/lib/customer-portal-contextual-intelligence";
import { usePortal } from "@/components/portal/PortalProvider";
import {
  PortalEmptyState,
  PortalInlineError,
  PortalPageHeader,
  PortalPageLoader,
  PortalStatusPill,
  formatPortalDate,
  getPortalLocale,
  getSafeHttpsUrl,
  getSafeTimeZone,
  portalPrimaryButton,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

function AppointmentCard({
  appointment,
  contextSnapshot,
  locale,
}: {
  appointment: PortalAppointment;
  contextSnapshot: PortalContextSnapshot;
  locale: string;
}) {
  const meetingUrl = getSafeHttpsUrl(appointment.meetingUrl);
  const rescheduleUrl = getSafeHttpsUrl(appointment.rescheduleUrl);
  const cancelUrl = getSafeHttpsUrl(appointment.cancelUrl);
  const displayTimeZone = getSafeTimeZone(appointment.timezone);
  const actionsAvailable = appointment.status === "scheduled" || appointment.status === "confirmed";
  const preparation = buildPortalAppointmentSuggestion(
    contextSnapshot,
    appointment.id
  );

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{appointment.serviceName || "Appointment"}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Clock3 aria-hidden="true" size={16} /> {formatPortalDate(appointment.startsAt, {
              locale,
              timeZone: displayTimeZone,
            })}
          </p>
        </div>
        <PortalStatusPill value={appointment.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        {appointment.location ? (
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0" aria-hidden="true" size={16} /><span>{appointment.location}</span></p>
        ) : null}
        <p className="flex items-start gap-2"><Clock3 className="mt-0.5 shrink-0" aria-hidden="true" size={16} /><span>{displayTimeZone}</span></p>
      </div>

      {preparation ? (
        <details className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
          <summary className="cursor-pointer text-sm font-bold text-cyan-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100">
            {preparation.label}
          </summary>
          <p className="mt-3 text-sm leading-6 text-slate-700">{preparation.value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">{preparation.reason}</p>
        </details>
      ) : appointment.customerVisibleNotes ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{appointment.customerVisibleNotes}</p>
      ) : null}

      {actionsAvailable && (meetingUrl || rescheduleUrl || cancelUrl) ? (
        <div className="mt-5">
          <p className="mb-3 text-xs leading-5 text-slate-600">
            These links open the business&apos;s external provider. Availability and completion are confirmed there, not by this portal.
          </p>
          <div className="flex flex-wrap gap-2">
          {meetingUrl ? (
            <a className={portalPrimaryButton} href={meetingUrl} target="_blank" rel="noopener noreferrer">
              <Video aria-hidden="true" size={16} /> Join securely <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : null}
          {rescheduleUrl ? (
            <a className={portalSecondaryButton} href={rescheduleUrl} target="_blank" rel="noopener noreferrer">
              Reschedule <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : null}
          {cancelUrl ? (
            <a className={portalSecondaryButton} href={cancelUrl} target="_blank" rel="noopener noreferrer">
              Cancel <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function PortalAppointments() {
  const { activeProfile, branding, context, dataVersion, initialData, referenceTime, repository } = usePortal();
  const [appointments, setAppointments] = useState<{ previous: PortalAppointment[]; upcoming: PortalAppointment[] } | null>(() => {
    if (!initialData) return null;
    const boundaryTime = new Date(referenceTime).getTime();
    return {
      previous: initialData.appointments
        .filter((item) => new Date(item.startsAt).getTime() < boundaryTime)
        .map((item) => ({ ...item })),
      upcoming: initialData.appointments
        .filter((item) => new Date(item.startsAt).getTime() >= boundaryTime)
        .map((item) => ({ ...item })),
    };
  });
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      repository.listUpcomingAppointments(referenceTime),
      repository.listPastAppointments(referenceTime),
    ])
      .then(([upcoming, previous]) => {
        if (active) {
          setError(false);
          setAppointments({ previous, upcoming });
        }
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [dataVersion, referenceTime, repository, revision]);

  const upcoming = appointments?.upcoming ?? [];
  const previous = appointments?.previous ?? [];
  const bookingUrl = getSafeHttpsUrl(branding?.bookingUrl);
  const locale = getPortalLocale(activeProfile.preferredLanguage);
  const contextSnapshot = createPortalContextSnapshot({
    acknowledgements: initialData?.acknowledgements,
    appointments: [...upcoming, ...previous],
    branding,
    context,
    documents: initialData?.documents,
    messages: initialData?.messages,
    profile: activeProfile,
    referenceTime,
    requests: initialData?.requests,
  });

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Appointments"
        title="Your schedule"
        description="View the appointment details the business has shared with you."
        action={bookingUrl ? (
          <a className={portalPrimaryButton} href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <CalendarDays aria-hidden="true" size={17} /> Book an appointment <ExternalLink aria-hidden="true" size={14} />
          </a>
        ) : undefined}
      />

      {error ? (
        <PortalInlineError message="Appointments could not be loaded." retry={() => setRevision((value) => value + 1)} />
      ) : !appointments ? (
        <PortalPageLoader label="Loading appointments" />
      ) : appointments.upcoming.length === 0 && appointments.previous.length === 0 ? (
        <PortalEmptyState icon={CalendarDays} title="No appointments yet" description="Scheduled visits and meetings will appear here when they are shared with you." />
      ) : (
        <>
          <section>
            <h2 className="text-xl font-semibold">Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="mt-4"><PortalEmptyState icon={CalendarDays} title="Nothing upcoming" description="There are no future appointments on your portal right now." /></div>
            ) : (
              <div className="mt-4 grid gap-4">{upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} contextSnapshot={contextSnapshot} locale={locale} />)}</div>
            )}
          </section>
          {previous.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold">Previous</h2>
              <div className="mt-4 grid gap-4">{previous.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} contextSnapshot={contextSnapshot} locale={locale} />)}</div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
