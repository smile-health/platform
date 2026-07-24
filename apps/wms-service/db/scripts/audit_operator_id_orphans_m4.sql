-- Read-only report for M4 (orphan operator_id backfill feasibility).
-- Run manually against staging/production. Produces three buckets — do NOT
-- write any UPDATEs from this file; it is diagnostic only.

-- Bucket 1: already resolvable (not actually orphaned) — operator_id matches
-- a users.user_uuid directly.
SELECT wteg.id, wteg.transporter_operator_id
FROM waste_transportation_external_group wteg
JOIN users u ON u.user_uuid = wteg.transporter_operator_id
WHERE wteg.transporter_operator_id IS NOT NULL;

-- Bucket 2: orphaned (no matching users.user_uuid) but a single plausible
-- candidate exists for the same entity/provider — a heuristic match, not a
-- guaranteed one. Review manually before backfilling; do not auto-apply.
SELECT
    wteg.id,
    wteg.transporter_operator_id AS orphaned_operator_id,
    wteg.transporter_id,
    (
        SELECT COUNT(*)
        FROM users u
        WHERE u.entity_id = wteg.transporter_id
    ) AS candidate_user_count
FROM waste_transportation_external_group wteg
LEFT JOIN users u ON u.user_uuid = wteg.transporter_operator_id
WHERE wteg.transporter_operator_id IS NOT NULL
  AND u.id IS NULL;

-- Bucket 3 (derived from bucket 2): rows where candidate_user_count <> 1 are
-- fundamentally unrecoverable (zero or ambiguous candidates) — do not guess.
-- Rows with candidate_user_count = 1 are the only realistic backfill targets,
-- and even those should be spot-checked against created_at proximity to the
-- candidate user's activity before writing anything.

-- Same three buckets for waste_treatment_external_group.treatment_operator_id:
SELECT wteg.id, wteg.treatment_operator_id
FROM waste_treatment_external_group wteg
JOIN users u ON u.user_uuid = wteg.treatment_operator_id
WHERE wteg.treatment_operator_id IS NOT NULL;

SELECT
    wteg.id,
    wteg.treatment_operator_id AS orphaned_operator_id,
    (
        SELECT COUNT(*)
        FROM users u
        WHERE u.entity_id = wteg.treatment_provider_id
    ) AS candidate_user_count
FROM waste_treatment_external_group wteg
LEFT JOIN users u ON u.user_uuid = wteg.treatment_operator_id
WHERE wteg.treatment_operator_id IS NOT NULL
  AND u.id IS NULL;
