import {
  addValidationIssue,
  validateRequiredFields,
} from "@/common/utils/validation.utils.js"
import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { Context } from "hono"
import z from "zod"
import { TargetEstimationNonBiasRepository } from "../target-estimation-non-bias/target-estimation-non-bias.repository.js"
import {
  AddTargetCalculateNonBiasSchema,
  SaveEstimationBiasRequest,
  SaveEstimationBiasSchema,
  SaveEstimationRequest,
  UpdateEstimationBiasRequest,
  UpdateEstimationBiasSchema,
  UpdateEstimationRequest,
  UpdateEstimationSchema,
} from "./target-estimation.schema.js"

export class TargetEstimationMiddleware extends BaseMiddleware {
  readonly #nonBiasFields = [
    "service_percentage_outreach",
    "service_percentage_facility",
    "required_monthly_outreach",
    "required_monthly_facility",
    "available_service_outreach",
    "available_service_facility",
    "required_additional_outreach",
    "required_vaccinator_outreach",
    "required_additional_facility",
    "required_vaccinator_facility",
    "ideal_needs",
    "available_worker",
    "gap_worker",
  ] as const

  readonly #biasFields = [
    "august_service_point",
    "august_service_days",
    "august_vaccinator",
    "november_service_point",
    "november_service_days",
    "november_vaccinator",
  ] as const

  constructor(
    private readonly nonBiasRepository: TargetEstimationNonBiasRepository
  ) {
    super()
  }

  create = (c: Context) => {
    return AddTargetCalculateNonBiasSchema.superRefine(
      async (data: SaveEstimationRequest, ctx: z.RefinementCtx) => {
        await this.#validateVillageId(c, ctx, data)
        await this.#validateNonBiasFields(c, ctx, data)
        await this.#checkDuplicateVillage(c, ctx, data)
        // DISABLED: percentage validation skipped — mobile client not yet deployed to production, re-enable once mobile prod is up
        // await this.#checkPercentage(c, ctx, data) // NOSONAR
      }
    )
  }

  readonly #validateVillageId = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: SaveEstimationRequest
  ) => {
    validateRequiredFields(
      c,
      ctx,
      data,
      ["village_id"] as const,
      "target_estimation_non_bias"
    )
  }

  readonly #checkDuplicateVillage = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: SaveEstimationRequest
  ) => {
    if (data.village_id) {
      const existingRecord = await this.nonBiasRepository.findByVillage(
        c,
        data.village_id,
        c.var.microplanningId!
      )

      if (existingRecord) {
        addValidationIssue(
          c,
          ctx,
          "village_id",
          "validator.exist",
          "target_estimation_non_bias.label.village_id"
        )
      }
    }
  }

  readonly #checkPercentage = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: SaveEstimationRequest
  ) => {
    const total =
      data.available_service_outreach + data.available_service_facility

    if (total > 0) {
      const outreachPercentage = Math.ceil(
        (data.available_service_outreach / total) * 100
      )
      const facilityPercentage = Math.floor(
        (data.available_service_facility / total) * 100
      )

      if (data.service_percentage_outreach != outreachPercentage) {
        addValidationIssue(
          c,
          ctx,
          "service_percentage_outreach",
          "validator.not_match",
          "target_estimation_non_bias.label.service_percentage_outreach"
        )
      }

      if (data.service_percentage_facility != facilityPercentage) {
        addValidationIssue(
          c,
          ctx,
          "service_percentage_facility",
          "validator.not_match",
          "target_estimation_non_bias.label.service_percentage_facility"
        )
      }
    }
  }

  createBias = (c: Context) => {
    return SaveEstimationBiasSchema.superRefine(
      async (data: SaveEstimationBiasRequest, ctx: z.RefinementCtx) => {
        await this.#validateSchoolId(c, ctx, data)
        await this.#validateBiasFields(c, ctx, data)
      }
    )
  }

  readonly #validateSchoolId = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: SaveEstimationBiasRequest
  ) => {
    validateRequiredFields(
      c,
      ctx,
      data,
      ["school_id"] as const,
      "target_estimation_bias"
    )
  }

  readonly #validateNonBiasFields = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: UpdateEstimationRequest | SaveEstimationRequest
  ) => {
    validateRequiredFields(
      c,
      ctx,
      data,
      this.#nonBiasFields,
      "target_estimation_non_bias"
    )
  }

  readonly #validateBiasFields = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: UpdateEstimationBiasRequest | SaveEstimationBiasRequest
  ) => {
    validateRequiredFields(
      c,
      ctx,
      data,
      this.#biasFields,
      "target_estimation_bias"
    )
  }

  update = (c: Context) => {
    return UpdateEstimationSchema.superRefine(
      async (data: UpdateEstimationRequest, ctx: z.RefinementCtx) => {
        await this.#validateNonBiasFields(c, ctx, data)
      }
    )
  }

  updateBias = (c: Context) => {
    return UpdateEstimationBiasSchema.superRefine(
      async (data: UpdateEstimationBiasRequest, ctx: z.RefinementCtx) => {
        await this.#validateBiasFields(c, ctx, data)
      }
    )
  }
}
