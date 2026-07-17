# Changelog

## 2026-07-15 — Customer Portal operational hold and Business Workspace certification audit

- Placed Customer Portal V1 on **Operational Validation Hold**. Development remains complete and feature-frozen; certification cannot resume until approved synthetic identities, an isolated operational test environment, and human-led authentication validation exist.
- Preserved the authoritative Customer Portal score of **71/100**, certification **FAILED**, and Production Ready **NO**. No resolved blocker was reopened, and no new Customer Portal development was authorized.
- Completed the first repository-only Business Workspace V1 certification audit. No prior Workspace certification exists; the provisional evidence score is **30/100**, status **NOT CERTIFIED**, and Production Ready **NO**.
- Identified the P0 Workspace blocker: interactive requests use one shared dashboard-password cookie plus service-role/default-business data access instead of a verified owner/member identity, role, and server-derived tenant. This is a source-supported risk, not evidence that a live cross-tenant disclosure occurred.
- Recorded additional critical audit findings: unauthenticated follow-up execution, no explicit public Knowledge publication boundary before unauthenticated chat retrieval, incomplete team membership and billing lifecycles, prepared AI actions presented too strongly, and missing Workspace authorization, accessibility, performance, and operations certification evidence.
- Documentation and audit only. No application code, SQL, migration, database state, identity, credential, deployment, or runtime behavior changed, and no SQL was executed.

## 2026-07-14 — Customer Portal Contextual Intelligence V1

- Added a typed, customer-safe contextual snapshot and policy with exact tenant/profile filtering, explicit access and confidence states, maximum-three insight and reply limits, source records, silence rules, and deterministic dashboard, appointment, support, and profile guidance.
- Added a separate provider boundary. Authenticated production routes fail closed with an unavailable provider; the development-only Portal demo uses fixed fictional document assistance, suggested replies, and draft rewriting without Supabase, Auth, OpenAI, or another external service.
- Added compact contextual UI across the existing shared Portal: a maximum of three dashboard insights with one primary recommendation and an honest **Everything is up to date** state; preparation guidance; contextual support and profile help; generated-source and source-of-truth notices; regulated-advice refusal; and truthful human-escalation wording.
- Preserved customer control: suggestions only fill an unsent draft, no appointment slots or provider completion are invented, revoked documents are excluded, and no person is described as contacted automatically.
- Expanded `tests/customer-portal-pilot.test.ts` to 31 passing tests, including all 15 Contextual Intelligence scenarios. `npm run lint` and `npm run build` also passed. Live 1440×900 browser inspection confirmed three dashboard insights, one primary action, no horizontal overflow, and keyboard activation of appointment preparation. The browser safety policy then blocked the private-network preview before the new document/message/support/profile controls and tablet/mobile sizes could be completed; those checks and real screen-reader validation remain Pending.
- Production document content, generative explanation, translation, published customer-visible knowledge, external-model integration, operational human takeover, and outcome instrumentation remain Planned or unavailable. This sprint did not close the production certification gates; the score remains **71/100**, certification **FAILED**, and Production Ready **NO**.
- No database change was required. No SQL or migration was created, modified, or executed, and the existing migration and verification history remains unchanged.

## 2026-07-14 — JOHAI Foundation Version 1.0 locked

- Recorded the JOHAI Foundation as **COMPLETE**, Version **1.0**, and **FROZEN**.
- Created the official Foundation status, change policy, table of contents, V1 release record, and sprint record.
- Locked the Constitution, North Star, Manifesto, Product Promise, Company Values, AI Principles, UX Principles, Design Principles, Contextual Intelligence, Brand System, and their indexed companion documents as permanent references.
- Required explicit user initiation, an architectural decision, affected-domain review, named human approval, versioning, validation, and preserved history for every future Foundation change. AI cannot approve a change.
- Directed default future work toward Customer Portal Certification, Business Workspace Certification, JOHAI Super Admin, AI Employees, Marketplace, and Business Brain V2. No further strategic-documentation epic should be proposed unless the user explicitly requests it.
- Governance and documentation only: no application code, UI, API, authentication, SQL, migration, database state, deployment, or runtime behavior changed, and no SQL was executed.

## 2026-07-14 — JOHAI North Star, Manifesto, and Brand System

- Adopted a permanent strategic and brand foundation beneath the JOHAI Constitution: North Star, Manifesto, Mission and Vision, Product Promise, Company Values, Brand Guidelines, Voice and Tone, AI Employee Principles, Culture, and a directional Long-Term Roadmap.
- Defined why JOHAI exists, what success means, what must remain invariant over ten years, how humans and AI share responsibility, and why trust and human relationships take precedence over automation volume.
- Defined eight product promises, permanent company values, observable brand and language rules, role-specific AI Employee boundaries, team operating expectations, and 1-, 3-, 5-, and 10-year strategic horizons.
- Added a governance requirement that future architectural and product decisions align with the Constitution and strategic foundation, while preserving law, security, privacy, accessibility, human approval, database safety, and evidence-backed capability status.
- Updated repository and documentation entry points, audience manuals, Product Fact Sheet, project history, and sprint records. Architecture and documentation only: no application code, UI, API, authentication, runtime behavior, SQL, migration, or database state changed, and no SQL was executed.

## 2026-07-14 — JOHAI Design System and Product Constitution

- Adopted `docs/constitution/JOHAI_CONSTITUTION.md` as the highest internal product-design authority for every future feature, UI change, AI behavior, workflow, automation, and interaction, subject to law, security, privacy, accessibility, explicit human approval, and mandatory database safety.
- Created the Constitution's experience, design, UX, AI, customer, business, language, decision, and product-value documents. The Ten Laws now include a mandatory stop condition and implementation consequences.
- Made Contextual Intelligence, platform architecture, manuals, feature specifications, components, and runtime decisions subordinate to the Constitution while preserving truthful **Implemented**, **Partial**, and **Planned** status.
- Updated governance, repository/documentation entrypoints, product/customer/investor/technical/sales manuals, Product Fact Sheet, project history, and known-risk records.
- Architecture and governance only: no application code, UI, API, authentication, automation, Customer Portal implementation, SQL, migration, or database state changed, and no SQL was executed.

## 2026-07-14 — JOHAI Contextual Intelligence™ philosophy

- Adopted the permanent platform rule: **The AI never asks for information it can already infer from context.** Authorized, current, relevant context may reduce customer effort; it never replaces permission, source validation, or necessary clarification.
- Created the authoritative Contextual Intelligence, Customer Experience, AI Behavior, and Smart Interaction documents, including visibility/silence rules, permission boundaries, honest escalation, success measures, nine interaction families, and fourteen Planned industry examples.
- Added the rule to `AGENTS.md` and documentation governance, then linked it from the repository/documentation entry points, product manual, customer guide, investor pack, technical architecture, sales guidance, Product Fact Sheet, and sprint record.
- Classified the shared context envelope, resolver, proactive suggestions, smart interactions, verified human takeover, and contextual measurement as **Planned**. Existing chat and product records remain governed by their current implementation contracts.
- Documentation and architecture only: no application code, UI, API, authentication, Customer Portal implementation, SQL, migration, or database state changed, and no SQL was executed.

## 2026-07-14 — Customer Portal industry adaptation architecture

- Added `docs/technical/customer-portal-industry-architecture.md` as the implementation contract for adapting one shared Customer Portal through a versioned module registry, validated business configuration, server-enforced rollout flags, typed module adapters, and strict tenant-scoped permissions.
- Preserved the implemented shared core: dedicated authentication, tenant/profile selection, overview, appointments, customer-visible messages, documents, profile/preferences, support, accessibility, responsive states, and the existing RLS boundary.
- Marked the configurable registry, optional industry modules, dynamic terminology/actions, customer-visible knowledge publication, customer-facing AI generation, and operational human escalation as **Planned and not implemented**.
- Recorded fail-closed configuration, feature-flag, AI, tenant-cache, multi-profile, rollout, versioning, rollback, compliance, and human-escalation rules. Industry templates remain configurations of one Portal, not separate products.
- This was a documentation-only architecture sprint. No application feature was added, no SQL was executed, no migration was created or modified, and Production Ready remains **NO** at the current **71/100** certification score.

## 2026-07-14 — Customer Portal synthetic provisioning package

- Added a complete human-operator package for the two-tenant synthetic Customer Portal environment: setup runbook, go/no-go and teardown checklist, 15 authentication procedures, and exact alias-based test-data matrix.
- Fixed the provisioning order as Businesses → Owners → Invitations → Auth Users → Customer Profiles → Documents → Appointments → Messages → Support Requests, with explicit stage outcomes, failure stops, and reverse-dependency rollback.
- Documented exact Portal labels and routes, current Supabase Dashboard screens, trusted-server invitation/redemption boundaries, private `.test` mail and credential handling, cross-tenant controls, private Storage paths, session revocation, and cleanup verification.
- The package is Prepared only. No approval, provisioning, identity, credential, tenant, portal record, test result, production-readiness result, SQL execution, migration change, or application-code change is implied.
- The current certification state has superseded the earlier hardening-verification blocker; the Applied migration remains immutable and must not be repeated. Separate fixture approval and trusted operational tooling remain required.

## 2026-07-11 — Knowledge processing reliability

- Added guarded processing claims using status, attempt count, stable request identifiers, and per-attempt tokens stored in existing source metadata.
- Enforced the Uploaded → Queued → Processing → Ready/Needs review state flow and token-guarded failure completion.
- Added idempotent replay handling, duplicate/concurrent request rejection, a five-attempt retry ceiling, and recoverable/non-recoverable failure classification.
- Added application-perspective chunk replacement with hidden Processing state, unique indexes, failed-insert restoration, and stale-attempt protection.
- Blocked archive and delete while processing and added a guarded archive delete-lock before storage cleanup.
- Added a synchronous `KnowledgeProcessingQueue` boundary for a future durable worker, retry queue, dead-letter handling, and scheduled recovery.
- Added 12 in-memory integration tests for processing, replacement, concurrency, stale completion, mutation races, and tenant isolation.
- No SQL migration was created or run.

## 2026-07-11 — Knowledge document versioning

- Added copy-on-write document replacement without changing the verified Supabase schema.
- Kept the current Ready source searchable while a replacement is validated and processed.
- Added guarded automatic activation for Ready replacements and human approval for review-required replacements.
- Added document version history, active/historical status, and replacement controls to the safe preview.
- Added retry-safe replacement request identifiers and direct-child pending replacement protection.
- Made processing, rename, archive, and delete behavior version-aware; unattended processing now ignores inactive history.
- Added guarded activation compensation and live active-version verification before shared knowledge state is updated.

## 2026-07-10 — Knowledge Center V2

- Added production extractors for PDF, DOCX, XLSX, CSV, TXT, and manual text.
- Added strict upload limits, MIME/extension pairing, signature checks, filename sanitization, and upload throttling.
- Added observable processing fields, Needs review and Archived states, source references, and version-ready metadata.
- Secured the tenant-scoped search RPC against direct client execution.
- Added honest keyword fallback search with filters, citations, and embedding-provider visibility.
- Added grounded pre-completion knowledge retrieval to chat.
- Rebuilt the Knowledge workspace with Overview, Sources, Documents, Processing, Search, Gaps, and Settings.

## 2026-07-10 — Living documentation system

- Added product manual, investor, customer, technical, sales, decision, and sprint libraries.
- Added documentation governance, master index, project history, and product fact sheet.
- Added the mandatory future-sprint documentation rule to `AGENTS.md`.
- Reconstructed major product phases from repository evidence.

## 2026-07-10 — Executive Dashboard V3

- Replaced the legacy dashboard presentation with an Executive Brief, Decision Queue, Business Pulse, JOHAI at Work, compact CRM summary, Business Brain, and Outlook.
- Removed legacy dashboard JSX while retaining server data sources and focused routes.

## Purpose
Summarize major JOHAI engineering milestones.

## Architecture
Changes are grouped by product capability rather than individual commits.

## Components
CRM, Authentication, Calendly, Email, Follow-ups, Multi-tenant, Onboarding, Knowledge Engine, Semantic Memory, AI Orchestrator, Business Brain, Audit Engine, Morning Brief, Chief of Staff, and Command Center.

## Current Status
- Added JOHAI v2 Command Center.
- Added AI Chief of Staff engine and dashboard experience.
- Added Morning Brief engine and dashboard experience.
- Added Business Brain, Audit Engine, AI Orchestrator, Semantic Memory, and Knowledge Engine architecture.
- Added Calendly integration, email notifications, follow-ups, onboarding, and CRM upgrades.
- Added engineering documentation folder.

## Future Roadmap
Maintain this changelog per release, add dates and version tags, and link migrations or pull requests when source control workflow is formalized.

## Dependencies
Engineering release process, Git history, and Supabase migration history.

## Known Limitations
This changelog is reconstructed from project state and recent work, not from tagged releases.

## 2026-07-12 — Knowledge transaction hardening proposal

- Added an unexecuted, conflict-first proposal for version uniqueness, single-active enforcement, atomic activation, and atomic chunk replacement.
- Added a read-only verifier for conflicts, integrity objects, and execution privileges.
- No application code or deployed database state changed.

## 2026-07-13 — Customer Portal V1 foundation and application

- Recorded the initial schema audit finding that business-member authentication, CRM conversations, lead-based appointments, and Knowledge Center documents could not safely serve authenticated end customers.
- Recorded explicit user confirmation that `supabase/migrations/20260713120000_customer_portal_v1_foundation.sql` was manually applied and verified with `supabase/verification/customer_portal_v1_foundation_verify.sql`.
- Preserved `supabase/verification/customer_portal_v1_foundation_verify.sql` as the required read-only verifier.
- Added the database approval ledger and identity/tenant-isolation ADR, including every proposed RLS policy, privilege change, risk, verification criterion, and recovery condition.
- Added a dedicated Customer Portal platform layer under `/portal/*` with PKCE authentication, password recovery, active-profile access gating, explicit tenant selection, and a responsive accessible shell.
- Added the portal overview, appointments, customer-visible messages, current shared documents and acknowledgements, editable profile/preferences, and support requests using an explicit safe-column RLS data layer.
- Added bearer-authorized document delivery that revalidates the caller and RLS-visible document, enforces `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` and a canonical business/profile path, and returns a 60-second signed URL.
- Isolated portal and workspace browser sessions at the root-provider boundary, required a recent user-bound password-recovery event before password changes, and restricted post-login redirects to protected portal destinations.
- Hardened document delivery during final security review with explicit selected-business/profile matching, traversal-resistant canonical path validation, and stale-request suppression after tenant or session changes.
- Kept CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, the Executive Dashboard, and unrelated tenants outside the portal.
- Public signup and invitation redemption remain unimplemented. Production deployment, raw verifier output, approver identity and dates, and production end-to-end tenant tests remain unconfirmed.
- `npm run lint` passed. The default build first failed because the pre-existing `.next-build-stable/trace` file was locked; an alternate `NEXT_DIST_DIR` build passed TypeScript and generated all 43 routes. Browser inspection confirmed enabled sign-in/password-recovery states and no horizontal overflow at a 390-pixel viewport.
- The implementation did not modify or execute SQL.

## 2026-07-13 — Customer Portal production hardening status reconciled

- Corrected the then-current lifecycle record after an unsupported verification-success claim: the migration was **Applied**, while verification was recorded as **Pending** at that checkpoint. The July 14 certification re-audit later removed that verification blocker.
- Preserved the applied migration as immutable history. It was not modified or rerun and must not be modified, deleted, replaced, or executed again.
- Recorded the two corrected verifier defects: the acknowledgement relation name and PostgreSQL `42883` ACL-expression incompatibility. At that checkpoint, execution results and evidence were still Pending; the current certification state treats the verification blocker as resolved while raw evidence references remain documentation gaps.
- Approver identity, approval date, and execution date were not supplied and remain Pending.
- Remaining production risks are application compatibility with the restricted columns, representative behavioral RLS/direct-REST tests, customer provisioning, storage and signed-download validation, rate limits, browser QA, and production deployment evidence.
- No SQL was executed. No migration or application code was modified.

## 2026-07-13 — Customer Portal hardening applied; historical verification-repair checkpoint

- Recorded the user's explicit confirmation that `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql` executed successfully. The migration is Applied, immutable history, and must not be modified, replaced, deleted, or executed again.
- Recorded verification as Pending at that historical checkpoint after the verifier referenced `public.customer_portal_acknowledgements` instead of `public.customer_portal_document_acknowledgements` and later failed with PostgreSQL `42883` on the schema-qualified `coalesce(aclitem[], aclitem[])` ACL expression.
- Corrected every acknowledgement-table reference and replaced incompatible table/function ACL-array inspection with read-only `information_schema.table_privileges` and `has_function_privilege` checks. Replaced the remaining schema-qualified `coalesce` label expression with `CASE`.
- A full static review confirms the corrected verifier contains only `SELECT` and `WITH ... SELECT` statements. No SQL was executed while repairing the file or documentation.
- Those execution and evidence items were Pending at that checkpoint. The latest certification re-audit removes verification as an active blocker; Production Ready remains **NO** because behavioral and operational gates are still open.

## 2026-07-13 — Customer Portal production security gate proposed

- Recorded live read-only PostgREST/OpenAPI evidence: all eight portal tables are exposed, only the existing portal-customer check RPC is present, and anonymous GET has API privilege on branding, messages, acknowledgements, and requests while RLS returns no rows.
- Recorded that every portal table had zero rows during the July 13 pre-hardening inspection; no customer JWT or fixture was available to that inspection, so its zero-row integrity and empty responses were not behavioral tenant-isolation evidence. The current live row count is not established by that historical result.
- Identified authenticated table-wide grants that exceed the UI safe-column/write contract, including internal profile, provider/event, storage, identifier, and timestamp fields.
- Added the Under review migration `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql` and matching 16-section read-only verifier `supabase/verification/customer_portal_production_security_hardening_verify.sql` to the approval workflow. Neither is approved, applied, executed, or verified.
- Recorded the proposed global identity-separation rule: one Auth identity cannot be both a portal customer and any JOHAI business owner/member; distinct identities are required for dual-role people.
- Recorded the post-migration application gate: hidden-column filters/writes and the signed-download lookup must be aligned and validated after database verification before the portal can proceed.
- Added the production-validation sprint with the route matrix, provisioning gap, security classifications, and Pending evidence.
- `npm.cmd run lint` passed. The default build was blocked before compilation by an `EPERM` lock on `.next-build-stable/trace`; the owning Node process was not identifiable and none was terminated. No browser QA or automated portal suite ran in this validation attempt.
- No SQL was executed.

## 2026-07-13 — Customer Portal Pilot Demo

- Added the development-only `/portal/demo` surface using the fictional Harbor Dental Studio business and fictional customer Sophie Martin.
- Added a deterministic in-memory Portal repository that performs no Supabase or external network requests and creates no production customer data.
- Reused the shared production Portal shell, dashboard, appointments, messages, documents, profile, support, UI states, and repository contracts instead of creating a separate product implementation.
- Added complete, empty, load-error, one-shot message failure, one-shot download failure, and expired-profile-save scenarios with reset and retry behavior.
- Added `npm run test:portal`; all 16 Pilot Demo tests passed. `npm run lint` and `npm run build` also passed.
- Confirmed with live production-server requests that `/portal/demo` and its generated attachment endpoint both return 404. Development HTTP/SSR and initial DOM inspection passed, but full interactive, keyboard, and exact desktop/tablet/mobile viewport QA remains Pending after the in-app browser connection to the local preview became unavailable.
- Tightened the demo guard to an explicit development/test allowlist and applied it to generated attachment downloads, replacing public static fixture files. Corrected the shared message success notice, removed complete-data flashes from empty/error scenarios, added an assistive-technology support success announcement, and exposed human assistance as an explicit request type.
- Verified the generated fictional attachment returns 200 with attachment disposition in development and 404 in production; temporary validation servers and the isolated development cache were removed afterward.
- Aligned the production Portal application calls with the Applied database hardening contract. Verification was still Pending at the time of the pilot and was later removed as a blocker; application alignment remains distinct from behavioral RLS or production-environment proof.
- No SQL was generated or executed. The demo does not establish deployment, production readiness, customer usage, traction, or real tenant isolation. Approver identity, dates, and raw verifier output remain Pending.

## 2026-07-14 — Customer Portal deterministic date rendering

- Removed the Customer Portal hydration mismatch caused by host-default `Intl.DateTimeFormat` locale and timezone behavior.
- Added one shared formatter that derives an explicit locale from the customer profile language with `en-US` fallback, uses each valid appointment timezone, and uses explicit `UTC` for portal records without a stored timezone.
- Replaced render-time demo fixture clocks and appointment boundaries with one fixed demo reference instant and one server-serialized production request instant.
- Replaced locale-sensitive ISO sorting, added Next.js 16's `data-scroll-behavior="smooth"` marker to the existing smooth-scrolling root, and extended the existing 16-test portal suite with deterministic rendering checks.
- `npm run test:portal`, `npm run lint`, and `npm run build` passed. HTTP/SSR returned the English customer date deterministically; the live in-app browser console check remains Pending because its webview did not attach.
- No SQL or migration was modified or executed.

## 2026-07-14 — Supabase browser auth client singleton hardening

- Removed repeated browser `createClient` calls from the Business Workspace and Customer Portal auth providers. Provider remounts, React development render replay, and Fast Refresh could previously create multiple GoTrue clients that recovered, refreshed, and broadcast against the same persisted storage key.
- Added one browser-global registry that returns exactly one Supabase auth client per storage key and rejects conflicting configuration for an occupied key. The registry survives provider remounts and Fast Refresh while remaining request-local on the server.
- Preserved the existing session boundary: Business Workspace remains on `johai-auth-session`; Customer Portal remains on `johai-customer-portal-session` with PKCE. The development-only portal demo still creates no Supabase client.
- Preserved login, local portal logout, session recovery/refresh listeners, protected portal redirects, and dashboard cookie authentication. Corrected a portal sign-in hydration race discovered during browser validation so the submit control is usable after hydration.
- All 16 `npm run test:portal` checks, `npm run lint`, and the canonical `npm run build` passed. Live development-browser checks found no duplicate GoTrue warning or hydration warning on portal login, the unauthenticated protected-portal redirect, `/portal/demo`, workspace login, or the dashboard login redirect.
- Credential-backed login, token refresh, recovery, logout, and multi-tab behavior remain Pending because no approved test identity or credentials were supplied. No SQL or migration was modified or executed.

## 2026-07-14 — Customer Portal real-auth validation gate

- Audited the project, environment variable names, current browser context, existing automated tests, and documentation for approved Customer Portal test identities without reading or exposing secret values. No approved identity, credential reference, controlled recovery mailbox, or existing authenticated browser session was available; this does not assert that the current live database is empty.
- Recorded an initial five-role synthetic identity model for valid, suspended, invited, multi-profile, and Business Workspace-only coverage, together with a trusted server-side provisioning and secret-handling procedure. The later exact Tenant A/B plan supersedes this generic role model without creating identities.
- Credential-free browser checks confirmed the unauthenticated `/portal` redirect precondition, the safe missing/invalid recovery-context state, and `/portal/demo` isolation. Recovery callback failure without a valid recovery context and the demo's no-Supabase-client contract passed; credential-backed lifecycle scenarios remain blocked rather than failed.
- Structural session separation remains intact through distinct `johai-customer-portal-session` and `johai-auth-session` keys, but behavioral two-session and multi-tab evidence remains Pending.
- `npm run lint`, all 16 `npm run test:portal` checks, and `npm run build` passed. No application code, SQL, migration, identity, tenant, invitation, or customer data was created or modified.

## 2026-07-14 — Customer Portal synthetic test identity plan

- Added an exact operator-only plan for Northstar Lantern Test Studio (Tenant A) and Blue Meadow Test Workshop (Tenant B), using only fictional reserved `.test` aliases.
- Defined eight unprovisioned Supabase Auth users, seven portal profiles, and seven invitations. A5 owns the only two-profile portal identity; A3 remains suspended; A4 remains invited with an unaccepted invitation.
- Assigned all 15 authentication scenarios to A1, A2, A3, A4, A5, B1, Owner A, or a clean identity-free demo context.
- Recorded human provisioning order, server-only invitation redemption, password-manager/private-mail handling, sanitized evidence rules, session revocation, dependency-safe fixture removal, Auth cleanup, and final read-only cleanup verification.
- The hardening migration remains Applied and immutable. At the time the identity plan was prepared, its corrected verifier was approved but still Pending; the latest certification re-audit subsequently removed that blocker. No identity, credential, tenant, row, application code, migration, or SQL execution was created or performed, and authentication remains not production-ready.

## 2026-07-14 — Customer Portal V1 final certification: FAILED

- Completed a production-assurance review across authentication, tenant isolation, Storage, messaging, appointments, profile editing, support, responsive behavior, accessibility, performance, and security. The initial rounded score was **69/100**; the latest re-audit supersedes it with **71/100**, and **Production Ready remains NO**.
- Passed `npm run lint`, all 16 `npm run test:portal` checks, and `npm run build`; the build completed TypeScript and generated 43 pages/routes.
- Checked all six shared Portal feature routes at 1440x900, 768x1024, and 390x844 with no page-level horizontal overflow. Final local browser logs contained no hydration, duplicate GoTrueClient, warning, or error entry.
- Found and corrected a real WCAG contrast issue in muted portal branding, timestamps, document types, support metadata, and placeholders without changing layout, content, routes, or features. The repeated route-wide sample recorded zero failures across 242 visible text nodes.
- The hardening-verification blocker is now resolved. Certification still fails because approved synthetic identities are unprovisioned and credential-backed auth, behavioral tenant/RLS, private Storage, complete keyboard/screen-reader, production performance, rate-limit, monitoring, and support-lifecycle evidence remain incomplete.
- Added `docs/sprints/CUSTOMER_PORTAL_V1_FINAL_CERTIFICATION.md` as the authoritative scorecard and blocker record. The hardening migration remains Applied and immutable; no SQL was executed and no migration was modified.
