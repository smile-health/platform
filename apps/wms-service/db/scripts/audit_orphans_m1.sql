-- Read-only orphan audit for M1 FK constraints.
-- Run manually against staging/production BEFORE deploying the
-- 20260703000010-add_fk_constraints_*.js migrations. Every query below must
-- return 0 rows; if any return rows, those need a cleanup migration
-- (modeled on H5) before the corresponding addConstraint migration can run.

-- waste_bag.healthcare_facility_id -> entities.id
SELECT wb.id, wb.healthcare_facility_id
FROM waste_bag wb
LEFT JOIN entities e ON e.id = wb.healthcare_facility_id
WHERE wb.healthcare_facility_id IS NOT NULL AND e.id IS NULL;

-- waste_bag.transporter_id -> entities.id
SELECT wb.id, wb.transporter_id
FROM waste_bag wb
LEFT JOIN entities e ON e.id = wb.transporter_id
WHERE wb.transporter_id IS NOT NULL AND e.id IS NULL;

-- waste_bag.third_party_id -> entities.id
SELECT wb.id, wb.third_party_id
FROM waste_bag wb
LEFT JOIN entities e ON e.id = wb.third_party_id
WHERE wb.third_party_id IS NOT NULL AND e.id IS NULL;

-- waste_bag.waste_classification_id -> waste_classification.id
SELECT wb.id, wb.waste_classification_id
FROM waste_bag wb
LEFT JOIN waste_classification wc ON wc.id = wb.waste_classification_id
WHERE wb.waste_classification_id IS NOT NULL AND wc.id IS NULL;

-- users.entity_id -> entities.id
-- (H5 already cleaned this once; re-run in case new orphans appeared since)
SELECT u.id, u.entity_id
FROM users u
LEFT JOIN entities e ON e.id = u.entity_id
WHERE u.entity_id IS NOT NULL AND e.id IS NULL;

-- entity_location.entity_id -> entities.id
SELECT el.id, el.entity_id
FROM entity_location el
LEFT JOIN entities e ON e.id = el.entity_id
WHERE el.entity_id IS NOT NULL AND e.id IS NULL;
