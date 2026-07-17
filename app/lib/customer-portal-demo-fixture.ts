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

export const portalDemoIdentity = Object.freeze({
  businessId: "11111111-1111-4111-8111-111111111111",
  customerProfileId: "22222222-2222-4222-8222-222222222222",
});

export const portalDemoReferenceTime = "2026-07-14T02:10:00.000Z";

export type PortalDemoFixture = Readonly<{
  acknowledgements: readonly PortalDocumentAcknowledgement[];
  appointments: readonly PortalAppointment[];
  branding: PortalBranding;
  context: PortalTenantContext;
  documentPaths: Readonly<Record<string, string>>;
  documents: readonly PortalDocument[];
  messages: readonly PortalMessage[];
  profile: PortalProfile;
  requests: readonly PortalRequest[];
}>;

function offsetIso(now: Date, days: number, hours = 0) {
  return new Date(now.getTime() + days * 86_400_000 + hours * 3_600_000).toISOString();
}

export function createCustomerPortalDemoFixture(
  now = new Date(portalDemoReferenceTime)
): PortalDemoFixture {
  const { businessId, customerProfileId } = portalDemoIdentity;
  const preparationId = "66666666-6666-4666-8666-666666666661";
  const summaryId = "66666666-6666-4666-8666-666666666662";
  const revokedId = "66666666-6666-4666-8666-666666666663";

  const profile: PortalProfile = {
    id: customerProfileId,
    businessId,
    fullName: "Sophie Martin",
    email: "sophie.martin@example.test",
    phone: "+1 416 555 0142",
    preferredLanguage: "en",
    communicationPreference: "portal",
    address: {
      line1: "27 Seabreeze Lane",
      line2: "Apartment 4B",
      city: "Toronto",
      region: "Ontario",
      postalCode: "M5V 2T6",
      country: "Canada",
    },
    notificationPreferences: {
      appointments: true,
      documents: true,
      messages: true,
    },
    updatedAt: offsetIso(now, -2),
  };

  const branding: PortalBranding = {
    businessId,
    displayName: "Harbor Dental Studio",
    logoUrl: "",
    primaryColor: "#0f766e",
    secondaryColor: "#f0fdfa",
    contactEmail: "hello@harbordental.example.test",
    contactPhone: "+1 416 555 0188",
    address: "88 Harbour Street, Toronto, Ontario",
    businessHours: {
      monday: "08:00–17:00",
      tuesday: "08:00–17:00",
      wednesday: "09:00–18:00",
      thursday: "08:00–17:00",
      friday: "08:00–15:00",
    },
    supportEmail: "care@harbordental.example.test",
    bookingUrl: "https://example.test/harbor-dental/book",
    industry: "Dental care",
    updatedAt: offsetIso(now, -14),
  };

  const appointments: PortalAppointment[] = [
    {
      id: "33333333-3333-4333-8333-333333333331",
      businessId,
      customerProfileId,
      status: "confirmed",
      startsAt: offsetIso(now, 7, 2),
      endsAt: offsetIso(now, 7, 3),
      timezone: "America/Toronto",
      location: "Harbor Dental Studio · Treatment Room 2",
      meetingUrl: "",
      serviceName: "Preventive cleaning and oral health review",
      customerVisibleNotes: "Please arrive 10 minutes early. Bring your insurance card and current medication list.",
      rescheduleUrl: "https://example.test/harbor-dental/reschedule",
      cancelUrl: "https://example.test/harbor-dental/cancel",
      updatedAt: offsetIso(now, -1),
    },
    {
      id: "33333333-3333-4333-8333-333333333332",
      businessId,
      customerProfileId,
      status: "completed",
      startsAt: offsetIso(now, -120),
      endsAt: offsetIso(now, -120, 1),
      timezone: "America/Toronto",
      location: "Harbor Dental Studio · Treatment Room 1",
      meetingUrl: "",
      serviceName: "New patient examination",
      customerVisibleNotes: "Completed. Your customer-visible care summary is available in Documents.",
      rescheduleUrl: "",
      cancelUrl: "",
      updatedAt: offsetIso(now, -120, 1),
    },
  ];

  const messages: PortalMessage[] = [
    {
      id: "44444444-4444-4444-8444-444444444441",
      businessId,
      customerProfileId,
      senderType: "human",
      body: "Hello Sophie — this is Maya from Harbor Dental Studio. Your cleaning is confirmed for next week.",
      humanSupportRequested: false,
      createdAt: offsetIso(now, -3),
    },
    {
      id: "44444444-4444-4444-8444-444444444442",
      businessId,
      customerProfileId,
      senderType: "ai",
      body: "Preparation reminder: please bring your insurance card and let the care team know about medication changes.",
      humanSupportRequested: false,
      createdAt: offsetIso(now, -2),
    },
    {
      id: "44444444-4444-4444-8444-444444444443",
      businessId,
      customerProfileId,
      senderType: "customer",
      body: "Thank you. I will arrive early and bring both items.",
      humanSupportRequested: false,
      createdAt: offsetIso(now, -1),
    },
  ];

  const documents: PortalDocument[] = [
    {
      id: preparationId,
      businessId,
      customerProfileId,
      documentType: "instructions",
      title: "Preparing for your preventive cleaning",
      mimeType: "text/plain",
      fileSize: 1_842,
      sharedAt: offsetIso(now, -4),
      availability: "available",
    },
    {
      id: summaryId,
      businessId,
      customerProfileId,
      documentType: "report",
      title: "New patient care summary",
      mimeType: "text/plain",
      fileSize: 2_216,
      sharedAt: offsetIso(now, -115),
      availability: "available",
    },
    {
      id: revokedId,
      businessId,
      customerProfileId,
      documentType: "form",
      title: "Superseded consent form",
      mimeType: "text/plain",
      fileSize: 918,
      sharedAt: offsetIso(now, -130),
      availability: "revoked",
    },
  ];

  return {
    acknowledgements: [
      {
        documentId: summaryId,
        businessId,
        customerProfileId,
        acknowledgedAt: offsetIso(now, -114),
      },
    ],
    appointments,
    branding,
    context: { businessId, customerProfileId },
    documentPaths: {
      [preparationId]: "/portal/demo/files/preparation-guide",
      [summaryId]: "/portal/demo/files/care-summary",
    },
    documents,
    messages,
    profile,
    requests: [
      {
        id: "55555555-5555-4555-8555-555555555551",
        businessId,
        customerProfileId,
        requestType: "appointment",
        subject: "Confirm insurance details",
        status: "open",
        customerVisibleDetail: "Please confirm whether my updated insurance card can be reviewed at check-in.",
        createdAt: offsetIso(now, -1),
        updatedAt: offsetIso(now, -1),
      },
    ],
  };
}
