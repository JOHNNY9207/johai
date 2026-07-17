# Risks and Mitigations

Key risks include AI accuracy, tenant isolation, integration failures, billing incompleteness, and absent traction evidence. Mitigations include bounded authority, approved knowledge, RLS review, idempotent jobs, observability, tests, and staged pilots.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal production and security gate

The Customer Portal database foundation is Applied and Verified by explicit user confirmation, and the repository application is implemented. Detailed live/default privilege evidence, helper ownership/configuration, raw verifier output, query findings, and execution dates were not supplied. Direct authenticated REST access remains governed by deployed privileges rather than the UI's safe-column list.

The application mitigates tenant risk with a dedicated PKCE session, RLS-visible active-profile selection, explicit profile/business filters, safe-column response validation, customer-visible record filters, and bearer-authorized short-lived downloads that require an allowlisted bucket and canonical path. Production readiness still requires direct-REST privilege review, cross-tenant denial and storage tests, invitation provisioning, rate limits, session/recovery testing, revocation-race coverage, provider synchronization decisions, retention, and stronger audit-timestamp integrity.

### Production-validation update

Pre-hardening live read-only inspection confirmed unnecessary anonymous privilege on four portal tables and broad authenticated access outside the UI contract. All eight portal tables were empty, so RLS success with real tenants, mixed-role identities, revoked documents, and signed downloads remains unproven. Post-hardening privilege state is Pending verification. The local document bucket allowlist is absent and downloads fail closed; production configuration is unknown.

Mitigation is now an Applied database/security change with verification Pending. The migration must not be rerun. The corrected read-only verifier must complete successfully before any fixture or production behavior test. The applied design denies mixed customer/workspace principals globally, requiring separate Auth identities for dual-role people. The 16-test local Portal suite, canonical build, and shared-route browser QA now pass, but they do not close unconfirmed deployed ACL evidence, operational identity management, absent provisioning/redemption, missing rate limits, credential-backed integration tests, production performance, monitoring, or rollback evidence.

### Final certification disposition

Customer Portal V1 scored **69/100**, certification **FAILED**, and Production Ready is **NO**. The key remaining risk is assurance, not a claim that a cross-tenant leak has been observed: mandatory hardening verification, representative identities, tenant/Storage attack tests, full auth lifecycle, assistive-technology testing, and production operations have not completed.

A real WCAG contrast defect found during certification was corrected and retested. It is closed for the sampled shared routes; complete keyboard and real screen-reader evidence remain open. The Applied migration remained immutable and no SQL was executed.
