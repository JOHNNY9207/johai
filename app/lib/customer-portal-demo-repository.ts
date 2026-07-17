import {
  createCustomerPortalDemoFixture,
  type PortalDemoFixture,
} from "./customer-portal-demo-fixture.ts";
import {
  PortalRepositoryError,
  type PortalRepository,
} from "./customer-portal-repository.ts";
import type {
  PortalAppointment,
  PortalDocument,
  PortalDocumentAcknowledgement,
  PortalMessage,
  PortalProfile,
  PortalRequest,
} from "./customer-portal-types.ts";

export type PortalDemoDataMode = "error" | "normal" | "empty";

export type PortalDemoRepository = PortalRepository & Readonly<{
  failNextDownload: () => void;
  failNextMessage: () => void;
  failNextProfileSaveWithSessionError: () => void;
  getDataMode: () => PortalDemoDataMode;
  getFixture: () => PortalDemoFixture;
  getProfile: () => PortalProfile;
  reset: () => PortalProfile;
  setDataMode: (mode: PortalDemoDataMode) => void;
}>;

type DemoState = {
  acknowledgements: PortalDocumentAcknowledgement[];
  appointments: PortalAppointment[];
  documents: PortalDocument[];
  messages: PortalMessage[];
  profile: PortalProfile;
  requests: PortalRequest[];
};

function cloneFixture(fixture: PortalDemoFixture): DemoState {
  return {
    acknowledgements: fixture.acknowledgements.map((item) => ({ ...item })),
    appointments: fixture.appointments.map((item) => ({ ...item })),
    documents: fixture.documents.map((item) => ({ ...item })),
    messages: fixture.messages.map((item) => ({ ...item })),
    profile: {
      ...fixture.profile,
      address: { ...fixture.profile.address },
      notificationPreferences: { ...fixture.profile.notificationPreferences },
    },
    requests: fixture.requests.map((item) => ({ ...item })),
  };
}

function page<T>(items: readonly T[], limit = 100, offset = 0) {
  return items.slice(offset, offset + limit);
}

function wait(milliseconds: number) {
  return milliseconds > 0
    ? new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
    : Promise.resolve();
}

export function createCustomerPortalDemoRepository(options?: {
  fixture?: PortalDemoFixture;
  latencyMs?: number;
}): PortalDemoRepository {
  const fixture = options?.fixture ?? createCustomerPortalDemoFixture();
  const latencyMs = options?.latencyMs ?? 220;
  let state = cloneFixture(fixture);
  let dataMode: PortalDemoDataMode = "normal";
  let messageSequence = state.messages.length;
  let requestSequence = state.requests.length;
  let shouldFailDownload = false;
  let shouldFailMessage = false;
  let shouldExpireProfileSave = false;

  async function beforeRead() {
    await wait(latencyMs);
    if (dataMode === "error") {
      throw new PortalRepositoryError(
        "The fictional demo data could not be loaded.",
        "LOAD_FAILED"
      );
    }
  }

  function emptyOr<T>(items: readonly T[]) {
    return dataMode === "empty" ? [] : items;
  }

  const repository: PortalDemoRepository = {
    async acknowledgeDocument(documentId) {
      await wait(latencyMs);
      const document = state.documents.find((item) => item.id === documentId);
      if (!document || document.availability !== "available") {
        throw new PortalRepositoryError(
          "The fictional document is unavailable.",
          "DOWNLOAD_UNAVAILABLE"
        );
      }
      const existing = state.acknowledgements.find(
        (item) => item.documentId === documentId
      );
      if (existing) return { ...existing };
      const acknowledgement: PortalDocumentAcknowledgement = {
        businessId: fixture.context.businessId,
        customerProfileId: fixture.context.customerProfileId,
        documentId,
        acknowledgedAt: new Date().toISOString(),
      };
      state.acknowledgements.push(acknowledgement);
      return { ...acknowledgement };
    },
    async createRequest(input) {
      await wait(latencyMs);
      const subject = input.subject.trim();
      if (!subject || subject.length > 200) {
        throw new PortalRepositoryError(
          "Add a subject of 200 characters or fewer.",
          "VALIDATION_ERROR"
        );
      }
      requestSequence += 1;
      const createdAt = new Date().toISOString();
      const request: PortalRequest = {
        id: `77777777-7777-4777-8777-${String(requestSequence).padStart(12, "0")}`,
        businessId: fixture.context.businessId,
        customerProfileId: fixture.context.customerProfileId,
        requestType: (input.requestType ?? "general").trim() || "general",
        subject,
        status: "open",
        customerVisibleDetail: (input.customerVisibleDetail ?? "").trim(),
        createdAt,
        updatedAt: createdAt,
      };
      state.requests.unshift(request);
      return { ...request };
    },
    async downloadDocument(documentId) {
      await wait(latencyMs);
      if (shouldFailDownload) {
        shouldFailDownload = false;
        throw new PortalRepositoryError(
          "A fictional one-time download failure was requested.",
          "DEMO_FAILURE"
        );
      }
      const document = state.documents.find((item) => item.id === documentId);
      const path = fixture.documentPaths[documentId];
      if (!document || document.availability !== "available" || !path) {
        throw new PortalRepositoryError(
          "The fictional document is unavailable.",
          "DOWNLOAD_UNAVAILABLE"
        );
      }
      return path;
    },
    failNextDownload() {
      shouldFailDownload = true;
    },
    failNextMessage() {
      shouldFailMessage = true;
    },
    failNextProfileSaveWithSessionError() {
      shouldExpireProfileSave = true;
    },
    getDataMode: () => dataMode,
    getFixture: () => fixture,
    getProfile: () => state.profile,
    async listAcknowledgements(documentIds) {
      await beforeRead();
      const allowedIds = new Set(documentIds);
      return emptyOr(state.acknowledgements)
        .filter((item) => allowedIds.has(item.documentId))
        .map((item) => ({ ...item }));
    },
    async listDocuments(pagination) {
      await beforeRead();
      return page(
        emptyOr(state.documents),
        pagination?.limit,
        pagination?.offset
      ).map((item) => ({ ...item }));
    },
    async listMessages(pagination) {
      await beforeRead();
      return page(
        emptyOr(state.messages),
        pagination?.limit ?? 200,
        pagination?.offset
      ).map((item) => ({ ...item }));
    },
    async listPastAppointments(boundary, pagination) {
      await beforeRead();
      const boundaryTime = new Date(boundary).getTime();
      return page(
        emptyOr(state.appointments)
          .filter((item) => new Date(item.startsAt).getTime() < boundaryTime)
          .sort(
            (left, right) =>
              new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime()
          ),
        pagination?.limit,
        pagination?.offset
      ).map((item) => ({ ...item }));
    },
    async listRequests(pagination) {
      await beforeRead();
      return page(
        emptyOr(state.requests),
        pagination?.limit,
        pagination?.offset
      ).map((item) => ({ ...item }));
    },
    async listUpcomingAppointments(boundary, pagination) {
      await beforeRead();
      const boundaryTime = new Date(boundary).getTime();
      return page(
        emptyOr(state.appointments)
          .filter((item) => new Date(item.startsAt).getTime() >= boundaryTime)
          .sort(
            (left, right) =>
              new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
          ),
        pagination?.limit,
        pagination?.offset
      ).map((item) => ({ ...item }));
    },
    reset() {
      state = cloneFixture(fixture);
      dataMode = "normal";
      shouldFailDownload = false;
      shouldFailMessage = false;
      shouldExpireProfileSave = false;
      messageSequence = state.messages.length;
      requestSequence = state.requests.length;
      return state.profile;
    },
    setDataMode(mode) {
      dataMode = mode;
    },
    async sendMessage(input) {
      await wait(latencyMs);
      if (shouldFailMessage) {
        shouldFailMessage = false;
        throw new PortalRepositoryError(
          "A fictional one-time send failure was requested.",
          "DEMO_FAILURE"
        );
      }
      const body = input.body.trim();
      if (!body || body.length > 10_000) {
        throw new PortalRepositoryError(
          "Write a message of 10,000 characters or fewer.",
          "VALIDATION_ERROR"
        );
      }
      messageSequence += 1;
      const message: PortalMessage = {
        id: `88888888-8888-4888-8888-${String(messageSequence).padStart(12, "0")}`,
        businessId: fixture.context.businessId,
        customerProfileId: fixture.context.customerProfileId,
        senderType: "customer",
        body,
        humanSupportRequested: input.humanSupportRequested ?? false,
        createdAt: new Date().toISOString(),
      };
      state.messages.push(message);
      return { ...message };
    },
    async updateProfile(update) {
      await wait(latencyMs);
      if (shouldExpireProfileSave) {
        shouldExpireProfileSave = false;
        throw new PortalRepositoryError(
          "The fictional customer session expired.",
          "SESSION_EXPIRED"
        );
      }
      const fullName = update.fullName?.trim() ?? state.profile.fullName;
      const email = update.email?.trim().toLowerCase() ?? state.profile.email;
      const preferredLanguage =
        update.preferredLanguage?.trim() ?? state.profile.preferredLanguage;
      if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new PortalRepositoryError(
          "The fictional profile contains invalid contact details.",
          "VALIDATION_ERROR"
        );
      }
      if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(preferredLanguage)) {
        throw new PortalRepositoryError(
          "Use a language code such as en, es, or fr.",
          "VALIDATION_ERROR"
        );
      }
      state.profile = {
        ...state.profile,
        ...update,
        fullName,
        email,
        preferredLanguage,
        address: update.address
          ? { ...update.address }
          : state.profile.address,
        notificationPreferences: update.notificationPreferences
          ? { ...update.notificationPreferences }
          : state.profile.notificationPreferences,
        updatedAt: new Date().toISOString(),
      };
      return state.profile;
    },
  };

  return repository;
}
