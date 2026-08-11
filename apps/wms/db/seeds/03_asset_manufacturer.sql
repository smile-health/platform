-- Seed: asset_manufacturer.
-- Source: apps/wms-service/db/seeders/20250424072759-aset_manufactures.js
-- No unique constraint on `name` in db/migrations/8_create_asset_tables.up.sql, so idempotency
-- is via a NOT EXISTS guard per row rather than ON CONFLICT.
INSERT INTO asset_manufacturer (created_by, updated_by, name, description)
SELECT 'system_init', 'system_init', v.name, v.name || ' Manufacturer'
FROM (
    VALUES
        ('Telkomsel'),
        ('Barloworld'),
        ('VersaCold'),
        ('Cloverleaf'),
        ('Henningsen'),
        ('Doing'),
        ('Henan'),
        ('Naugra'),
        ('Samart')
) AS v (name)
WHERE NOT EXISTS (
    SELECT 1 FROM asset_manufacturer am WHERE am.name = v.name
);
