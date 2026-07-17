export type JsonPrimitive = boolean | number | string | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

export type JsonObject = { [key: string]: JsonValue | undefined };

export type PortalTenantContext = Readonly<{
  businessId: string;
  customerProfileId: string;
}>;

export type PortalProfile = Readonly<{
  id: string;
  businessId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  communicationPreference: string;
  address: JsonObject;
  notificationPreferences: JsonObject;
  updatedAt: string;
}>;

export type PortalProfileUpdate = Readonly<{
  fullName?: string;
  email?: string;
  phone?: string;
  preferredLanguage?: string;
  communicationPreference?: string;
  address?: JsonObject;
  notificationPreferences?: JsonObject;
}>;

export type PortalBranding = Readonly<{
  businessId: string;
  displayName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: JsonObject;
  supportEmail: string;
  bookingUrl: string;
  industry: string;
  updatedAt: string;
}>;

export const portalAppointmentStatuses = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type PortalAppointmentStatus =
  (typeof portalAppointmentStatuses)[number];

export type PortalAppointment = Readonly<{
  id: string;
  businessId: string;
  customerProfileId: string;
  status: PortalAppointmentStatus;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  location: string;
  meetingUrl: string;
  serviceName: string;
  customerVisibleNotes: string;
  rescheduleUrl: string;
  cancelUrl: string;
  updatedAt: string;
}>;

export const portalMessageSenderTypes = ["customer", "ai", "human"] as const;

export type PortalMessageSenderType =
  (typeof portalMessageSenderTypes)[number];

export type PortalMessage = Readonly<{
  id: string;
  businessId: string;
  customerProfileId: string;
  senderType: PortalMessageSenderType;
  body: string;
  humanSupportRequested: boolean;
  createdAt: string;
}>;

export type PortalMessageInput = Readonly<{
  body: string;
  humanSupportRequested?: boolean;
}>;

export const portalDocumentTypes = [
  "quote",
  "invoice",
  "instructions",
  "contract",
  "report",
  "receipt",
  "form",
  "other",
] as const;

export type PortalDocumentType = (typeof portalDocumentTypes)[number];

export type PortalDocument = Readonly<{
  id: string;
  businessId: string;
  customerProfileId: string;
  documentType: PortalDocumentType;
  title: string;
  mimeType: string;
  fileSize: number;
  sharedAt: string;
  availability: "available" | "revoked";
}>;

export type PortalDocumentAcknowledgement = Readonly<{
  documentId: string;
  customerProfileId: string;
  businessId: string;
  acknowledgedAt: string;
}>;

export const portalRequestStatuses = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type PortalRequestStatus = (typeof portalRequestStatuses)[number];

export type PortalRequest = Readonly<{
  id: string;
  businessId: string;
  customerProfileId: string;
  requestType: string;
  subject: string;
  status: PortalRequestStatus;
  customerVisibleDetail: string;
  createdAt: string;
  updatedAt: string;
}>;

export type PortalRequestInput = Readonly<{
  requestType?: string;
  subject: string;
  customerVisibleDetail?: string;
}>;

export type PortalPagination = Readonly<{
  limit?: number;
  offset?: number;
}>;
