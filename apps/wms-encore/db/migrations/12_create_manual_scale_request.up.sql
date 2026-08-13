-- Mirrors apps/wms-service's ManualScaleRequestModel (table `manual_scale_request`,
-- Sequelize `paranoid: true` soft-delete). status/approval_type are kept as TEXT
-- (not real enums) rather than Postgres ENUM types, same convention as
-- waste_bag/waste_treatment_group's status columns (migration 9/10's comments) —
-- easier to extend without an ALTER TYPE later, and Zod already constrains the
-- values at the API boundary (see manual-scale-request.schema.ts).
CREATE TABLE manual_scale_request (
    id BIGSERIAL PRIMARY KEY,
    requested_by TEXT NOT NULL,
    processed_by TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'PENDING',
    approval_type TEXT,
    valid_until TIMESTAMPTZ,
    count_limit INTEGER,
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);

CREATE INDEX manual_scale_request_requested_by ON manual_scale_request (requested_by);
CREATE INDEX manual_scale_request_created_at ON manual_scale_request (created_at);
CREATE INDEX manual_scale_request_entity_id ON manual_scale_request (entity_id);
