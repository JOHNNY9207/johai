# API

## Knowledge Center V2

- `POST /api/knowledge` creates website records or processes manual text-backed sources.
- `POST /api/knowledge/upload` accepts validated PDF, DOCX, XLSX, CSV, and TXT files.
- `GET /api/knowledge/files` returns tenant-scoped documents.
- `POST /api/knowledge/files/[id]/replace` accepts one validated multipart `file` for an active Ready document. It stages an inactive direct-child version, processes it synchronously, returns `201` when a Ready replacement activates, `202` when human review is required or an identical request is still pending, `409` for an unsafe lineage/unresolved request, and `422` with recoverability evidence when extraction fails. An optional `Idempotency-Key` of at most 128 characters supports best-effort replay deduplication.
- `PATCH /api/knowledge/files/[id]` renames, archives, restores, or approves an eligible version. `{ "action": "approve" }` can approve an active initial Needs review source or a Needs review/Ready direct-child replacement whose predecessor is still the sole active Ready version.
- `DELETE /api/knowledge/files/[id]` rejects Processing files, conditionally claims Archived as an application delete lock, removes scoped storage, and then removes metadata. Inactive history deletes only that file version. The last version deletes the shared knowledge item. An active version cannot be deleted while other versions exist.
- `GET /api/knowledge/process` returns tenant-scoped chunks and recent processing evidence.
- `POST /api/knowledge/process` accepts optional `fileId` and stable `requestId` (maximum 128 characters). It returns `requested`, `processed`, `skipped`, `queueMode: "synchronous"`, and per-file status, attempt, attempt token, recoverability, error, chunk count, parser, and duration. Reusing the same request ID returns the prior outcome without another attempt. A new request ID is required for an intentional retry or reprocess.
- `GET /api/knowledge/search` accepts `q`, `limit`, `source`, and `document`; returns results plus explicit search mode, fallback status, and embedding-provider status.

All routes require dashboard authorization and use the active business boundary. Processing completion additionally requires the current Processing status and matching attempt token. Replacement, activation, archive, and deletion verify the shared document lineage and use a process-local lineage lock where needed. Search remains keyword fallback until vector storage is connected.

Route handlers cover chat, leads, cleanup, follow-ups, knowledge CRUD/upload/process/search, onboarding, team invitations, Calendly, and billing. Contracts must be documented from source before external publication.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal V1

Most portal operations use the authenticated Supabase anon client directly against the applied RLS policies. `app/lib/customer-portal-data.ts` selects explicit customer-safe columns, validates UUIDs/enums/timestamps/JSON/URLs, repeats the selected `customer_profile_id` and `business_id`, caps pagination, and exposes profile, branding, appointment, message, document, acknowledgement, and support-request operations.

`GET /api/portal/documents/[id]/download` is the only dedicated portal route handler. It:

1. rejects malformed document, selected-business, or selected-profile UUIDs;
2. requires a Supabase bearer token and validates the user with the anon client;
3. retrieves one non-revoked document matching the exact selected business/profile pair through the caller's RLS context;
4. checks the storage bucket against `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`;
5. rejects traversal segments, encoded paths, backslashes, control/query/hash characters, and non-canonical separators before requiring the exact `business_id/customer_profile_id/` prefix; and
6. uses the server-only service role to return a 60-second download URL.

Authentication and failure responses use no-store headers and do not disclose storage details. Missing server configuration returns `503`; invalid auth returns `401`; unavailable, revoked, unauthorized, or mis-scoped documents return the same `404` response. Rate limiting is not implemented.

## Production API privilege gate — Applied; verification Pending

During the July 13 pre-hardening inspection, PostgREST OpenAPI exposed all eight portal tables and only `is_current_portal_customer` as a portal RPC. Anonymous GET returned `200 []` on branding, messages, document acknowledgements, and requests, while profiles, invitations, appointments, and documents returned `401`. The tables had zero rows at that inspection, so the responses demonstrated API privilege but neither row leakage nor correct tenant behavior; they do not establish current row counts or deployed post-hardening grants.

Pre-migration authenticated table-wide grants allowed direct REST clients to request own-row columns outside `customer-portal-data.ts`, including identity/linkage, provider/event, and storage bucket/path fields, and to supply IDs/timestamps on permitted inserts. The user confirmed successful hardening-migration execution. Exact deployed privileges remain Pending until the corrected read-only verifier completes, and the migration must not be rerun.

The application client has been aligned with the Applied allowlist: profile updates do not filter on hidden `status` or send `updated_at`; message reads/inserts rely on RLS and the server-owned visibility default; document reads rely on RLS for revocation; and request inserts rely on the server status default. Corrected-verifier execution and direct-REST behavioral evidence remain Pending, so alignment is not deployed-security proof.

The download handler now authorizes the exact safe document/profile/business tuple through caller RLS, then uses a trusted server client to reread that tuple's storage metadata and revocation state immediately before signing. Bearer validation, tenant binding, non-revocation, bucket allowlisting, canonical paths, and service-role isolation remain mandatory. The current local workspace environment has no `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` key, so an authenticated request would fail closed with `503`. Corrected database verification, direct-REST tests, production allowlist, storage policy, canonical object placement, and successful-download evidence remain Pending.

### Synthetic API/auth fixture boundary

The planned eight Auth users and seven portal profiles are created only through approved Auth/Admin and trusted server operations after verifier success. No browser may insert profiles or invitations or invoke `redeem_customer_portal_invitation`; its execution remains service-role-only. Scenario evidence may retain response classes and alias labels, never authorization headers, tokens, UUIDs, invitation hashes, recovery codes, or signed URLs. No API call or identity creation was performed while preparing the plan.
