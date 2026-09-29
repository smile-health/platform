import { Context } from "hono"
import z from "zod"
import { GetAuditLogsQuerySchema } from "./audit-log.schema.js"

export class AuditLogMiddleware {
  list = (c: Context) => {
    return GetAuditLogsQuerySchema.superRefine((val, ctx) => {
      if (val.date_from && val.date_to && val.date_from > val.date_to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["date_to"],
          message: c.var.t("validator.not_greater_than", {
            field1: "date_from",
            field2: "date_to",
          }),
        })
      }
    })
  }
}
