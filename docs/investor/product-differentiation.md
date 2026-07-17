# Product Differentiation

JOHAI emphasizes accountable AI work and owner decisions rather than a chatbot transcript or CRM metric wall. Differentiation remains a product thesis until validated commercially.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Durable identity and operating discipline

The [JOHAI North Star](../foundation/JOHAI_NORTH_STAR.md), [Product Promise](../foundation/PRODUCT_PROMISE.md), and [Company Values](../foundation/COMPANY_VALUES.md) align strategy, product behavior, and company conduct around less effort, justified confidence, human authority, strong data boundaries, and measurable business value. The [Brand Guidelines](../foundation/BRAND_GUIDELINES.md), [Voice and Tone](../foundation/VOICE_AND_TONE.md), [AI Employee Principles](../foundation/AI_EMPLOYEE_PRINCIPLES.md), and [Culture](../foundation/CULTURE.md) make that identity repeatable across products and teams.

Consistency can become a strategic advantage only when implementation, customer outcomes, reliability, and trust substantiate it. These adopted standards are not by themselves a moat, product-market fit, commercial traction, or proof of an AI Employee runtime.

## Contextual Intelligence™ thesis

[JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md) defines a product thesis beyond a generic chatbot: authorized business context, customer history, current workflow, timing, permissions, and business rules should reduce the questions and effort required to complete a task. AI should appear only where it creates measurable value and otherwise disappear into the product.

The defensible asset would not be a chat surface by itself. It would be a permissioned context system, evaluated interaction patterns, workflow-specific business rules, safe human takeover, and accumulated evidence that JOHAI saves clicks and typing while improving completion and satisfaction without cross-tenant or unsupported behavior.

This is an adopted architecture and design philosophy, not a commercial or implementation claim. Most smart interactions, customer-facing AI, contextual metrics, and industry-specific experiences remain **Planned** and require measured validation.

### Bounded Customer Portal V1 implementation

The current Customer Portal contextual work converts part of that thesis into a bounded typed contract: exact-tenant customer-visible snapshots, deterministic silence and suggestion rules, four internal support classes, and a provider interface that fails closed. The internal classes are Supported, Partially supported, Unsupported, and Prohibited; the customer presentation maps them to Supported, Limited, and Unavailable while preserving Prohibited as a distinct refusal path.

This is not a general customer AI launch. Production has no approved generation provider or customer-visible knowledge publication boundary. A future provider must reauthenticate and reconstruct the authorized context on the server rather than trust a browser snapshot. Context never grants permission, and the ordinary Portal remains usable when intelligence is unavailable.

The Harbor Dental contextual examples are deterministic fictional demo behavior only. They are useful for reviewability, product communication, and failure-state testing, but they are not production inference, customer usage, proprietary training data, provider performance, clinical capability, or commercial differentiation. Document assistance remains subordinate to the original fictional source; regulated interpretation is refused; suggestions never auto-send; and no appointment availability or human response is invented.

Potential differentiation must still be earned through representative customer-effort reduction, grounded-answer quality, safe abstention, tenant isolation, accessibility, operational reliability, verified human handoff, customer adoption, retention, and measurable business outcomes. The latest Customer Portal certification remains **71/100**, **FAILED**, and Production Ready **NO**; the remaining authentication, tenant/direct-REST, private Storage, accessibility, performance, abuse-control, monitoring, and support-lifecycle gates prevent a production or moat claim.

## Constitutional product discipline

The [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) makes the experience thesis reviewable through Ten Laws, ten product values, permanent design/UX/AI/language principles, and a mandatory stop/go decision framework. This can reduce inconsistency and prevent decorative AI, dashboard clutter, unsupported autonomy, and feature expansion without business value.

The Constitution is not itself a moat or a customer outcome. Differentiation must still be demonstrated through implementation quality, measurable effort reduction, trust, reliability, business results, customer adoption, retention, and repeatable delivery.

## Customer Portal — implemented foundation, validation pending

The portal extends JOHAI from an owner operating system into a separate business-branded customer experience without exposing the internal workspace. Its database foundation is Applied and Verified by explicit user confirmation, and the repository implements appointments, visible messaging, current shared documents, profile/preferences, and support through a dedicated tenant-scoped interface.

This is an engineering capability, not yet evidence of commercial differentiation. Production deployment, invitation provisioning, customer adoption, retention, measurable service outcomes, and end-to-end tenant/storage validation remain unproven.

## Customer Portal Pilot Demo — development-only evidence

`/portal/demo` provides a deterministic development-only walkthrough using the fictional Harbor Dental Studio business and fictional customer Sophie Martin. It reuses the shared Customer Portal dashboard, appointments, messages, documents, profile, support, shell, and repository contracts while substituting an in-memory repository that never contacts Supabase or another network service.

The demo can present the complete pilot, empty states, a load error, and one-shot message, download, and profile-session failures with retry behavior. Its 16 automated tests passed, as did lint and the production build. The application was also aligned with the reviewed contract in the Applied database hardening migration, and the latest certification re-audit removed the earlier hardening-verification blocker. These are repository-quality and presentation-readiness signals only: the fictional demo is not a deployed customer environment, behavioral RLS evidence, customer traction, retention, or production readiness. Approver identity, approval and execution dates, and raw database-evidence references remain Pending documentation details.
