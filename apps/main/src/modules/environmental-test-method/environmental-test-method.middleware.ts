import { BaseMiddleware } from "@smile-health/lib/base/middleware.js"
import { Context } from "hono"
import { z } from "zod"
import { EnvironmentalTestMethodRepository } from "./environmental-test-method.repository.js"
import {
  GetEnvironmentalTestMethodListQuerySchema,
  CreateEnvironmentalTestMethodRequestSchema,
  UpdateEnvironmentalTestMethodRequestSchema,
  GetEnvironmentalTestMethodListQuery,
  CreateEnvironmentalTestMethodRequest,
  UpdateEnvironmentalTestMethodRequest,
} from "./environmental-test-method.schema.js"
import { createMiddleware } from "hono/factory"
import { NotFoundError } from "@smile-health/lib/error.js"

export class EnvironmentalTestMethodMiddleware extends BaseMiddleware {
  constructor(private readonly repository: EnvironmentalTestMethodRepository) {
    super()
  }

  readonly #getTestMethod = async (c: Context) => {
    const id = c.req.param("id")
    return await this.repository.getOnlyById(c, Number(id))
  }

  readonly #queryParamValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: GetEnvironmentalTestMethodListQuery
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
    data: CreateEnvironmentalTestMethodRequest
  ) => {
    const exists = await this.repository.checkExists(
      c,
      data.name,
      data.quality_standard
    )
    if (exists) {
      ctx.addIssue({
        path: ["name"],
        message: c.var.t("validator.already_exists", {
          field: `${c.var.t("environmental_test_method.label.name")} & ${c.var.t(
            "environmental_test_method.label.quality_standard"
          )}`,
        }),
        code: z.ZodIssueCode.custom,
      })
    }
  }

  readonly #updateValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: UpdateEnvironmentalTestMethodRequest
  ) => {
    const id = Number(c.req.param("id"))
    const existing = await this.repository.getOnlyById(c, id)

    if (!existing) return

    if (data.name) {
      const exists = await this.repository.checkExists(
        c,
        data.name,
        data.quality_standard !== undefined
          ? data.quality_standard
          : existing.quality_standard,
        id
      )
      if (exists) {
        ctx.addIssue({
          path: ["name"],
          message: c.var.t("validator.already_exists", {
            field: `${c.var.t(
              "environmental_test_method.label.name"
            )} & ${c.var.t("environmental_test_method.label.quality_standard")}`,
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }
  }

  readonly #pathParamValidation = async (c: Context, testMethod: unknown) => {
    if (!testMethod) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("environmental_test_method.label.id"),
        })
      )
    }
  }

  list = (c: Context) => {
    return GetEnvironmentalTestMethodListQuerySchema.superRefine(
      async (data, ctx) => {
        await this.#queryParamValidation(c, ctx, data)
      }
    )
  }

  create = (c: Context) => {
    return CreateEnvironmentalTestMethodRequestSchema.superRefine(
      async (data, ctx) => {
        await this.#createValidation(c, ctx, data)
      }
    )
  }

  update = (c: Context) => {
    return UpdateEnvironmentalTestMethodRequestSchema.superRefine(
      async (data, ctx) => {
        await this.#updateValidation(c, ctx, data)
      }
    )
  }

  detail = createMiddleware(async (c, next) => {
    const testMethod = await this.#getTestMethod(c)
    await this.#pathParamValidation(c, testMethod)
    await next()
  })

  delete = createMiddleware(async (c, next) => {
    const testMethod = await this.#getTestMethod(c)
    await this.#pathParamValidation(c, testMethod)
    await next()
  })
}
