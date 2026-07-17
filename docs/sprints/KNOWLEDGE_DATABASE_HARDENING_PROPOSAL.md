# Knowledge Database Hardening Proposal

## Findings

- `knowledge_item_id` is the non-null document-lineage key in the canonical `knowledge_files` definition.
- `business_id` carries tenant ownership; file/item and chunk/file tenant equality currently relies on application validation.
- Knowledge Center V2 added `version_number`, `is_active_version`, and `previous_version_id`; its predecessor foreign key was initially `NOT VALID`.
- Chunk positions already have a unique `(knowledge_file_id, chunk_index)` index.
- Activation and chunk replacement currently span guarded database requests with compensation.

## Proposal

The migration validates existing rows before creating lineage/version and single-active unique indexes. Service-role-only transaction functions then provide Ready replacement activation and attempt-token-bound chunk replacement. The migration aborts on duplicates, tenant/lineage mismatches, invalid predecessors, or orphan/cross-tenant chunks and performs no automatic repair.

## Status

Proposal only. SQL was not run. A later approved application change must adopt both RPCs before these guarantees become effective.
