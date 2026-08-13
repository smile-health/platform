CREATE TABLE entity_settings (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL,
    setting_name TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Most columns nullable: mirrors the original Entities model, which is wide
-- and sparsely populated depending on entity type.
CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type INTEGER,
    address TEXT,
    tag TEXT,
    province_id TEXT,
    regency_id TEXT,
    sub_district_id TEXT,
    village_id TEXT,
    integration_type INTEGER,
    integration_client_id INTEGER,
    location TEXT,
    external_properties JSONB,
    entity_type_id INTEGER,
    code TEXT,
    nib TEXT,
    head_name TEXT,
    email TEXT,
    gender INTEGER,
    mobile_phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    id_satu_sehat INTEGER,
    total_bad_room INTEGER,
    percentage_bad_room INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE entity_location (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance_limit_in_meters INTEGER,
    address TEXT,
    province_id INTEGER,
    city_id INTEGER,
    province_name TEXT,
    city_name TEXT,
    location_type TEXT NOT NULL CHECK (location_type IN ('STORAGE', 'TREATMENT')),
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);
