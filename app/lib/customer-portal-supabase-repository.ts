"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  acknowledgePortalDocument,
  createPortalRequest,
  listPortalAcknowledgements,
  listPortalDocuments,
  listPortalMessages,
  listPortalPastAppointments,
  listPortalRequests,
  listPortalUpcomingAppointments,
  sendPortalMessage,
  updatePortalProfile,
} from "@/app/lib/customer-portal-data";
import {
  PortalRepositoryError,
  type PortalRepository,
} from "@/app/lib/customer-portal-repository";
import type { PortalTenantContext } from "@/app/lib/customer-portal-types";

function safeSignedDownloadUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function createSupabasePortalRepository(
  client: SupabaseClient,
  context: PortalTenantContext,
  accessToken: string
): PortalRepository {
  return {
    acknowledgeDocument: (documentId) => acknowledgePortalDocument(client, context, documentId),
    createRequest: (input) => createPortalRequest(client, context, input),
    async downloadDocument(documentId) {
      if (!accessToken) throw new PortalRepositoryError("Sign-in required.", "SESSION_EXPIRED");
      const response = await fetch(
        `/api/portal/documents/${encodeURIComponent(documentId)}/download`,
        { cache: "no-store", headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const result = (await response.json().catch(() => null)) as { url?: unknown } | null;
      const downloadUrl = safeSignedDownloadUrl(result?.url);
      if (response.status === 401) {
        throw new PortalRepositoryError("Sign-in required.", "SESSION_EXPIRED");
      }
      if (!response.ok || !downloadUrl) {
        throw new PortalRepositoryError("The document download is unavailable.", "DOWNLOAD_UNAVAILABLE");
      }
      return downloadUrl;
    },
    listAcknowledgements: (documentIds) => listPortalAcknowledgements(client, context, documentIds),
    listDocuments: (pagination) => listPortalDocuments(client, context, pagination),
    listMessages: (pagination) => listPortalMessages(client, context, pagination),
    listPastAppointments: (boundary, pagination) => listPortalPastAppointments(client, context, boundary, pagination),
    listRequests: (pagination) => listPortalRequests(client, context, pagination),
    listUpcomingAppointments: (boundary, pagination) => listPortalUpcomingAppointments(client, context, boundary, pagination),
    sendMessage: (input) => sendPortalMessage(client, context, input),
    updateProfile: (update) => updatePortalProfile(client, context, update),
  };
}
