import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { pick } from "@smile/lib/utils.js"
import { Context } from "hono"
import { BmhpExaminationParameterRepository } from "./bmhp-examination-parameters.repository.js"
import {
  BulkCreateBmhpExaminationParametersRequest,
  CreateBmhpExaminationParameterRequest,
  GetBmhpExaminationParametersQueries,
  UpdateBmhpExaminationParameterRequest,
} from "./bmhp-examination-parameters.schema.js"

export class BmhpExaminationParameterModule {
  constructor(
    private readonly bmhpExaminationParameterRepo: BmhpExaminationParameterRepository
  ) {}

  async list(c: Context, query: GetBmhpExaminationParametersQueries) {
    const { list, total } = await this.bmhpExaminationParameterRepo.findWithPagination(c, query)
    return new PaginatedResponse(query, list, total)
  }

  async listByExaminationId(c: Context, examinationId: number) {
    const examination = await this.bmhpExaminationParameterRepo.findExaminationById(
      c,
      examinationId
    )

    if (!examination) {
      throw new NotFoundError("BMHP Examination not found")
    }

    return await this.bmhpExaminationParameterRepo.findByExaminationId(c, examinationId)
  }

  async detail(c: Context, id: number) {
    const result = await this.bmhpExaminationParameterRepo.findOne(c, { id })

    if (!result) {
      throw new NotFoundError("BMHP Examination Parameter not found")
    }

    return await this.bmhpExaminationParameterRepo.findDetailWithRelations(c, id)
  }

  async create(c: Context, request: CreateBmhpExaminationParameterRequest) {
    const examination = await this.bmhpExaminationParameterRepo.findExaminationById(
      c,
      request.examination_id
    )

    if (!examination) {
      throw new NotFoundError("BMHP Examination not found")
    }

    const parameter = await this.bmhpExaminationParameterRepo.findParameterById(
      c,
      request.parameter_id
    )

    if (!parameter) {
      throw new NotFoundError("BMHP Parameter not found")
    }

    // Check if combination already exists
    const existing = await this.bmhpExaminationParameterRepo.findOneByExaminationIdAndParameterId(
      c,
      request.examination_id,
      request.parameter_id
    )

    if (existing) {
      throw new ValidationError("This parameter is already assigned to the examination")
    }

    const data = pick(request, ["examination_id", "parameter_id", "sort_order"])

    const result = await this.bmhpExaminationParameterRepo.create(c, data)
    const id = Number(result.insertId)

    return this.detail(c, id)
  }

  async bulkCreate(c: Context, request: BulkCreateBmhpExaminationParametersRequest) {
    const examination = await this.bmhpExaminationParameterRepo.findExaminationById(
      c,
      request.examination_id
    )

    if (!examination) {
      throw new NotFoundError("BMHP Examination not found")
    }

    // Delete existing parameters for this examination
    await this.bmhpExaminationParameterRepo.deleteByExaminationId(c, request.examination_id)

    // Create new parameters
    const parameterData = request.parameters.map((param) => ({
      examination_id: request.examination_id,
      parameter_id: param.parameter_id,
      sort_order: param.sort_order,
    }))

    await this.bmhpExaminationParameterRepo.createMany(c, parameterData)

    return this.listByExaminationId(c, request.examination_id)
  }

  async update(c: Context, id: number, request: UpdateBmhpExaminationParameterRequest) {
    const existing = await this.bmhpExaminationParameterRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Examination Parameter not found")
    }

    // Check if parameter_id is being updated and if combination already exists
    if (request.parameter_id && request.parameter_id !== existing.parameter_id) {
      const duplicate = await this.bmhpExaminationParameterRepo.findOneByExaminationIdAndParameterId(
        c,
        existing.examination_id,
        request.parameter_id
      )

      if (duplicate) {
        throw new ValidationError("This parameter is already assigned to the examination")
      }
    }

    const data = pick(request, ["parameter_id", "sort_order"])

    await this.bmhpExaminationParameterRepo.update(c, data, { id })

    return this.detail(c, id)
  }

  async delete(c: Context, id: number) {
    const existing = await this.bmhpExaminationParameterRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Examination Parameter not found")
    }

    await this.bmhpExaminationParameterRepo.delete(c, { id })

    return { message: "BMHP Examination Parameter deleted successfully" }
  }
}
