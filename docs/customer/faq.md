# Customer FAQ

**Does JOHAI replace the owner?** No. It handles bounded work and surfaces decisions. **Where does it learn?** From approved business settings, knowledge, and recorded activity. **Are opportunity values revenue?** No; estimates are labeled.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal

**Is the Customer Portal available?** The application is implemented in the repository and its database foundation is Applied and Verified by explicit user confirmation, but the 2026-07-14 final certification **FAILED** with Production Ready **NO**. Production or commercial availability is not approved.

**How do customers get access?** V1 has no public signup or invitation-redemption flow. An authorized process must provision the customer's identity and active profile for the correct business. A customer linked to more than one business can choose only among profiles returned through RLS; the browser cannot create or change business membership.

**What will a portal customer see?** Only that customer's explicitly scoped records for one business, such as appointments, customer-visible messages, shared documents, acknowledgements, requests, and personal preferences. Business workspace and internal JOHAI data remain excluded.

**How are shared documents protected?** The customer must be signed in and able to read current document metadata through RLS. Downloads also require an approved bucket and canonical business/profile path before JOHAI returns a short-lived link. A business may revoke a document, after which it should no longer appear or download.

**Is production validation complete?** No. The current certification score is 71/100. The security-hardening migration is Applied and the earlier hardening-verification blocker has been resolved, but no approved credential-backed authentication, behavioral cross-tenant/direct-REST denial, private-Storage, full accessibility, or production-performance evidence has been recorded.

**Can the same login be both a workspace user and portal customer?** The Applied production rule says no: an Auth identity used for the Customer Portal must not be a business owner or member anywhere in JOHAI. A person needing both roles must use separate Auth identities. Credential-backed behavioral validation remains pending even though the earlier schema-verification blocker is resolved.

**Have synthetic test customers been created?** No. A secure two-tenant plan exists, but all identities, credentials, profiles, invitations, and tenant records remain unprovisioned. The corrected hardening verifier must succeed and a human must separately approve the isolated test environment and cleanup before provisioning. This plan does not make production authentication ready.

**Which portal routes exist?** `/portal` is the dashboard. Login, password recovery, appointments, messages, documents, profile, and support routes exist. Public registration, `/portal/dashboard`, and a dedicated auth callback route do not.

## Contextual Intelligence

**Is this a chatbot?** No. Customer Portal Contextual Intelligence V1 is a small assistance layer inside the existing pages. It ranks relevant visible records, prepares drafts, and remains silent when it cannot help safely.

**What information can it use?** Only the active customer's portal profile and exact-business customer-visible appointments, messages, documents, acknowledgements, support requests, and published branding needed for that page. Context does not grant permission and cannot widen RLS access.

**Does a generated explanation replace my document?** No. The original customer-visible document or record is always the source of truth. Demo guidance is labelled as deterministic fictional output and shows its source and support level.

**Can it send a reply, book an appointment, or contact a person for me?** No. Suggestions only fill an unsent draft or request form. You must confirm every send or submission. External booking links confirm availability outside the portal. A human-help choice records intent only and does not prove that someone was notified or assigned.

**Why is some help unavailable?** Production document content and a published customer-visible knowledge source do not yet exist in the approved Portal contract. Production generative help therefore fails closed instead of guessing or using internal systems.
