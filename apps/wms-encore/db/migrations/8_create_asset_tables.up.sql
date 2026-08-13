CREATE TABLE asset_manufacturer (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TYPE asset_type AS ENUM ('SCALE', 'INCINERATOR', 'AUTOCLAVE', 'COLD_STORAGE');

CREATE TABLE asset_model (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    asset_type asset_type NOT NULL,
    manufacturer_id INTEGER NOT NULL REFERENCES asset_manufacturer (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TABLE healthcare_asset (
    id SERIAL PRIMARY KEY,
    asset_id TEXT,
    asset_type_name TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    asset_working_status_name TEXT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

-- TEXT, not SERIAL — the original's autoIncrement is dead in practice,
-- callers always supply asset_id explicitly as a string (reused from an
-- existing healthcare_asset id in the original flow).
CREATE TABLE asset_dongle (
    asset_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TYPE asset_status AS ENUM (
    'OPERATIONAL', 'UNDER_MAINTAINENCE', 'OUT_OF_SERVICE', 'IDLE', 'RETIRED'
);

CREATE TABLE healthcare_facility_asset (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    healthcare_facility_id INTEGER NOT NULL,
    model_id INTEGER NOT NULL REFERENCES asset_model (id),
    is_iot_enabled BOOLEAN NOT NULL DEFAULT false,
    asset_id TEXT,
    asset_status asset_status,
    warranty_start_date DATE,
    warranty_end_date DATE,
    year_of_production INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TYPE activity_type AS ENUM ('MAINTENANCE', 'CALIBRATION');

-- No updated_at — original model has timestamps:true but updatedAt:false.
CREATE TABLE healthcare_facility_asset_activity (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    hf_asset_id INTEGER NOT NULL REFERENCES healthcare_facility_asset (id),
    operator_id TEXT,
    activity_type activity_type,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

-- waste_source_id/waste_classification_id reference tables that don't exist
-- yet (waste domain, not built) — no FK constraint until then.
CREATE TABLE qr_code_config (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    healthcare_facility_id INTEGER NOT NULL,
    waste_source_id INTEGER NOT NULL,
    waste_classification_id INTEGER NOT NULL,
    label_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);
