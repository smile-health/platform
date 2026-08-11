-- Mirrors apps/wms-service's DisposalModel/DisposalItemsModel (tables
-- `disposal` / `disposal_items`, both Sequelize `paranoid: true`). status is
-- kept as TEXT (not a Postgres ENUM), same convention as manual_scale_request
-- (migration 12) and waste_bag/waste_treatment_group (migrations 9/10).
CREATE TABLE disposal (
    id BIGSERIAL PRIMARY KEY,
    entity_id BIGINT NOT NULL,
    bast_no TEXT NOT NULL,
    description TEXT,
    created_name TEXT,
    entity_name TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejected_by TEXT,
    rejected_at TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE INDEX disposal_is_read ON disposal (is_read);
CREATE INDEX disposal_created_at ON disposal (created_at);
CREATE INDEX disposal_bast_no ON disposal (bast_no);
CREATE INDEX disposal_entity_name ON disposal (entity_name);

CREATE TABLE disposal_items (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL,
    bast_no TEXT NOT NULL,
    material_name TEXT NOT NULL,
    qty NUMERIC(10, 2),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE INDEX disposal_items_material_id ON disposal_items (material_id);
CREATE INDEX disposal_items_bast_no ON disposal_items (bast_no);
CREATE INDEX disposal_items_material_name ON disposal_items (material_name);
