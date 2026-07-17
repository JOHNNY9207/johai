import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { isCustomerPortalDemoAvailable } from "../app/lib/customer-portal-demo-guard.ts";
import {
  createCustomerPortalDemoFixture,
  portalDemoReferenceTime,
} from "../app/lib/customer-portal-demo-fixture.ts";
import { createCustomerPortalDemoRepository } from "../app/lib/customer-portal-demo-repository.ts";
import {
  buildPortalAppointmentSuggestion,
  buildPortalDashboardInsights,
  buildPortalProfileGuidance,
  buildPortalSupportSuggestion,
  createPortalContextSnapshot,
  getPortalConfidenceLabel,
  portalContextPolicy,
  type PortalAccessState,
} from "../app/lib/customer-portal-contextual-intelligence.ts";
import {
  demoPortalContextualIntelligenceProvider,
  unavailablePortalContextualIntelligenceProvider,
} from "../app/lib/customer-portal-contextual-provider.ts";
import {
  formatPortalDate,
  getPortalLocale,
  getSafeTimeZone,
  portalDefaultLocale,
  portalDefaultTimeZone,
} from "../app/lib/customer-portal-formatting.ts";
import { PortalRepositoryError } from "../app/lib/customer-portal-repository.ts";
import { getOrCreateCachedBrowserAuthClient } from "../app/lib/supabase-browser-auth-client.ts";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function repository() {
  return createCustomerPortalDemoRepository({ latencyMs: 0 });
}

function intelligenceSnapshot(access: PortalAccessState = "active") {
  const fixture = createCustomerPortalDemoFixture();
  return createPortalContextSnapshot({
    access,
    acknowledgements: fixture.acknowledgements,
    appointments: fixture.appointments,
    branding: fixture.branding,
    context: fixture.context,
    documents: fixture.documents,
    messages: fixture.messages,
    profile: fixture.profile,
    referenceTime: portalDemoReferenceTime,
    requests: fixture.requests,
  });
}

test("1. portal home route renders the shared dashboard component", () => {
  assert.match(source("app/portal/demo/page.tsx"), /<PortalDashboard\s*\/>/);
});

test("2. appointments route and fixture expose upcoming and previous appointments", async () => {
  assert.match(source("app/portal/demo/appointments/page.tsx"), /<PortalAppointments\s*\/>/);
  const demo = repository();
  const boundary = portalDemoReferenceTime;
  const upcoming = await demo.listUpcomingAppointments(boundary);
  const past = await demo.listPastAppointments(boundary);
  assert.equal(upcoming[0]?.status, "confirmed");
  assert.equal(past[0]?.status, "completed");
  assert.deepEqual(demo.getFixture(), repository().getFixture());
  assert.equal(getPortalLocale("en"), "en-US");
  assert.equal(getPortalLocale("not a locale"), portalDefaultLocale);
  assert.equal(getSafeTimeZone("not/a-time-zone"), portalDefaultTimeZone);
  assert.equal(
    formatPortalDate(upcoming[0]!.startsAt, {
      locale: getPortalLocale(demo.getFixture().profile.preferredLanguage),
      timeZone: getSafeTimeZone(upcoming[0]!.timezone),
    }),
    "Jul 21, 2026, 12:10 AM"
  );
});

test("3. messages route includes human, AI-assisted, and customer fixture messages", async () => {
  assert.match(source("app/portal/demo/messages/page.tsx"), /<PortalMessages\s*\/>/);
  const senders = new Set((await repository().listMessages()).map((message) => message.senderType));
  assert.deepEqual([...senders].sort(), ["ai", "customer", "human"]);
});

test("4. customer can submit a demo message and retry a one-shot failure", async () => {
  const demo = repository();
  demo.failNextMessage();
  await assert.rejects(
    demo.sendMessage({ body: "Please confirm my appointment." }),
    (error) => error instanceof PortalRepositoryError && error.code === "DEMO_FAILURE"
  );
  const sent = await demo.sendMessage({
    body: "Please confirm my appointment.",
    humanSupportRequested: true,
  });
  assert.equal(sent.senderType, "customer");
  assert.equal(sent.humanSupportRequested, true);
});

test("5. documents route exposes available, acknowledged, and revoked fixture states", async () => {
  assert.match(source("app/portal/demo/documents/page.tsx"), /<PortalDocuments\s*\/>/);
  const demo = repository();
  const documents = await demo.listDocuments();
  assert.ok(documents.some((document) => document.availability === "available"));
  assert.ok(documents.some((document) => document.availability === "revoked"));
  const acknowledgements = await demo.listAcknowledgements(
    documents.map((document) => document.id)
  );
  assert.ok(acknowledgements.some((item) => item.documentId === documents[1]?.id));
});

test("6. document acknowledgement is idempotent and rejects revoked documents", async () => {
  const demo = repository();
  const documents = await demo.listDocuments();
  const available = documents.find((document) => document.availability === "available")!;
  const revoked = documents.find((document) => document.availability === "revoked")!;
  const first = await demo.acknowledgeDocument(available.id);
  const second = await demo.acknowledgeDocument(available.id);
  assert.equal(first.documentId, second.documentId);
  await assert.rejects(demo.acknowledgeDocument(revoked.id));
});

test("7. profile edit persists allowed fields and rejects an invalid language", async () => {
  const demo = repository();
  const updated = await demo.updateProfile({ phone: "+1 416 555 0199", preferredLanguage: "fr" });
  assert.equal(updated.phone, "+1 416 555 0199");
  assert.equal(updated.preferredLanguage, "fr");
  await assert.rejects(
    demo.updateProfile({ preferredLanguage: "French language" }),
    (error) => error instanceof PortalRepositoryError && error.code === "VALIDATION_ERROR"
  );
});

test("8. support request creation stays bound to the fixed fictional tenant", async () => {
  const demo = repository();
  const fixture = demo.getFixture();
  assert.match(
    source("components/portal/PortalSupport.tsx"),
    /<option value="human_assistance">Human assistance<\/option>/
  );
  const request = await demo.createRequest({
    requestType: "human_assistance",
    subject: "Please call me",
  });
  assert.equal(request.businessId, fixture.context.businessId);
  assert.equal(request.customerProfileId, fixture.context.customerProfileId);
  assert.equal(request.status, "open");
});

test("9. customer-facing feature components contain no forbidden internal field labels", () => {
  const portalComponentNames = [
    "PortalDashboard",
    "PortalAppointments",
    "PortalMessages",
    "PortalDocuments",
    "PortalProfile",
    "PortalSupport",
  ];
  const ui = portalComponentNames
    .map((name) => source(`components/portal/${name}.tsx`))
    .join("\n");
  for (const forbidden of [
    "auth_user_id",
    "lead_id",
    "internal_notes",
    "crm_score",
    "service_role",
    "storage_bucket",
    "storage_path",
  ]) {
    assert.equal(ui.toLowerCase().includes(forbidden), false, forbidden);
  }

  const dateComponents = [
    "PortalDashboard",
    "PortalAppointments",
    "PortalMessages",
    "PortalDocuments",
    "PortalSupport",
  ].map((name) => source(`components/portal/${name}.tsx`));
  for (const component of dateComponents) {
    assert.match(component, /getPortalLocale\(activeProfile\.preferredLanguage\)/);
  }
  assert.doesNotMatch(
    source("app/lib/customer-portal-formatting.ts"),
    /DateTimeFormat\(undefined/
  );
  assert.doesNotMatch(
    source("app/lib/customer-portal-demo-fixture.ts"),
    /createCustomerPortalDemoFixture\(now = new Date\(\)\)/
  );
  assert.doesNotMatch(
    source("components/portal/PortalDashboard.tsx") +
      source("components/portal/PortalAppointments.tsx"),
    /useState\(\(\) => new Date\(\)\.toISOString\(\)\)/
  );
  assert.match(source("app/layout.tsx"), /data-scroll-behavior="smooth"/);
});

test("10. demo route guard fails closed in production", () => {
  assert.equal(isCustomerPortalDemoAvailable("production"), false);
  assert.equal(isCustomerPortalDemoAvailable("development"), true);
  assert.equal(isCustomerPortalDemoAvailable("test"), true);
  assert.equal(isCustomerPortalDemoAvailable("staging"), false);
  assert.equal(isCustomerPortalDemoAvailable(undefined), false);
  assert.match(source("app/portal/demo/layout.tsx"), /notFound\(\)/);
  assert.match(
    source("app/portal/demo/files/[name]/route.ts"),
    /!isCustomerPortalDemoAvailable\(\)/
  );
});

test("11. browser cannot provide tenant identifiers to the download route", () => {
  const route = source("app/api/portal/documents/[id]/download/route.ts");
  const adapter = source("app/lib/customer-portal-supabase-repository.ts");
  assert.doesNotMatch(route.toLowerCase(), /x-portal-business-id|x-portal-profile-id/);
  assert.doesNotMatch(adapter.toLowerCase(), /x-portal-business-id|x-portal-profile-id/);
  assert.match(route, /select\("id,business_id,customer_profile_id,title"\)/);
  assert.match(route, /document\.revoked_at !== null/);
});

test("12. protected production routes still require the portal auth and tenant providers", () => {
  const layout = source("app/portal/(customer)/layout.tsx");
  assert.match(layout, /<PortalAuthProvider>/);
  assert.match(layout, /<PortalProvider referenceTime=\{referenceTime\}>/);
  assert.match(source("components/portal/PortalProvider.tsx"), /router\.replace\(`\/portal\/login/);

  const supabaseAuthStorageKey = "johai-auth-session";
  const customerPortalAuthStorageKey = "johai-customer-portal-session";
  const cache = new Map<
    string,
    { configurationKey: string; client: { surface: "portal" | "workspace" } }
  >();
  const workspaceClient = { surface: "workspace" as const };
  const portalClient = { surface: "portal" as const };
  let workspaceCreations = 0;
  let portalCreations = 0;
  const getWorkspaceClient = () =>
    getOrCreateCachedBrowserAuthClient({
      cache,
      configurationKey: "workspace-config",
      createClient: () => {
        workspaceCreations += 1;
        return workspaceClient;
      },
      storageKey: supabaseAuthStorageKey,
    });
  const getPortalClient = () =>
    getOrCreateCachedBrowserAuthClient({
      cache,
      configurationKey: "portal-pkce-config",
      createClient: () => {
        portalCreations += 1;
        return portalClient;
      },
      storageKey: customerPortalAuthStorageKey,
    });

  assert.strictEqual(getWorkspaceClient(), getWorkspaceClient());
  assert.strictEqual(getPortalClient(), getPortalClient());
  assert.notStrictEqual(getWorkspaceClient(), getPortalClient());
  assert.equal(workspaceCreations, 1);
  assert.equal(portalCreations, 1);
  assert.notEqual(supabaseAuthStorageKey, customerPortalAuthStorageKey);
  assert.throws(
    () =>
      getOrCreateCachedBrowserAuthClient({
        cache,
        configurationKey: "conflicting-config",
        createClient: () => workspaceClient,
        storageKey: supabaseAuthStorageKey,
      }),
    /Conflicting Supabase browser auth configuration/
  );

  const workspaceAuthClient = source("app/lib/supabase-auth-client.ts");
  const portalAuthClient = source("app/lib/customer-portal-auth-client.ts");
  const sharedAuthClient = source("app/lib/supabase-browser-auth-client.ts");
  assert.match(
    workspaceAuthClient,
    /supabaseAuthStorageKey = "johai-auth-session"/
  );
  assert.match(
    portalAuthClient,
    /customerPortalAuthStorageKey = "johai-customer-portal-session"/
  );
  assert.match(workspaceAuthClient, /getSharedSupabaseBrowserAuthClient/);
  assert.match(portalAuthClient, /getSharedSupabaseBrowserAuthClient/);
  assert.doesNotMatch(workspaceAuthClient, /\bcreateClient\(/);
  assert.doesNotMatch(portalAuthClient, /\bcreateClient\(/);
  assert.match(sharedAuthClient, /autoRefreshToken: true/);
  assert.match(sharedAuthClient, /detectSessionInUrl: true/);
  assert.match(sharedAuthClient, /persistSession: true/);
  assert.match(source("components/AuthProvider.tsx"), /getSupabaseAuthClient\(\)/);
  assert.match(
    source("components/portal/PortalAuthProvider.tsx"),
    /getCustomerPortalAuthClient\(\)/
  );
  assert.match(
    source("components/AppProviders.tsx"),
    /isCustomerPortal \? children : <AuthProvider>\{children\}<\/AuthProvider>/
  );
  assert.match(source("app/portal/login/page.tsx"), /<PortalAuthProvider>/);
  assert.match(source("app/portal/reset-password/page.tsx"), /<PortalAuthProvider>/);
  assert.match(
    source("components/portal/PortalLogin.tsx"),
    /disabled=\{!configured \|\| busy\}/
  );
  assert.match(source("components/portal/PortalLogin.tsx"), /signInWithPassword/);
  assert.match(source("app/auth/AuthClient.tsx"), /signInWithPassword/);
  assert.match(source("components/portal/PortalProvider.tsx"), /signOut\(\{ scope: "local" \}\)/);
  assert.match(source("components/portal/PortalAuthProvider.tsx"), /onAuthStateChange/);
  assert.match(source("components/AuthProvider.tsx"), /onAuthStateChange/);
  assert.doesNotMatch(source("app/portal/demo/layout.tsx"), /PortalAuthProvider/);
});

test("demo fixture can show empty and load-error page states without network access", async () => {
  assert.match(
    source("components/portal/PortalDemoProvider.tsx"),
    /initialData: dataMode === "normal" \? fixture : undefined/
  );
  const demo = repository();
  demo.setDataMode("empty");
  assert.deepEqual(await demo.listDocuments(), []);
  demo.setDataMode("error");
  await assert.rejects(
    demo.listMessages(),
    (error) => error instanceof PortalRepositoryError && error.code === "LOAD_FAILED"
  );
});

test("demo download failure is one-shot and revoked downloads remain unavailable", async () => {
  const demo = repository();
  const documents = await demo.listDocuments();
  const available = documents.find((document) => document.availability === "available")!;
  const revoked = documents.find((document) => document.availability === "revoked")!;
  demo.failNextDownload();
  await assert.rejects(demo.downloadDocument(available.id));
  assert.match(await demo.downloadDocument(available.id), /^\/portal\/demo\/files\//);
  await assert.rejects(demo.downloadDocument(revoked.id));
});

test("demo profile can surface a one-shot session error", async () => {
  const demo = repository();
  demo.failNextProfileSaveWithSessionError();
  await assert.rejects(
    demo.updateProfile({ phone: "+1 416 555 0100" }),
    (error) => error instanceof PortalRepositoryError && error.code === "SESSION_EXPIRED"
  );
  assert.equal((await demo.updateProfile({ phone: "+1 416 555 0100" })).phone, "+1 416 555 0100");
});

test("authenticated data adapter does not request or write hardened server-only columns", () => {
  const dataLayer = source("app/lib/customer-portal-data.ts");
  assert.doesNotMatch(dataLayer, /\.eq\("status",\s*"active"\)/);
  assert.doesNotMatch(dataLayer, /\.eq\("is_customer_visible",\s*true\)/);
  assert.doesNotMatch(dataLayer, /\.is\("revoked_at",\s*null\)/);
  assert.doesNotMatch(dataLayer, /patch\.updated_at\s*=/);
  assert.doesNotMatch(dataLayer, /is_customer_visible:\s*true/);
  assert.doesNotMatch(dataLayer, /status:\s*"open"/);
});

test("contextual intelligence 1. rejects records from another tenant or customer profile", () => {
  const fixture = createCustomerPortalDemoFixture();
  const foreignMessage = {
    ...fixture.messages[0]!,
    id: "99999999-9999-4999-8999-999999999991",
    businessId: "99999999-9999-4999-8999-999999999992",
    customerProfileId: "99999999-9999-4999-8999-999999999993",
    body: "Foreign tenant message",
  };
  const snapshot = createPortalContextSnapshot({
    ...fixture,
    access: "active",
    messages: [...fixture.messages, foreignMessage],
    profile: fixture.profile,
    referenceTime: portalDemoReferenceTime,
  });
  assert.equal(snapshot.messages.some((item) => item.id === foreignMessage.id), false);
  assert.equal(snapshot.sources.some((item) => item.businessId === foreignMessage.businessId), false);
});

test("contextual intelligence 2. exposes only allowlisted customer-visible source kinds", () => {
  const snapshot = intelligenceSnapshot();
  assert.ok(snapshot.sources.length > 0);
  for (const item of snapshot.sources) {
    assert.ok(portalContextPolicy.visibleSourceKinds.includes(item.kind));
  }
  const implementation =
    source("app/lib/customer-portal-contextual-intelligence.ts") +
    source("app/lib/customer-portal-contextual-provider.ts");
  for (const forbiddenImport of [
    "knowledge-engine",
    "semantic-memory",
    "business-brain",
    "crm",
    "billing",
    "service_role",
  ]) {
    assert.equal(implementation.toLowerCase().includes(forbiddenImport), false);
  }
});

test("contextual intelligence 3. caps dashboard insights at three with one primary recommendation", () => {
  const insights = buildPortalDashboardInsights(intelligenceSnapshot(), "/portal/demo");
  assert.equal(insights.length, 3);
  assert.equal(
    insights.filter((item) => item.primary).length,
    1
  );
  assert.equal(
    insights.filter((item) => item.action).length,
    1
  );
  assert.equal(insights[0]?.primary, true);
});

test("contextual intelligence 4. stays silent when every candidate action is complete", () => {
  const fixture = createCustomerPortalDemoFixture();
  const acknowledgements = fixture.documents.map((document, index) => ({
    acknowledgedAt: `2026-07-1${index + 1}T00:00:00.000Z`,
    businessId: fixture.context.businessId,
    customerProfileId: fixture.context.customerProfileId,
    documentId: document.id,
  }));
  const snapshot = createPortalContextSnapshot({
    access: "active",
    acknowledgements,
    appointments: fixture.appointments.map((item) => ({
      ...item,
      status: "completed" as const,
    })),
    branding: fixture.branding,
    context: fixture.context,
    documents: fixture.documents,
    messages: [],
    profile: fixture.profile,
    referenceTime: portalDemoReferenceTime,
    requests: fixture.requests.map((item) => ({
      ...item,
      status: "resolved" as const,
    })),
  });
  assert.deepEqual(buildPortalDashboardInsights(snapshot, "/portal/demo"), []);
  assert.equal(buildPortalSupportSuggestion(snapshot), null);
});

test("contextual intelligence 5. suggested replies never send or mutate a conversation", async () => {
  const demo = repository();
  const before = await demo.listMessages();
  const suggestions = await demoPortalContextualIntelligenceProvider.messageSuggestions({
    snapshot: intelligenceSnapshot(),
  });
  const after = await demo.listMessages();
  assert.equal(suggestions.length, 3);
  assert.deepEqual(after, before);
  assert.match(source("components/portal/PortalMessages.tsx"), /setBody\(suggestion\.value\)/);
  assert.doesNotMatch(
    source("components/portal/PortalMessages.tsx"),
    /applySuggestion[\s\S]{0,250}repository\.sendMessage/
  );
});

test("contextual intelligence 6. document help identifies its source and source-of-truth warning", async () => {
  const snapshot = intelligenceSnapshot();
  const document = snapshot.documents.find(
    (item) => item.documentType === "instructions"
  )!;
  const result = await demoPortalContextualIntelligenceProvider.assistDocument({
    document,
    operation: "summarize",
    snapshot,
  });
  assert.equal(result.confidence, "supported");
  assert.equal(result.sourceLabel, document.title);
  assert.match(result.sourceNotice, /customer-visible source/i);
  assert.match(
    source("components/portal/PortalContextualUi.tsx"),
    /remains the source of truth/
  );
});

test("contextual intelligence 7. refuses regulated interpretation and preserves the prohibited class", async () => {
  const snapshot = intelligenceSnapshot();
  const regulatedDocument = snapshot.documents.find(
    (item) => item.documentType === "report"
  )!;
  const result = await demoPortalContextualIntelligenceProvider.assistDocument({
    document: regulatedDocument,
    operation: "explain",
    snapshot,
  });
  assert.equal(result.confidence, "prohibited");
  assert.equal(getPortalConfidenceLabel(result.confidence), "unavailable");
  assert.ok(result.escalation);
  assert.match(result.body, /will not interpret/i);
});

test("contextual intelligence 8. appointment guidance repeats visible preparation and never invents slots", () => {
  const snapshot = intelligenceSnapshot();
  const appointment = snapshot.appointments.find(
    (item) => item.status === "confirmed"
  )!;
  const suggestion = buildPortalAppointmentSuggestion(snapshot, appointment.id);
  assert.equal(suggestion?.value, appointment.customerVisibleNotes);
  assert.doesNotMatch(suggestion?.value ?? "", /available slot|booked for you/i);
  assert.match(
    source("components/portal/PortalAppointments.tsx"),
    /Availability and completion are confirmed there, not by this portal/
  );
});

test("contextual intelligence 9. escalation records intent without claiming a human was notified", async () => {
  const result = await demoPortalContextualIntelligenceProvider.rewriteMessage({
    draft: "I need a human to answer a legal question",
    snapshot: intelligenceSnapshot(),
    tone: "clear",
  });
  assert.equal(result.confidence, "partially_supported");
  assert.equal(result.escalation?.action, "request");
  assert.match(
    source("components/portal/PortalContextualUi.tsx") +
      source("components/portal/PortalMessages.tsx"),
    /No person has been contacted automatically|no one has been contacted automatically/i
  );
});

test("contextual intelligence 10. deterministic demo outputs repeat exactly", async () => {
  const snapshot = intelligenceSnapshot();
  const document = snapshot.documents.find(
    (item) => item.documentType === "instructions"
  )!;
  const request = { document, operation: "key-actions" as const, snapshot };
  assert.deepEqual(
    await demoPortalContextualIntelligenceProvider.assistDocument(request),
    await demoPortalContextualIntelligenceProvider.assistDocument(request)
  );
  assert.deepEqual(
    await demoPortalContextualIntelligenceProvider.messageSuggestions({ snapshot }),
    await demoPortalContextualIntelligenceProvider.messageSuggestions({ snapshot })
  );
  const translated = await demoPortalContextualIntelligenceProvider.assistDocument({
    document,
    operation: "translate",
    snapshot,
    targetLanguage: "fr",
  });
  assert.equal(translated.confidence, "partially_supported");
  assert.match(translated.body, /français|source de vérité/i);
  const unsupportedTranslation =
    await demoPortalContextualIntelligenceProvider.assistDocument({
      document,
      operation: "translate",
      snapshot,
      targetLanguage: "de",
    });
  assert.equal(unsupportedTranslation.confidence, "unsupported");
});

test("contextual intelligence 11. demo intelligence creates no Supabase or auth client", () => {
  const demoSources = [
    "app/lib/customer-portal-demo-fixture.ts",
    "app/lib/customer-portal-demo-repository.ts",
    "app/lib/customer-portal-contextual-provider.ts",
    "components/portal/PortalDemoProvider.tsx",
  ]
    .map(source)
    .join("\n");
  assert.doesNotMatch(demoSources, /createClient\(|getCustomerPortalAuthClient|@supabase/i);
  assert.doesNotMatch(source("app/portal/demo/layout.tsx"), /PortalAuthProvider/);
});

test("contextual intelligence 12. production demo exposure still fails closed", () => {
  assert.equal(isCustomerPortalDemoAvailable("production"), false);
  assert.match(source("app/portal/demo/layout.tsx"), /notFound\(\)/);
  assert.match(source("app/portal/demo/files/[name]/route.ts"), /status:\s*404/);
});

test("contextual intelligence 13. expired access produces no context or generated output", async () => {
  const snapshot = intelligenceSnapshot("expired");
  assert.deepEqual(buildPortalDashboardInsights(snapshot, "/portal"), []);
  assert.deepEqual(buildPortalProfileGuidance(snapshot), []);
  assert.deepEqual(
    await demoPortalContextualIntelligenceProvider.messageSuggestions({ snapshot }),
    []
  );
  const document = snapshot.documents[0]!;
  const result = await demoPortalContextualIntelligenceProvider.assistDocument({
    document,
    operation: "explain",
    snapshot,
  });
  assert.equal(result.confidence, "unsupported");
});

test("contextual intelligence 14. suspended and inactive access remain silent", async () => {
  for (const access of ["suspended", "inactive"] as const) {
    const snapshot = intelligenceSnapshot(access);
    assert.deepEqual(buildPortalDashboardInsights(snapshot, "/portal"), []);
    assert.equal(buildPortalSupportSuggestion(snapshot), null);
    assert.deepEqual(
      await demoPortalContextualIntelligenceProvider.messageSuggestions({ snapshot }),
      []
    );
  }
  assert.equal(unavailablePortalContextualIntelligenceProvider.mode, "unavailable");
});

test("contextual intelligence 15. generated authorship and keyboard-safe controls are explicit", () => {
  const ui = source("components/portal/PortalContextualUi.tsx");
  const documents = source("components/portal/PortalDocuments.tsx");
  const messages = source("components/portal/PortalMessages.tsx");
  assert.match(ui, /guidance\.generatedLabel/);
  assert.match(ui + documents + messages, /aria-live="polite"/);
  assert.match(ui + documents + messages, /type="button"/);
  assert.match(ui + documents + messages, /focus-visible:ring/);
  assert.doesNotMatch(ui + documents + messages, /autoFocus/);
  assert.match(
    source("components/portal/PortalProvider.tsx"),
    /unavailablePortalContextualIntelligenceProvider/
  );
});
