# Deployment

## Purpose
Explain how JOHAI should be prepared for deployment.

## Architecture
JOHAI deploys as a Next.js application with Supabase as backend. Provider secrets must be supplied through environment variables and never committed.

## Components
Next.js build, Supabase migrations, environment variables, Calendly webhooks, Resend email, dashboard password, and build output directory.

## Current Status
Local builds use `.next-build-stable` as `distDir` to avoid Windows/OneDrive file lock issues observed with an older build folder.

## Future Roadmap
Add CI build checks, migration verification, production environment checklist, webhook replay testing, monitoring, and error reporting.

## Dependencies
`DASHBOARD_PASSWORD`, Supabase credentials, Calendly token and webhook secret, Resend API key, JOHAI sender email, and owner email.

## Known Limitations
`.env.local` is intentionally not documented with real values. Hosted Supabase migrations must be applied manually or through a controlled workflow.
