import type { Kysely } from "kysely"
import { sql } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

// Rolling window of daily partitions created up-front so writes never hit a
// missing partition before the retention CLI job (audit-log-retention) has a
// chance to run for the first time. The job keeps this window rolling forward
// and drops partitions older than the configured retention
// (system_settings.audit_log.retention_days).
const INITIAL_PARTITION_DAYS = 40

const pad2 = (n: number) => String(n).padStart(2, "0")

export const partitionName = (date: Date): string => {
  return `p${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}`
}

export const partitionBoundary = (date: Date): string => {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

export const PARTITION_MAX = "pmax"

/**
 * Daily partitions still missing, as [name, boundary] pairs (all derived from
 * Date formatting only). `lastBoundary` is the highest existing daily
 * boundary ('YYYY-MM-DD', exclusive upper bound) or null; `targetLastBoundary`
 * is the last boundary that must exist. Idempotent: returns [] when covered.
 */
export const missingDailyPartitions = (
  lastBoundary: string | null,
  targetLastBoundary: Date
): Array<{ name: string; boundary: string }> => {
  const target = partitionBoundary(targetLastBoundary)
  const result: Array<{ name: string; boundary: string }> = []
  const cursor = lastBoundary
    ? new Date(`${lastBoundary}T00:00:00Z`)
    : new Date(targetLastBoundary)
  if (!lastBoundary) cursor.setUTCDate(cursor.getUTCDate() - 1)
  if (Number.isNaN(cursor.getTime())) return result
  for (;;) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const boundary = partitionBoundary(cursor)
    if (boundary > target) break
    result.push({ name: partitionName(cursor), boundary })
  }
  return result
}

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("audit_logs")
    .addColumn("id", "bigint", (col) => col.autoIncrement().notNull())
    .addColumn("program_id", "bigint")
    // Nullable: interop admin routes and logins without a resolvable id have no actor.
    .addColumn("actor_id", "bigint")
    // Set by publishers whose actor_id is not from this service's users table
    // (e.g. WMS); left null otherwise and resolved by a users join at read time.
    .addColumn("actor_name", "varchar(255)")
    .addColumn("actor_role", "varchar(50)")
    .addColumn("action", "varchar(50)", (col) => col.notNull())
    .addColumn("module", "varchar(100)", (col) => col.notNull())
    // Originating service: core | main | warehouse | auth | interop | wms.
    .addColumn("service", "varchar(30)")
    .addColumn("entity_id", "bigint")
    .addColumn("metadata", "json")
    .addColumn("ip", "varchar(255)")
    // datetime, not timestamp: MySQL's PARTITION BY RANGE COLUMNS rejects
    // TIMESTAMP columns ("not allowed type for this type of partitioning").
    .addColumn("created_at", "datetime", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    // Composite PK (id, created_at): MySQL requires every unique key
    // (including the primary key) to contain the partitioning column.
    .addPrimaryKeyConstraint("audit_logs_pk", ["id", "created_at"])
    .execute()

  await db.schema
    .createIndex("idx_audit_logs_module_entity_id")
    .on("audit_logs")
    .columns(["module", "entity_id"])
    .execute()

  await db.schema
    .createIndex("idx_audit_logs_created_at")
    .on("audit_logs")
    .column("created_at")
    .execute()

  await db.schema
    .createIndex("idx_audit_logs_actor_id")
    .on("audit_logs")
    .column("actor_id")
    .execute()

  await db.schema
    .createIndex("idx_audit_logs_service_created_at")
    .on("audit_logs")
    .columns(["service", "created_at"])
    .execute()

  const today = new Date()
  const partitions: string[] = []
  for (let i = 0; i < INITIAL_PARTITION_DAYS; i++) {
    const boundaryDate = new Date(today)
    boundaryDate.setUTCDate(today.getUTCDate() + i + 1)
    partitions.push(
      `PARTITION ${partitionName(boundaryDate)} VALUES LESS THAN ('${partitionBoundary(boundaryDate)}')`
    )
  }
  // Catch-all so an insert never fails if the retention job misses a run;
  // the job splits it with REORGANIZE PARTITION.
  partitions.push(`PARTITION ${PARTITION_MAX} VALUES LESS THAN (MAXVALUE)`)

  await sql`
    ALTER TABLE audit_logs
    PARTITION BY RANGE COLUMNS(created_at) (
      ${sql.raw(partitions.join(",\n      "))}
    )
  `.execute(db)

  await db.schema
    .createTable("system_settings")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("key", "varchar(100)", (col) => col.notNull())
    .addColumn("value", "varchar(255)", (col) => col.notNull())
    .$call(addTimestampColumns)
    .addUniqueConstraint("uq_system_settings_key", ["key"])
    .execute()

  await db
    .insertInto("system_settings")
    .values({ key: "audit_log.retention_days", value: "7" })
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("system_settings").execute()
  await db.schema.dropTable("audit_logs").execute()
}
