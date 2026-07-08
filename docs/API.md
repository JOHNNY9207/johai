# API

## Purpose
List current server routes and responsibilities.

## Architecture
API routes live under `app/api`. They use server-side Supabase access and should never expose secrets to the client.

## Components
- `POST /api/chat`
- `GET/POST /api/leads`
- `PATCH/DELETE /api/leads/[id]`
- `DELETE /api/leads/cleanup-test`
- `GET/PATCH /api/calendly/settings`
- `GET /api/calendly/public`
- `GET /api/calendly/availability`
- `POST /api/calendly/webhook`
- `GET/POST /api/knowledge`
- `POST /api/knowledge/upload`
- `GET /api/knowledge/files`
- `PATCH/DELETE /api/knowledge/files/[id]`
- `POST /api/knowledge/process`
- `GET /api/knowledge/search`
- `POST /api/follow-ups/process`
- `GET/PATCH /api/onboarding`

## Current Status
Routes support CRM, chatbot, Calendly, email, follow-up, knowledge, onboarding, and dashboard workflows.

## Future Roadmap
Add API tests, rate limiting, stronger tenant-aware auth checks, and OpenAPI documentation.

## Dependencies
Supabase server client, dashboard authentication, Calendly API, Resend, and knowledge file storage.

## Known Limitations
Some routes use internal admin authentication rather than full business-user auth. Public chatbot routes need production hardening.
