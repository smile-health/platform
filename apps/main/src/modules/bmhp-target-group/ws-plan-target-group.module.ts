import { BadRequestError, NotFoundError, ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import { WsPlanTargetGroupRepository } from "./ws-plan-target-group.repository.js"
import {
  BulkCreateWsPlanTargetGroupRequest,
  ListWsPlanTargetGroupQueries,
  VerifyPlanQueries,
} from "./ws-plan-target-group.schema.js"

export class WsPlanTargetGroupModule {
  constructor(
    private readonly wsPlanTargetGroupRepo: WsPlanTargetGroupRepository
  ) {}

  async list(c: Context, query: ListWsPlanTargetGroupQueries) {
    const response = await this.wsPlanTargetGroupRepo.findWithPagination(
      c,
      query
    )
    return response
  }

  async bulkCreate(c: Context, request: BulkCreateWsPlanTargetGroupRequest) {
    const { program_plan_id, target_group_ids } = request

    const uniqueTargetGroupIds = [...new Set(target_group_ids)]

    const existing =
      await this.wsPlanTargetGroupRepo.findExistingByProgramPlanAndTargetGroupIds(
        c,
        program_plan_id,
        uniqueTargetGroupIds
      )

    const existingIds = new Set(existing)

    const newTargetGroupIds = uniqueTargetGroupIds.filter(
      (id) => !existingIds.has(id)
    )

    if (newTargetGroupIds.length === 0) {
      throw new BadRequestError(
        "Target group already exists for this program plan"
      )
    }

    await this.wsPlanTargetGroupRepo.bulkCreate(c, {
      program_plan_id,
      target_group_ids: newTargetGroupIds,
    })

    return { message: "Target groups created successfully" }
  }

  async verifyPlan(c: Context, query: VerifyPlanQueries) {
    const data = await this.wsPlanTargetGroupRepo.findExistingTargetGroups(
      c,
      query.program_plan_id
    )
    return { data }
  }

  async delete(c: Context, id: number) {
    const existing = await this.wsPlanTargetGroupRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("Plan Target Group not found")
    }

    const isUsed = await this.wsPlanTargetGroupRepo.checkUsage(c, id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.wsPlanTargetGroupRepo.delete(c, { id })

    return { message: "Plan Target Group deleted successfully" }
  }
}
