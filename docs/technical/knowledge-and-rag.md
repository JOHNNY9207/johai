# Knowledge and Retrieval Architecture

## Ingestion

`POST /api/knowledge/upload` validates a 25 MB maximum, exact extension/MIME pairing, basic PDF/ZIP/text signatures, filename safety, and a ten-minute upload window. Raw files are private and stored under `{business_id}/{file_id}/{filename}`.

`processKnowledgeFile` reloads the file and conditionally claims it by current status and attempt count. Uploaded files first become Queued. The winner stores a request identifier and unique attempt token, then moves to Processing. PDF.js, Mammoth, ExcelJS, a quoted-field CSV parser, or UTF-8 extraction normalizes content, preserves page/sheet markers where available, and creates configurable overlapping chunks. Success and failure may update the row only while the same token still owns Processing.

Repeated calls with the same stable request ID are idempotent. A concurrent call cannot increment the attempt or claim a file already in Processing. Recoverable failures preserve their reason and accept a new request ID until the five-attempt ceiling; non-recoverable failures require source correction. A stale older attempt cannot finalize after the token changes.

Chunk replacement loads the previous chunk set, verifies attempt ownership, deletes and inserts one unique indexed set while the file is non-searchable in Processing, and restores the previous set when insertion fails. If guarded finalization detects a stale state, it restores the previous set before returning. A process crash between separate database requests remains outside application-level guarantees.

Manual FAQ/product/policy/procedure/text sources are saved as private TXT-backed files and use the same pipeline.

## Document replacement

`POST /api/knowledge/files/[id]/replace` validates and stores a new inactive Uploaded file that shares the source's `knowledge_item_id` and points to the current file through `previous_version_id`. A process-local lineage lock plus a fresh pending-child check prevents duplicate staging within one server process. It processes that file without changing the shared knowledge item. A clean Ready result passes guarded activation; a Needs review result remains inactive for human approval; a failure leaves the previous Ready version authoritative. Historical chunks and raw sources remain available until that version is explicitly deleted.

Activation reloads the lineage, requires exactly one active version, requires a direct active Ready predecessor, applies expected-state filters, and compensates a failed predecessor or knowledge-item update when safe. These checks reduce partial-state and stale-request failures but do not replace a database transaction.

## Retrieval

Current retrieval is PostgreSQL full-text search restricted to Ready, active, non-archived sources. Results include document identity, safe source type, excerpt, rank, and creation time. The API exposes keyword mode, fallback status, embedding-provider status, and source/document filters.

An OpenAI embedding provider implements the provider boundary. Vector persistence and hybrid ranking are partial, so no result is labeled semantic today.

## Chat grounding

The chat retrieves up to five tenant-scoped excerpts before completion and supplies them as untrusted reference data. The system prompt requires uncertainty when no source supports pricing, policy, hours, or guarantees. Lead qualification and booking behavior remain unchanged.

## Remaining risks

The `KnowledgeProcessingQueue`, job, and result contracts are active, but the implementation is explicitly synchronous and request-scoped. Durable worker leases, retry scheduling, dead-letter handling, and scheduled stale-attempt recovery are prepared boundaries rather than running services.

Remaining risks are non-transactional version activation and chunk replacement, process-local rather than distributed lineage locks, database-unenforced version allocation, default-business resolution, lack of malware scanning, incomplete live-Supabase concurrency/parser fixture coverage, multilingual FTS, and absent vector evaluation.

## Proposed database transaction boundary

An unexecuted proposal would lock a `knowledge_item_id` lineage and atomically swap its active Ready file. Chunk replacement would lock the tenant-scoped Processing file, require its current attempt token, validate the full payload, and replace all chunks atomically. Application code has not adopted these RPCs, so runtime behavior is unchanged.
