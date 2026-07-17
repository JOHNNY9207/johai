import type {
  PortalAppointment,
  PortalDocument,
  PortalDocumentAcknowledgement,
  PortalMessage,
  PortalMessageInput,
  PortalPagination,
  PortalProfile,
  PortalProfileUpdate,
  PortalRequest,
  PortalRequestInput,
} from "./customer-portal-types.ts";

export type PortalRepositoryErrorCode =
  | "DEMO_FAILURE"
  | "DOWNLOAD_UNAVAILABLE"
  | "LOAD_FAILED"
  | "SESSION_EXPIRED"
  | "VALIDATION_ERROR";

export class PortalRepositoryError extends Error {
  readonly code: PortalRepositoryErrorCode;

  constructor(message: string, code: PortalRepositoryErrorCode) {
    super(message);
    this.name = "PortalRepositoryError";
    this.code = code;
  }
}

export type PortalRepository = Readonly<{
  acknowledgeDocument: (documentId: string) => Promise<PortalDocumentAcknowledgement>;
  createRequest: (input: PortalRequestInput) => Promise<PortalRequest>;
  downloadDocument: (documentId: string) => Promise<string>;
  listAcknowledgements: (documentIds: readonly string[]) => Promise<PortalDocumentAcknowledgement[]>;
  listDocuments: (pagination?: PortalPagination) => Promise<PortalDocument[]>;
  listMessages: (pagination?: PortalPagination) => Promise<PortalMessage[]>;
  listPastAppointments: (boundary: string, pagination?: PortalPagination) => Promise<PortalAppointment[]>;
  listRequests: (pagination?: PortalPagination) => Promise<PortalRequest[]>;
  listUpcomingAppointments: (boundary: string, pagination?: PortalPagination) => Promise<PortalAppointment[]>;
  sendMessage: (input: PortalMessageInput) => Promise<PortalMessage>;
  updateProfile: (update: PortalProfileUpdate) => Promise<PortalProfile>;
}>;
