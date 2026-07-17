# Architecture

JOHAI uses Next.js App Router, server route handlers, domain services in `app/lib`, Supabase persistence, and client presentation components. The dashboard page loads source data server-side and passes typed models to Dashboard V3.

## Product-design authority hierarchy

Technical architecture implements, but cannot silently redefine, the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md). The authority order for product decisions is Constitution → product values and experience principles → adopted strategic and brand foundation → Contextual Intelligence and platform architecture → domain/feature contracts → components and runtime implementation.

The strategic and brand foundation consists of the [North Star](../foundation/JOHAI_NORTH_STAR.md), [Manifesto](../foundation/JOHAI_MANIFESTO.md), [Mission and Vision](../foundation/MISSION_AND_VISION.md), [Product Promise](../foundation/PRODUCT_PROMISE.md), [Company Values](../foundation/COMPANY_VALUES.md), [Brand Guidelines](../foundation/BRAND_GUIDELINES.md), [Voice and Tone](../foundation/VOICE_AND_TONE.md), [AI Employee Principles](../foundation/AI_EMPLOYEE_PRINCIPLES.md), [Culture](../foundation/CULTURE.md), and [Long-Term Roadmap](../foundation/LONG_TERM_ROADMAP.md). These adopted documents guide architecture beneath the Constitution; they have no runtime or capability effect and cannot weaken a technical boundary or change evidence-based status.

If a technical proposal conflicts with a Constitutional law, privacy, security, accessibility, tenant isolation, truthful status, or human authority, implementation stops. The [Decision Framework](../constitution/DECISION_FRAMEWORK.md) must be completed before a new feature, UI change, AI behavior, workflow, automation, or interaction is implemented.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Cross-layer Contextual Intelligence™

Contextual Intelligence is a platform-wide design constraint. It does not create a seventh platform layer and does not let the AI Layer bypass the Public Website, Business Workspace, Customer Portal, JOHAI Super Admin, or Developer Platform boundary. The surface that owns the workflow must resolve the authenticated actor and tenant, publish a minimized customer-visible context envelope, enforce capabilities, render consent and uncertainty, and execute any approved operation through its deterministic server contract.

Planned shared architecture consists of a typed context envelope, source/provenance adapters, freshness and revocation checks, an allowlisted interaction registry, silence and escalation policies, output/action validation, and sanitized outcome metrics. It must fail closed when identity, tenant, permission, source freshness, or action authority is uncertain.

The authoritative design is [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md). No shared resolver or smart-interaction runtime was added by the philosophy sprint.

## Customer Portal architecture status

The portal is assigned to the Customer Portal platform layer. Its database foundation is Applied and Verified by explicit user confirmation. The repository implements a separate `/portal/*` App Router tree, dedicated PKCE Supabase authentication, active-profile tenant selection, a validated safe-column data layer, a responsive portal shell, and feature components for overview, appointments, messages, documents, profile, and support.

The browser uses the anon-key client so RLS remains authoritative. The only service-role portal operation is the server-side signed-download step, reached only after bearer validation, an RLS-visible non-revoked metadata lookup, bucket allowlisting, and canonical business/profile path validation. Portal code does not import or surface dashboard, CRM-internal, Knowledge Center, Business Brain, AI orchestration, billing, or Executive Dashboard data.
