-- treatment_status/transportation_status kept as TEXT here too (not real
-- enums), same rationale as waste_bag — these group tables' status columns
-- are read/written by multiple modules and the value sets already overlap
-- inconsistently across the original codebase (documented per-module).

-- Table name is waste_treatment_group (NOT waste_bag_treatment_group) —
-- folder/route naming diverges from the physical table.
CREATE TABLE waste_treatment_group (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    total_bags_count INTEGER NOT NULL DEFAULT 1,
    total_weight_in_kgs INTEGER NOT NULL,
    treatment_asset_id INTEGER,
    treatment_operator_id INTEGER,
    handover_lattitude DOUBLE PRECISION,
    handover_longitude DOUBLE PRECISION,
    treatment_status TEXT NOT NULL DEFAULT 'IN_TEMPORARY_STORAGE',
    handover_timestamp TIMESTAMPTZ,
    is_read_only BOOLEAN NOT NULL DEFAULT false,
    group_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

-- Table name is waste_treatment_request (NOT waste_bag_treatment_request).
CREATE TABLE waste_treatment_request (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    request_status TEXT,
    treatment_group_id INTEGER NOT NULL REFERENCES waste_treatment_group (id),
    request_creator_id INTEGER,
    request_approver_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TABLE waste_transportation_group (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    total_bags_count INTEGER NOT NULL DEFAULT 1,
    total_weight_in_kgs INTEGER NOT NULL,
    transporter_vehicle_id INTEGER,
    transporter_operator_id TEXT,
    handover_lattitude DOUBLE PRECISION,
    handover_longitude DOUBLE PRECISION,
    transportation_status TEXT NOT NULL DEFAULT 'READY_FOR_TRANSPORT',
    handover_timestamp TIMESTAMPTZ,
    is_read_only BOOLEAN NOT NULL DEFAULT false,
    group_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TABLE waste_transportation_request (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    request_status TEXT,
    transportation_group_id INTEGER NOT NULL REFERENCES waste_transportation_group (id),
    request_creator_id INTEGER,
    request_approver_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

-- waste_treatment_external_group_id FK added after that table exists below.
CREATE TABLE waste_transportation_external_group (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    total_bags_count INTEGER NOT NULL DEFAULT 1,
    total_weight_in_kgs INTEGER NOT NULL,
    transporter_id INTEGER NOT NULL,
    transporter_vehicle_id INTEGER,
    transporter_operator_id TEXT,
    treatment_provider_id INTEGER,
    treatment_operator_id TEXT,
    handover_lattitude DOUBLE PRECISION,
    handover_longitude DOUBLE PRECISION,
    handover_timestamp TIMESTAMPTZ,
    transportation_status TEXT NOT NULL DEFAULT 'READY_FOR_TRANSPORT',
    is_read_only BOOLEAN NOT NULL DEFAULT false,
    group_id TEXT NOT NULL,
    waste_treatment_external_group_id INTEGER,
    pickup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

CREATE TABLE waste_treatment_external_group (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    total_bags_count INTEGER NOT NULL DEFAULT 1,
    total_weight_in_kgs INTEGER NOT NULL,
    treatment_provider_id INTEGER,
    source_external_transportation_group_id INTEGER NOT NULL REFERENCES waste_transportation_external_group (id),
    treatment_operator_id TEXT,
    transportation_status TEXT NOT NULL DEFAULT 'STORED_FOR_TREATMENT',
    is_read_only BOOLEAN NOT NULL DEFAULT false,
    group_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER
);

ALTER TABLE waste_transportation_external_group
    ADD CONSTRAINT fk_waste_transportation_external_group_treatment
    FOREIGN KEY (waste_treatment_external_group_id) REFERENCES waste_treatment_external_group (id);

-- Now that the four group tables exist, wire the FKs waste_bag/waste_bag_record
-- left unconstrained (migration 9's comment) into real references.
ALTER TABLE waste_bag ADD CONSTRAINT fk_waste_bag_treatment_group
    FOREIGN KEY (waste_treatment_group_id) REFERENCES waste_treatment_group (id);
ALTER TABLE waste_bag ADD CONSTRAINT fk_waste_bag_transportation_group
    FOREIGN KEY (waste_transportation_group_id) REFERENCES waste_transportation_group (id);
ALTER TABLE waste_bag ADD CONSTRAINT fk_waste_bag_treatment_external_group
    FOREIGN KEY (waste_treatment_external_group_id) REFERENCES waste_treatment_external_group (id);
ALTER TABLE waste_bag ADD CONSTRAINT fk_waste_bag_transportation_external_group
    FOREIGN KEY (waste_transportation_external_group_id) REFERENCES waste_transportation_external_group (id);

ALTER TABLE waste_bag_record ADD CONSTRAINT fk_waste_bag_record_treatment_group
    FOREIGN KEY (waste_treatment_group_id) REFERENCES waste_treatment_group (id);
ALTER TABLE waste_bag_record ADD CONSTRAINT fk_waste_bag_record_transportation_group
    FOREIGN KEY (waste_transportation_group_id) REFERENCES waste_transportation_group (id);
ALTER TABLE waste_bag_record ADD CONSTRAINT fk_waste_bag_record_treatment_external_group
    FOREIGN KEY (waste_treatment_external_group_id) REFERENCES waste_treatment_external_group (id);
ALTER TABLE waste_bag_record ADD CONSTRAINT fk_waste_bag_record_transportation_external_group
    FOREIGN KEY (waste_transportation_external_group_id) REFERENCES waste_transportation_external_group (id);
