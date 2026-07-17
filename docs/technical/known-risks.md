# Known Risks

## Business Workspace V1 certification audit — 2026-07-15

- **P0:** `/dashboard/*` uses one shared password cookie rather than a verified owner/member identity and role.
- **P0:** ordinary Workspace server operations use the service-role key and hard-coded or missing business filters, bypassing RLS as an interactive authorization boundary.
- **P0:** `/api/follow-ups/process` exposes unauthenticated GET and POST processing that can read and mutate leads and trigger email.
- **P0:** unauthenticated chat can retrieve Ready default-business Knowledge without a separate public-publication classification.
- **P1:** team invitations do not complete business membership, acceptance, revocation, or role management.
- **P1:** configured assistant action permissions are not enforced, and prepared actions can be presented too strongly as completed work.
- **P1:** no Business Workspace authorization/end-to-end suite, production accessibility matrix, performance evidence, monitoring, backup/restore exercise, or incident evidence exists.

The provisional certification score is **30/100**, status **NOT CERTIFIED**, and Production Ready **NO**. These are repository-supported risks, not claims of an observed live breach. The complete evidence and roadmap are in [Business Workspace V1 Certification Audit](../sprints/BUSINESS_WORKSPACE_V1_CERTIFICATION_AUDIT.md).

## Knowledge Center

- Application tenant context still uses `DEFAULT_BUSINESS_ID` with service-role access.
- Processing runs in request scope. A synchronous queue contract, conditional claim, attempt token, bounded retries, and process-local locks exist, but there is no durable worker lease, retry scheduler, dead-letter store, or cross-instance application lock.
- Malware scanning is not implemented.
- File signatures are basic, not forensic validation.
- Parser resource-exhaustion and malformed-file behavior needs a fixture/fuzz suite.
- Keyword search is English full-text; vector and multilingual ranking are partial.
- Copy-on-write replacement and inspectable history are active, but version allocation and activation use multiple guarded mutations rather than one database transaction.
- No database constraint guarantees a unique version number or exactly one active version per knowledge item; concurrent requests on different server instances can still stage duplicate numbers or race activation despite expected-state filters.
- Replacement request identifiers provide best-effort replay detection but are not protected by a unique database constraint.
- Chunk indexes are unique and application rollback restores a failed insert, but a process crash between chunk deletion and insertion can leave a non-searchable file with zero chunks. Strict crash atomicity requires a database transaction.
- A delayed result is rejected by its attempt token, but there is not yet a scheduled recovery job for a worker that dies while a row remains Processing.
- Approval does not create an immutable actor/timestamp audit record beyond normal processing and update evidence.
- Storage deletion and database deletion cannot be atomic; the API removes storage first and aborts metadata deletion if storage cleanup fails.
- Website ingestion is deliberately not implemented pending an SSRF-safe crawler design.

Primary technical risks are default-tenant resolution, shared dashboard authentication, incomplete billing state, absent vector persistence/ranking, limited automated tests, missing job infrastructure, and limited observability.

### Recommended database hardening — approval required

No SQL was created or run. The smallest recommended migration should add: (1) a unique `(knowledge_item_id, version_number)` constraint, (2) a partial unique index allowing only one `is_active_version = true` row per knowledge item, (3) a service-role-only transaction function that locks a lineage and deactivates/activates versions atomically, and (4) a service-role-only transaction function that replaces one file's chunks atomically from a JSON payload. These are required for strict guarantees across multiple server instances and process crashes; application guards alone cannot provide them.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Contextual Intelligence™ risks

The philosophy is adopted. A bounded Customer Portal V1 snapshot, policy, deterministic evaluators, provider interface, shared UI, and fictional demo interactions are **Implemented**; the broader shared runtime and production generative provider remain **Planned**. Principal implementation risks are:

- treating contextual relevance as authorization instead of resolving actor, tenant, profile, record, and capability first;
- retaining stale, revoked, deleted, cross-profile, or cross-business context after logout, suspension, tenant switch, or source replacement;
- leaking CRM internals, Business Brain internals, staff notes, prompts, billing internals, raw Knowledge Center content, orchestration, retrieval indexes, credentials, or another customer;
- asking fewer questions by guessing, stereotyping, or inferring regulated/sensitive facts rather than using current evidence;
- interrupting completed or critical workflows, creating automation pressure, or hiding the difference between a suggestion and an executed action;
- summarization, translation, deadline extraction, autocomplete, availability, travel, diagnosis/triage, or related-document errors presented without source and uncertainty limits;
- claiming human notification, assignment, takeover, response targets, provider completion, or emergency handling before operational evidence exists;
- presenting Planned industry examples or customer-effort metrics as implemented capability, customer traction, or proven moat;
- treating the deterministic demo provider as a production document or messaging provider;
- allowing a future browser-supplied snapshot, document identifier, source label, or generated action to become authorization;
- exposing raw document content or Knowledge Center material before a reviewed customer-visible publication, citation, freshness, and revocation boundary exists;
- allowing a suggested reply or rewrite to send automatically, overwrite a customer's draft without review, or impersonate staff;
- caching context across logout, expiry, suspension, active-profile change, or data-version change; and
- presenting a demo translation, extracted date, regulated explanation, or external appointment link as authoritative or completed.

V1 implements a typed minimized snapshot, exact tuple filtering, deny-by-default production provider, output caps, AI/demo authorship labels, source-of-truth wording, silence/escalation tests, and zero-tolerance cross-tenant/forbidden-source unit checks. Remaining controls include server-derived production context, approved-source provenance/freshness/revocation, abuse limits, monitoring, full accessibility/localization validation, behavioral tenant tests, provider evaluation, and customer-outcome evidence. See [AI Behavior Guidelines](../philosophy/AI_BEHAVIOR_GUIDELINES.md).

## Constitutional governance risks

- Treating Constitutional approval as a substitute for security, accessibility, testing, operations, or evidence.
- Citing principles selectively while ignoring a conflicting law or product value.
- Allowing “speed,” “confidence,” or “business value” to justify pressure, hidden uncertainty, privacy loss, or unsafe automation.
- Letting feature specifications, design systems, model behavior, or technical convenience silently override the Constitution.
- Recording compliance without measurable customer/business outcomes, failure behavior, or a completed decision framework.
- Presenting governance adoption as implemented UI, runtime intelligence, automation, commercial traction, or production readiness.

Mitigation requires a documented [Decision Framework](../constitution/DECISION_FRAMEWORK.md) result, explicit stop conditions, named evidence, truthful status, cross-audience documentation, and architecture review for any Constitutional amendment.

## Knowledge transaction proposal status

The hardening SQL exists only as an unapplied proposal. Live conflicts remain unknown until the read-only verifier is run; migration execution intentionally stops on duplicates, tenant mismatches, invalid predecessors, or orphan chunks. Application adoption is also still required.

## Customer Portal risks

The database foundation is Applied and Verified by explicit user confirmation, and the portal application is implemented in the repository. Approver identity, approval/execution dates, detailed live schema and effective-privilege evidence, raw verifier output, query-level findings, and unreported execution or verification errors remain Pending documentation gaps.

The application selects only the hardened browser allowlist and repeats the active profile/business pair, but those controls do not narrow direct authenticated Supabase REST access. Deployed database grants and RLS remain authoritative outside the UI. The latest certification review removed the earlier hardening-verification blocker, but raw evidence references and production behavioral cross-tenant results remain incomplete.

The Supabase adapter now relies on the hardened RLS predicates and server defaults instead of reading or writing hidden fields: it does not filter profiles by hidden `status`, send profile `updated_at`, filter or write message `is_customer_visible`, filter documents by hidden `revoked_at`, or send request `status`. The policies and defaults in the Applied migration remain the enforcement boundary. Browser-side validation and the in-memory demo are not substitutes for direct-REST negative tests.

Portal authentication persists the Supabase session and selected customer profile in browser storage. The profile selection is rechecked through RLS and is not itself authority, but XSS prevention, token/device hygiene, recovery-email configuration, and explicit session-expiry tests remain necessary. Public signup and invitation redemption are absent, so customer identity provisioning is an operational gap rather than a self-service flow.

The same-key GoTrue duplication risk from provider remounts is corrected by a browser-global registry that creates one client per storage key and keeps the workspace and portal keys separate. Automated identity/configuration checks and unauthenticated browser route transitions pass without duplicate-client or hydration warnings. Credential-backed refresh, recovery, logout, expiry, and multi-tab behavior are still not proven in a production-like browser session.

Signed downloads use two separate reads. The bearer/anon client first authorizes only safe metadata for the requested ID through customer RLS; only after that succeeds does the service-role client reread the exact returned document/profile/business tuple, reject revocation, validate the bucket allowlist and canonical path, and issue a 60-second URL. Browser-supplied business/profile headers are not accepted. A revocation can still occur after the trusted reread and before object delivery, so production needs storage-policy review, expiry, cross-tenant, missing-object, and revocation-race tests. Leakage of the service-role key would be critical.

Rate limiting is not implemented for login, recovery, messages, requests, acknowledgements, or downloads. Appointment meeting, reschedule, and cancellation links are stored external HTTPS URLs and may be stale, unavailable, or controlled by an external provider. Calendly/provider synchronization, retention, abuse monitoring, accessibility automation, and production end-to-end multi-tenant tests remain incomplete.

The hardening migration is Applied, immutable, and must not be rerun. The latest certification review removed its earlier verification blocker, but that does not prove browser behavior, rate limiting, application configuration, production tenant fixtures, storage-object policy, or signed downloads. The expanded 31-test Portal suite uses fictional in-memory data for contextual provider behavior and likewise cannot prove live Auth, RLS, PostgREST, or Storage behavior. No reverse migration exists; any recovery or database correction requires the same inspected, versioned, approved, manually applied, and verified workflow.

### Contextual Intelligence V1 risks — bounded implementation

- Authenticated production intentionally uses an unavailable document/message provider. A future change that silently substitutes demo output, calls an external model from the browser, or exposes the controls without an approved server contract is a release blocker.
- Production `PortalDocument` records contain metadata, not document content. Production explanation, summarization, important-date extraction, and translation remain unavailable; inferring them from titles, types, or Storage URLs would be unsafe.
- The demo provider is deterministic and fictional. Its phrases, reviewed relations, and limited language examples are not validated translations, clinical instructions, legal interpretation, financial obligations, or production business knowledge.
- The snapshot filters exact business/profile tuples in application code, but RLS and grants remain the authority. The new unit tests do not replace live cross-tenant and direct-REST denial.
- Dashboard and support relevance depends on bounded list results. The dashboard distinguishes a complete snapshot from capped results, but production freshness, pagination, race, and stale-record behavior still need monitored evidence.
- Suggested text remains an unsent customer draft. Regression tests must continue proving that suggestion application and rewrite do not call the send repository.
- Static accessibility contracts pass, but browser keyboard, screen-reader, focus order, mobile keyboard, responsive layout, and console evidence for the new controls remains Pending.

### Production security gate — database blocker resolved; behavioral validation Pending

- Pre-migration inspection found anonymous PostgREST privilege on four portal tables and authenticated table-wide grants broader than the UI contract. The latest certification review records the hardening-verification blocker as resolved; behavioral enforcement still needs approved fixtures.
- All eight tables were empty during the recorded July 13 pre-hardening inspection. That historical result does not establish the current live row count, and tenant isolation, mixed-role denial, revocation, and signed-download behavior remain unproven without approved fixtures.
- The global identity-separation rule requires distinct Auth identities for a person acting as both workspace user and portal customer; behavioral mixed-principal denial and operational account recovery remain untested.
- Production application calls are aligned with the reviewed column allowlists and server-owned defaults in the Applied migration. Live provisioned-user testing and direct-REST tests remain Pending.
- The download route implements the safe caller-RLS read followed by exact trusted-server tuple and revocation reread. Production Storage and race evidence remains Pending.
- Verification encountered two historical file defects: a wrong acknowledgement relation name and PostgreSQL `42883` from an incompatible schema-qualified ACL `coalesce(aclitem[], aclitem[])` expression. Both were corrected; the current certification state no longer treats verification as a blocker.
- The local bucket allowlist is absent, so local downloads fail closed; production configuration is unknown.
- No register route, dashboard alias, dedicated callback route, rate limiter, or approved production provisioning flow exists. A local 31-test Portal suite now exists, but production end-to-end coverage does not.
- The canonical build passed outside the restricted sandbox, and a live production-server check confirmed that `/portal/demo` fails closed with 404. Pilot browser QA remains partial because the in-app browser connection became unavailable before the complete interaction, keyboard, and exact 1440-by-900, 768-by-1024, and 390-by-844 viewport matrix finished. Production deployment, monitoring, and recovery evidence is absent.
- Portal date hydration is statically and automatically hardened with explicit customer-derived locales, explicit timezones, and fixed/serialized reference instants. Tests, lint, build, HTTP/SSR, and the July 14 final local browser-console check passed without a hydration warning.
- The fictional demo is server-guarded to return 404 in production and has no Supabase or network access. A future regression that mounts the mock on production routes or weakens the server guard would be severe; route-boundary tests must remain mandatory.

### Real-authentication evidence gap — 2026-07-14

- No approved synthetic test identities, secret credential delivery, controlled recovery mailbox, multi-profile fixture businesses, session-revocation capability, or short-lifetime token test condition was available. This means the real lifecycle remains blocked, not failed, and says nothing about the current number of live rows.
- Valid and invalid login, logout sequencing, session persistence across refresh, token refresh, genuine server-side expiry, successful recovery, expired/used recovery links, suspended and invited denial, multi-profile switching, multi-tab propagation, and behavioral workspace isolation remain unproven.
- The existing structural test proves distinct storage keys and singleton client objects, but only two approved identities in one browser context can prove the intended cross-surface behavior. The dashboard password cookie is not a Business Workspace Supabase-session substitute.
- There is no supported customer-facing invitation-redemption route. If trusted provisioning cannot place the required synthetic profiles into their approved states without ad hoc SQL, work must stop for a separately reviewed operational design.
- The hardening migration is Applied and must not be repeated. Rate limiting, monitoring, device/session management, production recovery-email delivery, direct REST, Storage, and signed-download tests remain separate gates.

### Synthetic fixture plan risk controls

The exact synthetic plan and [operator package](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md) are documented but unprovisioned. Its reserved `.test` addresses require a private test SMTP sink; public mail delivery is forbidden. The preferred target is an isolated non-production Supabase project or branch. Production-project fixture creation, if ever needed, requires separate explicit approval and is not authorized by the plan.

The greatest operational risks are accidental owner/customer Auth-ID reuse, A5 profiles not both remaining active, A3 accidental reactivation, A4 accidental redemption, secret leakage in browser evidence, incomplete session revocation, and fixture cleanup leaving tenant or Auth records behind. The trusted operator must verify global owner/member separation and perform dependency-safe cleanup with recorded results.

There is still no supported customer-facing redemption route or automated suspension/invited-state administration. If approved operator tooling cannot create or remove those states without ad hoc SQL, provisioning must stop. The package reduces documentation ambiguity only; it does not reduce rate-limit, monitoring, direct-REST, Storage, signed-download, or behavioral-authentication gates and does not make authentication production-ready.

### Final certification blockers — 2026-07-14

Customer Portal V1's last recomputed score is **71/100**, certification **FAILED**, and Production Ready is **NO**. The score cannot close a mandatory security boundary.

The blocking risks are no approved credential-backed identity run; no Tenant A/A1/A2 versus Tenant B/B1 behavioral RLS/direct-REST proof; no private-bucket, signed-URL expiry, wrong-object, or revocation-race result; no trusted support lifecycle; no customer-facing invitation redemption; incomplete keyboard/screen-reader evidence; no production Core Web Vitals or representative latency/load results; and missing abuse controls, monitoring, alerting, and incident evidence. The hardening-verification and contrast issues are resolved and are not remaining blockers.

The Applied migration remains immutable and must not be rerun. No SQL was executed during certification.
