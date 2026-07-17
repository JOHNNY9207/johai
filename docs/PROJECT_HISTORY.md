# JOHAI Project History

This history is reconstructed from source files, migrations, and existing documentation rather than tagged releases. Status means repository implementation status, not production adoption.

## CRM foundation — Implemented

- **Built:** Lead capture, Supabase persistence, conversations, status, notes, meeting and follow-up fields, update/delete endpoints, and test cleanup.
- **Why it matters:** Creates the operational record connecting customer conversations to follow-up and booking.
- **Major files:** `app/api/leads/`, `app/lib/supabase.ts`, early lead-management migrations.
- **Limitations:** The executive homepage now shows a compact summary; a focused rich CRM workspace remains a product need.

## Knowledge Engine — Implemented with limits

- **Built:** Knowledge entries, strict uploads, maintained PDF/DOCX/XLSX extraction, CSV/TXT/manual processing, guarded attempt tokens, idempotent request replay, recoverability metadata, application-perspective chunk rollback, observable status, safe preview, archive/reprocess/delete, copy-on-write replacement, inspectable version history, guarded review/activation, processing logs, and filterable keyword search.
- **Why it matters:** Grounds AI responses in approved business information.
- **Major files:** `app/lib/knowledge-engine.ts`, `app/lib/knowledge-processing-state.ts`, `app/lib/knowledge-processing-queue.ts`, `app/lib/knowledge-versioning.ts`, `app/dashboard/knowledge/`, `app/api/knowledge/`, knowledge migrations, and `tests/knowledge-processing-reliability.test.ts`.
- **Limitations:** Processing still runs synchronously in the request. Chunk replacement and version activation are guarded multi-step operations rather than database transactions. Database-enforced version-number and single-active-version uniqueness, crash-safe chunk transactions, immutable approval audit records, malware scanning, website crawling, and live-Supabase integration coverage remain incomplete.

## Knowledge Processing Reliability — Application hardening implemented

- **Built:** Conditional processing claims, stable request replay identifiers, attempt tokens, stale-result rejection, bounded retries, failure classification, process-local lineage locks, archive/delete processing guards, a synchronous queue contract, and 12 in-memory integration scenarios.
- **Why it matters:** Retries and overlapping requests no longer duplicate attempts or allow an older result to overwrite a newer document state through supported application paths.
- **Major files:** `app/lib/knowledge-engine.ts`, `app/lib/knowledge-processing-state.ts`, `app/lib/knowledge-processing-queue.ts`, `app/lib/knowledge-operation-lock.ts`, Knowledge APIs, and `tests/knowledge-processing-reliability.test.ts`.
- **Limitations:** Process-local locks do not coordinate separate server instances. Strict one-active-version, unique version allocation, and crash-atomic chunk replacement still require database-side constraints and transactional functions.

## Semantic Memory — Partial

- **Built:** Search service contract, result types, OpenAI embedding-provider adapter, and integration boundary.
- **Why it matters:** Prepares contextual retrieval without coupling routes to one provider.
- **Major files:** `app/lib/semantic-memory.ts`, semantic-memory migration and documentation.
- **Limitations:** Vector persistence, hybrid ranking, and production retrieval evaluation are not complete; active retrieval is PostgreSQL full-text keyword search.

## AI Orchestrator — Implemented foundation

- **Built:** Intent detection, contextual search, bounded action planning, and orchestration logging.
- **Why it matters:** Connects chat understanding to traceable business actions.
- **Major files:** `app/lib/ai-orchestrator.ts`, `app/api/chat/route.ts`, orchestrator migration.
- **Limitations:** Connector execution, durable jobs, retries, and authority controls need production hardening.

## Business Brain — Implemented foundation

- **Built:** Business snapshot, readiness scoring, industry templates, vocabulary, and recommendations.
- **Why it matters:** Makes missing business knowledge visible and actionable.
- **Major files:** `app/lib/business-brain.ts`, Business Brain migration, dashboard insight components.
- **Limitations:** Some assessments are deterministic and depend on default-business context.

## Autonomous Audit Engine — Implemented foundation

- **Built:** Modular business audits, scores, issues, recommendations, and audit history support.
- **Why it matters:** Turns configuration and operating gaps into an improvement plan.
- **Major files:** `app/lib/audit-engine.ts`, audit migration.
- **Limitations:** External AI and export connectors are extension points; execution is not fully autonomous.

## AI Employee Experience — Implemented frontend and flow

- **Built:** Floating chat, lead qualification, booking intent, business-context responses, and AI-work framing.
- **Why it matters:** Presents JOHAI as a bounded worker rather than only a chatbot.
- **Major files:** `components/AIChat.tsx`, `components/FloatingChat.tsx`, `app/api/chat/route.ts`.
- **Limitations:** Provider and knowledge quality determine response reliability.

## Morning Brief — Implemented service

- **Built:** Executive metrics, priorities, recommendations, health, opportunity, and timeline model.
- **Why it matters:** Summarizes operating context for owners.
- **Major files:** `app/lib/morning-brief.ts`.
- **Limitations:** Scheduled delivery and persisted history are not complete.

## Chief of Staff — Implemented service

- **Built:** Executive cards, business pulse, notification plan, and executive timeline.
- **Why it matters:** Interprets business signals instead of displaying raw admin data.
- **Major files:** `app/lib/chief-of-staff.ts`.
- **Limitations:** Recommendations remain bounded by available data and deterministic logic.

## Command Center — Superseded by Dashboard V3

- **Built:** Earlier command-center views joining CRM, knowledge, AI, audit, and readiness signals.
- **Why it matters:** Established executive framing.
- **Major files:** Historical `DashboardClient.tsx` revisions and dashboard services.
- **Limitations:** The earlier interface became visually dense and was removed from the rendered dashboard.

## Product Stabilization — Ongoing

- **Built:** Type-safe routes, dashboard authorization, validation, lead cleanup, error states, and repeated successful lint/build runs.
- **Why it matters:** Reduces regressions while the product surface expands.
- **Major files:** Auth helpers, API handlers, configuration, and dashboard components.
- **Limitations:** Automated unit, integration, and end-to-end tests remain missing.

## Documentation foundation — Implemented

- **Built:** Product, investor, customer, technical, sales, ADR, sprint, history, and governance libraries.
- **Why it matters:** Keeps future product claims and operating knowledge synchronized.
- **Major files:** `docs/`, `AGENTS.md`.
- **Limitations:** Screenshots, API schemas, diagrams, and per-sprint backfill remain future work.

## Billing architecture — Partial

- **Built:** Plan models, pricing routes, Stripe Checkout, and signature-verified webhook handling.
- **Why it matters:** Establishes a path to subscription revenue.
- **Major files:** `app/lib/billing.ts`, `app/lib/stripe-billing.ts`, `app/api/billing/`, `app/pricing/`.
- **Limitations:** Subscription state, portal, invoices, cancellations, and entitlements are not complete.

## Customer Lifecycle — Implemented derived model

- **Built:** Lifecycle status, timeline, health, risks, and recommendations derived from existing signals.
- **Why it matters:** Prepares proactive customer-success operations.
- **Major files:** `app/lib/customer-lifecycle.ts`.
- **Limitations:** State is calculated rather than persisted and integrated with a billing authority.

## Landing redesign — Implemented

- **Built:** Multilingual, animated, room-based landing experience with industry, customer, pricing, product, Calendly, and chat entry points.
- **Why it matters:** Communicates the broader AI employee product thesis.
- **Major files:** `app/page.tsx`, active marketing images.
- **Limitations:** The page is a large client component and older unused marketing components remain.

## Premium chat redesign — Implemented

- **Built:** Premium chat surface, structured lead collection, availability display, booking actions, and responsive floating presentation.
- **Why it matters:** Makes the first product interaction feel operational and business-aware.
- **Major files:** `components/AIChat.tsx`, `components/FloatingChat.tsx`.
- **Limitations:** Accessibility and mobile keyboard behavior require continued device testing.

## Dashboard V3 — Implemented frontend

- **Built:** Executive Brief, Decision Queue, Business Pulse, JOHAI at Work, compact CRM summary, Business Brain insights, and Outlook.
- **Why it matters:** Reframes the dashboard as an AI Chief of Staff rather than an admin CRM.
- **Major files:** `app/dashboard/DashboardClient.tsx`, `components/dashboard/`.
- **Limitations:** Historical trends and business learnings are only shown when supportable; focused operational workspace expansion remains planned.

## Knowledge database hardening proposal — 2026-07-12

- **Prepared:** Minimal constraints and service-role-only transactions for distributed version activation and chunk replacement.
- **Safety:** The proposal aborts on conflicts and never deletes or rewrites knowledge data.
- **Status:** Proposed only; no SQL was executed and application callers are unchanged.

## Customer Portal V1 — foundation verified and application implemented, 2026-07-13

- **Product layer:** A separate business-branded, mobile-first portal for each business's authenticated customers.
- **Initial audit:** Existing business-member authentication, CRM conversations, lead-based appointments, and Knowledge Center documents could not safely serve end customers or establish a customer-visible tenant boundary.
- **Database foundation:** Isolated customer identity, invitations, appointments, messages, shared documents, acknowledgements, requests, branding, composite tenant constraints, RLS, a read-only verifier, approval ledger, and architecture decision.
- **Approval and execution:** The user explicitly confirmed that the approved migration was manually applied and verified successfully. Approver identity, approval date, execution date, detailed live-schema/effective-privilege evidence, raw verifier output, query findings, and unreported errors remain Pending in the authoritative database change log.
- **Application:** Added `/portal`, login and reset-password flows, a dedicated PKCE portal session, active-profile authorization and explicit tenant selection, dashboard, appointments, visible messaging, documents and acknowledgements, protected short-lived downloads, profile/preferences, support requests, and responsive accessible state handling.
- **Security boundary:** Portal data uses explicit safe-column queries plus the applied RLS profile/business boundary. CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, the Executive Dashboard, and other tenants remain excluded.
- **Limitations:** No public signup or invitation redemption, production deployment, rate limiting, or production end-to-end tenant/storage tests are confirmed. Secure downloads require an allowlisted bucket and canonical business/profile storage path. Direct authenticated REST access remains governed by deployed table privileges, not the UI column list.
- **Validation:** `npm run lint` passed. The default build encountered a locked pre-existing `.next-build-stable/trace`; an alternate output-directory build passed TypeScript and generated all 43 routes. No SQL was modified or executed by the implementation agent.

## Customer Portal production validation — historical Applied/Pending checkpoint, 2026-07-13

- **Pre-hardening live findings:** PostgREST exposed all eight portal tables and only the existing customer-check RPC. Anonymous API privilege existed on four tables despite RLS returning no rows. Authenticated grants were broader than the application safe-column contract.
- **Inspected data state:** All eight tables contained zero rows. No active profile, invitation, mixed principal, appointment, message, document, acknowledgement, request, or customer JWT existed for behavioral validation.
- **Database change:** The user explicitly confirmed successful execution of the versioned production-security migration that narrows privileges, constrains customer writes, and enforces global separation between portal-customer and business-owner/member identities. The migration is Applied and must not be rerun.
- **Status at that checkpoint:** Migration Applied and immutable; it must not be rerun. Verification was Pending while the corrected verifier and results were reviewed. The July 14 certification re-audit later removed verification as an active blocker; approver identity, dates, raw evidence references, fixtures, protected-route validation, Storage validation, and production readiness remain incomplete documentation or behavioral evidence.
- **Routes:** `/portal` is the canonical dashboard. Registration, `/portal/dashboard`, and a dedicated auth callback route remain absent; protected routes use a client gate plus RLS.
- **Historical validation attempt:** In that July 13 attempt, `npm.cmd run lint` passed, the default build was blocked by an unidentified active-process lock on `.next-build-stable/trace`, no process was terminated, no browser QA ran, and no Portal automated suite existed yet. Later Pilot and final-certification records supersede those application-validation facts, and the later certification re-audit also removed verification as an active blocker.
- **Verifier repair and result:** The read-only verifier's nonexistent `public.customer_portal_acknowledgements` reference was corrected to `public.customer_portal_document_acknowledgements`. PostgreSQL error `42883` from the invalid schema-qualified `coalesce(aclitem[], aclitem[])` ACL expression was corrected with compatible read-only privilege checks. The latest certification state records the blocker as resolved. The migration was not changed or rerun; raw result references remain documentation gaps.
- **Next gate after resolution:** Provision only the separately approved synthetic environment, then record behavioral RLS, direct REST, Storage, session, route, accessibility, and production-deployment evidence.

## Customer Portal Pilot Demo — development-only validation surface, 2026-07-13

- **Built:** Added `/portal/demo` with the fictional Harbor Dental Studio tenant and fictional customer Sophie Martin, backed by a deterministic in-memory repository with no Supabase or external network access.
- **Shared implementation:** The demo reuses the production Portal shell, dashboard, appointments, messages, documents, profile, support, UI-state components, and repository contracts. It does not create a parallel customer product or production data path.
- **Scenarios:** Complete pilot, empty states, load error, one-shot message failure and retry, one-shot download failure, expired profile save, reset, document acknowledgement/revocation, customer message, profile edit, and support request behavior.
- **Application hardening:** Production Portal calls were aligned with the restricted-column and trusted-server boundaries of the Applied database hardening migration. Verification was Pending during the pilot and was later removed as an active blocker; the immutable migration was not changed or rerun.
- **Validation:** All 16 `npm run test:portal` tests passed. `npm run lint` and `npm run build` passed.
- **Browser and guard validation:** Live production-server requests confirmed `/portal/demo` and its generated attachment endpoint both return 404. Development HTTP/SSR and initial in-app DOM inspection confirmed the demo shell, navigation, fictional labeling, and rendered dashboard content. Full interaction, keyboard, and exact desktop/tablet/mobile viewport QA remains Pending because the in-app browser connection to the local preview became unavailable.
- **Final audit corrections:** The development guard now uses an explicit development/test allowlist and also protects generated attachment downloads; no public static demo document remains. Shared production messaging no longer receives fictional-only success text, empty/error scenarios no longer flash complete fixture data, and support creation now provides an accessible success announcement and explicit human-assistance type.
- **Limits:** This is development-only fictional evidence. It is not a production deployment, customer session, behavioral RLS/direct-REST result, real storage test, customer usage, traction, or production-readiness claim. Approver identity, approval and execution dates, verification date, and raw verifier output remain Pending. No SQL was generated or executed.

## Customer Portal hydration hardening — deterministic locale, timezone, and reference time, 2026-07-14

- **Root cause:** Customer Portal client components formatted dates with the host's default locale and sometimes the host's default timezone. Server rendering used French while the browser used English. The demo fixture and appointment boundary also created independent render-time timestamps.
- **Correction:** Added customer-language-to-locale resolution with stable `en-US` fallback, explicit appointment timezones with `UTC` fallback, a fixed fictional-demo reference instant, and a request-time server instant serialized into the authenticated portal context.
- **Coverage:** Dashboard, appointments, messages, documents, and support now use the same formatter contract. The demo repository no longer uses locale-sensitive sorting, and the root HTML declares the existing smooth-scroll behavior for Next.js 16 navigation.
- **Validation:** All 16 portal tests, lint, and the canonical production build passed. HTTP/SSR produced the expected English/Toronto appointment text. The in-app browser webview did not attach, so a live console confirmation of zero hydration warnings remains Pending.
- **Database:** No SQL or migration was modified or executed. The hardening migration remains Applied and immutable; the latest certification re-audit later removed the corrected-verifier blocker.

## Browser authentication client lifecycle hardening — 2026-07-14

- **Root cause:** Workspace and Customer Portal providers called fresh Supabase factories during provider initialization. React development render replay, route-boundary remounts, and Fast Refresh could therefore leave multiple GoTrue clients recovering and refreshing one persisted storage key.
- **Correction:** Added a browser-global, storage-keyed registry and changed both providers to retrieve their shared surface client. Conflicting configuration for an occupied key fails closed instead of creating a second client.
- **Session boundary:** Workspace keeps `johai-auth-session`; Customer Portal keeps the distinct PKCE `johai-customer-portal-session`. Portal local logout, refresh listeners, workspace guards, dashboard cookie authentication, and the demo's no-Supabase boundary remain unchanged.
- **Browser correction:** Live QA exposed and corrected an auth-loading/Suspense hydration race that could leave the portal sign-in button disabled even after the client was ready.
- **Validation:** The 16-test portal suite now covers singleton identity, one construction per key, configuration conflict rejection, immutable key separation, refresh/listener/login/logout wiring, and provider/demo boundaries. Portal tests, lint, and the canonical build passed. Development-browser portal, demo, workspace-login, and dashboard-login checks showed no duplicate GoTrue or hydration warnings.
- **Remaining evidence:** No approved customer or workspace test credentials were supplied, so live credential-backed login, logout, refresh, recovery, expiry, and multi-tab propagation remain Pending. No SQL or migration was modified or executed.

## Customer Portal real-authentication validation attempt — blocked, 2026-07-14

- **Objective:** Exercise the 15-scenario Customer Portal authentication lifecycle with approved non-production identities, including recovery, expiry, multi-tab behavior, multiple profiles, inactive customers, and Business Workspace isolation.
- **Identity result:** No approved test identity, credential reference, controlled mailbox, or authenticated browser session was available. Existing tests and the pilot demo use fake clients and fictional in-memory data, not Supabase Auth accounts. The result does not claim that the live database is currently empty.
- **Evidence collected:** Unauthenticated `/portal` access redirected to login; missing/invalid recovery context failed safely; the demo declared and preserved its no-Supabase boundary. Static and automated evidence preserved distinct workspace and portal storage keys, while behavioral session and multi-tab tests remained blocked.
- **Provisioning record:** Added an initial five-role model and trusted server-side procedure. The later exact Tenant A/B synthetic plan supersedes those generic roles and still forbids production accounts, browser service-role use, and documentation of passwords, links, UUIDs, or tokens.
- **Validation:** `npm run lint`, all 16 portal tests, and the canonical production build passed. No credential-backed auth request, SQL, migration, application-code change, or identity/data creation occurred.
- **Gate:** The hardening migration remains Applied and immutable, and the latest re-audit removed the verification blocker. The next active gate is separate human approval and provisioning of the synthetic fixtures before repeating the complete lifecycle matrix.

## Customer Portal synthetic identity plan — prepared, not provisioned, 2026-07-14

- **Tenants:** Defined two fictional reserved-domain tenants with separate owners and visibly different safe portal data.
- **Identity model:** Defined eight Auth users, seven profiles, and seven invitations. A5 has active profiles in both tenants; A3 remains suspended; A4 remains invited/unaccepted; owner identities have no portal profile.
- **Operations:** Recorded the then-current verifier gate plus enduring fixture approval, service-role-only redemption, private `.test` mail capture, expiring secret delivery, sanitized evidence, session revocation, dependency-safe cleanup, and Auth-user deletion last. The verifier blocker was later removed; fixture approval remains required.
- **Testing:** Assigned every required authentication scenario to a specific fixture while preserving a clean no-identity context for the demo.
- **Status:** Documentation only. No account, credential, tenant, invitation, profile, SQL, migration, or application-code change was created. The hardening-verification blocker is resolved, while authentication remains not production-ready.

## Customer Portal V1 final certification — FAILED, 2026-07-14

- **Decision:** The initial certification scored 69/100; the latest re-audit supersedes it with **71/100**. Customer Portal V1 is still not production-ready because mandatory identity, tenant, Storage, and operational gates cannot be averaged away.
- **Passed evidence:** Lint, all 16 Portal tests, and the canonical production build passed. The build completed TypeScript and generated 43 pages/routes. Six shared Portal routes passed desktop, tablet, and mobile no-overflow checks, with no final browser warning, hydration error, or duplicate-auth-client warning.
- **Correction:** The certification browser audit found insufficient contrast in several small muted text styles. The shared Portal styles were darkened without changing layout or data, and the repeated 242-node sample recorded zero WCAG AA text-contrast failures.
- **Unclosed gates:** Synthetic identities remain unprovisioned; credential-backed authentication, behavioral cross-tenant/direct-REST denial, private Storage/signed URL behavior, support lifecycle, complete keyboard/screen-reader evidence, production performance, rate limiting, and monitoring remain incomplete. Hardening verification is no longer an active blocker.
- **Database status:** The foundation remains Applied and Verified by explicit user confirmation. The hardening migration remains Applied and immutable, its verification blocker is resolved, and it must not be rerun. No SQL was executed and no migration was changed during certification.

## Customer Portal synthetic environment package — prepared, not provisioned, 2026-07-14

- **Current-state correction:** The latest certification review removed the previous production-hardening verification blocker. The Applied migration remains immutable and is not part of this package.
- **Created:** `docs/testing/SYNTHETIC_ENVIRONMENT_SETUP.md`, `docs/testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md`, `docs/testing/AUTH_TEST_PROCEDURES.md`, and `docs/testing/TEST_DATA_MATRIX.md`.
- **Operator scope:** The package fixes the human creation order, exact two-business/eight-user/seven-profile/seven-invitation matrix, Dashboard screens, trusted-server boundaries, evidence controls, stage rollback, session revocation, private Storage cleanup, and all 15 authentication procedures.
- **Hard stop:** JOHAI V1 has no customer-facing invitation creation/redemption screen. Six active profiles require the existing service-role-only redemption function through an independently approved trusted server operation. A3 suspension and A4 invited-state creation also require approved privileged administration. No ad hoc SQL is permitted.
- **Status:** Prepared only. Approver, environment, operators, mail sink, secret system, trusted tooling, test window, evidence policy, cleanup ownership, and final GO decision remain Pending. No identity, tenant, invitation, profile, fixture, credential, or test result was created.
- **Change boundary:** Documentation only; no SQL was executed, no migration was changed or rerun, and no application code was modified.

## Customer Portal industry adaptation architecture — Planned, 2026-07-14

- **Architecture:** Added `docs/technical/customer-portal-industry-architecture.md` as the contract for one shared Customer Portal with a versioned module registry, validated business-scoped configuration, server-enforced rollout flags, typed module adapters, and exact tenant/profile permissions.
- **Implemented baseline:** Dedicated authentication, tenant/profile selection, overview, appointments, customer-visible messages, documents, profile/preferences, support, accessibility, responsive states, and the current RLS boundary remain the shared implemented core.
- **Planned scope:** Configurable industry modules, dynamic terminology and actions, customer-visible knowledge publication, customer-facing AI generation, and operational human escalation are Planned and were not implemented by this sprint.
- **Security boundary:** Industry metadata and configuration never grant access, replace RLS, expose Business Brain or Knowledge Center internals, or create separate industry products. Missing or invalid optional configuration fails back to the neutral core with optional modules off; authorization uncertainty denies access.
- **Current status:** Documentation only. No application code, feature, SQL, migration, database state, identity, tenant, or production configuration changed. The latest certification remains **71/100**, certification **FAILED**, and Production Ready **NO**.

## JOHAI Contextual Intelligence™ philosophy — adopted architecture, implementation Planned, 2026-07-14

- **Objective:** Define a product-wide alternative to generic chat in which authorized context reduces customer effort and the system asks only for genuinely missing information.
- **Permanent rule:** “The AI never asks for information it can already infer from context.” Inference is restricted to current, relevant, provenance-aware, customer-safe context and never grants authority.
- **Architecture:** Contextual Intelligence is a cross-layer design contract, not a seventh platform layer or autonomous agent. The workflow owner resolves actor, tenant, customer/profile, permissions, visible sources, business rules, and deterministic action authority before providing a minimized context envelope to the AI Layer.
- **Experience:** AI appears only when an explanation, summary, translation, draft, clarification, or safe recommendation adds value; it remains invisible for deterministic behavior, completed or critical workflows, policy-required human work, and situations with no useful intervention.
- **Security:** CRM internals, Business Brain internals, private notes, prompts, billing internals, raw Knowledge Center files, orchestration, embeddings/vector-search implementation, credentials, and other customers remain forbidden customer-facing sources.
- **Artifacts:** Created the four philosophy documents and the `docs/sprints/CONTEXTUAL_INTELLIGENCE.md` architecture record; updated governance, indexes, manuals, architecture, investor, sales, product-status, changelog, and history records.
- **Status:** Philosophy and governance adopted. Context resolver, smart interactions, human-takeover operations, industry scenarios, and outcome metrics remain **Planned** and have no claimed baseline or production result.
- **Change boundary:** No application code, UI, API, authentication, Customer Portal implementation, SQL, migration, database state, or runtime capability changed. No SQL was executed.

## JOHAI Design System and Product Constitution — adopted governance, 2026-07-14

- **Objective:** Establish the permanent identity and highest internal product-design authority for JOHAI so future features cannot drift into generic chat, dashboard clutter, decorative AI, pressure, hidden uncertainty, or automation without business value.
- **Authority:** The Constitution governs features, UI decisions, AI behavior, workflows, automations, interactions, language, customer experience, and business experience. It remains subordinate to law, security, privacy, accessibility, explicit human approval, and mandatory database safety.
- **Ten Laws:** Codified context before questions, valuable interruption only, effort reduction, necessary explanation, useful silence, customer understanding, time savings, confidence through truthful clarity, natural human takeover, and the business as hero. Each law includes purpose, examples, counterexamples, and implementation consequences.
- **Values and principles:** Defined Trust, Simplicity, Speed, Transparency, Respect, Reliability, Privacy, Context, Elegance, and Business Value, plus permanent design, UX, AI, customer, business, and language rules.
- **Decision control:** Added a mandatory stop/go framework. A proposal that does not reduce effort, create trust, remove friction, respect context, preserve human authority, and satisfy the Ten Laws must not be implemented.
- **Hierarchy:** Contextual Intelligence, platform architecture, manuals, feature specifications, components, and runtime implementation are subordinate to the Constitution. Adoption does not change any capability's implementation status.
- **Documentation:** Created ten files under `docs/constitution/` and updated AGENTS, documentation governance/indexes, manuals, audience packs, architecture, Product Fact Sheet, changelog, history, and risks.
- **Change boundary:** Architecture and governance only. No application code, UI, API, authentication, automation, Customer Portal implementation, SQL, migration, database state, or runtime capability changed. No SQL was executed.

## JOHAI North Star, Manifesto, and Brand System — adopted strategy, 2026-07-14

- **Objective:** Establish the permanent strategic identity that explains why JOHAI exists, what the company promises, how it behaves, how it speaks, and what should still be true in ten years.
- **Foundation:** Created the North Star, Manifesto, Mission and Vision, Product Promise, Company Values, Brand Guidelines, Voice and Tone, AI Employee Principles, Culture, and Long-Term Roadmap under `docs/foundation/`.
- **Governance:** Future architectural and product decisions must align with the Constitution and strategic foundation. The Constitution remains the highest internal product-design authority; protective legal, security, privacy, accessibility, human-approval, and database-safety requirements remain controlling.
- **Direction:** JOHAI exists to give owner-led businesses useful enterprise-level intelligence without adding enterprise complexity. AI should reduce work, remain honest about limits, respect permissions, and strengthen rather than displace human relationships.
- **Status truth:** The roadmap is directional. Strategic adoption does not imply that marketplace, developer-platform, international, industry, AI Employee, customer, revenue, or production outcomes are implemented or proven.
- **Documentation:** Updated governance, repository and documentation entry points, product/customer/investor/technical/sales manuals, Product Fact Sheet, changelog, project history, and sprint index.
- **Change boundary:** Architecture and documentation only. No application code, UI, API, authentication, runtime behavior, SQL, migration, or database state changed. No SQL was executed.

## JOHAI Foundation Version 1.0 — COMPLETE and FROZEN, 2026-07-14

- **Objective:** Lock the completed constitutional, strategic, contextual-intelligence, and brand corpus as the permanent baseline for future JOHAI decisions and implementation.
- **Version and status:** Foundation Version **1.0**; status **COMPLETE**; lock state **FROZEN**.
- **Control records:** Created `docs/foundation/FOUNDATION_STATUS.md`, `docs/foundation/FOUNDATION_CHANGE_POLICY.md`, `docs/foundation/FOUNDATION_INDEX.md`, and `docs/releases/FOUNDATION_V1_RELEASE.md`.
- **Governance:** Every future implementation must comply with the Constitution, North Star, Manifesto, Product Promise, Company Values, AI Principles, UX Principles, Design Principles, Contextual Intelligence, and Brand System. No implementation may violate or silently reinterpret them.
- **Change control:** A future Foundation change requires an explicit user request, classified architectural decision, affected-domain review, named human approval, versioning, release validation, and preserved history. AI cannot approve a change.
- **Development transition:** Strategic-documentation epics stop by default. The next priorities are Customer Portal Certification, Business Workspace Certification, JOHAI Super Admin, AI Employees, Marketplace, and Business Brain V2.
- **Status truth:** Foundation completion means governance readiness, not application conformity, product completion, production certification, feature availability, market entry, or commercial proof.
- **Change boundary:** Governance and documentation only. No application code, UI, API, authentication, SQL, migration, database state, deployment, or runtime behavior changed. No SQL was executed.

## Customer Portal Contextual Intelligence V1 — bounded implementation, 2026-07-14

- **Objective:** Make the existing Customer Portal feel prepared and useful through bounded contextual assistance rather than a generic chatbot.
- **Typed engine:** Added customer-safe snapshot, source, insight, suggestion, action, escalation, access, confidence, and policy contracts. Snapshot construction discards records outside the active business/profile tuple, excludes revoked documents as sources, uses one explicit reference time, and remains silent for expired, inactive, suspended, unavailable, completed, or unsupported states.
- **Shared deterministic experience:** The dashboard presents at most three explained insights with one primary recommendation. Appointments repeat only customer-visible preparation notes and state that external providers own availability/completion. Support can prefill one contextual question, and Profile explains optional communication settings without pressure.
- **Provider boundary:** Authenticated production routes use a fail-closed unavailable provider. The development-only demo receives deterministic fictional document and message assistance with explicit authorship, source, source-of-truth, confidence, regulated-refusal, and human-escalation wording. Suggested text never sends automatically.
- **Security:** Context remains limited to the active profile, published branding, customer-visible appointments, messages, documents, acknowledgements, and requests. CRM, Business Brain, raw Knowledge Center sources, internal notes, billing, prompts, orchestration, credentials, Storage paths, signed URLs, and other tenants remain excluded. The demo creates no Supabase or Auth client and remains unavailable in production.
- **Validation:** `npm run test:portal` passed 31/31 tests, including all 15 new Contextual Intelligence requirements. Lint and the production build passed. Browser interaction, console, responsive, keyboard, and screen-reader validation of the new controls remains Pending.
- **Status truth:** The deterministic engine and demo interactions are Implemented. Production generative document/message assistance, document-content access, translation, customer-visible knowledge publication, industry modules, monitored human takeover, and outcome instrumentation remain Planned or unavailable.
- **Certification:** The authoritative score remains **71/100**, certification **FAILED**, and Production Ready **NO**. The sprint did not resolve synthetic identity, behavioral tenant/direct-REST, private Storage, support lifecycle, abuse-control/monitoring, assistive-technology, or production-performance gates.
- **Database:** No schema change was required. Applied migrations and verification files were not modified or rerun, and no SQL was executed.

## Customer Portal V1 Operational Validation Hold — 2026-07-15

- **Program state:** Customer Portal development is complete and feature-frozen. Certification is on Operational Validation Hold.
- **Authoritative decision:** Score **71/100**, certification **FAILED**, Production Ready **NO**.
- **Required prerequisites:** Human-approved synthetic identities, an approved isolated operational test environment, and human-led execution of the documented authentication validation.
- **Boundary:** No further Customer Portal feature, redesign, contextual behavior, AI capability, module, route, or architecture work proceeds while the hold is active.
- **Database:** Applied migrations remain immutable. The earlier hardening-verification blocker remains resolved. No SQL was executed.
- **Record:** `docs/sprints/CUSTOMER_PORTAL_OPERATIONAL_VALIDATION_HOLD.md`.

## Business Workspace V1 certification audit — 2026-07-15

- **Scope:** Static repository and evidence audit only; no live environment, identity, schema, production deployment, or operational test was used.
- **Existing certification:** None found.
- **Provisional score:** **30/100**; **NOT CERTIFIED**; Production Ready **NO**.
- **Implemented foundation:** Dashboard command center, lead and CRM APIs, Knowledge Center, onboarding, Calendly, email/follow-up logic, team invitation, Checkout, Business Brain, audit, Morning Brief, Chief of Staff, public grounded chat, and orchestration foundations.
- **P0 blocker:** The interactive dashboard uses one shared password cookie and service-role data client rather than a verified owner/member identity, role, and server-derived tenant. Hard-coded or missing business filters mean the static RLS model is not the ordinary runtime authorization boundary.
- **Additional critical findings:** Unauthenticated follow-up processing can trigger service-role reads/writes and email; unauthenticated chat has no separate public Knowledge publication boundary; most AI executors prepare rather than execute actions; no Workspace-specific authorization/end-to-end, accessibility, performance, or operations certification exists.
- **Next target:** Approve a certification charter, then address the actor/role/tenant boundary as the first and only P0 remediation sprint. Any database change requires the mandatory live-inspection, migration, read-only-verification, approval, manual-execution, and recorded-verification workflow.
- **Record:** `docs/sprints/BUSINESS_WORKSPACE_V1_CERTIFICATION_AUDIT.md`.
- **Change boundary:** Audit documentation only. No application code, SQL, migration, database state, identity, credential, deployment, or runtime behavior changed.
