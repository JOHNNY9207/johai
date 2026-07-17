# Troubleshooting

Start with environment configuration, dashboard authentication, provider credentials, and Supabase connectivity. Generated build caches may be safely regenerated when corrupted; never edit generated route types or commit secrets.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal troubleshooting

- **Login page reports missing configuration:** confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployed environment.
- **A signed-in customer sees access unavailable:** confirm that the auth user has an active `customer_profiles` row for the intended business. There is no public signup or invitation-redemption flow in V1.
- **The wrong portal is selected:** customers linked to multiple RLS-visible profiles can switch portals from the portal selector. Signing out clears the remembered selection for that user.
- **A document download is unavailable:** confirm the metadata is non-revoked and visible to the customer, the bucket is listed in `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`, the object path starts with the exact business/profile prefix, and the service-role key is configured server-side. Do not expose private storage paths or service credentials to the customer.
- **An appointment action fails:** meeting, reschedule, and cancel links are external HTTPS destinations and may be unavailable or stale at the provider.
- **Data fails to load:** preserve the generic customer-safe error, inspect server/Supabase diagnostics privately, and never loosen RLS or use a client-visible service role as a workaround.
- **The console reports multiple GoTrue clients for one storage key:** confirm all browser auth consumers use `supabase-browser-auth-client.ts` through the workspace or portal getter. Do not call Supabase `createClient` inside a component, provider initializer, or render path, and do not merge `johai-auth-session` with `johai-customer-portal-session`. After changing client lifecycle code, perform one full reload to discard clients created by the older bundle, then repeat the route transition and inspect the console.

## Pilot demo troubleshooting

- Start the development server from `C:\Projects\johai` with `npm run dev`, then open `http://localhost:3000/portal/demo`.
- Verify the **Demo environment** and **Fictional data** indicators. If either is absent, stop and confirm the route before entering anything.
- A production `404` is expected and required. Never remove the server-side development guard to make a deployed demo accessible.
- Use **Complete pilot** for the full Harbor Dental Studio/Sophie Martin fixture, **Empty states** for empty collections, and **Load error** for safe read failures.
- **Fail next message**, **Fail next download**, and **Expire next save** each affect exactly one matching action. Retry after the expected error or select **Reset fictional data**.
- **Reset fictional data** or a refresh discards local mutations. No Supabase cleanup, migration rollback, or Storage deletion is needed.
- The demo must make no Supabase, Auth/session, external, production-data, or persistence network request. The guarded same-origin generated attachment download is the only permitted non-asset request. If browser inspection shows any other portal data request, Auth mutation, service key, or production identifier, stop the demo and treat it as an isolation defect.
- Harbor Dental Studio and Sophie Martin are fictional. Never paste live customer data into the pilot.

Business-service questions belong to the represented business; JOHAI platform-account or technical access issues belong to JOHAI. Demo support submissions remain local and notify neither party.

## Production-validation gate

There were zero portal rows during the recorded pre-hardening inspection and there is no documented approved production customer fixture, so a successful page build, local demo, or empty PostgREST response cannot confirm production customer access. The hardening migration is **Applied** and must not be modified or rerun; the latest certification review removed the earlier hardening-verification blocker. Do not create a customer, invitation, document, or mixed-role identity merely to manufacture readiness evidence.

`/portal/register`, `/portal/dashboard`, and a dedicated callback route are not implemented. Use `/portal` as the canonical dashboard and `/portal/reset-password` only for a valid recovery flow. Protected pages redirect in the browser after session initialization; they are not protected by server middleware.

If `.next-build-stable/trace` is locked, identify the process holding the file and confirm from its command line and working directory that it is the JOHAI Next.js dev/start process. Stop only that confirmed process gracefully, then repeat an exclusive-open check. Resolve the build directory and confirm it is exactly inside `C:\Projects\johai` before removing only the stale build output, then rerun the default build. Never terminate an unidentified process, delete source files, or keep changing `distDir` to evade the lock. If ownership cannot be proven, leave the process and directory untouched and request operator help. The alternate output directory remains a diagnostic from an earlier run, not the repeatable fix.

The dedicated Pilot Demo suite contains 16 tests: the 12 required portal contracts plus four complementary scenario and guard cases. A local test pass still does not prove production RLS, Storage, session, or browser behavior.

If the pilot implementation must be rolled back, restore the prior application/documentation revision through the normal source-control review. Do not alter or rerun an applied migration. Local fixture state requires no recovery beyond refresh or **Reset fictional data**. Production readiness remains unconfirmed until its separate authentication, multi-tenant, Storage, signed-download, abuse-control, browser, monitoring, and recovery evidence is complete.

## Real-auth validation is blocked

If the real-auth matrix cannot start because credentials are unavailable, do not invent an account, reuse a production customer, read secret values from environment files, or treat the fictional demo as authentication evidence. Record the identity result as **NO**, list credential-dependent scenarios as **Blocked**, and distinguish those from an actual failed test.

Before retrying, require a GO decision in [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md). Then an approved operator may follow [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), create only the exact values in [Test Data Matrix](../testing/TEST_DATA_MATRIX.md), deliver credentials through the approved secret channel, and provide a controlled recovery mailbox plus session-revocation and token-lifetime conditions before executing [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md).

For expiry, invalidate the approved non-production session through the operator-controlled Auth process; clearing local storage tests local removal, not server expiry. For session isolation, use `/auth/login` with the separate workspace-only identity and `/portal/login` with the active portal identity; the dashboard password cookie is not the same boundary. For multi-tab behavior, use two same-origin tabs in one browser profile and record propagation without capturing tokens. For recovery, never screenshot or log the link.

If A3 can enter the portal, stop and verify it has no active profile anywhere; do not “fix” the test by changing the browser. If A4 can enter, stop and confirm its profile remains `invited` and its invitation remains unaccepted. If A5 shows only one tenant, confirm both profiles are active and clear only the remembered profile preference before retrying. If owner/customer isolation fails, revoke sessions and inspect Auth-ID role assignments through the trusted operator path; never merge identities or loosen RLS.

If cleanup cannot prove all sessions revoked, all reserved aliases removed, both synthetic tenants removed, and secret/mail/browser material destroyed, keep the validation open and authentication not production-ready.
