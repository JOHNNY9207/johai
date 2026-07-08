# AI Orchestrator

## Purpose
Decide which business actions should happen from each conversation.

## Architecture
The orchestrator detects intent, assigns confidence, prepares actions, executes isolated action classes, logs results, and preserves business isolation with `business_id`.

## Components
Intent detection, action planning, action executor, isolated actions, orchestration logs, business context, knowledge context, and CRM context.

## Current Status
`app/lib/ai-orchestrator.ts` supports planned intents, actions, dependency injection, logging, and integration from the chat flow.

## Future Roadmap
LLM-powered intent detection, real action execution against more systems, channel adapters, retry recovery, and owner approval workflows.

## Dependencies
Chat route, leads, knowledge search, semantic memory, Calendly, email, and follow-up engine.

## Known Limitations
Some actions are placeholders. Stronger transactional guarantees will be needed for production automation.
