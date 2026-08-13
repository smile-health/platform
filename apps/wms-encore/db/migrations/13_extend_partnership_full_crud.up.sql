-- Extends the partnership stand-in table (see migrations 5/7's comments —
-- id/consumer_id/provider_id/transporter_id already exist) with the rest of
-- apps/wms-service's infrastructure/database/models/PartnershipModel.ts's
-- columns, now that the real partnership/partnership CRUD module
-- (Create/Update/Delete/Get/List) is landing rather than just the join-table
-- stand-in sibling modules needed.

CREATE TYPE partnership_consumer_type AS ENUM (
    'HEALTHCARE_FACILITY', 'TRANSPORTER', 'TRANSPORTER_RECYCLER',
    'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL',
    'TRANSPORTER_TREATMENT', 'TRANSPORTER_TREATMENT_PROVIDER'
);

CREATE TYPE partnership_provider_type AS ENUM (
    'LANDFILLER', 'TREATMENT_PROVIDER', 'RECYCLER', 'TREATMENT',
    'SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER', 'TRANSPORTER_RECYCLER',
    'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER', 'TRANSPORTER_LANDFILL',
    'TRANSPORTER_TREATMENT', 'TRANSPORTER_TREATMENT_PROVIDER',
    'TRANSPORTER_GOVERNMENT', 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
);

CREATE TYPE partnership_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED');

ALTER TABLE partnership ADD COLUMN created_by TEXT NOT NULL DEFAULT '';
ALTER TABLE partnership ADD COLUMN updated_by TEXT;
ALTER TABLE partnership ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE partnership ADD COLUMN updated_at TIMESTAMPTZ;
ALTER TABLE partnership ADD COLUMN contract_id TEXT;
ALTER TABLE partnership ADD COLUMN contract_start_date DATE;
ALTER TABLE partnership ADD COLUMN contract_end_date DATE;
ALTER TABLE partnership ADD COLUMN consumer_type partnership_consumer_type NOT NULL DEFAULT 'HEALTHCARE_FACILITY';
ALTER TABLE partnership ADD COLUMN waste_classification_id INTEGER REFERENCES waste_classification (id);
ALTER TABLE partnership ADD COLUMN provider_type partnership_provider_type;
ALTER TABLE partnership ADD COLUMN partnership_status partnership_status NOT NULL DEFAULT 'PENDING';
ALTER TABLE partnership ADD COLUMN has_incinerator BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE partnership ADD COLUMN has_autoclave BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE partnership ADD COLUMN pic_name TEXT;
ALTER TABLE partnership ADD COLUMN pic_position TEXT;
ALTER TABLE partnership ADD COLUMN pic_phone_number TEXT;
ALTER TABLE partnership ADD COLUMN price_per_kg NUMERIC(10, 2);
ALTER TABLE partnership ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE partnership ADD COLUMN deleted_by INTEGER;

CREATE INDEX idx_partnership_consumer_id ON partnership (consumer_id);
CREATE INDEX idx_partnership_provider_id ON partnership (provider_id);
CREATE INDEX idx_partnership_waste_classification_id ON partnership (waste_classification_id);
