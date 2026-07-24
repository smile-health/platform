import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { pick } from "@smile/lib/utils.js"
import { Context } from "hono"
import { BmhpParameterRepository } from "./bmhp-parameters.repository.js"
import {
  CreateBmhpParameterRequest,
  GetBmhpParametersQueries,
  UpdateBmhpParameterRequest,
} from "./bmhp-parameters.schema.js"

export class BmhpParameterModule {
  constructor(private readonly bmhpParameterRepo: BmhpParameterRepository) {}

  async list(c: Context, query: GetBmhpParametersQueries) {
    const { list, total } = await this.bmhpParameterRepo.findWithPagination(
      c,
      query
    )
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
    const result = await this.bmhpParameterRepo.findDetailById(c, id)

    if (!result) {
      throw new NotFoundError("BMHP Parameter not found")
    }

    const row = result as Record<string, unknown>
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

  async create(c: Context, request: CreateBmhpParameterRequest) {
    // Check if name already exists within the same program plan
    const existing = await this.bmhpParameterRepo.findByName(
      c,
      request.name,
      request.program_plan_id
    )
    if (existing) {
      throw new ValidationError("BMHP Parameter with this name already exists")
    }

    const data = pick(request, [
      "program_plan_id",
      "name",
      "unit",
      "description",
    ])

    const result = await this.bmhpParameterRepo.create(c, data)
    const id = Number(result.insertId)

    return this.bmhpParameterRepo.findOne(c, { id })
  }

  async update(c: Context, id: number, request: UpdateBmhpParameterRequest) {
    const existing = await this.bmhpParameterRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Parameter not found")
    }

    // Check if name already exists within the same program plan (excluding current record)
    if (request.name && request.name !== existing.name) {
      const duplicate = await this.bmhpParameterRepo.findByName(
        c,
        request.name,
        request.program_plan_id ?? existing.program_plan_id ?? undefined
      )
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(
          "BMHP Parameter with this name already exists"
        )
      }
    }

    const data = pick(request, [
      "program_plan_id",
      "name",
      "unit",
      "description",
    ])

    await this.bmhpParameterRepo.update(c, data, { id })

    return this.bmhpParameterRepo.findOne(c, { id })
  }

  async delete(c: Context, id: number) {
    const existing = await this.bmhpParameterRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Parameter not found")
    }

    const isUsed = await this.bmhpParameterRepo.checkUsage(c, id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.bmhpParameterRepo.delete(c, { id })

    return { message: "BMHP Parameter deleted successfully" }
  }
}
