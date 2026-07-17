# Knowledge Engine

## Implemented

Knowledge Center V2 supports PDF, DOCX, XLSX, CSV, TXT, and manual business knowledge. Manual types include FAQ, product/service, policy, and procedure. Files are validated, stored in a private business-prefixed path, extracted as text, normalized, divided into configurable overlapping sections, and stored as searchable chunks.

Every file exposes Uploaded/Queued, Processing, Ready, Failed, Needs review, or Archived status plus processing attempts, duration, last attempt, processed time, error, chunk count, source information, and version metadata. The preview renders extracted text only and never uploaded HTML.

Processing follows Uploaded → Queued → Processing → Ready or Needs review. A guarded failure from Processing becomes Failed and preserves the error, duration, attempt count, last attempt, request identifier, and recoverability classification. A stable request identifier makes replay of the same completed request idempotent. A unique attempt token prevents a delayed older result from updating a file after another state has superseded it. Automatic retries stop after five attempts, and non-recoverable extraction failures require source correction or replacement.

An active Ready document can be replaced through a copy-on-write workflow. JOHAI stores and processes the new file as an inactive version while the previous Ready version remains searchable. A clean Ready replacement activates automatically. A replacement with extraction warnings remains inactive in Needs review until a person approves it. Failed replacements never displace the active source. The document preview shows the ordered lineage and marks each version Active or Historical.

Rename updates the shared knowledge record only for the active version. Unattended queue processing ignores inactive history. Processing files cannot be archived or deleted. Delete first claims an Archived application lock, then removes storage and metadata; database cascades remove chunks. Active files with an existing lineage cannot be archived or deleted in place, preventing an implicit and unsafe rollback; inactive historical versions can be maintained separately.

## Safety

The application caps files at 25 MB, validates extension/MIME pairs and basic file signatures, sanitizes filenames, throttles uploads, checks database mutations, records explicit failures, hides chunks unless their file is Ready/active/non-archived, and restores prior chunks when a replacement insert fails. It does not execute uploads and does not claim malware scanning.

## Partial and planned

Website URLs are saved as planned sources but are not crawled. The current `KnowledgeProcessingQueue` implementation is synchronous and route-triggered; durable worker leases, retry scheduling, dead-letter handling, and recovery scans are interfaces rather than running infrastructure. Transaction-backed version allocation/activation, database-enforced single-active-version uniqueness, crash-atomic chunk replacement, malware scanning, immutable approval audit records, live-Supabase concurrency coverage, parser fixtures, and deeper multilingual extraction remain future work.
