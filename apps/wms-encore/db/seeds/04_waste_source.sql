-- Seed: waste_source (example/demo data for one healthcare facility).
-- Source: apps/wms-service/db/seeders/20250526073000-PIC1060-5958-waste-source.js
--
-- Schema difference: db/migrations/9_create_waste_core_tables.up.sql defines
-- healthcare_facility_id / external_healthcare_facility_id as INTEGER (with a comment noting
-- there is intentionally no FK yet, since entities/healthcare-facility rows may not exist in
-- every environment). The old MySQL seeder used string literals ('820678', '1', '2') for these —
-- converted to plain integers here since the column type demands it.
--
-- No unique constraint on this table, so idempotency is via NOT EXISTS per row.
INSERT INTO waste_source (created_by, updated_by, healthcare_facility_id, source_type, internal_source_name, is_active)
SELECT 'system_init', 'system_init', 820678, 'INTERNAL', 'Sugery Room 1', true
WHERE NOT EXISTS (
    SELECT 1 FROM waste_source
    WHERE healthcare_facility_id = 820678 AND source_type = 'INTERNAL' AND internal_source_name = 'Sugery Room 1'
);

INSERT INTO waste_source (created_by, updated_by, healthcare_facility_id, source_type, internal_source_name, is_active)
SELECT 'system_init', 'system_init', 820678, 'INTERNAL', 'General Ward', true
WHERE NOT EXISTS (
    SELECT 1 FROM waste_source
    WHERE healthcare_facility_id = 820678 AND source_type = 'INTERNAL' AND internal_source_name = 'General Ward'
);

INSERT INTO waste_source (created_by, updated_by, healthcare_facility_id, source_type, internal_treatment_name, is_active)
SELECT 'system_init', 'system_init', 820678, 'INTERNAL_TREATMENT', 'PYROLYSIS', true
WHERE NOT EXISTS (
    SELECT 1 FROM waste_source
    WHERE healthcare_facility_id = 820678 AND source_type = 'INTERNAL_TREATMENT' AND internal_treatment_name = 'PYROLYSIS'
);

INSERT INTO waste_source (created_by, updated_by, healthcare_facility_id, source_type, internal_treatment_name, is_active)
SELECT 'system_init', 'system_init', 820678, 'INTERNAL_TREATMENT', 'DISINFECTION', true
WHERE NOT EXISTS (
    SELECT 1 FROM waste_source
    WHERE healthcare_facility_id = 820678 AND source_type = 'INTERNAL_TREATMENT' AND internal_treatment_name = 'DISINFECTION'
);

INSERT INTO waste_source (created_by, updated_by, healthcare_facility_id, source_type, external_healthcare_facility_id, is_active)
SELECT 'system_init', 'system_init', 820678, 'EXTERNAL', 1, true
WHERE NOT EXISTS (
    SELECT 1 FROM waste_source
    WHERE healthcare_facility_id = 820678 AND source_type = 'EXTERNAL' AND external_healthcare_facility_id = 1
);

INSERT INTO waste_source (created_by, updated_by, healthcare_facility_id, source_type, external_healthcare_facility_id, is_active)
SELECT 'system_init', 'system_init', 820678, 'EXTERNAL', 2, true
WHERE NOT EXISTS (
    SELECT 1 FROM waste_source
    WHERE healthcare_facility_id = 820678 AND source_type = 'EXTERNAL' AND external_healthcare_facility_id = 2
);
