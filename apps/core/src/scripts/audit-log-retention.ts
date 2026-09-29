import { db } from "@/common/infrastructure/database/index.js"
import {
  missingDailyPartitions,
  PARTITION_MAX,
} from "@/common/infrastructure/database/migrations/1783400000000_create-audit-logs-and-system-settings.js"
import {
  AUDIT_LOG_RETENTION_KEY,
  resolveRetentionDays,
} from "@/modules/audit-log/audit-log.constants.js"
import { sql } from "kysely"

// Keep a couple of days of buffer ahead of "today" so a missed run never
// leaves the table without a partition to write into.
const LOOKAHEAD_DAYS = 2

interface PartitionRow {
  PARTITION_NAME: string | null
  PARTITION_DESCRIPTION: string | null
  TABLE_ROWS?: string | number | null
}

// Manual fallback. The primary mechanism is the MySQL event
// audit_log_retention_daily (see migration 1783400000001).
export async function runAuditLogRetention(): Promise<void> {
  await logEventSchedulerStatus()

  if (await procedureExists()) {
    await sql`CALL audit_log_maintain_partitions()`.execute(db)
    console.log("[audit-log-retention] called audit_log_maintain_partitions()")
    return
  }

  console.warn(
    "[audit-log-retention] procedure audit_log_maintain_partitions not found, using TS fallback"
  )
  await ensureUpcomingPartition()
  await dropExpiredPartitions()
}

async function logEventSchedulerStatus(): Promise<void> {
  try {
    const res = await sql<{
      scheduler: string | number
    }>`SELECT @@event_scheduler AS scheduler`.execute(db)
    const value = String(res.rows[0]?.scheduler ?? "").toUpperCase()
    if (value === "ON" || value === "1") {
      console.log("[audit-log-retention] event_scheduler is ON")
    } else {
      console.warn(
        `[audit-log-retention] event_scheduler is ${value || "unknown"}: the daily MySQL event will not run; schedule this CLI externally`
      )
    }
  } catch (err) {
    console.warn("[audit-log-retention] could not read event_scheduler", err)
  }
}

async function procedureExists(): Promise<boolean> {
  const res = await sql<{ n: string | number }>`
    SELECT COUNT(*) AS n
    FROM information_schema.ROUTINES
    WHERE ROUTINE_SCHEMA = DATABASE()
      AND ROUTINE_TYPE = 'PROCEDURE'
      AND ROUTINE_NAME = 'audit_log_maintain_partitions'
  `.execute(db)
  return Number(res.rows[0]?.n ?? 0) > 0
}

async function getRetentionDays(): Promise<number> {
  const row = await db
    .selectFrom("system_settings")
    .select("value")
    .where("key", "=", AUDIT_LOG_RETENTION_KEY)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  return resolveRetentionDays(row?.value)
}

async function ensureUpcomingPartition(): Promise<void> {
  const target = new Date()
  target.setUTCDate(target.getUTCDate() + LOOKAHEAD_DAYS)

  const existing = await sql<PartitionRow>`
    SELECT PARTITION_NAME, PARTITION_DESCRIPTION
    FROM information_schema.PARTITIONS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'audit_logs'
      AND PARTITION_NAME IS NOT NULL
      AND PARTITION_NAME <> ${PARTITION_MAX}
  `.execute(db)

  let lastBoundary: string | null = null
  for (const row of existing.rows) {
    // datetime boundaries read back as '2026-09-30 00:00:00'; keep the date.
    const b = row.PARTITION_DESCRIPTION?.replace(/'/g, "").slice(0, 10) ?? ""
    if (/^\d{4}-\d{2}-\d{2}$/.test(b) && (!lastBoundary || b > lastBoundary)) {
      lastBoundary = b
    }
  }

  // Partition name == its exclusive UTC boundary date (same as the migration).
  const missing = missingDailyPartitions(lastBoundary, target)
  if (missing.length === 0) {
    console.log("[audit-log-retention] daily partitions up to date")
    return
  }

  // Names/boundaries come only from Date formatting, never user input.
  const parts = missing
    .map((m) => `PARTITION ${m.name} VALUES LESS THAN ('${m.boundary}')`)
    .concat(`PARTITION ${PARTITION_MAX} VALUES LESS THAN (MAXVALUE)`)
    .join(", ")

  await sql`
    ALTER TABLE audit_logs REORGANIZE PARTITION ${sql.raw(PARTITION_MAX)} INTO (${sql.raw(parts)})
  `.execute(db)

  console.log(
    `[audit-log-retention] added partitions ${missing.map((m) => m.name).join(", ")}`
  )
}

async function dropExpiredPartitions(): Promise<void> {
  const retentionDays = await getRetentionDays()
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays)
  cutoff.setUTCHours(0, 0, 0, 0)
  console.log(`[audit-log-retention] retention ${retentionDays} day(s)`)

  const partitions = await sql<PartitionRow>`
    SELECT PARTITION_NAME, PARTITION_DESCRIPTION, TABLE_ROWS
    FROM information_schema.PARTITIONS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'audit_logs'
      AND PARTITION_NAME IS NOT NULL
      AND PARTITION_NAME <> ${PARTITION_MAX}
  `.execute(db)

  let totalDroppedRows = 0

  for (const partition of partitions.rows) {
    const name = partition.PARTITION_NAME
    const description = partition.PARTITION_DESCRIPTION?.replace(/'/g, "").slice(0, 10)
    if (!name || name === PARTITION_MAX || !description) continue

    // The partition's boundary is its exclusive upper bound, so it only holds
    // rows older than the cutoff once boundary <= cutoff.
    const boundaryDate = new Date(`${description}T00:00:00Z`)
    if (Number.isNaN(boundaryDate.getTime()) || boundaryDate > cutoff) continue

    // TABLE_ROWS is an estimate (InnoDB); avoids a full COUNT(*) scan.
    const rowCount = Number(partition.TABLE_ROWS ?? 0)

    await sql`ALTER TABLE audit_logs DROP PARTITION ${sql.raw(name)}`.execute(
      db
    )

    totalDroppedRows += rowCount
    console.log(
      `[audit-log-retention] dropped partition ${name} (~${rowCount} rows, boundary < ${description})`
    )
  }

  console.log(
    `[audit-log-retention] done, dropped ${totalDroppedRows} rows total`
  )
}
