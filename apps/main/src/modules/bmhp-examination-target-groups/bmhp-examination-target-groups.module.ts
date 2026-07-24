import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { pick } from "@smile/lib/utils.js"
import { Context } from "hono"
import { BmhpExaminationTargetGroupRepository } from "./bmhp-examination-target-groups.repository.js"
import {
  BulkCreateBmhpExaminationTargetGroupsRequest,
  CreateBmhpExaminationTargetGroupRequest,
  GetBmhpExaminationTargetGroupsQueries,
} from "./bmhp-examination-target-groups.schema.js"

export class BmhpExaminationTargetGroupModule {
  constructor(
    private readonly bmhpExaminationTargetGroupRepo: BmhpExaminationTargetGroupRepository
  ) {}

  async list(c: Context, query: GetBmhpExaminationTargetGroupsQueries) {
    const { list, total } = await this.bmhpExaminationTargetGroupRepo.findWithPagination(c, query)
    return new PaginatedResponse(query, list, total)
  }

  async listByExaminationId(c: Context, examinationId: number) {
    const examination = await this.bmhpExaminationTargetGroupRepo.findExaminationById(
      c,
      examinationId
    )

    if (!examination) {
      throw new NotFoundError("BMHP Examination not found")
    }

    return await this.bmhpExaminationTargetGroupRepo.findByExaminationId(c, examinationId)
  }

  async detail(c: Context, id: number) {
    const result = await this.bmhpExaminationTargetGroupRepo.findOne(c, { id })

    if (!result) {
      throw new NotFoundError("BMHP Examination Target Group not found")
    }

    return await this.bmhpExaminationTargetGroupRepo.findDetailWithRelations(c, id)
  }

  async create(c: Context, request: CreateBmhpExaminationTargetGroupRequest) {
    const examination = await this.bmhpExaminationTargetGroupRepo.findExaminationById(
      c,
      request.examination_id
    )

    if (!examination) {
      throw new NotFoundError("BMHP Examination not found")
    }

    const targetGroup = await this.bmhpExaminationTargetGroupRepo.findTargetGroupById(
      c,
      request.target_group_id
    )

    if (!targetGroup) {
      throw new NotFoundError("BMHP Target Group not found")
    }

    // Check if combination already exists
    const existing = await this.bmhpExaminationTargetGroupRepo.findOneByExaminationIdAndTargetGroupId(
      c,
      request.examination_id,
      request.target_group_id
    )

    if (existing) {
      throw new ValidationError("This target group is already assigned to the examination")
    }

    const data = pick(request, ["examination_id", "target_group_id"])

    const result = await this.bmhpExaminationTargetGroupRepo.create(c, data)
    const id = Number(result.insertId)

    return this.detail(c, id)
  }

  async bulkCreate(c: Context, request: BulkCreateBmhpExaminationTargetGroupsRequest) {
    const examination = await this.bmhpExaminationTargetGroupRepo.findExaminationById(
      c,
      request.examination_id
    )

    if (!examination) {
      throw new NotFoundError("BMHP Examination not found")
    }

    // Delete existing target groups for this examination
    await this.bmhpExaminationTargetGroupRepo.deleteByExaminationId(c, request.examination_id)

    // Create new target groups
    const targetGroupData = request.target_groups.map((tg) => ({
      examination_id: request.examination_id,
      target_group_id: tg.target_group_id,
    }))

    await this.bmhpExaminationTargetGroupRepo.createMany(c, targetGroupData)

    return this.listByExaminationId(c, request.examination_id)
  }

  async delete(c: Context, id: number) {
    const existing = await this.bmhpExaminationTargetGroupRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Examination Target Group not found")
    }

    await this.bmhpExaminationTargetGroupRepo.delete(c, { id })

    return { message: "BMHP Examination Target Group deleted successfully" }
  }
}
