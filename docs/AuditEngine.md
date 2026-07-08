# Audit Engine

## Purpose
Analyze a business and produce a modular AI audit.

## Architecture
The audit system uses an `AuditEngine`, runner concept, module interface, module results, scores, recommendations, and report records.

## Components
Business Profile Audit, Knowledge Audit, Website Audit placeholder, SEO placeholder, Google Business placeholder, Social Media placeholder, Automation Audit, CRM Audit, AI Readiness Audit, and Communication Audit.

## Current Status
`app/lib/audit-engine.ts` generates an autonomous audit with scores, module results, recommendations, and dashboard output in the AI Audit Center.

## Future Roadmap
PDF export, executive summary generation, detailed report generation, implementation roadmap, website crawler, and external audit connectors.

## Dependencies
Business profile, Business Brain score, knowledge items, leads, orchestration logs, and audits table.

## Known Limitations
External audit connectors are placeholders, PDF output is not implemented, and some scoring is deterministic.
