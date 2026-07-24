import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { Context } from "hono"
import { z } from "zod"
import { EnvironmentalParameterCategoryRepository } from "./environmental-parameter-category.repository.js"
import {
  GetParameterCategoryListQuerySchema,
  CreateParameterCategoryRequestSchema,
  UpdateParameterCategoryRequestSchema,
  GetParameterCategoryListQuery,
  CreateParameterCategoryRequest,
  UpdateParameterCategoryRequest,
} from "./environmental-parameter-category.schema.js"
import { createMiddleware } from "hono/factory"
import { NotFoundError } from "@smile/lib/error.js"

export class EnvironmentalParameterCategoryMiddleware extends BaseMiddleware {
  constructor(
    private readonly repository: EnvironmentalParameterCategoryRepository
  ) {
    super()
  }

  readonly #getCategory = async (c: Context) => {
    const id = c.req.param("id")
    return await this.repository.getOnlyById(c, Number(id))
  }

  readonly #queryParamValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: GetParameterCategoryListQuery
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
    data: CreateParameterCategoryRequest
  ) => {
    const exists = await this.repository.checkNameExists(c, data.name)
    if (exists) {
      ctx.addIssue({
        path: ["name"],
        message: c.var.t("validator.already_exists", {
          field: c.var.t("environmental_parameter_category.label.name"),
        }),
        code: z.ZodIssueCode.custom,
      })
    }

    // Check all analysis parameters exist and are not duplicates
    const seenParamIds = new Set<number>()
    for (let i = 0; i < data.analysis_parameters.length; i++) {
      const param = data.analysis_parameters[i]

      // Check duplicate analysis parameter in request
      if (seenParamIds.has(param.env_analysis_parameter_id)) {
        ctx.addIssue({
          path: ["analysis_parameters", i],
          message: c.var.t("validator.already_exists", {
            field: c.var.t("environmental_analysis_parameter.label.id"),
          }),
          code: z.ZodIssueCode.custom,
        })
      }
      seenParamIds.add(param.env_analysis_parameter_id)

      const paramExists = await this.repository.checkAnalysisParameterExists(
        c,
        param.env_analysis_parameter_id
      )
      if (!paramExists) {
        ctx.addIssue({
          path: ["analysis_parameters", i, "env_analysis_parameter_id"],
          message: c.var.t("validator.not_exist", {
            field: c.var.t("environmental_analysis_parameter.label.id"),
          }),
          code: z.ZodIssueCode.custom,
        })
      }

      // Validate each test method ID
      for (let j = 0; j < param.env_test_method_ids.length; j++) {
        const methodId = param.env_test_method_ids[j]
        const methodExists = await this.repository.checkTestMethodExists(
          c,
          methodId
        )
        if (!methodExists) {
          ctx.addIssue({
            path: ["analysis_parameters", i, "env_test_method_ids", j],
            message: c.var.t("validator.not_exist", {
              field: c.var.t("test_method.label.id"),
            }),
            code: z.ZodIssueCode.custom,
          })
        }
      }
    }

    // Validate fields - check for duplicate keys
    this.#validateFieldsDuplicateKeys(c, ctx, data.fields, "fields")
  }

  readonly #validateFieldsDuplicateKeys = (
    c: Context,
    ctx: z.RefinementCtx,
    fields: CreateParameterCategoryRequest["fields"],
    path: string
  ) => {
    if (!fields || fields.length === 0) return

    const seenKeys = new Set<string>()
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      if (seenKeys.has(field.key)) {
        ctx.addIssue({
          path: [path, i, "key"],
          message: c.var.t("validator.already_exists", {
            field: "Key",
          }),
          code: z.ZodIssueCode.custom,
        })
      }
      seenKeys.add(field.key)
    }
  }

  readonly #updateValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: UpdateParameterCategoryRequest
  ) => {
    const id = Number(c.req.param("id"))
    const existing = await this.repository.getOnlyById(c, id)

    if (!existing) return

    if (data.name) {
      const exists = await this.repository.checkNameExists(c, data.name, id)
      if (exists) {
        ctx.addIssue({
          path: ["name"],
          message: c.var.t("validator.already_exists", {
            field: c.var.t("environmental_parameter_category.label.name"),
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }

    if (data.analysis_parameters) {
      await this.#validateAnalysisParametersUpdate(
        c,
        ctx,
        data.analysis_parameters
      )
    }

    // Validate fields - check for duplicate keys
    this.#validateFieldsDuplicateKeys(c, ctx, data.fields, "fields")
  }

  readonly #validateAnalysisParametersUpdate = async (
    c: Context,
    ctx: z.RefinementCtx,
    analysisParameters: UpdateParameterCategoryRequest["analysis_parameters"]
  ) => {
    if (!analysisParameters) return

    const seenParamIds = new Set<number>()
    for (let i = 0; i < analysisParameters.length; i++) {
      const param = analysisParameters[i]
      if (param._delete) continue

      // Check duplicate analysis parameter in request
      if (seenParamIds.has(param.env_analysis_parameter_id)) {
        ctx.addIssue({
          path: ["analysis_parameters", i],
          message: c.var.t("validator.already_exists", {
            field: c.var.t("environmental_analysis_parameter.label.id"),
          }),
          code: z.ZodIssueCode.custom,
        })
      }
      seenParamIds.add(param.env_analysis_parameter_id)

      const paramExists = await this.repository.checkAnalysisParameterExists(
        c,
        param.env_analysis_parameter_id
      )
      if (!paramExists) {
        ctx.addIssue({
          path: ["analysis_parameters", i, "env_analysis_parameter_id"],
          message: c.var.t("validator.not_exist", {
            field: c.var.t("environmental_analysis_parameter.label.id"),
          }),
          code: z.ZodIssueCode.custom,
        })
      }

      // Validate each test method ID
      for (let j = 0; j < param.env_test_method_ids.length; j++) {
        const methodId = param.env_test_method_ids[j]
        const methodExists = await this.repository.checkTestMethodExists(
          c,
          methodId
        )
        if (!methodExists) {
          ctx.addIssue({
            path: ["analysis_parameters", i, "env_test_method_ids", j],
            message: c.var.t("validator.not_exist", {
              field: c.var.t("test_method.label.id"),
            }),
            code: z.ZodIssueCode.custom,
          })
        }
      }
    }
  }

  readonly #pathParamValidation = async (c: Context, category: unknown) => {
    if (!category) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("environmental_parameter_category.label.id"),
        })
      )
    }
  }

  list = (c: Context) => {
    return GetParameterCategoryListQuerySchema.superRefine(
      async (data, ctx) => {
        await this.#queryParamValidation(c, ctx, data)
      }
    )
  }

  create = (c: Context) => {
    return CreateParameterCategoryRequestSchema.superRefine(
      async (data, ctx) => {
        await this.#createValidation(c, ctx, data)
      }
    )
  }

  update = (c: Context) => {
    return UpdateParameterCategoryRequestSchema.superRefine(
      async (data, ctx) => {
        await this.#updateValidation(c, ctx, data)
      }
    )
  }

  detail = createMiddleware(async (c, next) => {
    const category = await this.#getCategory(c)
    await this.#pathParamValidation(c, category)
    await next()
  })

  delete = createMiddleware(async (c, next) => {
    const category = await this.#getCategory(c)
    await this.#pathParamValidation(c, category)
    await next()
  })
}
