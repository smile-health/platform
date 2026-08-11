CREATE TABLE waste_bag_audit_trail (
    id SERIAL PRIMARY KEY,
    waste_bag_id INTEGER NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
