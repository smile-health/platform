import { TARGET_GROUP_NAME_TRANSFORM } from "@/common/constants/target.js"
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "@smile/lib/error.js"
import { Context } from "hono"
import { ActivityPlanRepository } from "./activity-plan.repository.js"
import {
  CreateActivityPlan,
  UpdateActivityPlan,
} from "./activity-plan.schema.js"

const VALID_TARGET_GROUP_IDS = Object.keys(TARGET_GROUP_NAME_TRANSFORM).map(
  (k) => Number(k)
)

export class ActivityPlanMiddleware {
  constructor(private readonly repository: ActivityPlanRepository) {}

  async #validateReferences(
    c: Context,
    body: Pick<
      CreateActivityPlan,
      | "target_group_ids"
      | "location_type_ids"
      | "material_ids"
      | "budget_source_ids"
    >
  ): Promise<void> {
    const {
      target_group_ids,
      location_type_ids,
      material_ids,
      budget_source_ids,
    } = body

    // Validate target_group_ids against TARGET_GROUP_NAME_TRANSFORM keys
    if (target_group_ids && target_group_ids.length > 0) {
      const invalid = target_group_ids.filter(
        (id) => !VALID_TARGET_GROUP_IDS.includes(id)
      )
      if (invalid.length > 0) {
        throw new ValidationError(
          c.var.t("validator.not_found", {
            field: `target_group_id ${invalid}`,
          })
        )
      }
    }

    // Validate location_type_ids against ws_microplanning_config with key: destination_type
    if (location_type_ids && location_type_ids.length > 0) {
      const validIds = await this.repository.getValidLocationTypeIds(
        c,
        location_type_ids
      )
      const invalid = location_type_ids.filter((id) => !validIds.includes(id))
      if (invalid.length > 0) {
        throw new ValidationError(
          c.var.t("validator.not_found", {
            field: `location_type_id ${invalid}`,
          })
        )
      }
    }

    // Validate material_ids against ws_materials with material_level_id = 2
    if (material_ids && material_ids.length > 0) {
      const validIds = await this.repository.getValidMaterialIds(
        c,
        material_ids
      )
      const invalid = material_ids.filter((id) => !validIds.includes(id))
      if (invalid.length > 0) {
        throw new ValidationError(
          c.var.t("validator.not_found", { field: `material_id ${invalid}` })
        )
      }
    }

    // Validate budget_source_ids against ws_budget_sources
    if (budget_source_ids && budget_source_ids.length > 0) {
      const validIds = await this.repository.getValidBudgetSources(
        c,
        budget_source_ids
      )
      const invalid = budget_source_ids.filter((id) => !validIds.includes(id))
      if (invalid.length > 0) {
        throw new ValidationError(
          c.var.t("validator.not_found", {
            field: `budget_source_ids ${invalid}`,
          })
        )
      }
    }
  }

  validateCreate = async (c: Context, body: CreateActivityPlan) => {
    // Validate title is provided
    if (!body.title || body.title.trim() === "") {
      throw new ValidationError(c.var.t("common.validation_error"))
    }

    // Validate title length
    if (body.title.length > 255) {
      throw new ValidationError(c.var.t("common.validation_error"))
    }

    await this.#validateReferences(c, body)

    return body
  }

  validateUpdate = async (c: Context, body: UpdateActivityPlan) => {
    const microplanningId = c.var.microplanningId!
    const id = Number(c.req.param("id"))

    // Validate record exists
    const record = await this.repository.findById(c, id, microplanningId)

    if (!record) {
      throw new NotFoundError(
        c.var.t("validator.not_found", {
          field: c.var.t("microplanning.label.activity_plan"),
        })
      )
    }

    // Validate title is not being changed for mandatory plans
    if (
      record.is_mandatory === 1 &&
      body.title &&
      body.title !== record.title
    ) {
      throw new ValidationError(
        c.var.t("microplanning.error.cannot_change_mandatory_plan_title")
      )
    }

    await this.#validateReferences(c, body)

    return body
  }

  validateDelete = async (c: Context, params: { id: number }) => {
    const microplanningId = c.var.microplanningId!

    // Validate record exists
    const record = await this.repository.findById(c, params.id, microplanningId)

    if (!record) {
      throw new NotFoundError(
        c.var.t("validator.not_found", {
          field: c.var.t("microplanning.label.activity_plan"),
        })
      )
    }

    // Cannot delete mandatory plans
    if (record.is_mandatory === 1) {
      throw new BadRequestError(
        c.var.t("microplanning.error.cannot_delete_mandatory_plan")
      )
    }

    return params
  }
}
