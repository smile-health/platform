import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate.js"
import z from "zod"
import {
  AUDIT_LOG_RETENTION_MAX_DAYS,
  AUDIT_LOG_RETENTION_MIN_DAYS,
} from "./audit-log.constants.js"

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export const GetAuditLogsQuerySchema = PaginationQueriesSchema.extend({
  program_id: z.coerce.number().int().positive().optional(),
  module: z.string().max(100).optional(),
  entity_id: z.coerce.number().int().positive().optional(),
  actor_id: z.coerce.number().int().positive().optional(),
  service: z.string().max(30).optional(),
  action: z.string().max(50).optional(),
  date_from: z.string().regex(DATE_ONLY).optional(),
  date_to: z.string().regex(DATE_ONLY).optional(),
}).refine((v) => !v.date_from || !v.date_to || v.date_from <= v.date_to, {
  message: "date_from must be on or before date_to",
  path: ["date_from"],
})

export type GetAuditLogsQuery = z.infer<typeof GetAuditLogsQuerySchema>

export const UpdateAuditLogSettingsSchema = z.object({
  retention_days: z
    .number()
    .int()
    .min(AUDIT_LOG_RETENTION_MIN_DAYS)
    .max(AUDIT_LOG_RETENTION_MAX_DAYS),
})

export type UpdateAuditLogSettings = z.infer<
  typeof UpdateAuditLogSettingsSchema
>

export type {
  AuditLogMetadata,
  CreateAuditLogInput,
} from "@smile-health/lib/audit-log/types.js"
