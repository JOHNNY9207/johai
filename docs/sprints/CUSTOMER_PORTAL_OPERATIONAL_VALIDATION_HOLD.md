# Customer Portal V1 Operational Validation Hold

- **Platform layer:** Customer Portal
- **Status date:** 2026-07-15
- **Program status:** Operational Validation Hold
- **Development status:** Complete and feature-frozen
- **Certification status:** FAILED
- **Last recomputed certification score:** 71/100
- **Production Ready:** NO

## Decision

Customer Portal V1 development is complete for the current scope. No new customer-facing feature, contextual behavior, AI capability, route, module, redesign, or architecture change is authorized while this hold is active.

The hold is operational rather than technical-development work. The repository implementation and its local validation evidence remain preserved, but certification cannot continue without representative identities and a controlled environment.

## Required prerequisites

All three prerequisites must exist before Customer Portal certification resumes:

1. human-approved synthetic Customer Portal identities;
2. an approved isolated operational test environment with controlled mail, credentials, evidence, cleanup, and revocation; and
3. human-led execution of the documented authentication validation procedures.

The prepared [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md), and [Test Data Matrix](../testing/TEST_DATA_MATRIX.md) remain instructions only. They have not created identities, credentials, fixtures, or test results.

## Hold boundary

Until the prerequisites exist:

- do not continue Customer Portal development;
- do not invent, automatically create, or use production customer identities;
- do not claim credential-backed authentication, tenant isolation, private Storage, signed-download, support-lifecycle, accessibility, performance, monitoring, or operational certification;
- do not modify or rerun applied migrations; and
- do not mark Customer Portal V1 as certified or production-ready.

Defect correction may be considered only when an approved operational validation run proves a defect and the correction is separately authorized. It must not expand product scope.

## Database status

The Customer Portal database migrations remain applied and immutable. The earlier production-hardening verification blocker is resolved in the current certification state. This hold does not request a database change and does not authorize SQL execution.

## Resume condition

Certification may resume only after the human operator records the approved environment, fictional identities, credential channel, test window, evidence policy, cleanup owner, and explicit GO decision. The first resumed work is operational authentication validation, not feature development.

No application code, SQL, migration, database state, identity, credential, or runtime behavior was changed by this status record.
