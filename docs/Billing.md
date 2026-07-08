# Billing

## Purpose
Prepare JOHAI for first paying customers without enabling a payment gateway yet.

## Architecture
Billing is provider-neutral. `app/lib/billing.ts` defines plans, subscription models, usage limits, feature flags, and a future payment provider interface for Stripe or another gateway.

## Components
- Starter, Professional, Enterprise, and Enterprise+ plans
- Monthly and yearly pricing fields
- Trial days
- Seat limits
- AI usage limits
- Storage limits
- Knowledge limits
- Conversation limits
- Automation limits
- Subscription model
- Feature flags
- Dashboard Billing workspace
- Future payment provider dependency injection

## Current Status
The Billing workspace displays current plan, upgrade button, trial days, renewal placeholder, usage this month, remaining quota, enabled features, invoice placeholder, and payment history placeholder.

## Future Roadmap
- Persist subscriptions in Supabase.
- Add Stripe customer and checkout sessions.
- Add customer portal.
- Add invoice sync.
- Enforce feature flags at route and UI boundaries.
- Add metered AI usage tracking.

## Dependencies
Current data is derived from businesses, leads, knowledge files, and orchestration logs. Future payment integration will depend on Stripe or another billing provider.

## Known Limitations
No payment gateway is active. Subscription data is derived at render time and is not persisted as a billing table yet.
