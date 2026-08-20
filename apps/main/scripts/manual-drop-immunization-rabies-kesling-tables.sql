-- =============================================================================
-- MANUAL REVIEW SCRIPT — NOT AUTO-EXECUTED
-- =============================================================================
-- Generated as part of the removal of Immunization, Rabies (dengue), and
-- Kesling (environmental health) program-exclusive frontend workspace-menu
-- items and their backing apps/main modules.
--
-- This file is a draft for a HUMAN to review and run manually against each
-- environment (dev/staging/prod) individually. It is NOT wired into any
-- migration runner, CI job, or npm script, and must NOT be executed
-- automatically.
--
-- Before running against any environment:
--   1. Confirm no other service (warehouse-service, sync-service,
--      interop-service, core, platform, auth-service, apps/3.0/*) reads from
--      or writes to the tables below. A repo-wide grep in apps/main on the
--      day this was generated found no cross-module references outside the
--      deleted modules, EXCEPT for the important carve-out described in
--      section 4 below (environmental-parameter-category and its supporting
--      tables were NOT deleted / are NOT in this script) — re-verify against
--      the state of the repo at the time you run this.
--   2. Take a backup / snapshot before running.
--   3. Run inside a transaction where the target engine supports DDL
--      transactions, or run table-by-table with verification in between.
--
-- Tables below are dropped in FK-safe order (children before parents, based
-- on the `.references(...)` foreign keys and drop order declared in the
-- now-deleted migrations' own down() functions).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Immunization — used only by src/modules/immunization (deleted).
-- Source migrations deleted: 1764076837975_ws_patient_immunization.ts,
-- 1764077521215_ws_immunization_weighing_history.ts,
-- 1764144976161_create-ws-patient-immunization-details-table.ts,
-- 1764383061384_alter-ws_material_targets-add-ideal-days-and-immunization-type.ts,
-- 1764644590579_add-is-given-to-ws-patient-immunization-details.ts,
-- 1764684845832_alter_ws_patient_immunizations.ts,
-- 1765067514684_alter_ws_immunization_weighing_history_decimal_precision.ts,
-- 1765236575588_drop-ws-patient-immunization-details-material-target-fk.ts,
-- 1765249669749_add-last-is-given-to-ws-patient-immunization-details.ts,
-- 1765258098000_add-last-status-to-ws-patient-immunization-details.ts,
-- 1765857109865_alter_ws_patient_immunization_details_add_target_group_id.ts.
-- ws_patient_immunization_details references ws_patient_immunizations, so it
-- is dropped first.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_patient_immunization_details;
DROP TABLE IF EXISTS ws_patient_immunizations;
DROP TABLE IF EXISTS ws_immunization_weighing_history;

-- -----------------------------------------------------------------------------
-- Microplanning — used only by src/modules/microplanning (deleted, entire
-- domain: dashboard, immunization-logistics, non-bias/bias-immunization-
-- logistics, target-estimation(-bias/-non-bias), targets, mp-config,
-- activity-plan, priority-areas, problem-solution, map-destination/route/
-- service-point, osrm-route, overview, material-targets).
-- Source migrations deleted: 1764296829471_create-ws-microplanning.ts,
-- 1764297163289_alter_ws_targets_add_microplanning_id_and_status_column.ts,
-- 1764299080885_alter_ws_material_needs_add_microplanning_id_and_status_column.ts,
-- 1765785437369_alter_ws_microplan_targets_consumptions_add_microplanning_id.ts,
-- 1777450267695_create-table-ws_microplanning_patient_targets.ts,
-- 1777521886882_fix-ws-microplanning-entity-id-global-to-local.ts,
-- 1777530939923_create-table-ws_microplanning_config.ts,
-- 1777531506039_create-ws_microplanning_problem_solutions.ts,
-- 1777692936296_create-ws-microplanning-priority-areas.ts,
-- 1779260631425_add-column-reff-ws_microplanning_patient_targets.ts,
-- 1779300000000_create-ws_microplanning_activity_plans.ts.
--
-- NOTE: ws_targets and ws_material_needs are NOT dropped here — they are
-- generic tables also used outside microplanning (annual-needs / target-group
-- flows for other still-live programs). Only the microplanning_id/status
-- columns those alter-migrations added are now orphaned; a human should
-- decide whether to drop those specific columns separately after confirming
-- no other code path reads them.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_microplanning_patient_targets;
DROP TABLE IF EXISTS ws_microplanning_activity_plans;
DROP TABLE IF EXISTS ws_microplanning_priority_areas;
DROP TABLE IF EXISTS ws_microplanning_problem_solutions;
DROP TABLE IF EXISTS ws_microplanning_config;
DROP TABLE IF EXISTS ws_microplanning;

-- -----------------------------------------------------------------------------
-- Rabies / Dengue — used only by src/modules/dengue (dengue-case,
-- sentinel-surveillance) (deleted).
-- Source migrations deleted: 1764310869049_create_ws_patient_dengues.ts,
-- 1764646641978_alter_ws_patient_dengues.ts.
--
-- NOTE: migration 1767336417947_seed-rules-rabies-dengue-etc.ts was
-- DELIBERATELY KEPT (NOT deleted) because it seeds/truncates the SHARED
-- tables `protocols`, `vaccine_methods`, `vaccine_types`,
-- `ws_vaccine_sequences`, and `ws_vaccine_rules` — all of which back the
-- generic, still-live `protocol` module used by other programs. Do NOT drop
-- those tables here. Only ws_patient_dengues (Rabies/Dengue-specific patient
-- data) is dropped.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_patient_dengues;

-- -----------------------------------------------------------------------------
-- Kesling / Environmental Health & History — used only by
-- src/modules/environmental-health and
-- src/modules/environmental-health-history (deleted).
-- environmental_health/environmental-health-history do not have a dedicated
-- table of their own in this migration set (they read the ws_environmental_tests
-- family, dropped below); no dedicated table to drop for these two modules.
--
-- UPDATE (this pass): migration 1770404000001_adjust-environmental-health-tables.ts
-- has now been DELETED along with the rest of Section 4 below — see that
-- section for why the contradiction is resolved. It altered ws_environmental_tests
-- (dropped below) and added audit columns to environmental_parameter_categories /
-- environmental_analysis_parameters, both of which are now also dropped.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Kesling / Environmental Test Recording — used only by the deleted
-- ws_environmental_tests-recording feature (NOT the environmental-parameter-
-- category module, which was kept — see section 4 below).
-- Source migrations deleted: 1770197072006_create-ws-environmental-tests.ts,
-- 1770900000000_create-ws-environmental-test-field.ts,
-- 1771917450030_add-activity-id-to-ws-environmental-tests.ts,
-- 1776760557362_create_table_ws_environmental_tests_detail.ts,
-- 1777087356260_alter_ws_environmental_tests.ts,
-- 1778329269536_alter_ws_environmental_tests.ts,
-- 1778645164255_alter_ws_environmental_tests.ts.
-- Children (detail/field) reference ws_environmental_tests, so they are
-- dropped first.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_environmental_tests_detail;
DROP TABLE IF EXISTS ws_environmental_test_field;
DROP TABLE IF EXISTS ws_environmental_tests;

-- -----------------------------------------------------------------------------
-- SECTION 4 — RESOLVED (previously a contradiction, NOT dropped; now executed):
-- environmental_parameter_categories, ws_environmental_parameter_category_details,
-- environmental_parameter_categories_fields, environmental_analysis_parameters,
-- environmental_test_methods, environmental_analysis_parameter_test_methods,
-- environmental_units, environmental_parameter_validation_rules,
-- environmental_parameter_options, ws_activity_environmental_parameter_categories.
--
-- Prior note: these tables (and src/modules/environmental-parameter-category)
-- were kept because the SHARED, generic Activity module
-- (activity.middleware.ts / activity.repository.ts) imported
-- EnvironmentalParameterCategoryRepository and read/wrote the join table
-- `ws_activity_environmental_parameter_categories` to let a generic Activity
-- be tagged with environmental parameter categories.
--
-- RESOLUTION: the user confirmed the Activity environmental-category tagging
-- feature should be removed entirely (Activity itself stays generic/shared).
-- That dependency has now been stripped from activity.middleware.ts,
-- activity.repository.ts, activity.module.ts, and activity.schema.ts (and the
-- corresponding frontend fields in packages/ui/src/pages/activity/*). With
-- zero remaining consumers of EnvironmentalParameterCategoryRepository,
-- src/modules/environmental-parameter-category/ has been deleted, its route
-- registration removed from wire.ts, and its 18 backing migrations deleted
-- (see the DELETE statement below for the full list). The tables below are
-- now dropped in FK-safe order (children referencing
-- environmental_parameter_categories / environmental_analysis_parameters
-- first).
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS ws_activity_environmental_parameter_categories;
DROP TABLE IF EXISTS ws_environmental_parameter_category_details;
DROP TABLE IF EXISTS environmental_parameter_categories_fields;
DROP TABLE IF EXISTS environmental_parameter_validation_rules;
DROP TABLE IF EXISTS environmental_parameter_options;
DROP TABLE IF EXISTS environmental_analysis_parameter_test_methods;
DROP TABLE IF EXISTS environmental_analysis_parameters;
DROP TABLE IF EXISTS environmental_test_methods;
DROP TABLE IF EXISTS environmental_units;
DROP TABLE IF EXISTS environmental_parameter_categories;

-- =============================================================================
-- Remove migration bookkeeping rows for the migrations deleted in this cleanup
-- (kysely's FileMigrationProvider stores the migration `name` as the file
-- basename without the .ts extension; table name confirmed from
-- apps/main/src/common/infrastructure/database/index.ts: migrationTableName
-- = "ws_kysely_migration").
-- =============================================================================
DELETE FROM ws_kysely_migration WHERE name IN (
  '1764076837975_ws_patient_immunization',
  '1764077521215_ws_immunization_weighing_history',
  '1764144976161_create-ws-patient-immunization-details-table',
  '1764296829471_create-ws-microplanning',
  '1764297163289_alter_ws_targets_add_microplanning_id_and_status_column',
  '1764299080885_alter_ws_material_needs_add_microplanning_id_and_status_column',
  '1764383061384_alter-ws_material_targets-add-ideal-days-and-immunization-type',
  '1764644590579_add-is-given-to-ws-patient-immunization-details',
  '1764684845832_alter_ws_patient_immunizations',
  '1765067514684_alter_ws_immunization_weighing_history_decimal_precision',
  '1765236575588_drop-ws-patient-immunization-details-material-target-fk',
  '1765249669749_add-last-is-given-to-ws-patient-immunization-details',
  '1765258098000_add-last-status-to-ws-patient-immunization-details',
  '1765785437369_alter_ws_microplan_targets_consumptions_add_microplanning_id',
  '1765857109865_alter_ws_patient_immunization_details_add_target_group_id',
  '1777450267695_create-table-ws_microplanning_patient_targets',
  '1777521886882_fix-ws-microplanning-entity-id-global-to-local',
  '1777530939923_create-table-ws_microplanning_config',
  '1777531506039_create-ws_microplanning_problem_solutions',
  '1777692936296_create-ws-microplanning-priority-areas',
  '1779260631425_add-column-reff-ws_microplanning_patient_targets',
  '1779300000000_create-ws_microplanning_activity_plans',
  '1764310869049_create_ws_patient_dengues',
  '1764646641978_alter_ws_patient_dengues',
  '1770197072006_create-ws-environmental-tests',
  '1770900000000_create-ws-environmental-test-field',
  '1771917450030_add-activity-id-to-ws-environmental-tests',
  '1776760557362_create_table_ws_environmental_tests_detail',
  '1777087356260_alter_ws_environmental_tests',
  '1778329269536_alter_ws_environmental_tests',
  '1778645164255_alter_ws_environmental_tests',

  -- Section 4 migrations — previously restored/kept, now deleted along with
  -- src/modules/environmental-parameter-category/ (see Section 4 above):
  '1770197072001_create-environmental-parameter-categories',
  '1770197072003_create-environmental-analysis-parameters',
  '1770197072004_create-environmental-analysis-parameter-test-methods',
  '1770197072005_create-environmental-test-methods',
  '1770308258634_create-ws-environmental-parameter-category-details',
  '1770308258635_alter-environmental-analysis-parameters-make-optional',
  '1770308258636_drop-columns-from-environmental-analysis-parameters',
  '1770404000001_adjust-environmental-health-tables',
  '1770404000002_restructure-environmental-test-methods',
  '1770500000001_create-environmental-units',
  '1770500000002_seed-environmental-units',
  '1770500000003_alter-environmental-analysis-parameters-unit-to-unit-id',
  '1770500000004_create-environmental-parameter-validation-rules',
  '1770500000005_create-environmental-parameter-options',
  '1770731664000_create-environmental-parameter-categories-fields',
  '1771917450029_create-ws-activity-environmental-parameter-categories',
  '1772784426404_seed_environmental_master_data',
  '1779356104323_alter_add_status_to_environmental_parameter_categories'
);
