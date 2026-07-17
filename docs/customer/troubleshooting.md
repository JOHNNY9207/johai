# Customer Troubleshooting

If chat, booking, email, or dashboard data is missing, confirm configuration and provider availability. For account or payment problems, contact the JOHAI operator; do not repeatedly submit sensitive information.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal

- **Cannot sign in:** confirm the email and password supplied for the provisioned customer account. Use the password-recovery option when appropriate. There is no public signup in V1.
- **Portal access is unavailable after sign-in:** the account may not have an active customer profile. Contact the business that provisioned access; do not create another account or submit tenant identifiers manually.
- **More than one portal appears:** choose the business you intend to visit. The selector only shows profiles already authorized for the signed-in account.
- **Appointments or messages are empty:** the business may not have shared any current records. Empty states are not proof of an error.
- **A document cannot download:** it may have been revoked, the secure link may have expired, or the business's private storage may be unavailable. Refresh once, then contact support. Do not request a raw storage path or service credential.
- **An external meeting, reschedule, or cancellation link fails:** the destination is operated by an external scheduling provider; contact the business for an updated link.
- **Data still looks wrong after switching businesses:** sign out, sign in again, and select the intended portal. Never share screenshots containing recovery links or access tokens.

## Pilot demo troubleshooting

- **The demo route is unavailable locally:** start the application from the JOHAI root with `npm run dev`, then open the exact URL `http://localhost:3000/portal/demo`.
- **The demo route returns 404 in production:** this is expected. `/portal/demo` is development-only and must remain unavailable in production.
- **The page does not say Demo environment and Fictional data:** stop the presentation. Do not enter customer information; confirm that the development-only route was opened.
- **The demo shows no records:** select **Complete pilot**. **Empty states** intentionally removes the fictional collections.
- **Every data area shows an error:** select **Complete pilot** or **Reset fictional data**. **Load error** intentionally fails local repository reads.
- **One message fails:** **Fail next message** is a one-shot control. Keep the fictional draft and retry, or reset the fixture.
- **One download fails:** **Fail next download** is a one-shot control. Retry after the safe error or reset the fixture.
- **One profile save reports an expired session:** **Expire next save** is a one-shot fictional session state. Retry or select **Reset fictional data**.
- **Demo changes need to be discarded:** select **Reset fictional data** or refresh. Nothing needs to be removed from Supabase because the demo makes no Supabase, external, production-data, persistence, or database request. A fictional document download uses only the guarded same-origin generated attachment endpoint.

Harbor Dental Studio and Sophie Martin are fictional. Do not paste real customer data into any pilot field. For appointments, services, documents, or business follow-up, contact the represented business. For an actual JOHAI platform-account or technical access issue, contact JOHAI. The local demo sends neither type of request.

## Production status

The recorded pre-hardening inspection had no portal customer rows, so it did not reproduce a live customer journey. An empty result was not proof of isolation. The hardening migration is recorded as **Applied** and must not be rerun, while successful execution of the corrected read-only verifier remains **Pending**. Production support procedures, representative accounts, behavioral tenant tests, Storage evidence, browser evidence, and raw verifier output also remain incomplete or `Pending`.

There is no public registration page, dashboard alias, or dedicated callback route. Use `/portal/login`, `/portal/reset-password` for a valid recovery email, and `/portal` after sign-in. If a person also uses the Business Workspace, the applied hardening requires a different Auth identity for customer access. The `/portal/demo` fixture is not an account and cannot be promoted into production.

## Authentication-validation safeguard

The real-authentication matrix remains Blocked because no synthetic identity or credential has been provisioned. An exact operator plan is now prepared, but preparation is not account availability. Do not offer a production customer's account as a fixture, convert the fictional demo into an account, or send passwords, recovery links, invitation tokens, access tokens, refresh tokens, or Auth identifiers through support.

A customer who cannot sign in should follow the normal recovery option and contact the provisioning business if no active profile is available. Test operators must use separately approved non-production identities and a controlled mailbox; they must record only aliases and outcomes. A missing/invalid recovery context was confirmed to fail safely, but successful recovery and genuine expired-link behavior remain Pending.

Synthetic-test support belongs to the authorized operator, not a real customer. If a `.test` alias, synthetic tenant name, or test-recovery message appears outside the approved environment, stop testing, revoke sessions, and begin the documented cleanup and incident review. Authentication remains not production-ready.

## Certification safeguard

Customer Portal V1 is not certified for production. The 2026-07-14 decision is **FAILED**, global score **69/100**, Production Ready **NO**. Do not diagnose a missing production customer account by creating one, rerunning a migration, or using the fictional demo as an identity.

Operators must first record successful execution of the corrected read-only verifier, then obtain separate fixture approval and follow the synthetic identity plan. Real customers must never be used to close certification blockers. No SQL was executed during certification.
