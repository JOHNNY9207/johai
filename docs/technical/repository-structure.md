# Repository Structure

## Source directories

- `app/` — Next.js App Router pages, layouts, and route groups.
- `app/api/` — server endpoints for chat, leads, knowledge, onboarding, Calendly, billing, follow-ups, and team invitations.
- `app/lib/` — domain services and integration adapters, including Supabase, AI orchestration, Business Brain, knowledge, semantic memory, audits, billing, and customer lifecycle.
- `components/` — shared client components. `components/dashboard/` contains the active Executive Dashboard V3 composition.
- `public/` — static marketing images and SVG assets.
- `supabase/migrations/` — additive database migrations and RLS preparation.
- `docs/` — product, customer, investor, technical, sales, decisions, and sprint documentation.

## Active application entry points

- `app/page.tsx` — marketing homepage
- `app/product/page.tsx` and `app/pricing/*` — product and commercial pages
- `app/auth/*` — Supabase authentication experience
- `app/dashboard/page.tsx` — server data loader for the dashboard
- `app/dashboard/DashboardClient.tsx` — dashboard shell and V3 executive composition
- `app/dashboard/knowledge`, `onboarding`, `settings`, and `team` — focused workspaces
- `components/AIChat.tsx` and `app/api/chat/route.ts` — website AI conversation flow
- `app/portal/` — separate Customer Portal layouts, auth pages, protected overview, appointments, messages, documents, profile, support, loading, and error routes
- `components/portal/` — portal auth/provider state, tenant selection, shell, dashboard, feature views, and shared loading/empty/error UI
- `app/lib/customer-portal-*` — portal auth, type contracts, the injectable repository contract, the Supabase adapter, and the isolated fictional demo adapter, fixture, and guard
- `app/api/portal/documents/[id]/download/route.ts` — bearer-authorized short-lived private document download
- `app/portal/demo/` — development/test-only fictional pilot routes; the server layout returns 404 when `NODE_ENV=production`
- `tests/customer-portal-pilot.test.ts` — 16 repository, route-boundary, failure-state, and security-contract checks run by `npm run test:portal`

## Customer Portal repository boundary

`app/lib/customer-portal-repository.ts` defines the UI-facing `PortalRepository` contract for appointments, messages, documents, acknowledgements, profile updates, support requests, and downloads. Production customer routes receive `createSupabasePortalRepository`, which delegates database operations to the validated safe-column data layer and downloads to the authenticated server route. Components consume the injected repository rather than selecting a transport directly.

The pilot demo receives `createCustomerPortalDemoRepository`, a mutable in-memory adapter backed only by synthetic fixtures. It supports normal, empty, load-error, retry, revoked-document, and simulated-session-expiry states without Supabase, service-role credentials, production customer data, or network access. The demo layout's server-side environment guard makes the entire route tree unavailable in production; there is no query-string, cookie, local-storage, or automatic fallback that can switch a production customer route to mock data.

## Legacy and inactive source

Several root `components/*.tsx` marketing sections are not imported by the active self-contained landing page. They should be reviewed before deletion. Unreferenced default Next.js SVG assets and older team illustrations also remain.

## Partial systems

- Semantic embeddings and vector search
- Subscription persistence
- Customer Portal production provisioning, invitation redemption, rate limiting, and end-to-end authorization/storage validation
- Organization membership and role management
- Tenant context resolution outside the default business path
- Production end-to-end testing and observability; a 16-test local Customer Portal pilot suite now exists but does not replace live tenant/RLS/Storage evidence

## Configuration

Key configuration files include `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json`, and `.gitignore`. `.env.local` contains local secrets and is never documentation source.

## Generated folders

`node_modules/`, `.next/`, and `.next-build-stable/` are generated dependencies or build output. They must not be treated as application source, manually edited, or used to reconstruct product behavior when source files are available.
