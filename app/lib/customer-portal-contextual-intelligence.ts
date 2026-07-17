import type {
  PortalAppointment,
  PortalBranding,
  PortalDocument,
  PortalDocumentAcknowledgement,
  PortalMessage,
  PortalProfile,
  PortalRequest,
  PortalTenantContext,
} from "./customer-portal-types.ts";

export type PortalConfidence =
  | "supported"
  | "partially_supported"
  | "unsupported"
  | "prohibited";

export type PortalConfidenceLabel = "supported" | "limited" | "unavailable";

export type PortalContextSourceKind =
  | "appointment"
  | "branding"
  | "customer-visible-knowledge"
  | "document"
  | "message"
  | "profile"
  | "request";

export type PortalContextSource = Readonly<{
  businessId: string;
  customerProfileId?: string;
  id: string;
  kind: PortalContextSourceKind;
  label: string;
}>;

export type PortalAction = Readonly<{
  href?: string;
  id: string;
  intent: "contact" | "navigate" | "prefill" | "review";
  label: string;
}>;

export type PortalEscalation = Readonly<{
  action: "call" | "contact" | "email" | "request" | "support";
  href?: string;
  label: string;
  reason: string;
}>;

export type PortalInsight = Readonly<{
  action?: PortalAction;
  confidence: PortalConfidence;
  detail: string;
  id: string;
  primary: boolean;
  reason: string;
  sourceIds: readonly string[];
  title: string;
}>;

export type PortalSuggestion = Readonly<{
  confidence: PortalConfidence;
  id: string;
  label: string;
  reason: string;
  sourceIds: readonly string[];
  value: string;
}>;

export type PortalAccessState =
  | "active"
  | "expired"
  | "inactive"
  | "suspended"
  | "unavailable";

export type PortalContextSnapshot = Readonly<{
  access: PortalAccessState;
  acknowledgements: readonly PortalDocumentAcknowledgement[];
  appointments: readonly PortalAppointment[];
  branding: PortalBranding | null;
  context: PortalTenantContext;
  documents: readonly PortalDocument[];
  messages: readonly PortalMessage[];
  profile: PortalProfile | null;
  referenceTime: string;
  requests: readonly PortalRequest[];
  sources: readonly PortalContextSource[];
}>;

export type PortalContextPolicy = Readonly<{
  confidenceWording: Readonly<Record<PortalConfidenceLabel, string>>;
  contextNeverGrantsPermission: true;
  maximumDashboardInsights: 3;
  maximumMessageSuggestions: 3;
  silenceWhen: readonly string[];
  visibleSourceKinds: readonly PortalContextSourceKind[];
}>;

export const portalContextPolicy: PortalContextPolicy = Object.freeze({
  confidenceWording: {
    supported: "Supported by the customer-visible source listed below.",
    limited:
      "Limited help: confirm this with the source document or a person.",
    unavailable:
      "Unavailable: no approved source or provider can answer safely.",
  },
  contextNeverGrantsPermission: true,
  maximumDashboardInsights: 3,
  maximumMessageSuggestions: 3,
  silenceWhen: [
    "The customer access state is expired, inactive, suspended, or unavailable.",
    "No useful customer-visible source exists.",
    "The only candidate source belongs to another tenant or customer profile.",
    "A document is revoked or an action is already complete.",
    "A provider or approved customer-visible knowledge source is unavailable.",
    "A regulated answer would require certainty the approved source cannot support.",
  ],
  visibleSourceKinds: [
    "appointment",
    "branding",
    "customer-visible-knowledge",
    "document",
    "message",
    "profile",
    "request",
  ] as const,
});

export function getPortalConfidenceLabel(
  confidence: PortalConfidence
): PortalConfidenceLabel {
  if (confidence === "supported") return "supported";
  if (confidence === "partially_supported") return "limited";
  return "unavailable";
}

export type PortalSnapshotInput = Readonly<{
  access?: PortalAccessState;
  acknowledgements?: readonly PortalDocumentAcknowledgement[];
  appointments?: readonly PortalAppointment[];
  branding?: PortalBranding | null;
  context: PortalTenantContext;
  documents?: readonly PortalDocument[];
  messages?: readonly PortalMessage[];
  profile?: PortalProfile | null;
  referenceTime: string;
  requests?: readonly PortalRequest[];
}>;

function belongsToTenant(
  value: { businessId: string; customerProfileId: string },
  context: PortalTenantContext
) {
  return (
    value.businessId === context.businessId &&
    value.customerProfileId === context.customerProfileId
  );
}

export function createPortalContextSnapshot(
  input: PortalSnapshotInput
): PortalContextSnapshot {
  const { context } = input;
  const hasValidReferenceTime = Number.isFinite(Date.parse(input.referenceTime));
  const profile =
    input.profile &&
    input.profile.businessId === context.businessId &&
    input.profile.id === context.customerProfileId
      ? input.profile
      : null;
  const branding =
    input.branding?.businessId === context.businessId ? input.branding : null;
  const appointments = (input.appointments ?? []).filter((item) =>
    belongsToTenant(item, context)
  );
  const messages = (input.messages ?? []).filter((item) =>
    belongsToTenant(item, context)
  );
  const documents = (input.documents ?? []).filter((item) =>
    belongsToTenant(item, context)
  );
  const acknowledgements = (input.acknowledgements ?? []).filter((item) =>
    belongsToTenant(item, context)
  );
  const requests = (input.requests ?? []).filter((item) =>
    belongsToTenant(item, context)
  );
  const sources: PortalContextSource[] = [];

  if (profile) {
    sources.push({
      businessId: profile.businessId,
      customerProfileId: profile.id,
      id: profile.id,
      kind: "profile",
      label: "Your portal profile",
    });
  }
  if (branding) {
    sources.push({
      businessId: branding.businessId,
      id: branding.businessId,
      kind: "branding",
      label: "Published business information",
    });
  }
  appointments.forEach((item) =>
    sources.push({
      businessId: item.businessId,
      customerProfileId: item.customerProfileId,
      id: item.id,
      kind: "appointment",
      label: item.serviceName || "Customer-visible appointment",
    })
  );
  messages.forEach((item) =>
    sources.push({
      businessId: item.businessId,
      customerProfileId: item.customerProfileId,
      id: item.id,
      kind: "message",
      label: "Customer-visible portal message",
    })
  );
  documents
    .filter((item) => item.availability === "available")
    .forEach((item) =>
      sources.push({
        businessId: item.businessId,
        customerProfileId: item.customerProfileId,
        id: item.id,
        kind: "document",
        label: item.title,
      })
    );
  requests.forEach((item) =>
    sources.push({
      businessId: item.businessId,
      customerProfileId: item.customerProfileId,
      id: item.id,
      kind: "request",
      label: item.subject,
    })
  );

  return {
    access: hasValidReferenceTime
      ? input.access ?? (profile ? "active" : "unavailable")
      : "unavailable",
    acknowledgements,
    appointments,
    branding,
    context,
    documents,
    messages,
    profile,
    referenceTime: hasValidReferenceTime
      ? input.referenceTime
      : "1970-01-01T00:00:00.000Z",
    requests,
    sources,
  };
}

function canUseContext(snapshot: PortalContextSnapshot) {
  return snapshot.access === "active" && snapshot.profile !== null;
}

function activeAppointments(snapshot: PortalContextSnapshot) {
  const boundary = Date.parse(snapshot.referenceTime);
  return snapshot.appointments
    .filter(
      (item) =>
        Date.parse(item.startsAt) >= boundary &&
        item.status !== "cancelled" &&
        item.status !== "completed" &&
        item.status !== "no_show"
    )
    .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
}

export function buildPortalDashboardInsights(
  snapshot: PortalContextSnapshot,
  routeBase: "/portal" | "/portal/demo"
): readonly PortalInsight[] {
  if (!canUseContext(snapshot)) return [];

  const insights: PortalInsight[] = [];
  const nextAppointment = activeAppointments(snapshot)[0];
  if (nextAppointment?.customerVisibleNotes.trim()) {
    insights.push({
      action: {
        href: `${routeBase}/appointments`,
        id: "review-appointment-preparation",
        intent: "navigate",
        label: "Review preparation",
      },
      confidence: "supported",
      detail: nextAppointment.customerVisibleNotes.trim(),
      id: `appointment:${nextAppointment.id}`,
      primary: true,
      reason: `Because ${nextAppointment.serviceName || "your next appointment"} is upcoming.`,
      sourceIds: [nextAppointment.id],
      title: "Prepare for your next appointment",
    });
  }

  const acknowledgedIds = new Set(
    snapshot.acknowledgements.map((item) => item.documentId)
  );
  const document = snapshot.documents.find(
    (item) =>
      item.availability === "available" && !acknowledgedIds.has(item.id)
  );
  if (document) {
    insights.push({
      action: {
        href: `${routeBase}/documents`,
        id: "review-new-document",
        intent: "navigate",
        label: "Review document",
      },
      confidence: "supported",
      detail: document.title,
      id: `document:${document.id}`,
      primary: insights.length === 0,
      reason: "Because this available document has not been acknowledged yet.",
      sourceIds: [document.id],
      title: "A document may need your attention",
    });
  }

  const request = snapshot.requests.find(
    (item) => item.status === "open" || item.status === "in_progress"
  );
  if (request) {
    insights.push({
      action: {
        href: `${routeBase}/support`,
        id: "review-open-request",
        intent: "navigate",
        label: "Review request",
      },
      confidence: "supported",
      detail: request.subject,
      id: `request:${request.id}`,
      primary: insights.length === 0,
      reason: `Because this request is ${request.status.replaceAll("_", " ")}.`,
      sourceIds: [request.id],
      title: "Your support request is still active",
    });
  }

  return insights
    .slice(0, portalContextPolicy.maximumDashboardInsights)
    .map((insight, index) => ({
      ...insight,
      action: index === 0 ? insight.action : undefined,
      primary: index === 0,
    }));
}

export function buildPortalAppointmentSuggestion(
  snapshot: PortalContextSnapshot,
  appointmentId: string
): PortalSuggestion | null {
  if (!canUseContext(snapshot)) return null;
  const appointment = activeAppointments(snapshot).find(
    (item) => item.id === appointmentId
  );
  if (!appointment?.customerVisibleNotes.trim()) return null;
  return {
    confidence: "supported",
    id: `appointment-preparation:${appointment.id}`,
    label: "Show preparation guidance",
    reason: "Based only on the details shared with this appointment.",
    sourceIds: [appointment.id],
    value: appointment.customerVisibleNotes.trim(),
  };
}

export function buildPortalSupportSuggestion(
  snapshot: PortalContextSnapshot
): PortalSuggestion | null {
  if (!canUseContext(snapshot)) return null;
  const request = snapshot.requests.find(
    (item) => item.status === "open" || item.status === "in_progress"
  );
  if (request) {
    return {
      confidence: "supported",
      id: `support-follow-up:${request.id}`,
      label: "Use this follow-up question",
      reason: "Based on your active customer-visible support request.",
      sourceIds: [request.id],
      value: `Could you confirm the next customer-visible step for “${request.subject}”?`,
    };
  }

  const appointment = activeAppointments(snapshot)[0];
  if (!appointment) return null;
  return {
    confidence: "supported",
    id: `support-appointment:${appointment.id}`,
    label: "Ask about preparation",
    reason: "Based on your next customer-visible appointment.",
    sourceIds: [appointment.id],
    value: `Is there anything else I should prepare for ${appointment.serviceName || "my appointment"}?`,
  };
}

export function buildPortalProfileGuidance(
  snapshot: PortalContextSnapshot
): readonly PortalInsight[] {
  if (!canUseContext(snapshot) || !snapshot.profile) return [];
  const profile = snapshot.profile;
  const missing: string[] = [];
  if (!profile.phone.trim()) missing.push("phone number");
  if (!profile.preferredLanguage.trim()) missing.push("preferred language");
  if (!profile.communicationPreference.trim())
    missing.push("communication preference");

  if (missing.length > 0) {
    return [
      {
        action: {
          id: "review-profile-preferences",
          intent: "review",
          label: "Review profile fields",
        },
        confidence: "supported",
        detail: `You can add your ${missing.join(", ")} if you want the business to use it for customer service.`,
        id: "profile:missing-preferences",
        primary: true,
        reason: "These fields are currently blank. They are optional unless the business says otherwise.",
        sourceIds: [profile.id],
        title: "Choose how the business can contact you",
      },
    ];
  }

  return [
    {
      confidence: "supported",
      detail:
        "Your contact language and communication preference are set. You remain in control of these settings.",
      id: "profile:preferences-set",
      primary: true,
      reason: "Based only on the preferences stored in your portal profile.",
      sourceIds: [profile.id],
      title: "Your communication preferences are set",
    },
  ];
}

export function shouldOfferHumanHelp(text: string) {
  const normalized = text.toLowerCase();
  return [
    "person",
    "human",
    "urgent",
    "complaint",
    "legal",
    "medical advice",
    "emergency",
  ].some((term) => normalized.includes(term));
}
