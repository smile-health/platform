import z from "zod"
import { Context } from "hono"
import { BaseMiddleware } from "@smile/lib/base/middleware"
import { GetWorkspacesParamsSchema } from "./workspace.schema"

export class ExecutiveWorkspaceMiddleware extends BaseMiddleware {
  constructor() {
    super()
  }

  list = (c: Context) => {
    return GetWorkspacesParamsSchema.superRefine((data, ctx) => {
      const { sort_by, sort_type } = data
      const sortBys = ["name", "updated_at", "is_hierarchy_enabled"]
      const sortTypes = ["asc", "desc"]

      if (sort_by && !sortBys.includes(sort_by)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sort_by"],
          message: c.var.t("validator.one_of", {
            field: "sort_by",
            condition: sortBys,
          }),
        })
      }

      if (sort_type && !sortTypes.includes(sort_type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sort_type"],
          message: c.var.t("validator.one_of", {
            field: "sort_type",
            condition: sortTypes,
          }),
        })
      }
    })
  }
}
