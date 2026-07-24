import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { pick } from "@smile/lib/utils.js"
import { Context } from "hono"
import {
  BmhpExaminationMethodRepository,
  WsBmhpExaminationMethodRepository,
} from "./bmhp-examination-methods.repository.js"
import {
  CreateBmhpExaminationMethodRequest,
  GetBmhpExaminationMethodsQueries,
  UpdateBmhpExaminationMethodRequest,
  CreateWsBmhpExaminationMethodRequest,
  GetWsBmhpExaminationMethodsQueries,
  UpdateWsBmhpExaminationMethodRequest,
} from "./bmhp-examination-methods.schema.js"

export class BmhpExaminationMethodModule {
  constructor(
    private readonly bmhpExaminationMethodRepo: BmhpExaminationMethodRepository,
    private readonly wsBmhpExaminationMethodRepo: WsBmhpExaminationMethodRepository
  ) {}

  async list(c: Context, query: GetBmhpExaminationMethodsQueries) {
    const { list, total } =
      await this.bmhpExaminationMethodRepo.findWithPagination(c, query)
    const formattedList = list.map((item) => {
      const row = item as Record<string, unknown>
      const {
        id_updated,
        username_updated,
        firstname_updated,
        lastname_updated,
        id_created,
        username_created,
        firstname_created,
        lastname_created,
        ...rest
      } = row
      return {
        ...rest,
        description: rest.description ?? "-",
        user_updated_by: id_updated
          ? {
              id: id_updated,
              username: username_updated,
              firstname: firstname_updated,
              lastname: lastname_updated,
            }
          : null,
        user_created_by: id_created
          ? {
              id: id_created,
              username: username_created,
              firstname: firstname_created,
              lastname: lastname_created,
            }
          : null,
      }
    })
    return new PaginatedResponse(query, formattedList, total)
  }

  async detail(c: Context, id: number) {
    const method =
      await this.bmhpExaminationMethodRepo.findByIdWithExaminations(c, id)

    if (!method) {
      throw new NotFoundError("Examination method not found")
    }
    const row = method as Record<string, unknown>
    const {
      id_updated,
      username_updated,
      firstname_updated,
      lastname_updated,
      updated_by,
      id_created,
      username_created,
      firstname_created,
      lastname_created,
      ...rest
    } = row
    return {
      ...rest,
      created_by: id_created
        ? [firstname_created, lastname_created].filter(Boolean).join(" ") ||
          username_created
        : null,
      updated_by: id_updated
        ? [firstname_updated, lastname_updated].filter(Boolean).join(" ") ||
          username_updated
        : null,
    }
  }

  async create(c: Context, request: CreateBmhpExaminationMethodRequest) {
    // Check if name already exists within the same program plan
    const existing = await this.bmhpExaminationMethodRepo.findByName(
      c,
      request.name,
      request.program_plan_id
    )
    if (existing) {
      throw new ValidationError(
        "BMHP Examination Method with this name already exists"
      )
    }

    const data = pick(request, ["name", "description", "program_plan_id"])

    const result = await this.bmhpExaminationMethodRepo.create(c, data)
    const id = Number(result.insertId)

    return this.bmhpExaminationMethodRepo.findOne(c, { id })
  }

  async update(
    c: Context,
    id: number,
    request: UpdateBmhpExaminationMethodRequest
  ) {
    const existing = await this.bmhpExaminationMethodRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Examination Method not found")
    }

    // Check if name already exists within the same program plan (excluding current record)
    if (request.name && request.name !== existing.name) {
      const duplicate = await this.bmhpExaminationMethodRepo.findByName(
        c,
        request.name,
        request.program_plan_id ?? existing.program_plan_id ?? undefined
      )
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(
          "BMHP Examination Method with this name already exists"
        )
      }
    }

    const data = pick(request, ["name", "description", "program_plan_id"])

    await this.bmhpExaminationMethodRepo.update(c, data, { id })

    return this.bmhpExaminationMethodRepo.findOne(c, { id })
  }

  async delete(c: Context, id: number) {
    const existing = await this.bmhpExaminationMethodRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Examination Method not found")
    }

    const isUsed = await this.bmhpExaminationMethodRepo.checkUsage(c, id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.bmhpExaminationMethodRepo.delete(c, { id })

    return { message: "BMHP Examination Method deleted successfully" }
  }

  async getMethodsByExamination(c: Context, examinationId: number) {
    const methods = await this.bmhpExaminationMethodRepo.findByExaminationId(
      c,
      examinationId
    )

    if (!methods || methods.length === 0) {
      return []
    }

    return methods
  }

  // Workspace Examination Methods
  async wsList(c: Context, query: GetWsBmhpExaminationMethodsQueries) {
    const { list, total } =
      await this.wsBmhpExaminationMethodRepo.findWithPagination(c, query)
    return new PaginatedResponse(query, list, total)
  }

  async wsDetail(c: Context, id: number) {
    const result = await this.wsBmhpExaminationMethodRepo.findByIdWithDetails(
      c,
      id
    )

    if (!result) {
      throw new NotFoundError("Workspace BMHP Examination Method not found")
    }

    return result
  }

  async wsCreate(c: Context, request: CreateWsBmhpExaminationMethodRequest) {
    // Check if combination already exists
    const existing =
      await this.wsBmhpExaminationMethodRepo.findByExaminationAndMethod(
        c,
        request.examination_id,
        request.method_id
      )
    if (existing) {
      throw new ValidationError(
        "This examination and method combination already exists"
      )
    }

    const data = pick(request, ["examination_id", "method_id"])

    const result = await this.wsBmhpExaminationMethodRepo.create(c, data)
    const id = Number(result.insertId)

    return this.wsBmhpExaminationMethodRepo.findOne(c, { id })
  }

  async wsUpdate(
    c: Context,
    id: number,
    request: UpdateWsBmhpExaminationMethodRequest
  ) {
    const existing = await this.wsBmhpExaminationMethodRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("Workspace BMHP Examination Method not found")
    }

    // Check if new combination already exists (excluding current record)
    const newExaminationId = request.examination_id ?? existing.examination_id
    const newMethodId = request.method_id ?? existing.method_id

    if (
      newExaminationId !== existing.examination_id ||
      newMethodId !== existing.method_id
    ) {
      const duplicate =
        await this.wsBmhpExaminationMethodRepo.findByExaminationAndMethod(
          c,
          newExaminationId,
          newMethodId
        )
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(
          "This examination and method combination already exists"
        )
      }
    }

    const data = pick(request, ["examination_id", "method_id"])

    await this.wsBmhpExaminationMethodRepo.update(c, data, { id })

    return this.wsBmhpExaminationMethodRepo.findOne(c, { id })
  }

  async wsDelete(c: Context, id: number) {
    const existing = await this.wsBmhpExaminationMethodRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("Workspace BMHP Examination Method not found")
    }

    await this.wsBmhpExaminationMethodRepo.delete(c, { id })

    return { message: "Workspace BMHP Examination Method deleted successfully" }
  }
}
