-- Extending the partnership stand-in table (see migration 5's comment) with
-- columns partnership-operator-map's queries need — still not the full
-- partnership CRUD module, just enough for sibling modules' joins.
ALTER TABLE partnership ADD COLUMN provider_id INTEGER;
ALTER TABLE partnership ADD COLUMN transporter_id INTEGER;

CREATE TABLE partnership_operator_map (
    partnership_id INTEGER NOT NULL REFERENCES partnership (id),
    operator_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER,
    PRIMARY KEY (partnership_id, operator_id)
);
CREATE INDEX idx_partnership_operator_map_partnership_id ON partnership_operator_map (partnership_id);
CREATE INDEX idx_partnership_operator_map_operator_id ON partnership_operator_map (operator_id);

-- No SERIAL/auto-increment on id — the original Sequelize model has no
-- auto-increment either; ids are assigned upstream (see users.repository.ts).
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    user_uuid UUID NOT NULL,
    entity_id INTEGER NOT NULL,
    firstname TEXT,
    lastname TEXT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    mobile_phone TEXT,
    gender INTEGER,
    gender_label TEXT,
    date_of_birth DATE,
    role INTEGER,
    role_id INTEGER,
    role_label TEXT,
    view_only BOOLEAN NOT NULL DEFAULT false,
    status INTEGER,
    last_device INTEGER,
    last_login TIMESTAMPTZ,
    integration_client_id INTEGER,
    keycloak_uuid UUID,
    external_roles TEXT,
    address TEXT,
    manufacture_id INTEGER,
    village_id TEXT,
    external_properties JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_by BIGINT,
    is_active BOOLEAN DEFAULT true
);
CREATE INDEX idx_users_entity_id ON users (entity_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_username ON users (username);
