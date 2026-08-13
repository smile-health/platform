-- Seed: base region.
-- Source: apps/wms-service/db/seeders/20250419074621-PIC1060-5177-region.js
-- Note: table renamed region -> regions in the Postgres schema (see
-- db/migrations/1_create_regions.up.sql). `code` is UNIQUE there, unlike the
-- old MySQL table, so ON CONFLICT (code) is enough to make this idempotent.
INSERT INTO regions (code, name, region_type, created_by, updated_by)
VALUES ('INDO', 'Indonesia', 'COUNTRY', 'system_init', 'system_init')
ON CONFLICT (code) DO NOTHING;
