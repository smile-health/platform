ALTER TABLE entities DROP COLUMN deleted_by;
ALTER TABLE entities DROP COLUMN deleted_at;
ALTER TABLE entities ALTER COLUMN percentage_bad_room TYPE INTEGER USING percentage_bad_room::INTEGER;
ALTER TABLE entities ALTER COLUMN id_satu_sehat TYPE INTEGER USING id_satu_sehat::INTEGER;
