"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  portalAppointmentStatuses,
  portalDocumentTypes,
  portalMessageSenderTypes,
  portalRequestStatuses,
  type JsonObject,
  type JsonValue,
  type PortalAppointment,
  type PortalBranding,
  type PortalDocument,
  type PortalDocumentAcknowledgement,
  type PortalMessage,
  type PortalMessageInput,
  type PortalPagination,
  type PortalProfile,
  type PortalProfileUpdate,
  type PortalRequest,
  type PortalRequestInput,
  type PortalTenantContext,
} from "@/app/lib/customer-portal-types";

const PROFILE_COLUMNS =
  "id,business_id,full_name,email,phone,preferred_language,communication_preference,address,notification_preferences,updated_at";
const BRANDING_COLUMNS =
  "business_id,display_name,logo_url,primary_color,secondary_color,contact_email,contact_phone,address,business_hours,support_email,booking_url,industry,updated_at";
const APPOINTMENT_COLUMNS =
  "id,business_id,customer_profile_id,status,starts_at,ends_at,timezone,location,meeting_url,service_name,customer_visible_notes,reschedule_url,cancel_url,updated_at";
const MESSAGE_COLUMNS =
  "id,business_id,customer_profile_id,sender_type,body,human_support_requested,created_at";
const DOCUMENT_COLUMNS =
  "id,business_id,customer_profile_id,document_type,title,mime_type,file_size,shared_at";
const ACKNOWLEDGEMENT_COLUMNS =
  "document_id,customer_profile_id,business_id,acknowledged_at";
const REQUEST_COLUMNS =
  "id,business_id,customer_profile_id,request_type,subject,status,customer_visible_detail,created_at,updated_at";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANGUAGE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;
const SLUG_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

type UnknownRecord = Record<string, unknown>;

export class CustomerPortalDataError extends Error {
  readonly code: string;

  constructor(message: string, code = "CUSTOMER_PORTAL_DATA_ERROR") {
    super(message);
    this.name = "CustomerPortalDataError";
    this.code = code;
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, entity: string): UnknownRecord {
  if (!isRecord(value)) {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value;
}

function requireRows(value: unknown, entity: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value;
}

function readString(row: UnknownRecord, key: string, entity: string): string {
  const value = row[key];

  if (typeof value !== "string") {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value;
}

function readUuid(row: UnknownRecord, key: string, entity: string): string {
  const value = readString(row, key, entity);
  assertUuid(value, `${entity}.${key}`);
  return value;
}

function readBoolean(row: UnknownRecord, key: string, entity: string): boolean {
  const value = row[key];

  if (typeof value !== "boolean") {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value;
}

function readTimestamp(row: UnknownRecord, key: string, entity: string): string {
  const value = readString(row, key, entity);

  if (Number.isNaN(Date.parse(value))) {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value;
}

function readNullableTimestamp(
  row: UnknownRecord,
  key: string,
  entity: string
): string | null {
  if (row[key] === null) return null;
  return readTimestamp(row, key, entity);
}

function readEnum<T extends string>(
  row: UnknownRecord,
  key: string,
  entity: string,
  allowed: readonly T[]
): T {
  const value = readString(row, key, entity);

  if (!(allowed as readonly string[]).includes(value)) {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value as T;
}

function isJsonValue(value: unknown, depth = 0): value is JsonValue {
  if (depth > 24) return false;
  if (value === null) return true;

  if (
    typeof value === "boolean" ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item, depth + 1));
  }

  if (!isRecord(value)) return false;

  return Object.values(value).every(
    (item) => item !== undefined && isJsonValue(item, depth + 1)
  );
}

function normalizeJsonObject(
  value: unknown,
  label: string,
  maximumLength = 20_000
): JsonObject {
  if (!isRecord(value) || !isJsonValue(value)) {
    throw new CustomerPortalDataError(
      `${label} must be a JSON object.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const serialized = JSON.stringify(value);

  if (serialized.length > maximumLength) {
    throw new CustomerPortalDataError(
      `${label} is too large.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  return JSON.parse(serialized) as JsonObject;
}

function readFileSize(row: UnknownRecord, key: string, entity: string): number {
  const raw = row[key];
  const value = typeof raw === "string" && raw.trim() ? Number(raw) : raw;

  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new CustomerPortalDataError(
      `The ${entity} response was invalid.`,
      "CUSTOMER_PORTAL_RESPONSE_INVALID"
    );
  }

  return value;
}

function normalizeSafeUrl(value: string): string {
  const normalized = value.trim();
  if (!normalized) return "";

  if (normalized.startsWith("/") && !normalized.startsWith("//")) {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeColor(value: string): string {
  const normalized = value.trim();
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : "";
}

function assertUuid(value: string, label: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new CustomerPortalDataError(
      `${label} is invalid.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }
}

function assertContext(context: PortalTenantContext): void {
  if (!isRecord(context)) {
    throw new CustomerPortalDataError(
      "The portal context is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  assertUuid(context.customerProfileId, "customerProfileId");
  assertUuid(context.businessId, "businessId");
}

function normalizeText(
  value: unknown,
  label: string,
  maximumLength: number,
  required = false
): string {
  if (typeof value !== "string") {
    throw new CustomerPortalDataError(
      `${label} is invalid.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const normalized = value.trim();

  if ((required && !normalized) || normalized.length > maximumLength) {
    throw new CustomerPortalDataError(
      `${label} is invalid.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  return normalized;
}

function normalizeIsoBoundary(value: string, label: string): string {
  if (typeof value !== "string") {
    throw new CustomerPortalDataError(
      `${label} must be a valid ISO timestamp.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const normalized = value.trim();
  const isoTimestampPattern =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
  const match = isoTimestampPattern.exec(normalized);
  const timestamp = Date.parse(normalized);

  if (!match || Number.isNaN(timestamp)) {
    throw new CustomerPortalDataError(
      `${label} must be a valid ISO timestamp.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const [, year, month, day, hour, minute, second] = match;
  const calendarCheck = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  );

  if (
    calendarCheck.getUTCFullYear() !== Number(year) ||
    calendarCheck.getUTCMonth() !== Number(month) - 1 ||
    calendarCheck.getUTCDate() !== Number(day) ||
    calendarCheck.getUTCHours() !== Number(hour) ||
    calendarCheck.getUTCMinutes() !== Number(minute) ||
    calendarCheck.getUTCSeconds() !== Number(second)
  ) {
    throw new CustomerPortalDataError(
      `${label} must be a valid ISO timestamp.`,
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  return new Date(timestamp).toISOString();
}

function queryErrorCode(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

function throwQueryError(error: unknown, message: string): never {
  throw new CustomerPortalDataError(
    message,
    queryErrorCode(error) ?? "CUSTOMER_PORTAL_QUERY_FAILED"
  );
}

function paginationRange(
  pagination: PortalPagination | undefined,
  defaultLimit: number
): readonly [number, number] {
  const limit = pagination?.limit ?? defaultLimit;
  const offset = pagination?.offset ?? 0;

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 500 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 100_000
  ) {
    throw new CustomerPortalDataError(
      "The requested page is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  return [offset, offset + limit - 1];
}

function mapProfile(value: unknown): PortalProfile {
  const row = requireRecord(value, "profile");

  return {
    id: readUuid(row, "id", "profile"),
    businessId: readUuid(row, "business_id", "profile"),
    fullName: readString(row, "full_name", "profile"),
    email: readString(row, "email", "profile"),
    phone: readString(row, "phone", "profile"),
    preferredLanguage: readString(row, "preferred_language", "profile"),
    communicationPreference: readString(
      row,
      "communication_preference",
      "profile"
    ),
    address: normalizeJsonObject(row.address, "Profile address"),
    notificationPreferences: normalizeJsonObject(
      row.notification_preferences,
      "Notification preferences"
    ),
    updatedAt: readTimestamp(row, "updated_at", "profile"),
  };
}

function mapBranding(value: unknown): PortalBranding {
  const row = requireRecord(value, "branding");

  return {
    businessId: readUuid(row, "business_id", "branding"),
    displayName: readString(row, "display_name", "branding"),
    logoUrl: normalizeSafeUrl(readString(row, "logo_url", "branding")),
    primaryColor: normalizeColor(
      readString(row, "primary_color", "branding")
    ),
    secondaryColor: normalizeColor(
      readString(row, "secondary_color", "branding")
    ),
    contactEmail: readString(row, "contact_email", "branding"),
    contactPhone: readString(row, "contact_phone", "branding"),
    address: readString(row, "address", "branding"),
    businessHours: normalizeJsonObject(
      row.business_hours,
      "Business hours",
      50_000
    ),
    supportEmail: readString(row, "support_email", "branding"),
    bookingUrl: normalizeSafeUrl(
      readString(row, "booking_url", "branding")
    ),
    industry: readString(row, "industry", "branding"),
    updatedAt: readTimestamp(row, "updated_at", "branding"),
  };
}

function mapAppointment(value: unknown): PortalAppointment {
  const row = requireRecord(value, "appointment");

  return {
    id: readUuid(row, "id", "appointment"),
    businessId: readUuid(row, "business_id", "appointment"),
    customerProfileId: readUuid(
      row,
      "customer_profile_id",
      "appointment"
    ),
    status: readEnum(
      row,
      "status",
      "appointment",
      portalAppointmentStatuses
    ),
    startsAt: readTimestamp(row, "starts_at", "appointment"),
    endsAt: readNullableTimestamp(row, "ends_at", "appointment"),
    timezone: readString(row, "timezone", "appointment"),
    location: readString(row, "location", "appointment"),
    meetingUrl: normalizeSafeUrl(
      readString(row, "meeting_url", "appointment")
    ),
    serviceName: readString(row, "service_name", "appointment"),
    customerVisibleNotes: readString(
      row,
      "customer_visible_notes",
      "appointment"
    ),
    rescheduleUrl: normalizeSafeUrl(
      readString(row, "reschedule_url", "appointment")
    ),
    cancelUrl: normalizeSafeUrl(
      readString(row, "cancel_url", "appointment")
    ),
    updatedAt: readTimestamp(row, "updated_at", "appointment"),
  };
}

function mapMessage(value: unknown): PortalMessage {
  const row = requireRecord(value, "message");

  return {
    id: readUuid(row, "id", "message"),
    businessId: readUuid(row, "business_id", "message"),
    customerProfileId: readUuid(row, "customer_profile_id", "message"),
    senderType: readEnum(
      row,
      "sender_type",
      "message",
      portalMessageSenderTypes
    ),
    body: readString(row, "body", "message"),
    humanSupportRequested: readBoolean(
      row,
      "human_support_requested",
      "message"
    ),
    createdAt: readTimestamp(row, "created_at", "message"),
  };
}

function mapDocument(value: unknown): PortalDocument {
  const row = requireRecord(value, "document");

  return {
    id: readUuid(row, "id", "document"),
    businessId: readUuid(row, "business_id", "document"),
    customerProfileId: readUuid(row, "customer_profile_id", "document"),
    documentType: readEnum(
      row,
      "document_type",
      "document",
      portalDocumentTypes
    ),
    title: readString(row, "title", "document"),
    mimeType: readString(row, "mime_type", "document"),
    fileSize: readFileSize(row, "file_size", "document"),
    sharedAt: readTimestamp(row, "shared_at", "document"),
    availability: "available",
  };
}

function mapAcknowledgement(value: unknown): PortalDocumentAcknowledgement {
  const row = requireRecord(value, "document acknowledgement");

  return {
    documentId: readUuid(row, "document_id", "document acknowledgement"),
    customerProfileId: readUuid(
      row,
      "customer_profile_id",
      "document acknowledgement"
    ),
    businessId: readUuid(
      row,
      "business_id",
      "document acknowledgement"
    ),
    acknowledgedAt: readTimestamp(
      row,
      "acknowledged_at",
      "document acknowledgement"
    ),
  };
}

function mapRequest(value: unknown): PortalRequest {
  const row = requireRecord(value, "request");

  return {
    id: readUuid(row, "id", "request"),
    businessId: readUuid(row, "business_id", "request"),
    customerProfileId: readUuid(row, "customer_profile_id", "request"),
    requestType: readString(row, "request_type", "request"),
    subject: readString(row, "subject", "request"),
    status: readEnum(row, "status", "request", portalRequestStatuses),
    customerVisibleDetail: readString(
      row,
      "customer_visible_detail",
      "request"
    ),
    createdAt: readTimestamp(row, "created_at", "request"),
    updatedAt: readTimestamp(row, "updated_at", "request"),
  };
}

export async function listPortalProfiles(
  client: SupabaseClient
): Promise<PortalProfile[]> {
  const { data, error } = await client
    .from("customer_profiles")
    .select(PROFILE_COLUMNS)
    .order("business_id", { ascending: true })
    .limit(50);

  if (error) throwQueryError(error, "Customer profiles could not be loaded.");

  return requireRows(data, "profiles").map(mapProfile);
}

export async function getPortalProfile(
  client: SupabaseClient,
  context: PortalTenantContext
): Promise<PortalProfile | null> {
  assertContext(context);

  const { data, error } = await client
    .from("customer_profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .maybeSingle();

  if (error) throwQueryError(error, "The customer profile could not be loaded.");
  return data === null ? null : mapProfile(data);
}

export async function updatePortalProfile(
  client: SupabaseClient,
  context: PortalTenantContext,
  update: PortalProfileUpdate
): Promise<PortalProfile> {
  assertContext(context);

  if (!isRecord(update)) {
    throw new CustomerPortalDataError(
      "The profile update is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const patch: Record<string, unknown> = {};

  if (update.fullName !== undefined) {
    patch.full_name = normalizeText(update.fullName, "Full name", 200);
  }

  if (update.email !== undefined) {
    const email = normalizeText(update.email, "Email", 320);

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new CustomerPortalDataError(
        "Email is invalid.",
        "CUSTOMER_PORTAL_VALIDATION_ERROR"
      );
    }

    patch.email = email.toLowerCase();
  }

  if (update.phone !== undefined) {
    patch.phone = normalizeText(update.phone, "Phone", 64);
  }

  if (update.preferredLanguage !== undefined) {
    const language = normalizeText(
      update.preferredLanguage,
      "Preferred language",
      35,
      true
    );

    if (!LANGUAGE_PATTERN.test(language)) {
      throw new CustomerPortalDataError(
        "Preferred language is invalid.",
        "CUSTOMER_PORTAL_VALIDATION_ERROR"
      );
    }

    patch.preferred_language = language;
  }

  if (update.communicationPreference !== undefined) {
    const preference = normalizeText(
      update.communicationPreference,
      "Communication preference",
      64,
      true
    ).toLowerCase();

    if (!SLUG_PATTERN.test(preference)) {
      throw new CustomerPortalDataError(
        "Communication preference is invalid.",
        "CUSTOMER_PORTAL_VALIDATION_ERROR"
      );
    }

    patch.communication_preference = preference;
  }

  if (update.address !== undefined) {
    patch.address = normalizeJsonObject(update.address, "Address");
  }

  if (update.notificationPreferences !== undefined) {
    patch.notification_preferences = normalizeJsonObject(
      update.notificationPreferences,
      "Notification preferences"
    );
  }

  if (Object.keys(patch).length === 0) {
    throw new CustomerPortalDataError(
      "At least one profile field must be changed.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const { data, error } = await client
    .from("customer_profiles")
    .update(patch)
    .eq("id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throwQueryError(error, "The customer profile could not be updated.");
  return mapProfile(data);
}

export async function getPortalBranding(
  client: SupabaseClient,
  context: PortalTenantContext
): Promise<PortalBranding | null> {
  assertContext(context);

  const { data, error } = await client
    .from("customer_portal_branding")
    .select(BRANDING_COLUMNS)
    .eq("business_id", context.businessId)
    .maybeSingle();

  if (error) throwQueryError(error, "Portal branding could not be loaded.");
  return data === null ? null : mapBranding(data);
}

export async function listPortalAppointments(
  client: SupabaseClient,
  context: PortalTenantContext,
  pagination?: PortalPagination
): Promise<PortalAppointment[]> {
  assertContext(context);
  const [from, to] = paginationRange(pagination, 100);

  const { data, error } = await client
    .from("customer_portal_appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .order("starts_at", { ascending: true })
    .range(from, to);

  if (error) throwQueryError(error, "Appointments could not be loaded.");
  return requireRows(data, "appointments").map(mapAppointment);
}

export async function listPortalUpcomingAppointments(
  client: SupabaseClient,
  context: PortalTenantContext,
  boundary: string,
  pagination?: PortalPagination
): Promise<PortalAppointment[]> {
  assertContext(context);
  const normalizedBoundary = normalizeIsoBoundary(boundary, "Appointment boundary");
  const [from, to] = paginationRange(pagination, 100);

  const { data, error } = await client
    .from("customer_portal_appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .gte("starts_at", normalizedBoundary)
    .order("starts_at", { ascending: true })
    .range(from, to);

  if (error) {
    throwQueryError(error, "Upcoming appointments could not be loaded.");
  }

  return requireRows(data, "upcoming appointments").map(mapAppointment);
}

export async function listPortalPastAppointments(
  client: SupabaseClient,
  context: PortalTenantContext,
  boundary: string,
  pagination?: PortalPagination
): Promise<PortalAppointment[]> {
  assertContext(context);
  const normalizedBoundary = normalizeIsoBoundary(boundary, "Appointment boundary");
  const [from, to] = paginationRange(pagination, 100);

  const { data, error } = await client
    .from("customer_portal_appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .lt("starts_at", normalizedBoundary)
    .order("starts_at", { ascending: false })
    .range(from, to);

  if (error) {
    throwQueryError(error, "Past appointments could not be loaded.");
  }

  return requireRows(data, "past appointments").map(mapAppointment);
}

export async function listPortalMessages(
  client: SupabaseClient,
  context: PortalTenantContext,
  pagination?: PortalPagination
): Promise<PortalMessage[]> {
  assertContext(context);
  const [from, to] = paginationRange(pagination, 200);

  const { data, error } = await client
    .from("customer_portal_messages")
    .select(MESSAGE_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throwQueryError(error, "Messages could not be loaded.");
  return requireRows(data, "messages").map(mapMessage).reverse();
}

export async function sendPortalMessage(
  client: SupabaseClient,
  context: PortalTenantContext,
  input: PortalMessageInput
): Promise<PortalMessage> {
  assertContext(context);

  if (!isRecord(input)) {
    throw new CustomerPortalDataError(
      "The message is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const body = normalizeText(input.body, "Message", 10_000, true);
  const humanSupportRequested = input.humanSupportRequested ?? false;

  if (typeof humanSupportRequested !== "boolean") {
    throw new CustomerPortalDataError(
      "The support preference is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const { data, error } = await client
    .from("customer_portal_messages")
    .insert({
      business_id: context.businessId,
      customer_profile_id: context.customerProfileId,
      sender_type: "customer",
      body,
      human_support_requested: humanSupportRequested,
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) throwQueryError(error, "The message could not be sent.");
  return mapMessage(data);
}

export async function listPortalDocuments(
  client: SupabaseClient,
  context: PortalTenantContext,
  pagination?: PortalPagination
): Promise<PortalDocument[]> {
  assertContext(context);
  const [from, to] = paginationRange(pagination, 100);

  const { data, error } = await client
    .from("customer_portal_documents")
    .select(DOCUMENT_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .order("shared_at", { ascending: false })
    .range(from, to);

  if (error) throwQueryError(error, "Documents could not be loaded.");
  return requireRows(data, "documents").map(mapDocument);
}

async function visibleDocumentIds(
  client: SupabaseClient,
  context: PortalTenantContext,
  documentIds: readonly string[]
): Promise<string[]> {
  const uniqueIds = [...new Set(documentIds)];

  if (uniqueIds.length > 500) {
    throw new CustomerPortalDataError(
      "Too many documents were requested.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  uniqueIds.forEach((id) => assertUuid(id, "documentId"));
  if (uniqueIds.length === 0) return [];

  const { data, error } = await client
    .from("customer_portal_documents")
    .select("id")
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .in("id", uniqueIds);

  if (error) throwQueryError(error, "Document access could not be confirmed.");

  return requireRows(data, "documents").map((value) => {
    const row = requireRecord(value, "document");
    return readUuid(row, "id", "document");
  });
}

export async function listPortalAcknowledgements(
  client: SupabaseClient,
  context: PortalTenantContext,
  documentIds: readonly string[]
): Promise<PortalDocumentAcknowledgement[]> {
  assertContext(context);
  const allowedIds = await visibleDocumentIds(client, context, documentIds);
  if (allowedIds.length === 0) return [];

  const { data, error } = await client
    .from("customer_portal_document_acknowledgements")
    .select(ACKNOWLEDGEMENT_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .in("document_id", allowedIds)
    .order("acknowledged_at", { ascending: false });

  if (error) {
    throwQueryError(error, "Document acknowledgements could not be loaded.");
  }

  return requireRows(data, "document acknowledgements").map(
    mapAcknowledgement
  );
}

async function getPortalAcknowledgement(
  client: SupabaseClient,
  context: PortalTenantContext,
  documentId: string
): Promise<PortalDocumentAcknowledgement | null> {
  const { data, error } = await client
    .from("customer_portal_document_acknowledgements")
    .select(ACKNOWLEDGEMENT_COLUMNS)
    .eq("document_id", documentId)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .maybeSingle();

  if (error) {
    throwQueryError(error, "The document acknowledgement could not be loaded.");
  }

  return data === null ? null : mapAcknowledgement(data);
}

export async function acknowledgePortalDocument(
  client: SupabaseClient,
  context: PortalTenantContext,
  documentId: string
): Promise<PortalDocumentAcknowledgement> {
  assertContext(context);
  assertUuid(documentId, "documentId");

  const allowedIds = await visibleDocumentIds(client, context, [documentId]);

  if (!allowedIds.includes(documentId)) {
    throw new CustomerPortalDataError(
      "The document is not available.",
      "CUSTOMER_PORTAL_DOCUMENT_UNAVAILABLE"
    );
  }

  const { data, error } = await client
    .from("customer_portal_document_acknowledgements")
    .insert({
      document_id: documentId,
      customer_profile_id: context.customerProfileId,
      business_id: context.businessId,
    })
    .select(ACKNOWLEDGEMENT_COLUMNS)
    .single();

  if (error && queryErrorCode(error) === "23505") {
    const existing = await getPortalAcknowledgement(client, context, documentId);
    if (existing) return existing;
  }

  if (error) {
    throwQueryError(error, "The document could not be acknowledged.");
  }

  return mapAcknowledgement(data);
}

export async function listPortalRequests(
  client: SupabaseClient,
  context: PortalTenantContext,
  pagination?: PortalPagination
): Promise<PortalRequest[]> {
  assertContext(context);
  const [from, to] = paginationRange(pagination, 100);

  const { data, error } = await client
    .from("customer_portal_requests")
    .select(REQUEST_COLUMNS)
    .eq("customer_profile_id", context.customerProfileId)
    .eq("business_id", context.businessId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throwQueryError(error, "Support requests could not be loaded.");
  return requireRows(data, "support requests").map(mapRequest);
}

export async function createPortalRequest(
  client: SupabaseClient,
  context: PortalTenantContext,
  input: PortalRequestInput
): Promise<PortalRequest> {
  assertContext(context);

  if (!isRecord(input)) {
    throw new CustomerPortalDataError(
      "The support request is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const requestType = normalizeText(
    input.requestType ?? "support",
    "Request type",
    64,
    true
  ).toLowerCase();

  if (!SLUG_PATTERN.test(requestType)) {
    throw new CustomerPortalDataError(
      "Request type is invalid.",
      "CUSTOMER_PORTAL_VALIDATION_ERROR"
    );
  }

  const subject = normalizeText(input.subject, "Subject", 200, true);
  const customerVisibleDetail = normalizeText(
    input.customerVisibleDetail ?? "",
    "Request detail",
    5_000
  );

  const { data, error } = await client
    .from("customer_portal_requests")
    .insert({
      business_id: context.businessId,
      customer_profile_id: context.customerProfileId,
      request_type: requestType,
      subject,
      customer_visible_detail: customerVisibleDetail,
    })
    .select(REQUEST_COLUMNS)
    .single();

  if (error) throwQueryError(error, "The support request could not be created.");
  return mapRequest(data);
}
