-- partner_vehicle referenced by partnership_vehicle_map's FK below, so it must
-- be created first even though its own module (partnership/partner-vehicle)
-- is a sibling, not an owner, of this migration file.
CREATE TYPE vehicle_type AS ENUM (
    'BOX_TRUCK', 'REFRIGERATED_BOX_TRUCK', 'OPEN_BODY_TRUCK', 'TANKER',
    'HAZARDOUS_MATERIAL_TRUCK', 'RADIOACTIVE_MATERIAL_TRUCK', 'FLATBED_TRUCK',
    'LOADER_TRUCK', 'TRAILER', 'VAN'
);

CREATE TABLE partner_vehicle (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    vehicle_number TEXT NOT NULL UNIQUE,
    capacity_in_kgs INTEGER NOT NULL DEFAULT 1,
    transporter_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

-- Minimal stand-in for the real partnership/partnership module's own table
-- (not built yet) — just enough for partnership_vehicle_map's join. Extend,
-- don't replace, when the real partnership CRUD module lands.
CREATE TABLE partnership (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL
);

-- Composite PK, no surrogate id — mirrors the original's paranoid join table.
CREATE TABLE partnership_vehicle_map (
    partnership_id INTEGER NOT NULL REFERENCES partnership (id),
    vehicle_id INTEGER NOT NULL REFERENCES partner_vehicle (id),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER,
    PRIMARY KEY (partnership_id, vehicle_id)
);
CREATE INDEX idx_partnership_vehicle_map_partnership_id ON partnership_vehicle_map (partnership_id);
CREATE INDEX idx_partnership_vehicle_map_vehicle_id ON partnership_vehicle_map (vehicle_id);

CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    region_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TABLE user_fcm_token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    entity_id INTEGER NOT NULL,
    user_uuid TEXT NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);
CREATE INDEX idx_user_fcm_token_user_uuid ON user_fcm_token (user_uuid);
CREATE INDEX idx_user_fcm_token_user_id ON user_fcm_token (user_id);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT,
    user_id INTEGER NOT NULL,
    province_id INTEGER,
    regency_id INTEGER,
    entity_id INTEGER NOT NULL,
    media TEXT NOT NULL,
    title TEXT,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ,
    mobile_phone TEXT,
    action_url TEXT,
    download_url TEXT,
    patient_id INTEGER,
    program_id INTEGER,
    for_super_admin BOOLEAN DEFAULT false,
    for_admin BOOLEAN DEFAULT false,
    for_operator BOOLEAN DEFAULT false
);
