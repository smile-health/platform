import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types/index.js"

// Moves audit_logs partition maintenance into MySQL itself (Event Scheduler),
// so retention no longer depends on an external cron calling the CLI.
//
// Prerequisites: event_scheduler=ON on the server (SET GLOBAL event_scheduler =
// ON, or event_scheduler=ON in my.cnf), and the migration user needs EVENT,
// CREATE ROUTINE, ALTER and DROP on the schema. The event runs with the
// definer's privileges. If any of this is unavailable, run
// `pnpm cron:audit-log-retention` from an external scheduler instead; it calls
// the same procedure (or falls back to equivalent TS logic).
//
// created_at is written in UTC, so the procedure uses UTC_DATE() throughout,
// independent of the server time zone. Partition names are pYYYYMMDD and equal
// their exclusive upper boundary date (same convention as the table migration).

export const AUDIT_LOG_MAINTAIN_PROCEDURE = "audit_log_maintain_partitions"
export const AUDIT_LOG_RETENTION_EVENT = "audit_log_retention_daily"

export const DROP_PROCEDURE_SQL = `DROP PROCEDURE IF EXISTS ${AUDIT_LOG_MAINTAIN_PROCEDURE}`
export const DROP_EVENT_SQL = `DROP EVENT IF EXISTS ${AUDIT_LOG_RETENTION_EVENT}`

export const CREATE_PROCEDURE_SQL = `
CREATE PROCEDURE ${AUDIT_LOG_MAINTAIN_PROCEDURE}()
BEGIN
  DECLARE v_raw VARCHAR(255) DEFAULT NULL;
  DECLARE v_retention INT DEFAULT 7;
  DECLARE v_target DATE;
  DECLARE v_last DATE DEFAULT NULL;
  DECLARE v_cutoff DATE;
  DECLARE v_parts TEXT DEFAULT '';
  DECLARE v_name VARCHAR(64);
  DECLARE v_done INT DEFAULT 0;

  DECLARE cur_expired CURSOR FOR
    SELECT PARTITION_NAME
    FROM information_schema.PARTITIONS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'audit_logs'
      AND PARTITION_NAME REGEXP '^p[0-9]{8}$'
      AND STR_TO_DATE(LEFT(REPLACE(PARTITION_DESCRIPTION, '''', ''), 10), '%Y-%m-%d') <= v_cutoff
    ORDER BY PARTITION_ORDINAL_POSITION;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

  -- 1. Retention: system_settings value, default 7, clamped to 1..90.
  SELECT value INTO v_raw
  FROM system_settings
  WHERE \`key\` = 'audit_log.retention_days' AND deleted_at IS NULL
  LIMIT 1;
  IF v_raw REGEXP '^[0-9]+$' THEN
    SET v_retention = LEAST(90, GREATEST(1, CAST(v_raw AS UNSIGNED)));
  END IF;

  -- 2. Create every missing daily partition up to today + 2 (UTC).
  SET v_target = UTC_DATE() + INTERVAL 2 DAY;

  SELECT MAX(STR_TO_DATE(LEFT(REPLACE(PARTITION_DESCRIPTION, '''', ''), 10), '%Y-%m-%d'))
    INTO v_last
  FROM information_schema.PARTITIONS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'audit_logs'
    AND PARTITION_NAME REGEXP '^p[0-9]{8}$';

  IF v_last IS NULL THEN
    SET v_last = v_target - INTERVAL 1 DAY;
  END IF;

  WHILE v_last < v_target DO
    SET v_last = v_last + INTERVAL 1 DAY;
    SET v_parts = CONCAT(
      v_parts,
      'PARTITION p', DATE_FORMAT(v_last, '%Y%m%d'),
      ' VALUES LESS THAN (''', DATE_FORMAT(v_last, '%Y-%m-%d'), '''), '
    );
  END WHILE;

  IF v_parts <> '' THEN
    SET @audit_log_ddl = CONCAT(
      'ALTER TABLE audit_logs REORGANIZE PARTITION pmax INTO (',
      v_parts,
      'PARTITION pmax VALUES LESS THAN (MAXVALUE))'
    );
    PREPARE audit_log_stmt FROM @audit_log_ddl;
    EXECUTE audit_log_stmt;
    DEALLOCATE PREPARE audit_log_stmt;
  END IF;

  -- 3. Drop daily partitions whose exclusive boundary <= today - retention.
  -- pmax never matches the name pattern, so it is never dropped.
  SET v_cutoff = UTC_DATE() - INTERVAL v_retention DAY;

  -- The NOT FOUND handler also fires on an empty SELECT ... INTO above
  -- (missing setting row); reset it so the drop loop still runs.
  SET v_done = 0;
  OPEN cur_expired;
  drop_loop: LOOP
    FETCH cur_expired INTO v_name;
    IF v_done = 1 THEN
      LEAVE drop_loop;
    END IF;
    SET @audit_log_ddl = CONCAT('ALTER TABLE audit_logs DROP PARTITION ', v_name);
    PREPARE audit_log_stmt FROM @audit_log_ddl;
    EXECUTE audit_log_stmt;
    DEALLOCATE PREPARE audit_log_stmt;
  END LOOP;
  CLOSE cur_expired;
END`

export const CREATE_EVENT_SQL = `
CREATE EVENT ${AUDIT_LOG_RETENTION_EVENT}
  ON SCHEDULE EVERY 1 DAY
  STARTS (UTC_DATE() + INTERVAL 1 DAY + INTERVAL 5 MINUTE)
  DO CALL ${AUDIT_LOG_MAINTAIN_PROCEDURE}()`

export async function up(db: Kysely<Database>): Promise<void> {
  // One statement per execute(): the driver has multipleStatements off.
  await sql.raw(DROP_PROCEDURE_SQL).execute(db)
  await sql.raw(CREATE_PROCEDURE_SQL).execute(db)
  await sql.raw(DROP_EVENT_SQL).execute(db)
  await sql.raw(CREATE_EVENT_SQL).execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql.raw(DROP_EVENT_SQL).execute(db)
  await sql.raw(DROP_PROCEDURE_SQL).execute(db)
}
