# AI Chat Experience

The floating website chat calls the chat API, uses approved business context, captures lead details, and can support booking. Its quality depends on configuration, knowledge quality, and provider availability.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## From chat to contextual assistance

The current public chat remains an implemented conversational interface. Future work must first satisfy the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) and [AI Principles](../constitution/AI_PRINCIPLES.md), then follow [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md): use authorized context before asking a question, assist only when value is clear, and prefer a concise suggestion or prefilled action over a new conversation when the customer is already inside a document, appointment, message, profile, payment, support, order, reservation, or invoice workflow.

AI should remain silent when the answer or action is already visible, the customer has completed the task, an interruption could increase risk, no useful recommendation exists, or policy requires a person. It must never pretend to be human, invent a business commitment, conceal material uncertainty, or imply that a suggestion was executed.

Customer-visible AI may use only the context approved for that customer and task. CRM internals, Business Brain internals, private notes, internal prompts, billing internals, raw Knowledge Center files, orchestration details, and other customers remain outside the customer-facing context boundary. The detailed response, escalation, and human-takeover rules are in [AI Behavior Guidelines](../philosophy/AI_BEHAVIOR_GUIDELINES.md).

## Customer Portal Contextual Intelligence V1

Customer Portal Contextual Intelligence V1 is **not a chatbot**. It is a bounded, surface-specific assistance layer that ranks visible facts, proposes one next action, and becomes silent when it cannot add trustworthy value.

- The deterministic engine receives only the active customer profile, published branding, and exact-tenant customer-visible records required by the current page.
- Context never grants permission. Tenant identity, authorization, downloads, and writes remain with Auth, RLS, and the existing repository or server route.
- The development demo uses fixed fictional output and no external model, Supabase client, production tenant, or raw Knowledge Center source.
- The authenticated production provider is fail-closed. Document explanation, translation, message rewriting, and knowledge-grounded generation remain unavailable until an approved server-side provider independently reauthorizes and rebuilds context.
- Internal confidence remains `supported`, `partially_supported`, `unsupported`, or `prohibited`. Customer copy maps these to supported, limited, or unavailable without a numeric meter.
- Suggestions never send messages, modify profiles, acknowledge documents, submit support requests, or invoke external-provider actions. The customer remains the actor.

Generated or deterministic-demo help must identify its authorship, name the visible source, preserve the original record as the source of truth, state uncertainty, and offer a truthful human path when judgment exceeds authority.
