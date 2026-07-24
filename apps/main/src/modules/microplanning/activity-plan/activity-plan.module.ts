import { BadRequestError, ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import {
  ActivityPlanRepository,
  ActivityPlanWithReferences,
} from "./activity-plan.repository.js"
import {
  ActivityPlanDetailResponse,
  ActivityPlanListItemResponse,
  ActivityPlanSummaryResponse,
  CreateActivityPlan,
  CreateActivityPlanResponse,
  UpdateActivityPlan,
  UpdateActivityPlanResponse,
} from "./activity-plan.schema.js"

export class ActivityPlanModule {
  constructor(private readonly repository: ActivityPlanRepository) {}

  async getActivityPlans(c: Context): Promise<ActivityPlanListItemResponse[]> {
    const microplanningId = c.var.microplanningId!

    const plans = await this.repository.findAllWithReferences(
      c,
      microplanningId
    )

    if (plans.filter((plan) => plan.is_mandatory === 1).length === 0) {
      await this.seedMandatoryPlans(c)
      return this.getActivityPlans(c)
    }

    return plans.map((plan) => {
      const hasCompleted = plan.objective !== null

      let data: ActivityPlanDetailResponse | null = null

      if (hasCompleted) {
        data = this.#mapToDetailResponse(plan)
      }

      return {
        id: plan.id,
        title: plan.title,
        has_completed: Number(hasCompleted),
        is_mandatory: plan.is_mandatory,
        data,
      }
    })
  }

  async getActivityPlanDetail(
    c: Context,
    id: number
  ): Promise<ActivityPlanDetailResponse> {
    const microplanningId = c.var.microplanningId!

    const plan = await this.repository.findByIdWithReferences(
      c,
      id,
      microplanningId
    )

    if (!plan) {
      throw new ValidationError(
        c.var.t("validator.not_found", {
          field: c.var.t("microplanning.label.activity_plan"),
        })
      )
    }

    return this.#mapToDetailResponse(plan)
  }

  async createActivityPlan(
    c: Context,
    body: CreateActivityPlan
  ): Promise<CreateActivityPlanResponse> {
    const microplanningId = c.var.microplanningId!

    const result = await this.repository.create(c, microplanningId, {
      title: body.title,
      objective: body.objective ?? null,
      frequency_id: body.frequency_id ?? null,
      target_group_ids: JSON.stringify(body.target_group_ids),
      location_type_ids: JSON.stringify(body.location_type_ids),
      implementation_schedule: body.implementation_schedule ?? null,
      material_ids: JSON.stringify(body.material_ids),
      budget_estimation: body.budget_estimation ?? null,
      budget_source_ids: JSON.stringify(body.budget_source_ids),
      other_budget_source_name: body.other_budget_source_name ?? null,
      additional_information: body.additional_information ?? null,
      number_of_vaccinator: body.number_of_vaccinator ?? null,
      pics: body.pics ?? null,
    })

    return {
      message: "success",
      id: Number(result.insertId),
    }
  }

  async updateActivityPlan(
    c: Context,
    id: number,
    body: UpdateActivityPlan
  ): Promise<UpdateActivityPlanResponse> {
    await this.repository.update(c, id, {
      title: body.title ?? undefined,
      objective: body.objective ?? null,
      frequency_id: body.frequency_id ?? null,
      target_group_ids: JSON.stringify(body.target_group_ids) ?? null,
      location_type_ids: JSON.stringify(body.location_type_ids) ?? null,
      implementation_schedule: body.implementation_schedule ?? null,
      material_ids: JSON.stringify(body.material_ids) ?? null,
      budget_estimation: body.budget_estimation ?? null,
      budget_source_ids: JSON.stringify(body.budget_source_ids) ?? null,
      other_budget_source_name: body.other_budget_source_name ?? null,
      additional_information: body.additional_information ?? null,
      number_of_vaccinator: body.number_of_vaccinator ?? null,
      pics: body.pics ?? null,
    })

    return { message: "success" }
  }

  async deleteActivityPlan(
    c: Context,
    id: number
  ): Promise<UpdateActivityPlanResponse> {
    const microplanningId = c.var.microplanningId!

    const result = await this.repository.softDelete(c, id, microplanningId)

    if (result.length === 0) {
      throw new BadRequestError(
        c.var.t("microplanning.error.cannot_delete_mandatory_plan")
      )
    }

    return { message: "success" }
  }

  async getSummary(c: Context): Promise<ActivityPlanSummaryResponse> {
    const microplanningId = c.var.microplanningId!
    const summary = await this.repository.getSummary(c, microplanningId)

    return {
      total_plans: summary.total_plans,
    }
  }

  async seedMandatoryPlans(c: Context): Promise<void> {
    const microplanningId = c.var.microplanningId!
    await this.repository.seedMandatoryPlans(c, microplanningId)
  }

  async updateStatus(c: Context, status: number): Promise<void> {
    const microplanningId = c.var.microplanningId!
    await this.repository.updateStatusByMicroplanningId(
      c,
      microplanningId,
      status
    )
  }

  #mapToDetailResponse(
    plan: ActivityPlanWithReferences
  ): ActivityPlanDetailResponse {
    return {
      id: plan.id,
      title: plan.title,
      objective: plan.objective,
      frequency: plan.frequency,
      target_groups: plan.target_groups,
      location_types: plan.location_types,
      implementation_schedule: plan.implementation_schedule,
      materials: plan.materials,
      budget_estimation: plan.budget_estimation,
      budget_sources: plan.budget_sources,
      other_budget_source_name: plan.other_budget_source_name,
      additional_information: plan.additional_information,
      number_of_vaccinator: plan.number_of_vaccinator,
      pics: plan.pics,
      is_mandatory: plan.is_mandatory,
      has_completed: plan.has_completed,
      status: plan.status,
    }
  }
}
