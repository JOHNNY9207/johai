# Knowledge Processing Reliability

## Date

July 11, 2026

## Status

Application-level reliability implemented; database transaction hardening recommended

## Objective

Make document ingestion and replacement reliable under duplicate requests, retries, concurrent application calls, failures, and delayed results without creating or running SQL automatically.

## Problem Solved

Processing previously changed a file to Processing unconditionally, incremented attempts from a stale object, deleted chunks before an unguarded insert, and allowed completion or failure updates without proving that the same attempt still owned the file. Archive and delete could also race an active extraction.

## Business Value

JOHAI now preserves the active trusted document during replacement failure, prevents supported duplicate work, records actionable failure evidence, limits automatic retry loops, and rejects stale processing results before they can become authoritative.

## User Experience

The existing Knowledge Center design is unchanged. Document and processing cards now show attempt count, last attempt, current status, failure reason, retry availability, active/historical version status, and replacement evidence. Archive and delete controls are disabled during Processing and the server enforces the same rule.

## Features Added

- Conditional processing claim using current status and attempt count
- Stable request identifiers and unique application attempt tokens
- Uploaded → Queued → Processing → Ready/Needs review state enforcement
- Token-guarded success and failure completion
- Idempotent replay response for completed or failed request identifiers
- Five-attempt automatic retry ceiling
- Recoverable/non-recoverable failure classification in `source_metadata`
- Chunk backup and restoration when replacement insertion fails
- Stale completion rejection and rollback before authority changes
- Process-local document-lineage lock for replacement, archive, and delete staging
- Synchronous queue interface and job/result contracts
- Twelve integration-level in-memory reliability tests

## Files Changed

Knowledge engine, processing state and queue contracts, lineage lock, upload/manual/process/replacement/file APIs, Knowledge Center status UI, package test configuration, TypeScript configuration, tests, and living documentation.

## Architecture Changes

`processKnowledgeFile` now reloads the database record, queues Uploaded files, conditionally claims one attempt, stores an attempt token in existing `source_metadata`, and guards every authoritative completion by Processing status plus that token. `SynchronousKnowledgeProcessingQueue` makes the current request-bound execution explicit while providing the contract for a future worker.

## Data Model Changes

None. Existing `processing_attempts`, `last_processing_attempt_at`, `processing_status`, `processed_at`, `processing_error`, `processing_duration_ms`, `source_metadata`, `is_active_version`, and `previous_version_id` fields are used. Request IDs, attempt IDs, failure classification, and last completed/failed request IDs are stored inside `source_metadata`.

## API Changes

`POST /api/knowledge/process` accepts optional `requestId`, returns requested/processed/skipped counts, explicit per-file recoverability, and `queueMode: "synchronous"`. Uploads and manual/replacement sources begin at Uploaded. Replacement processing returns `422` with preserved failure evidence when extraction fails. Archive/delete return `409` while Processing.

## Security Considerations

Tenant and storage-path guards remain unchanged. Processing claims, attempt completion, chunk operations, replacement staging, archive, and delete remain scoped to the active business. No uploaded content is executed. This sprint does not add malware scanning.

## Multi-Tenant Considerations

The tests verify that a job for another business cannot mutate status, attempts, or chunks. Runtime still uses `DEFAULT_BUSINESS_ID`; request-scoped membership resolution remains outside this sprint.

## Billing Considerations

None.

## Testing and Validation

`npm run test:knowledge` passed 12/12 integration-level scenarios using the production state and queue contracts through an in-memory repository boundary. `npm run lint` passed. `npm run build` passed with TypeScript validation and generated `/dashboard/knowledge`, `/api/knowledge/process`, and `/api/knowledge/files/[id]/replace` successfully.

## Known Limitations

The queue is synchronous and request-triggered. Process-local locks do not coordinate multiple server instances. Chunk delete/insert and version activate/deactivate remain separate database requests. A process crash can still occur between those requests.

## Remaining Risks

Strict global uniqueness of active versions and version numbers, crash-atomic chunk replacement, durable retries, dead-letter storage, scheduled recovery, worker leases, and live-Supabase concurrency tests remain incomplete.

## Screenshots Required

Processing queue with attempts/retry eligibility, failed document preview, active replacement, and historical version evidence.

## Investor Summary

JOHAI now has a tested application-level ingestion state machine and an explicit path to durable workers, while accurately separating current reliability from database-transaction guarantees.

## Customer Summary

Customers can see why processing failed, whether retry is available, and which version remains active. Duplicate or stale supported requests no longer silently replace trusted knowledge.

## Technical Summary

The sprint adds guarded claims, attempt tokens, stable request replay, bounded retries, failure classification, chunk restoration, lineage locks, mutation guards, synchronous queue contracts, and 12 reliability tests without a schema change.

## Next Recommended Step

After approval, add the smallest database migration containing transaction-backed chunk replacement and version activation functions plus uniqueness constraints for one active version and one version number per lineage. Then move the queue implementation to a durable worker.
