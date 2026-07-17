# Product Overview

The product includes a marketing site, AI chat, lead CRM, knowledge center, Business Brain, onboarding, Calendly, email follow-up, billing checkout, an Executive Dashboard, and a separate Customer Portal repository implementation. See the Product Fact Sheet for implementation and production-readiness status.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Cross-product experience philosophy

The [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) is the governing product contract. [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md) applies its laws to future customer-facing work across every platform layer. A feature may use only context authorized for the active user, tenant, and task; it must avoid asking for known information, minimize interruption, distinguish suggestions from completed work, disclose uncertainty when useful, and provide a truthful human-escalation path.

The existing public chat, business knowledge, appointments, conversations, and Customer Portal provide partial building blocks. The unified context resolver, smart interaction patterns, proactive assistance, contextual measurement, and most industry examples remain **Planned**. The philosophy changes design governance only in this sprint; it does not add product behavior.

The complete experience should present one clear purpose and primary action at a time, minimize cognitive load, avoid decorative AI and unnecessary popups, keep evidence and uncertainty visible, and make the represented business—not JOHAI—the source of customer value.

## Customer Portal — implemented repository product layer

The Customer Portal is a business-branded experience for provisioned, authenticated end customers. It is separate from the Business Workspace and JOHAI administration. Its database foundation is Applied and Verified by explicit user confirmation, and the repository implements login, password recovery, tenant selection, overview, appointments, customer-visible messages, shared documents, profile/preferences, and support under `/portal/*`.

Public signup and invitation redemption are not implemented, and production deployment is not confirmed. Portal customers never receive CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, the Executive Dashboard, or another tenant's data.
