import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import { BmhpTargetGroupRepository } from "./bmhp-target-groups.repository.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import {
  CreateBmhpTargetGroupRequest,
  GetBmhpTargetGroupsQueries,
  UpdateBmhpTargetGroupRequest,
  UpdateBmhpTargetGroupStatusRequest,
} from "./bmhp-target-groups.schema.js"

export class BmhpTargetGroupModule {
  constructor(
    private readonly bmhpTargetGroupRepo: BmhpTargetGroupRepository
  ) {}

  readonly #convertAge = (
    ageRange: string | undefined
  ): { ageMin: number; ageMax: number } => {
    if (!ageRange) return { ageMin: 0, ageMax: 0 }
    const match = ageRange.match(/(\d+)\s*-\s*(\d+)/)
    if (match) {
      const min = Number(match[1])
      const max = Number(match[2])
      return {
        ageMin: min * 365,
        ageMax: max * 365,
      }
    }
    return { ageMin: 0, ageMax: 0 }
  }

  async list(c: Context, query: GetBmhpTargetGroupsQueries) {
    const { list, total } = await this.bmhpTargetGroupRepo.findWithPagination(
      c,
      query
    )
    return new PaginatedResponse(query, list, total)
  }

  async detail(c: Context, id: number) {
    const result = await this.bmhpTargetGroupRepo.findByIdWithExaminations(
      c,
      id
    )

    if (!result) {
      throw new NotFoundError("BMHP Target Group not found")
    }

    return result
  }

  async create(c: Context, request: CreateBmhpTargetGroupRequest) {
    const { ageMin, ageMax } = this.#convertAge(request.age_range)

    const data = {
      title: request.name,
      age_min: ageMin,
      age_max: ageMax,
      is_active: request.is_active,
    }

    const result = await this.bmhpTargetGroupRepo.create(c, data)
    const id = Number(result.insertId)

    // Handle association
    const programId = c.var.programId
    if (programId) {
      await this.bmhpTargetGroupRepo.associateWithWorkspace(c, {
        target_group_id: id,
        program_id: programId,
      })
    }

    return this.bmhpTargetGroupRepo.findByIdWithExaminations(c, id)
  }

  async update(c: Context, id: number, request: UpdateBmhpTargetGroupRequest) {
    const existing = await this.bmhpTargetGroupRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Target Group not found")
    }

    const { ageMin, ageMax } = this.#convertAge(request.age_range)

    const data: Record<string, unknown> = {}
    if (request.name !== undefined) data.title = request.name
    if (request.age_range !== undefined) {
      data.age_min = ageMin
      data.age_max = ageMax
    }
    if (request.is_active !== undefined) data.is_active = request.is_active

    if (Object.keys(data).length > 0) {
      await this.bmhpTargetGroupRepo.update(c, data, { id })
    }

    return this.bmhpTargetGroupRepo.findByIdWithExaminations(c, id)
  }

  async updateStatus(
    c: Context,
    id: number,
    request: UpdateBmhpTargetGroupStatusRequest
  ) {
    const existing = await this.bmhpTargetGroupRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Target Group not found")
    }

    await this.bmhpTargetGroupRepo.update(
      c,
      { is_active: request.is_active },
      { id }
    )

    return this.bmhpTargetGroupRepo.findByIdWithExaminations(c, id)
  }

  async delete(c: Context, id: number) {
    const existing = await this.bmhpTargetGroupRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Target Group not found")
    }

    const isUsed = await this.bmhpTargetGroupRepo.checkUsage(c, id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.bmhpTargetGroupRepo.delete(c, { id })

    return { message: "BMHP Target Group deleted successfully" }
  }
}
