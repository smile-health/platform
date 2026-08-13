CREATE TABLE global_settings (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    setting_name TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);
