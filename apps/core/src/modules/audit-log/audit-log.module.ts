import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { Context } from "hono"
import { UserRepository } from "../user/user.repository.js"
import { AuditLogRepository } from "./audit-log.repository.js"
import {
  GetAuditLogsQuery,
  UpdateAuditLogSettings,
} from "./audit-log.schema.js"

// created_at is stored as naive UTC. The pool uses timezone "Z" so mysql2
// yields a correct Date, but handle a raw 'YYYY-MM-DD HH:mm:ss' string too and
// always emit ISO-8601 with 'Z' so clients never guess the zone.
export const toUtcIso = (value: Date | string): string =>
  value instanceof Date
    ? value.toISOString()
    : `${value.replace(" ", "T").replace(/Z$/, "")}Z`

export class AuditLogModule {
  constructor(
    private readonly auditLogRepo: AuditLogRepository,
    private readonly userRepo: UserRepository
  ) {}

  async list(c: Context, params: GetAuditLogsQuery) {
    const { data, total } = await this.auditLogRepo.findAll(
      c,
      params,
      c.var.timezone
    )
    if (data.length === 0) {
      return new PaginatedResponse(params)
    }

    // Rows with actor_name already set (cross-service publishers, e.g. WMS)
    // skip this join: their actor_id isn't from SMILE's users table, so a
    // lookup would resolve to the wrong person or nobody. Rows with no actor
    // at all (actor_id null) are skipped too.
    const actorIds = [
      ...new Set(
        data
          .filter((row) => !row.actor_name && row.actor_id !== null)
          .map((row) => Number(row.actor_id))
      ),
    ]
    const mapUsers = await this.userRepo.getBasicDetailMapped(c, actorIds)

    const list = data.map((row) => ({
      id: String(row.id),
      service: row.service,
      program_id: row.program_id !== null ? String(row.program_id) : null,
      actor_id: row.actor_id !== null ? String(row.actor_id) : null,
      actor_name:
        row.actor_name ??
        (row.actor_id !== null
          ? mapUsers[Number(row.actor_id)]?.fullname
          : undefined) ??
        "",
      actor_role: row.actor_role,
      action: row.action,
      module: row.module,
      entity_id: row.entity_id !== null ? String(row.entity_id) : null,
      metadata: row.metadata
        ? typeof row.metadata === "string"
          ? JSON.parse(row.metadata)
          : row.metadata
        : null,
      ip: row.ip,
      created_at: toUtcIso(row.created_at),
    }))

    return new PaginatedResponse(params, list, total)
  }

  async getSettings(c: Context) {
    return { retention_days: await this.auditLogRepo.getRetentionDays(c) }
  }

  async updateSettings(c: Context, body: UpdateAuditLogSettings) {
    await this.auditLogRepo.setRetentionDays(c, body.retention_days)
    return this.getSettings(c)
  }
}
