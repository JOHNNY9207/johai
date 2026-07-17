# Technical Moat

Knowledge Center V2 improves the potential business-memory moat with maintained document extraction, traceable processing, business-scoped citations, grounded chat evidence, and replaceable embedding architecture. Copy-on-write source replacement preserves the trusted version during processing and exposes source evolution for review. Guarded attempt tokens, stable request replay, stale-result rejection, bounded retries, and tested failure recovery improve operational trust. The current queue remains synchronous, cross-instance version/chunk transactions are not yet database-enforced, and proprietary vector relevance or accumulated outcome data are not proven defensibility.

Potential defensibility comes from business-specific memory, cross-workflow context, action evidence, and executive interpretation. Production semantic retrieval and accumulated proprietary outcome data are not yet complete.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Contextual Intelligence™ as a potential moat

The [Contextual Intelligence philosophy](../philosophy/CONTEXTUAL_INTELLIGENCE.md) turns business memory into a product contract: infer only from authorized, fresh, provenance-aware context; intervene only when useful; constrain every suggestion by tenant, customer, workflow, and business rules; and measure effort reduction and successful outcomes.

Potential defensibility comes from the combination of typed context contracts, customer-visible publication boundaries, business-specific rules, workflow timing, permission enforcement, safe escalation, and longitudinal outcome evidence. The philosophy itself is not proprietary traction. JOHAI must still implement the planned resolver and interaction patterns, prove safety and tenant isolation, and accumulate validated customer outcomes before treating Contextual Intelligence as a demonstrated moat.

The bounded Customer Portal V1 work adds reviewable building blocks: an exact business/profile snapshot contract, customer-visible source allowlists, deterministic silence and suggestion policies, and an unavailable-by-default provider boundary. Its internal support model preserves Supported, Partially supported, Unsupported, and Prohibited; the simpler public Supported/Limited/Unavailable labels do not erase the Prohibited refusal branch. These contracts can improve engineering consistency, but code structure is not defensibility by itself.

Context never grants permission. Current client-side filtering is defense in depth over already customer-visible records; RLS and deterministic server controls remain authoritative. Any future production provider must reauthenticate, derive and revalidate the exact tenant/profile and records server-side, enforce source/capability/freshness/revocation rules, validate output, and operate with rate limits, monitoring, privacy-safe evidence, and a verified recovery path. No approved production provider or published customer-visible knowledge source exists today, so production generation remains fail-closed.

The deterministic Harbor Dental behavior is explicitly demo-only. Its fictional fixture, fixed outputs, and reviewed relation map are not proprietary customer data, model quality, production safety, industry validation, or accumulated learning. They cannot substantiate a technical moat or increase certification by themselves.

The [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) governs how that architecture is designed and evaluated. It may improve coherence, trust, and decision quality, but written principles are not technical defensibility without enforceable contracts, tests, operational evidence, and accumulated customer outcomes.

## Integrity hardening status

A reviewable but unapplied database proposal covers conflict-first uniqueness and service-role-only atomic activation/chunk replacement. It is not represented as deployed until approved, applied, verified, and adopted by application callers.

The Customer Portal adds an applied, user-confirmed verified tenant-isolation foundation and a repository implementation for a secure customer-interaction layer while keeping internal intelligence private. The architecture combines a separate customer identity, profile/business RLS, explicit tenant selection, safe-column access, and constrained short-lived private document delivery.

This does not yet establish defensibility. Detailed verifier evidence, production deployment, invitation provisioning, end-to-end multi-tenant/storage tests, customer usage, proprietary interaction history, retention, and measurable outcomes remain absent or unconfirmed.

## Customer Portal production-security evidence

The least-privilege and identity-separation migration is Applied, immutable, and must not be rerun. The latest certification re-audit removed the earlier hardening-verification blocker, while raw evidence references remain a documentation gap. Pre-migration inspection found broader anonymous/authenticated API privileges than the UI requires, while all eight portal tables were empty and no customer behavior could be tested. The applied design's global separation between customer and workspace identities reduces confused-deputy risk but adds operational friction for dual-role people, who need distinct Auth identities.

Technical defensibility cannot be claimed until reproducible cross-tenant, direct-REST, storage, session, and route evidence is recorded with representative fixtures and tied to monitored customer outcomes.

## Final certification evidence

The latest 2026-07-14 Customer Portal V1 certification re-audit scored **71/100**, returned **FAILED**, and set Production Ready **NO**. Local lint, 16 Portal tests, the canonical 43-route build, shared-route responsive checks, corrected contrast, and browser-console checks passed. The result improves reviewability, but it does not establish production behavioral evidence or a moat.

Approved credential-backed identities, tenant/direct-REST and private-Storage attack evidence, production performance, abuse controls, monitoring, and customer outcomes remain missing. The earlier hardening-verification blocker is resolved. No SQL was executed during certification.

Contextual Intelligence adds further evidence requirements rather than removing these blockers: server reauthorization, approved source publication and revocation, cross-tenant and forbidden-source tests, provider/output-validation failure handling, accessibility of generated states, truthful escalation, rate limits, monitoring, incident recovery, and measured customer effort. Until those are recorded, the authoritative result remains **71/100**, **FAILED**, Production Ready **NO**, and Contextual Intelligence remains a potential—not demonstrated—moat.
