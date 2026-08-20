-- Fixes two type-narrowing regressions vs the original wms-service Sequelize
-- model (EntitiesModel.ts): id_satu_sehat was BIGINT there, percentage_bad_room
-- was FLOAT(7,2) — migration 4 narrowed both to INTEGER, risking overflow on
-- id_satu_sehat and losing decimal precision on percentage_bad_room. Widening
-- via a new migration rather than editing migration 4, which may already be
-- applied in deployed environments.
ALTER TABLE entities ALTER COLUMN id_satu_sehat TYPE BIGINT;
ALTER TABLE entities ALTER COLUMN percentage_bad_room TYPE NUMERIC(7, 2);

-- The original Entities model was `paranoid: true` with a `deleted_at` column,
-- which Sequelize used to auto-filter soft-deleted rows out of every query.
-- Migration 4 dropped the column entirely, so soft-deleted entities (if any
-- are ever created) would leak into every list/get query with no way to
-- filter them out. Added here rather than migration 4 for the same
-- already-applied-migration reason as above.
ALTER TABLE entities ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE entities ADD COLUMN deleted_by BIGINT;
