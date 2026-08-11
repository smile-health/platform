-- Seed: user_role.
--
-- The old wms-service seeder history for this table is:
--   1. 20250422062048-...-user_role.js   -> 5 roles (system_admin, hf_admin, ...)
--   2. 20250707031603-list_roles.js      -> TRUNCATEs and replaces with 16 Indonesian-named roles
--   3. 20250825044731-add_more_role.js   -> appends 4 more roles + adds a `type` column, backfilled
--   4. 20251021021505-list_roles_new.js  -> TRUNCATEs again and replaces with the FINAL 12 roles below,
--                                          this time with explicit ids, `type`, and `name_en`.
-- Since (4) truncates and fully replaces the table, it supersedes (1)-(3) entirely — the roles from
-- those earlier seeders no longer exist in the source system. This seed reproduces only the final
-- state from list_roles_new.js.
--
-- The wms-encore `user_role` table (db/migrations/5_create_partnership_users_notification_tables.up.sql)
-- additionally requires `name_en` and `type` as NOT NULL, which matches list_roles_new.js's shape
-- (unlike the earlier seeders, which predate those columns).
--
-- Explicit ids are preserved from the source seeder for referential stability. There is no UNIQUE
-- constraint on `name`, so idempotency here is via ON CONFLICT (id) instead.
INSERT INTO user_role (id, created_by, updated_by, region_id, name, description, type, name_en)
SELECT v.id, 'system_init', 'system_init', r.id, v.name, NULL, v.type, v.name_en
FROM (
    VALUES
        (1, 'Super Admin', 'super_admin', 'Super Admin'),
        (2, 'Admin', 'admin', 'Admin'),
        (3, 'Manager', 'manager', 'Manager'),
        (4, 'Operator', 'operator', 'Operator'),
        (5, 'Sanitarian', 'sanitarian', 'Sanitarian'),
        (6, 'Operator Pengangkut', 'operator_transporter', 'Operator Transporter'),
        (7, 'Operator Pengolah', 'operator_treatment', 'Operator Treatment'),
        (8, 'Operator Penimbus', 'operator_landfill', 'Operator Landfill'),
        (9, 'Operator Pemanfaat', 'operator_recycler', 'Operator Recycler'),
        (10, 'Operator Pengangkut Khusus', 'operator_specialized_transport', 'Operator Specialized Transport'),
        (11, 'Pengangkut Limbah Lokal', 'operator_goverment', 'Operator Local Transporter'),
        (12, 'Operator Bank Sampah', 'operator_waste_bank', 'Operator Waste Bank')
) AS v (id, name, type, name_en)
JOIN regions r ON r.code = 'INDO'
ON CONFLICT (id) DO NOTHING;

-- Keep the SERIAL sequence ahead of the explicit ids we just inserted so future
-- inserts (via the API, not this seed) don't collide with id 1..12.
SELECT setval(
    pg_get_serial_sequence('user_role', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM user_role), 1)
);
