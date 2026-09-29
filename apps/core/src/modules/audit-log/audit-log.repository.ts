import { Context } from "hono"
import momentTZ from "moment-timezone"
import { BaseRepository } from "../base.repository.js"
import {
  AUDIT_LOG_COLUMN_LIMITS as LIMITS,
  AUDIT_LOG_RETENTION_KEY,
  formatUtcDateTime,
  truncateTo,
  resolveRetentionDays,
} from "./audit-log.constants.js"
import { CreateAuditLogInput, GetAuditLogsQuery } from "./audit-log.schema.js"

const UTC_FORMAT = "YYYY-MM-DD HH:mm:ss"

export const resolveTimezone = (timezone?: string | null): string =>
  timezone && momentTZ.tz.zone(timezone) ? timezone : "UTC"

/**
 * Converts a calendar day (YYYY-MM-DD) in the user's timezone into the UTC
 * 'YYYY-MM-DD HH:mm:ss' string of that day's start, plus `addDays` days.
 * created_at is stored in UTC, so filters must compare against UTC strings.
 */
export const localDayStartToUtc = (
  date: string,
  timezone?: string | null,
  addDays = 0
): string =>
  momentTZ
    .tz(date, "YYYY-MM-DD", resolveTimezone(timezone))
    .add(addDays, "day")
    .startOf("day")
    .utc()
    .format(UTC_FORMAT)

export class AuditLogRepository extends BaseRepository<"audit_logs"> {
  constructor() {
    // audit_logs is append-only: no soft delete, no created_by/updated_by audit columns.
    super("audit_logs", false, false)
  }

  async findAll(c: Context, params: GetAuditLogsQuery, timezone?: string) {
    const offset = (params.page - 1) * params.paginate

    const base = c.var.trx
      .selectFrom("audit_logs")
      .$if(!!params.program_id, (qb) =>
        qb.where("program_id", "=", params.program_id!)
      )
      .$if(!!params.module, (qb) => qb.where("module", "=", params.module!))
      .$if(!!params.service, (qb) => qb.where("service", "=", params.service!))
      .$if(!!params.action, (qb) => qb.where("action", "=", params.action!))
      .$if(!!params.entity_id, (qb) =>
        qb.where("entity_id", "=", params.entity_id!)
      )
      .$if(!!params.actor_id, (qb) =>
        qb.where("actor_id", "=", params.actor_id!)
      )
      // date_from/date_to are calendar days in the user's timezone: [start of
      // date_from, start of the day after date_to) converted to UTC strings.
      .$if(!!params.date_from, (qb) =>
        qb.where(
          "created_at",
          ">=",
          localDayStartToUtc(params.date_from!, timezone) as unknown as Date
        )
      )
      .$if(!!params.date_to, (qb) =>
        qb.where(
          "created_at",
          "<",
          localDayStartToUtc(params.date_to!, timezone, 1) as unknown as Date
        )
      )

    const [data, count] = await Promise.all([
      base
        .selectAll()
        .orderBy("created_at", "desc")
        .orderBy("id", "desc")
        .limit(params.paginate)
        .offset(offset)
        .execute(),
      base
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return { data, total: Number(count.total) }
  }

  async create(c: Context, data: CreateAuditLogInput) {
    return c.var.trx
      .insertInto("audit_logs")
      .values({
        program_id: data.program_id ?? null,
        actor_id: data.actor_id ?? null,
        actor_name: truncateTo(data.actor_name, LIMITS.actor_name),
        actor_role: truncateTo(data.actor_role, LIMITS.actor_role),
        action: truncateTo(data.action, LIMITS.action)!,
        module: truncateTo(data.module, LIMITS.module)!,
        service: truncateTo(data.service, LIMITS.service),
        entity_id: data.entity_id ?? null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ip: truncateTo(data.ip, LIMITS.ip),
        // Explicit UTC (not DB CURRENT_TIMESTAMP): partition boundaries are UTC,
        // so data and boundaries agree whatever the DB session time zone is.
        created_at: formatUtcDateTime(new Date()) as unknown as Date,
      })
      .executeTakeFirst()
  }

  async getRetentionDays(c: Context): Promise<number> {
    const row = await c.var.trx
      .selectFrom("system_settings")
      .select("value")
      .where("key", "=", AUDIT_LOG_RETENTION_KEY)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return resolveRetentionDays(row?.value)
  }

  async setRetentionDays(c: Context, days: number): Promise<void> {
    await c.var.trx
      .insertInto("system_settings")
      .values({ key: AUDIT_LOG_RETENTION_KEY, value: String(days) })
      .onDuplicateKeyUpdate({ value: String(days), deleted_at: null })
      .execute()
  }
}
