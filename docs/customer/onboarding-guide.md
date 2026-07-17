# Onboarding Guide

Complete company identity, industry, website, services, pricing guidance, FAQs, policies, AI tone, restrictions, email, and booking settings in Dashboard Onboarding. Review all information before activation.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal onboarding

The portal database foundation is Applied and Verified by explicit user confirmation, and the customer-facing application exists in the repository. Before a customer can use it, an authorized operational or server process must provision the customer's Supabase identity and active customer profile for the correct business. V1 does not provide public signup or invitation redemption.

Configure safe portal branding and, when documents are offered, an allowlisted private bucket with objects below the exact business/profile path. Give the customer the `/portal/login` address through a trusted channel. A customer connected to multiple businesses chooses only among profiles returned through RLS; browser selection never creates or changes tenant membership.

Before production use, test login, password recovery, logout, multi-profile selection, empty/access-denied states, cross-tenant denial, direct REST permissions, messages, requests, acknowledgements, document revocation, and signed downloads with representative customer accounts.

## Provisioning status

No supported customer-facing provisioning or invitation-redemption route exists. The recorded July 13 pre-hardening inspection contained zero profiles and invitations, but that historical result does not establish the current row count. The five-step provisioning design—authorized invitation, trusted redemption, Auth linkage, active profile creation, then RLS-gated sign-in—remains Pending implementation and validation.

The Applied production hardening rejects mixed principals globally. A portal Auth identity cannot also be any JOHAI business owner or member. If one person needs both experiences, provision distinct Auth identities. The migration must not be rerun. Do not create fixtures until the corrected read-only verifier completes successfully, its results are recorded, and fixture creation is separately authorized.

A separate operator-only synthetic plan now defines fictional `.test` identities for future validation. None has been created, and it is not a customer onboarding offer. Real customers must never be substituted for testing, and passwords, recovery links, invitation tokens, Auth identifiers, or session tokens must never be sent through onboarding documents or support channels.
