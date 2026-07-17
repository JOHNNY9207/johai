# Knowledge Document Versioning

## Date

July 11, 2026

## Status

Implemented with documented transaction and concurrency limits

## Objective

Let an owner replace outdated business knowledge without removing the currently trusted source before the new document has been validated, extracted, and approved.

## Problem Solved

The schema contained version fields, but the product could only overwrite, archive, reprocess, or delete individual files. Replacing a trusted source risked a knowledge gap, and historical source evidence was not presented as a usable lineage.

## Business Value

JOHAI can keep answering from the current Ready source while a replacement is processed. Failed or review-required replacements do not silently displace trusted knowledge, and prior versions remain inspectable for operational traceability.

## User Experience

An active Ready document exposes **Replace version**. The replacement dialog accepts the same validated file formats as initial upload. Ready replacements activate automatically; Needs review replacements remain inactive until approved. Preview shows version number, active/historical state, extracted text, processing evidence, and the complete source lineage.

## Features Added

- Copy-on-write replacement using the existing version fields
- Direct predecessor links and increasing version numbers
- Guarded Ready activation and human approval for Needs review
- Stable replacement request identifiers for best-effort client retry deduplication
- Active and historical version labels in the document library and preview
- Version-aware processing, rename, archive, and delete behavior
- Shared upload validation for initial and replacement files
- Live active-version verification before shared knowledge status updates

## Files Changed

Knowledge file APIs, processing engine, upload validation, version activation service, Knowledge Center client, document preview, and the living documentation library.

## Architecture Changes

Replacement is a staged saga: validate and store a new inactive file, process its private source, activate only a trusted Ready result, deactivate the direct predecessor, then synchronize the shared knowledge item. Guarded filters and compensating updates reduce partial-state failures without adding a migration.

## Data Model Changes

None. This sprint uses the verified `version_number`, `is_active_version`, `previous_version_id`, and `source_metadata` columns already present in Knowledge Center V2.

## API Changes

- Added `POST /api/knowledge/files/[id]/replace` for multipart replacement upload and synchronous processing.
- Added guarded `PATCH /api/knowledge/files/[id]` approval for eligible Needs review or inactive Ready replacements.
- Made archive and delete reject unsafe active-version mutations when a lineage exists.
- Made explicit reprocessing preserve inactive history and unattended processing ignore inactive versions.

## Security Considerations

Replacement uses dashboard authorization, business-scoped record queries, private business-prefixed storage, MIME/extension/signature validation, filename sanitization, a 25 MB limit, and upload throttling. Uploaded content remains data and preview remains plain text. Malware scanning is not implemented.

## Multi-Tenant Considerations

Every replacement, activation, processing, archive, and delete query is filtered by the current business and the file lineage. Runtime tenant resolution still relies on `DEFAULT_BUSINESS_ID`, which remains a production risk outside this sprint.

## Billing Considerations

None.

## Testing and Validation

`npx tsc --noEmit --incremental false`, `npm run lint`, and `npm run build` passed on July 11, 2026. The production build generated both `/dashboard/knowledge` and `/api/knowledge/files/[id]/replace`. The implementation also received a static data-integrity review covering stale activation, retry behavior, active-state checks, processing authority, archive, and delete paths.

## Known Limitations

Processing runs synchronously in request scope. Activation uses guarded multi-step mutations rather than one database transaction. Historical versions are inspectable but are not an immutable compliance audit log. Active versions with history must be retained rather than deleted or archived in place.

## Remaining Risks

The existing schema has no unique constraint for `(knowledge_item_id, version_number)` and no database constraint guaranteeing exactly one active version. Concurrent distributed replacements can still race despite direct-child checks, idempotent retries, expected-state filters, and compensating updates. Upload throttling is process-local, and storage/database deletion cannot be fully atomic.

## Screenshots Required

Replacement dialog, active version preview, Needs review approval, historical document card, and version history list.

## Investor Summary

JOHAI now preserves trusted business knowledge during source updates and exposes traceable document evolution, strengthening operational reliability without overstating the current transaction guarantees.

## Customer Summary

Customers can replace an outdated document safely, review what JOHAI extracted, approve exceptions, and inspect older versions without creating an avoidable gap in active knowledge.

## Technical Summary

The sprint adds staged replacement, shared upload validation, guarded version activation, compensation, best-effort retry deduplication, live processing authority checks, and version-aware file mutations on the existing schema.

## Next Recommended Step

Move extraction to a durable background worker and add transaction-backed version allocation/activation plus integration tests for concurrent replacement and failure recovery.
