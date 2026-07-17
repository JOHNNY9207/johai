# ADR-0001: Living Documentation System

## Status

Accepted — July 10, 2026

## Context

JOHAI serves product, customer, investor, sales, and engineering audiences. A single undifferentiated documentation folder cannot reliably keep claims, operating instructions, and technical facts synchronized.

## Decision

Maintain audience-specific documentation under `manual`, `investor`, `customer`, `technical`, and `sales`; preserve decisions in ADRs and implementation context in sprint records. Every future feature sprint must follow `DOCUMENTATION_RULES.md`.

## Consequences

Documentation becomes part of completion criteria. Repetition across audiences is accepted when language and depth differ, but factual status must remain consistent and capabilities must be labeled Implemented, Partial, or Planned.
