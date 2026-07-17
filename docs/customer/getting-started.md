# Getting Started with JOHAI

JOHAI helps a business answer customer questions, capture leads, support booking, organize follow-up, and summarize what needs the owner's attention.

## 1. Create an account

Use the sign-up page to create a Supabase-authenticated account, confirm the authentication flow, and continue to the welcome experience. Dashboard administration currently also uses a configured dashboard access gate.

## 2. Complete onboarding

Open Dashboard Onboarding and add the company profile, services, communication preferences, AI behavior, restrictions, and booking information. The introductory `/start` pages explain the journey; the persisted configuration is managed in Dashboard Onboarding.

## 3. Add business knowledge

Use the Knowledge Center to add approved text or upload supported files. JOHAI processes this material so it can use business-specific services, FAQs, policies, and procedures. Production-grade semantic retrieval is still being completed.

Knowledge Center V2 fully extracts PDF, DOCX, XLSX, CSV, TXT, and manual sources. Review processing status and extracted text before relying on a source. Search currently uses a clearly labeled full-text fallback; vector semantic ranking remains partial.

When a trusted document becomes outdated, replace its version instead of deleting it first. JOHAI keeps the current Ready version in use until the replacement succeeds. Review and approve any replacement marked Needs review before it becomes active.

## 4. Capture leads

The website chat collects customer needs and contact information. Qualified lead information is saved to the CRM. Owners can review lead status, conversation history, notes, follow-up state, and bookings.

## 5. Connect booking

Add Calendly configuration in Dashboard Settings. JOHAI can expose the public booking link, check availability, and use verified Calendly webhook events to create or update lead booking information.

## 6. Understand follow-up

JOHAI can send owner and prospect emails and process scheduled follow-up candidates. Delivery depends on valid email configuration. Failed delivery or a decision outside JOHAI's authority still requires a person.

## 7. Use the Executive Dashboard

The dashboard summarizes the Executive Brief, Decision Queue, Business Pulse, JOHAI at Work, CRM movement, Business Brain, and Outlook. Recorded facts, derived interpretations, estimates, recommendations, and missing information are labeled separately.

## Human approval

JOHAI should not approve custom financial terms, resolve compliance questions, override business policy, or make unsupported commitments. Owners remain responsible for high-impact decisions and for maintaining accurate business knowledge.

## Constitutional customer promise

JOHAI should make the represented business feel prepared, respectful, and easy to work with. The business remains the hero; JOHAI should not force customers to learn AI terminology, navigate unnecessary screens, repeat known information, or wonder whether a suggestion actually happened.

Every future customer interaction is governed by the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) and [Customer Experience Principles](../constitution/CUSTOMER_EXPERIENCE_PRINCIPLES.md). These are design commitments, not claims that every described workflow is currently available.

## What JOHAI promises customers

The [Product Promise](../foundation/PRODUCT_PROMISE.md) commits JOHAI to speed, trust, context, transparency, respect, reliability, consistency, and business value without weakening consent, privacy, accessibility, or human control. The [Voice and Tone](../foundation/VOICE_AND_TONE.md) standard requires simple, professional, calm, confident, human, and respectful language that is never arrogant, robotic, or manipulative.

These are permanent experience standards. Current availability, limitations, and production readiness still come from this guide and the [Product Fact Sheet](../PRODUCT_FACT_SHEET.md); a promise or brand guideline does not make a Planned capability available.

## Contextual Intelligence™ direction

JOHAI's permanent design rule is: **The AI never asks for information it can already infer from authorized context.** The goal is to reduce repeated questions and unnecessary steps while remaining calm, optional, honest about uncertainty, and easy to hand to a person.

This is a design direction, not a claim that every smart interaction exists. The current website chat remains available under its documented behavior. Smart documents, proactive appointment help, contextual support, payments, orders, reservations, invoices, and broader industry examples remain **Planned** unless the Product Fact Sheet says otherwise. See [Customer Experience Philosophy](../philosophy/CUSTOMER_EXPERIENCE_PHILOSOPHY.md).

## Customer Portal

The repository includes a separate Customer Portal for customers whose access has already been provisioned by a business. The database foundation is Applied and Verified by explicit user confirmation. Customers sign in at `/portal/login`, can request password recovery, and see only the active profile and business records allowed by RLS.

Available portal areas are overview, appointments, customer-visible messages, current shared documents and acknowledgements, profile/preferences, and support requests. A customer linked to more than one business explicitly chooses the portal. The portal never opens the JOHAI Business Workspace or exposes CRM internals, Business Brain, Knowledge Center, AI orchestration, internal notes, billing, or the Executive Dashboard.

There is no public signup or invitation-redemption flow in V1. Production availability depends on the business provisioning the customer, configuring Supabase authentication, and configuring approved private document storage.

## Industry-adapted Customer Portal

JOHAI plans to adapt the same Customer Portal for restaurants, dental practices, beauty businesses, real-estate agencies, legal firms, and home-services companies. This is one shared Portal with the same sign-in, tenant protection, profile, messages, documents, appointments, and support foundation. It is not six separate products.

Today, a provisioned business can already present its display name, primary color, booking link, support email and phone, industry-appropriate appointment service names, customer-visible notes, messages, and shared files. The page names and navigation remain generic. Restaurant **Reservations**, dental or home-service **Visits**, beauty **Bookings**, real-estate **Viewings**, legal **Consultations**, optional modules, richer branding, and industry-specific support categories are **Planned**, not currently available variants.

The current Portal can show a message labeled **AI-assisted response** when a trusted system has already saved that customer-visible message. It does not currently create AI answers, deliver notifications, operate realtime chat, or promise that a support request has been assigned. Planned industry AI must use only approved customer-visible information and must hand medical, legal, financial, safety, emergency, privacy, or uncertain questions to an appropriate person.

Industry adaptation will not expose business internals or add unsupported transactions. Ordering, payments, billing administration, e-signatures, clinical records, legal case management, property transactions, live technician tracking, SMS/WhatsApp delivery, and other specialized systems remain unavailable unless a future reviewed module is explicitly implemented and validated. If optional configuration is missing or invalid, the Portal will use neutral wording and keep optional modules off rather than guessing.

## Customer Portal pilot demo

The development-only pilot lets a reviewer explore the customer journey without a Supabase account or production data. From the JOHAI project root, run `npm run dev`, then open `http://localhost:3000/portal/demo`.

Confirm the **Demo environment** and **Fictional data** indicators before continuing. The demo uses the entirely fictional Harbor Dental Studio business and Sophie Martin customer. It runs from an in-memory repository with no Supabase client, Auth session, service-role key, external or production-data request, production tenant, or database write. Downloading a fictional document uses one guarded same-origin generated attachment request and no storage service.

Use the scenario controls to review behavior:

- **Complete pilot** shows the complete fictional journey.
- **Empty states** shows honest no-data experiences.
- **Load error** shows safe repository failure and retry states.
- **Fail next message** fails one message submission.
- **Fail next download** fails one document download.
- **Expire next save** fails one profile save with a fictional session error.
- **Reset fictional data** restores the original fixture.

The pilot covers overview, appointments, messages, documents, profile, and support. It is unavailable in production, does not weaken authentication or RLS, and is not evidence of production readiness. See [Customer Portal Pilot Demo Walkthrough](customer-portal-walkthrough.md) for the complete presentation and recovery procedure.

## Current production status

No live portal customer, invitation, appointment, message, document, acknowledgement, or support request existed in the recorded pre-hardening inspection. The production security-hardening migration is **Applied** and must not be modified or rerun. The latest certification re-audit removed the earlier hardening-verification blocker after the corrected read-only verifier was reviewed and approved. Approver identity, approval/execution dates, and raw query-by-query evidence references remain `Pending` documentation details.

`/portal` is the canonical production dashboard. There is no `/portal/register` or `/portal/dashboard` route. The applied global identity-separation design requires a person who also owns or belongs to a JOHAI business to use a separate Auth identity for portal access. Production provisioning, representative tenant fixtures, end-to-end authentication, Storage, signed-download, abuse-control, accessibility, performance, monitoring, and browser evidence remain incomplete, so customers should not be directed to production access from the pilot record.

## Authentication validation status

The July 14 real-authentication review did not use a production customer. No approved synthetic test identity or credential was available, so credential-backed login, logout, refresh, recovery, expiry, inactive-account, multiple-business, multi-tab, and Business Workspace isolation scenarios remain Blocked rather than passed or failed.

The safe missing/invalid recovery state and the fictional demo's no-Supabase boundary were checked without credentials. These limited checks do not establish production authentication readiness. Customers should use only credentials issued through the approved business provisioning process and should never send JOHAI a password, recovery link, access token, or invitation token in a support message.

A secure synthetic identity plan has been prepared for future operator testing, but no test identity, credential, profile, invitation, or tenant has been created. It uses reserved `.test` aliases in an approved non-production environment and cannot be used as customer access. Customer Portal authentication remains not production-ready until the complete behavioral matrix and cleanup are approved and recorded.

## Final certification status

The latest Customer Portal V1 certification re-audit records **71/100**, certification **FAILED**, and Production Ready **NO**. The shared interface passed local tests, build, desktop/tablet/mobile layout checks, semantic checks, and corrected contrast checks. Those results do not authorize customer access.

Customers must not be enrolled from this certification record. The approved synthetic authentication run, cross-tenant denial, private document delivery, support operations, full accessibility evidence, production performance, abuse controls, and operational monitoring must complete before certification is repeated. No SQL was executed during certification.

## Customer Portal Contextual Intelligence V1

The Customer Portal now includes a bounded contextual layer for the existing overview, appointments, messages, documents, profile, and support pages. It uses the active portal profile and only records already visible to that customer. It does not expose CRM details, internal notes, Business Brain, raw Knowledge Center files, billing, or another customer or business.

In the local fictional demo, contextual controls can explain demo documents, prepare unsent message drafts, reveal appointment preparation, explain profile guidance, and prefill one support question. These controls never send, acknowledge, book, cancel, reschedule, or submit automatically. The original portal record remains the source of truth.

Production generative assistance is not enabled. Until a separately approved server-side provider and customer-visible publication boundary exist, production document and message generation remains unavailable. Customer Portal certification remains **71/100**, **FAILED**, and **Production Ready: NO**.
