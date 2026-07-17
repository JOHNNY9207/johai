# Future Roadmap

Priority work includes tenant authorization, subscription persistence, production semantic retrieval, background jobs, tests, observability, team membership, and customer validation. Roadmap entries are planned, not promised delivery dates.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Constitutional roadmap gate

A roadmap item is not authorized merely because it appears here. Before implementation it must pass the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) and [Decision Framework](../constitution/DECISION_FRAMEWORK.md), identify its owning platform layer, preserve security/privacy/accessibility and human authority, define measurable effort and business value, and retain truthful status.

## Strategic horizon

The [JOHAI North Star](../foundation/JOHAI_NORTH_STAR.md) and [Long-Term Roadmap](../foundation/LONG_TERM_ROADMAP.md) describe the durable direction and staged 1-, 3-, 5-, and 10-year ambition for the platform, AI, marketplace, developers, businesses, customers, and responsible international expansion. Those horizons are decision context, not delivery dates, forecasts, financing assumptions, or proof that future capabilities exist.

Roadmap work must also preserve the [Mission and Vision](../foundation/MISSION_AND_VISION.md), [Product Promise](../foundation/PRODUCT_PROMISE.md), and [Company Values](../foundation/COMPANY_VALUES.md). A milestone that conflicts with them or with the Constitution returns to review.

## Contextual Intelligence™ sequence

Contextual Intelligence is a staged architecture roadmap, not a delivery promise:

1. **Governance:** adopt the permanent rule, behavior guidelines, interaction patterns, permission boundaries, silence rules, and metrics. This documentation phase is complete.
2. **Context contracts:** inventory customer-visible sources, define typed context envelopes, freshness and provenance rules, deterministic fallbacks, and zero cross-tenant leakage tests.
3. **Assistive suggestions:** introduce read-only, reversible, user-confirmed suggestions inside existing workflows before any autonomous action.
4. **Smart domains:** validate documents, messages, appointments, profile, and support one pattern at a time; payments, orders, reservations, and invoices require their own implemented product and security contracts.
5. **Human operations:** prove notification, assignment, takeover, response targets, audit evidence, abuse controls, and incident recovery before promising escalation.
6. **Industry adaptation:** release allowlisted industry configurations only after shared-core parity, compliance review, accessibility, localization, tenant-isolation, and rollback evidence.
7. **Outcome certification:** measure effort saved, completion, suggestion quality, escalation quality, satisfaction, and permission failures before declaring the philosophy production-effective.

Each phase must preserve the [Customer Experience Philosophy](../philosophy/CUSTOMER_EXPERIENCE_PHILOSOPHY.md) and may ship only after the normal implementation, security, testing, and documentation gates pass.

## Customer Portal sequence

The Customer Portal database foundation is Applied and Verified by explicit user confirmation, and the repository implementation now covers authentication, dashboard, appointments, messages, documents, profile, support, responsive behavior, accessibility, and loading/empty/error states.

Next work is production provisioning and validation: add a reviewed invitation-redemption flow, rate limits, production end-to-end authentication and cross-tenant tests, direct-REST privilege checks, document revocation-race coverage, storage-policy and signed-download tests, provider synchronization where justified, monitoring, retention controls, and customer validation. No new database change may bypass the mandatory migration workflow.
