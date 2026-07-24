import { BaseMiddleware } from "@smile-health/lib/base/middleware.js"
import { Context } from "hono"
import { z } from "zod"
import { EnvironmentalAnalysisParameterRepository } from "./environmental-analysis-parameter.repository.js"
import {
  GetAnalysisParameterListQuerySchema,
  CreateAnalysisParameterRequestSchema,
  UpdateAnalysisParameterRequestSchema,
  GetAnalysisParameterListQuery,
  CreateAnalysisParameterRequest,
  UpdateAnalysisParameterRequest,
} from "./environmental-analysis-parameter.schema.js"
import { createMiddleware } from "hono/factory"
import { NotFoundError } from "@smile-health/lib/error.js"

export class EnvironmentalAnalysisParameterMiddleware extends BaseMiddleware {
  constructor(
    private readonly repository: EnvironmentalAnalysisParameterRepository
  ) {
    super()
  }

  readonly #getParameter = async (c: Context) => {
    const id = c.req.param("id")
    return await this.repository.getOnlyById(c, Number(id))
  }

  readonly #queryParamValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: GetAnalysisParameterListQuery
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
  }

  readonly #createValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: CreateAnalysisParameterRequest
  ) => {
    // Check name uniqueness
    const exists = await this.repository.checkNameExists(c, data.name)
    if (exists) {
      ctx.addIssue({
        path: ["name"],
        message: c.var.t("validator.already_exists", {
          field: c.var.t("environmental_analysis_parameter.label.name"),
        }),
        code: z.ZodIssueCode.custom,
      })
    }
  }

  readonly #updateValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: UpdateAnalysisParameterRequest
  ) => {
    const id = Number(c.req.param("id"))
    const existing = await this.repository.getOnlyById(c, id)

    if (!existing) return

    // Check name uniqueness (if name changed)
    if (data.name) {
      const exists = await this.repository.checkNameExists(c, data.name, id)
      if (exists) {
        ctx.addIssue({
          path: ["name"],
          message: c.var.t("validator.already_exists", {
            field: c.var.t("environmental_analysis_parameter.label.name"),
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }
  }

  readonly #pathParamValidation = async (c: Context, parameter: unknown) => {
    if (!parameter) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("environmental_analysis_parameter.label.id"),
        })
      )
    }
  }

  list = (c: Context) => {
    return GetAnalysisParameterListQuerySchema.superRefine(
      async (data, ctx) => {
        await this.#queryParamValidation(c, ctx, data)
      }
    )
  }

  create = (c: Context) => {
    return CreateAnalysisParameterRequestSchema.superRefine(
      async (data, ctx) => {
        await this.#createValidation(c, ctx, data)
      }
    )
  }

  update = (c: Context) => {
    return UpdateAnalysisParameterRequestSchema.superRefine(
      async (data, ctx) => {
        await this.#updateValidation(c, ctx, data)
      }
    )
  }

  detail = createMiddleware(async (c, next) => {
    const parameter = await this.#getParameter(c)
    await this.#pathParamValidation(c, parameter)
    await next()
  })

  delete = createMiddleware(async (c, next) => {
    const parameter = await this.#getParameter(c)
    await this.#pathParamValidation(c, parameter)
    await next()
  })
}
