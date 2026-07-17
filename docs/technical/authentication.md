# Authentication

Customer-facing auth uses Supabase browser sessions. Dashboard administration uses a configured shared-password cookie. Unifying these systems with organization membership is a production requirement.

## Business Workspace certification finding — 2026-07-15

The shared browser client under `johai-auth-session` provides account-session behavior for `/auth/*` and the guarded `/start/*` previews. It does not authorize `/dashboard/*`. Dashboard pages and protected dashboard APIs accept the separate `johai_dashboard_auth` shared-password cookie, which contains no user, business, membership, or role identity. No rendered dashboard logout path was found.

This split is the P0 Business Workspace certification blocker. Production certification requires one server-verifiable owner/member identity, explicit role and active-business resolution, protected logout/recovery/redirect behavior, and credential-backed lifecycle evidence. See [Business Workspace V1 Certification Audit](../sprints/BUSINESS_WORKSPACE_V1_CERTIFICATION_AUDIT.md). The provisional score is **30/100**, status **NOT CERTIFIED**, and Production Ready **NO**.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal identity and session

Portal customers use Supabase Auth but are not business members. The applied and user-confirmed verified Customer Portal V1 foundation schema links `auth.users` to active customer profiles and businesses; the latest certification review removed the earlier security-hardening verification blocker. Direct browser creation of identity links is forbidden; V1 has no public signup or invitation-redemption endpoint, so customers must already be provisioned through a trusted server or operational process.

`customer-portal-auth-client.ts` retrieves a dedicated browser client with PKCE, automatic token refresh, redirect-fragment/code detection, persistent session storage, and the separate `johai-customer-portal-session` key. `AppProviders` does not mount the workspace `AuthProvider` on `/portal/*`, preventing portal credentials from satisfying workspace-only client guards. Login accepts email/password and reset-password sends a recovery redirect back to `/portal/reset-password`. Redirect targets are restricted to protected local portal paths, and password updates require a recent `PASSWORD_RECOVERY` event marker bound to the same authenticated user.

Protected portal routes require an authenticated session and at least one active `customer_profiles` row returned through RLS. A customer with multiple profiles explicitly selects one; the profile ID is remembered in `localStorage` under the authenticated user ID but is never accepted as authority without the RLS-visible profile/business lookup. Logout clears that preference and the local Supabase session.

Production gaps include invitation provisioning, rate limiting, device/session management, production recovery-email validation, XSS/session-storage hardening, and end-to-end authentication and cross-tenant tests.

## Browser auth client lifecycle

`supabase-browser-auth-client.ts` owns a browser-global registry keyed by the persisted auth storage key. Each active surface retrieves its client through this registry, so React render replay, provider remounts, and Fast Refresh reuse the existing GoTrue client instead of adding another auto-refresh owner, visibility listener, or BroadcastChannel for the same session. A repeated lookup with different project or flow configuration for an occupied key throws rather than merging incompatible clients.

The Business Workspace client remains on `johai-auth-session` with the implicit flow. The Customer Portal client remains on `johai-customer-portal-session` with PKCE. The two clients are intentionally separate objects and their sessions are never merged. Server-only service-role and bearer-validation clients remain non-persistent per-request clients and do not participate in this browser registry.

Provider effects still call `getSession`, subscribe to `onAuthStateChange`, and unsubscribe their application listener on unmount. Portal logout still uses local scope, so it clears only the portal session. Browser validation confirmed one warning-free client lifecycle for unauthenticated portal and workspace routes; credential-backed refresh, logout, recovery, expiry, and multi-tab tests remain Pending.

## Production identity gate — database blocker resolved; behavioral validation Pending

The Applied security-hardening migration enforces global role separation: an Auth user linked to any active portal customer profile must not be a `businesses.owner_user_id` or a `business_members.user_id` for any JOHAI business. Mixed principals are denied rather than scoped per business. The tradeoff is intentional: a person who needs both the Business Workspace and Customer Portal must use distinct Supabase Auth identities.

The latest certification review removed the earlier production-hardening verification blocker. The migration is immutable Applied history and must not be rerun. Detailed raw evidence references and behavioral testing with provisioned multi-tenant identities remain incomplete; this operator package does not alter the database lifecycle.

The route audit also confirms that `/portal/register` and a dedicated callback route do not exist. Password recovery returns to `/portal/reset-password`; email/password sign-in requires no callback. Protected routes are client-gated after session initialization rather than server/middleware-gated. These facts must remain explicit in production runbooks and tests.

## Pilot demo authentication boundary

The fictional pilot at `/portal/demo/*` deliberately does not mount `PortalAuthProvider`, create a Supabase client, read a persisted portal session, or call production APIs. The neutral `app/portal/layout.tsx` is only a shared metadata boundary. Production customer pages mount `PortalAuthProvider` and `PortalProvider` inside the `(customer)` route group, while login and password-recovery pages mount their own portal-auth provider. `AppProviders` continues to exclude the Business Workspace `AuthProvider` from every `/portal/*` path.

The demo uses a separate in-memory provider with fixed fictional identity and tenant data. Its server guard explicitly allows only `NODE_ENV=development` or `NODE_ENV=test`; production, staging, missing, and unexpected values return HTTP 404. The generated attachment endpoint applies the same guard. This mock boundary is a presentation and failure-state tool only; it is not an authentication bypass, provisioning mechanism, RLS test, or production fallback.

## Real authentication validation — blocked, 2026-07-14

No approved Customer Portal test identity, credential reference, controlled recovery mailbox, or authenticated browser session was available to the validation. Existing test clients and the fictional demo are not Supabase Auth identities. Secret values were not inspected or documented, no production customer was used, and the result does not assert that the current live database is empty.

The required approved synthetic set is `PORTAL-ACTIVE-SINGLE`, `PORTAL-SUSPENDED`, `PORTAL-INVITED-INACTIVE`, `PORTAL-ACTIVE-MULTI`, and a distinct `WORKSPACE-ONLY` identity. Their exact profile and role requirements are recorded in [Customer Portal Real Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md). Emails, UUIDs, passwords, links, and tokens must remain outside source control and documentation.

Credential-free browser evidence confirmed that an unauthenticated visit to `/portal` redirects to `/portal/login`, missing or invalid recovery context fails safely at `/portal/reset-password`, and `/portal/demo` creates no Supabase client. These checks do not prove login, logout sequencing, active-session refresh, token refresh, server-side expiry, successful recovery, inactive-profile denial, multiple-profile behavior, multi-tab propagation, or behavioral workspace isolation.

Structural isolation remains intact: portal and workspace use distinct storage keys and distinct singleton clients. Behavioral isolation must sign the portal identity into the Customer Portal and the separate workspace-only identity into `/auth/login` within the same browser context; the dashboard password cookie is a different mechanism and is not a substitute. Token expiry requires controlled Auth-session revocation, and recovery requires an operator-controlled mailbox. The latest certification review removed the earlier hardening-verification blocker; the Applied migration must not be rerun. Separate fixture approval still precedes provisioning.

## Synthetic identity plan — prepared, not provisioned

[Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md) defines Owner A, Owner B, A1–A5, and B1 as eight distinct fictional Supabase Auth users under reserved `.test` aliases. A5 alone has two active customer profiles, one per synthetic tenant. A3 remains suspended, A4 remains invited with an unaccepted invitation, and every portal identity remains globally absent from business owner/member roles.

The plan requires seven profile rows and seven invitation rows. Six invitations finish accepted through the trusted service-role-only redemption path; A4's remains unaccepted. A3 is redeemed while active and only then moved to suspended through an approved operator path. No public redemption route, automated provisioning, credential, UUID, identity, or row now exists because of this documentation.

Credentials use unique password-manager secrets, an expiring delivery channel, and a private `.test` SMTP sink. Recovery links, tokens, cookies, headers, UUIDs, and service-role keys are forbidden in Git, docs, logs, chat, screenshots, and test output. Provisioning remains gated by separate human approval of the environment, operators, trusted server path, evidence controls, and cleanup. Authentication remains not production-ready.

The complete operator package is [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md), and [Test Data Matrix](../testing/TEST_DATA_MATRIX.md). It is Prepared only; it created no identity or credential and executed no authentication scenario.

## Final certification result

Authentication scored **61/100** in the 2026-07-14 final certification. The PKCE singleton, distinct `johai-customer-portal-session` boundary, safe local redirects, generic auth errors, profile selection, local logout wiring, refresh listeners, invalid recovery handling, and protected-route structure passed static/local review.

No credential-backed scenario ran. Valid/invalid login, post-login refresh, token refresh, successful recovery, used/expired recovery links, genuine expiry, suspended/invited denial, multi-profile selection, multi-tab propagation, logout redirect, and simultaneous Business Workspace isolation remain Blocked. Customer Portal V1 certification is **FAILED** and Production Ready is **NO**. No SQL was executed.
