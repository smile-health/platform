import { BaseMiddleware } from "@smile-health/lib/base/middleware.js"
import { Context } from "hono"
import { z } from "zod"
import { EnvironmentalHealthHistoryRepository } from "./environmental-health-history.repository.js"
import {
  GetHistoryListQuerySchema,
  GetHistoryListQuery,
} from "./environmental-health-history.schema.js"
import { createMiddleware } from "hono/factory"
import { NotFoundError } from "@smile-health/lib/error.js"

export class EnvironmentalHealthHistoryMiddleware extends BaseMiddleware {
  constructor(
    private readonly repository: EnvironmentalHealthHistoryRepository
  ) {
    super()
  }

  readonly #getRecord = async (c: Context) => {
    const id = c.req.param("id")
    return await this.repository.getOnlyById(c, Number(id))
  }

  readonly #queryParamValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: GetHistoryListQuery
  ) => {
    if (data.sort_by && !data.sort_type) {
      ctx.addIssue({
        path: ["sort_type"],
        message: c.var.t("validator.must_be_filled", {
          field: c.var.t("common.sort_type"),
        }),
        code: z.ZodIssueCode.custom,
      })
    }

    if (!data.sort_by && data.sort_type) {
      ctx.addIssue({
        path: ["sort_by"],
        message: c.var.t("validator.must_be_filled", {
          field: c.var.t("common.sort_by"),
        }),
        code: z.ZodIssueCode.custom,
      })
    }

    // Validate date range
    if (data.start_date && data.end_date) {
      if (data.start_date > data.end_date) {
        ctx.addIssue({
          path: ["start_date"],
          message: c.var.t("validator.start_date_before_end_date", {
            field: "start_date",
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }
  }

  readonly #pathParamValidation = async (c: Context, record: unknown) => {
    if (!record) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t(
            "environmental_health_history.label.id",
            "environmental_test"
          ),
        })
      )
    }
  }

  list = (c: Context) => {
    return GetHistoryListQuerySchema.superRefine(async (data, ctx) => {
      await this.#queryParamValidation(c, ctx, data)
    })
  }

  detail = createMiddleware(async (c, next) => {
    const record = await this.#getRecord(c)
    await this.#pathParamValidation(c, record)
    await next()
  })

  delete = createMiddleware(async (c, next) => {
    const record = await this.#getRecord(c)
    await this.#pathParamValidation(c, record)
    await next()
  })

  exportPdf = createMiddleware(async (c, next) => {
    const record = await this.#getRecord(c)
    await this.#pathParamValidation(c, record)
    await next()
  })
}
