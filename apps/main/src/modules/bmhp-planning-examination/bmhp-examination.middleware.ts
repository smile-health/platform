import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { z } from "zod"
import { BmhpExaminationTypeRepository } from "./bmhp-examination-type.repository.js"
import { BmhpExaminationRepository } from "./bmhp-examination.repository.js"
import { BmhpTargetGroupRepository } from "../bmhp-target-groups/bmhp-target-groups.repository.js"
import { BmhpExaminationMethodRepository } from "../bmhp-examination-methods/bmhp-examination-methods.repository.js"
import { BmhpParameterRepository } from "../bmhp-parameters/bmhp-parameters.repository.js"
import {
  CreateExaminationTypeBodySchema,
  GetListExaminationTypeQuerySchema,
  UpdateExaminationTypeBodySchema,
  CreateExaminationBodySchema,
  GetListExaminationQuerySchema,
  UpdateExaminationBodySchema,
} from "./bmhp-examination.schema.js"

/* ========== Shared ========== */

const sortParamValidation = async (
  c: Context,
  ctx: z.RefinementCtx,
  data: { sort_by?: string; sort_type?: string }
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

/* ========== BMHP Examination Middleware (includes Type validations) ========== */

export class BmhpExaminationMiddleware extends BaseMiddleware {
  constructor(
    private readonly repository: BmhpExaminationRepository,
    private readonly examinationTypeRepository: BmhpExaminationTypeRepository,
    private readonly targetGroupRepository: BmhpTargetGroupRepository,
    private readonly methodRepository: BmhpExaminationMethodRepository,
    private readonly parameterRepository: BmhpParameterRepository
  ) {
    super()
  }

  /* ========== Examination Type Validations ========== */

  readonly #typePathParamValidation = async (c: Context) => {
    const id = Number(c.req.param("id"))
    const record = await this.examinationTypeRepository.findDetailById(c, id)

    if (!record) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: "Examination Type",
        })
      )
    }
  }

  readonly #typeUniqueNameValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    name: string,
    programPlanId?: number,
    excludeId?: number
  ) => {
    const existing = await this.examinationTypeRepository.findByName(
      c,
      name,
      programPlanId,
      excludeId
    )

    if (existing) {
      ctx.addIssue({
        path: ["name"],
        message: c.var.t("validator.duplicated", {
          field: "name",
        }),
        code: z.ZodIssueCode.custom,
      })
    }
  }

  typeList = (c: Context) => {
    return GetListExaminationTypeQuerySchema.superRefine(
      async (data, ctx) => {
        await sortParamValidation(c, ctx, data)
      }
    )
  }

  typeCreate = (c: Context) => {
    return CreateExaminationTypeBodySchema.superRefine(
      async (data, ctx) => {
        await this.#typeUniqueNameValidation(
          c,
          ctx,
          data.name,
          data.program_plan_id
        )
      }
    )
  }

  typeUpdate = (c: Context) => {
    return UpdateExaminationTypeBodySchema.superRefine(
      async (data, ctx) => {
        const id = Number(c.req.param("id"))
        await this.#typeUniqueNameValidation(
          c,
          ctx,
          data.name,
          data.program_plan_id,
          id
        )
      }
    )
  }

  typeDetail = createMiddleware(async (c, next) => {
    await this.#typePathParamValidation(c)
    await next()
  })

  typeDelete = createMiddleware(async (c, next) => {
    await this.#typePathParamValidation(c)
    await next()
  })

  /* ========== Examination Validations ========== */

  readonly #pathParamValidation = async (c: Context) => {
    const id = Number(c.req.param("id"))
    const record = await this.repository.findDetailById(c, id)

    if (!record) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: "Examination",
        })
      )
    }
  }

  readonly #uniqueNameValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    name: string,
    programPlanId?: number,
    excludeId?: number
  ) => {
    const existing = await this.repository.findByName(c, name, programPlanId, excludeId)

    if (existing) {
      throw new ValidationError("name already exists")
    }
  }

  readonly #examinationTypeValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    examinationTypeId: number
  ) => {
    const type = await this.examinationTypeRepository.findDetailById(
      c,
      examinationTypeId
    )

    if (!type) {
      ctx.addIssue({
        path: ["examination_type_id"],
        message: c.var.t("validator.not_exist", {
          field: "Examination Type",
        }),
        code: z.ZodIssueCode.custom,
      })
    }
  }

  readonly #targetGroupIdsValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    targetGroupIds?: number[]
  ) => {
    if (!targetGroupIds || targetGroupIds.length === 0) return

    for (const id of targetGroupIds) {
      const targetGroup = await this.targetGroupRepository.findOne(c, { id })
      if (!targetGroup) {
        ctx.addIssue({
          path: ["target_group_ids"],
          message: c.var.t("validator.not_exist", {
            field: `Target Group with ID ${id}`,
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }
  }

  readonly #methodIdsValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    methodIds?: number[]
  ) => {
    if (!methodIds || methodIds.length === 0) return

    for (const id of methodIds) {
      const method = await this.methodRepository.findOne(c, { id })
      if (!method) {
        ctx.addIssue({
          path: ["method_ids"],
          message: c.var.t("validator.not_exist", {
            field: `Method with ID ${id}`,
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }
  }

  readonly #parametersValidation = async (
    c: Context,
    ctx: z.RefinementCtx,
    parameters?: Array<{ id: number; sort_order?: number }>
  ) => {
    if (!parameters || parameters.length === 0) return

    for (const param of parameters) {
      const parameter = await this.parameterRepository.findOne(c, { id: param.id })
      if (!parameter) {
        ctx.addIssue({
          path: ["parameters"],
          message: c.var.t("validator.not_exist", {
            field: `Parameter with ID ${param.id}`,
          }),
          code: z.ZodIssueCode.custom,
        })
      }
    }
  }

  list = (c: Context) => {
    return GetListExaminationQuerySchema.superRefine(async (data, ctx) => {
      await sortParamValidation(c, ctx, data)
    })
  }

  create = (c: Context) => {
    return CreateExaminationBodySchema.superRefine(async (data, ctx) => {
      await this.#examinationTypeValidation(c, ctx, data.examination_type_id)
      await this.#uniqueNameValidation(c, ctx, data.name, data.program_plan_id)
      await this.#targetGroupIdsValidation(c, ctx, data.target_group_ids)
      await this.#methodIdsValidation(c, ctx, data.method_ids)
      await this.#parametersValidation(c, ctx, data.parameters)
    })
  }

  update = (c: Context) => {
    return UpdateExaminationBodySchema.superRefine(async (data, ctx) => {
      const id = Number(c.req.param("id"))
      await this.#examinationTypeValidation(c, ctx, data.examination_type_id)
      await this.#uniqueNameValidation(c, ctx, data.name, data.program_plan_id, id)
      await this.#targetGroupIdsValidation(c, ctx, data.target_group_ids)
      await this.#methodIdsValidation(c, ctx, data.method_ids)
      await this.#parametersValidation(c, ctx, data.parameters)
    })
  }

  detail = createMiddleware(async (c, next) => {
    await this.#pathParamValidation(c)
    await next()
  })

  delete = createMiddleware(async (c, next) => {
    await this.#pathParamValidation(c)
    await next()
  })
}
