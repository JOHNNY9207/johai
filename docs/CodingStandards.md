# Coding Standards

## Purpose
Define engineering standards for maintaining JOHAI safely.

## Architecture
Code should follow Next.js App Router patterns, keep business logic in `app/lib`, keep API handlers in `app/api`, keep dashboard UI organized by workspace, and preserve multi-tenant boundaries.

## Components
TypeScript strictness, server/client separation, Supabase access patterns, Tailwind consistency, reusable domain services, environment variable safety, lint verification, and build verification.

## Current Status
The project uses TypeScript, ESLint, Tailwind, React, Next.js, and typed Supabase domain objects.

## Future Roadmap
Split dashboard into smaller workspace components, add service unit tests, add API integration tests, and add UI smoke tests.

## Dependencies
`npm run lint`, `npm run build`, TypeScript, ESLint, and Next.js compiler.

## Known Limitations
The dashboard client component is large and should be refactored. Some service modules need tests before production automation expands.
