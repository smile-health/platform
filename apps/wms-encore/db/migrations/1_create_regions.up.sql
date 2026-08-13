CREATE TYPE region_type AS ENUM (
    'COUNTRY', 'PROVINCE/STATE', 'CITY', 'DISTRICT', 'SUB-DISTRICT', 'VILLAGE'
);

-- INTEGER, not BIGINT: node-postgres returns bigint columns as strings (to avoid
-- precision loss), which would make `id` a string over the wire — the original
-- Sequelize INTEGER column returns a plain JS number, and callers rely on that.
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    region_type region_type NOT NULL,
    parent_id INTEGER REFERENCES regions (id),
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ
);
