-- Manual cleanup script for the removed "Pasien" (patient bulk-import) and
-- "Populasi" (population) global-settings menu features.
--
-- The frontend global-menu pages backed by this data ("patient-global-view",
-- "patient-global-mutate", "population-view", "population-global-view", etc.)
-- have been removed. The corresponding backend module code
-- (apps/core/src/modules/patient/*.excel.*, apps/core/src/modules/population/*)
-- and its Kysely migrations have also been deleted from the codebase:
--   - 1761783838114_create_patient_import_logs
--   - 1762475594482_create_population_table
--   - 1762817942091_add_province_id_to_populations
--   - 1763000000000_add_unique_key_to_populations
--   - 1765861893769_add-status-to-populations
--
-- Because the migrations were deleted rather than given new "down" migrations,
-- the corresponding tables are NOT dropped automatically by any migration
-- runner. This script must be run MANUALLY, by a human, against each
-- environment's database (dev, staging, prod) -- it is not executed by any
-- automated process (CI, deploy pipeline, `npm run db:migrate`, etc).
--
-- IMPORTANT: Before running this against any environment, confirm that no
-- other service or job still depends on these tables (e.g. reporting exports,
-- data warehouse ETL, sync-service, interop-service). A repo-wide grep at the
-- time this script was written found no other service reading/writing these
-- tables or calling the removed apps/core routes ("/patients",
-- "/annual-planning" population endpoints); apps/main's own unrelated
-- "populations"/"ws_patient_*" tables and modules are a completely separate
-- domain and are NOT affected by or dropped by this script.
--
-- Tables are dropped in dependency-safe order (no FK relationship exists
-- between them, so order here is arbitrary but kept deterministic).

DROP TABLE IF EXISTS patient_import_logs;
DROP TABLE IF EXISTS populations;

-- Remove the migration bookkeeping rows so kysely's migration table no longer
-- references migration files that no longer exist in the repo.
DELETE FROM kysely_migration WHERE name IN (
  '1761783838114_create_patient_import_logs',
  '1762475594482_create_population_table',
  '1762817942091_add_province_id_to_populations',
  '1763000000000_add_unique_key_to_populations',
  '1765861893769_add-status-to-populations'
);
