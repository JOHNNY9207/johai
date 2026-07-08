# Customer Lifecycle

## Purpose
Prepare JOHAI to manage the complete lifecycle of each business customer from lead to archived account.

## Architecture
`app/lib/customer-lifecycle.ts` generates lifecycle status, customer timeline, health score, risks, and Customer Success recommendations from existing business, billing, lead, knowledge, orchestration, audit, and onboarding data.

## Components
- Lifecycle statuses
- Customer timeline
- Customer health score
- Risk detection
- Customer Success recommendations
- Dashboard Customer Success workspace
- Future connector interfaces

## Current Status
The Customer Success workspace displays active trials, trials ending soon, conversion rate, customers by plan, MRR/ARR/churn placeholders, lifecycle status, timeline, health score, risks, and recommendations.

## Future Roadmap
- Persist lifecycle state.
- Add customer success tasks.
- Sync lifecycle data to Stripe, Paddle, Chargebee, HubSpot, and Intercom.
- Add account owner assignments.
- Add customer health alerts.

## Dependencies
Businesses, billing subscription model, leads, knowledge files, orchestration logs, audit history, Business Brain score, and onboarding status.

## Known Limitations
No payment gateway is connected. Lifecycle metrics are computed at render time and are not yet persisted.
