import { Context } from "hono"
import { EnvironmentalAnalysisParameterRepository } from "./environmental-analysis-parameter.repository.js"
import {
  GetAnalysisParameterListQuery,
  CreateAnalysisParameterRequest,
  UpdateAnalysisParameterRequest,
} from "./environmental-analysis-parameter.schema.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"

export class EnvironmentalAnalysisParameterModule {
  constructor(
    private readonly repository: EnvironmentalAnalysisParameterRepository
  ) {}

  async list(c: Context, params: GetAnalysisParameterListQuery) {
    const { list, total } = await this.repository.getList(c, params)

    const result = list.map((item) => {
      const id = Number(item.id)
      return {
        id,
        name: item.name,
        unit_id: item.unit_id ? Number(item.unit_id) : null,
        unit: item.unit,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }
    })
    return new PaginatedResponse(params, result, total)
  }

  async detail(c: Context, id: number) {
    const data = await this.repository.getById(c, id)
    if (!data) return null

    return {
      id: Number(data.id),
      name: data.name,
      unit_id: data.unit_id ? Number(data.unit_id) : null,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  async create(c: Context, body: CreateAnalysisParameterRequest) {
    const result = await this.repository.create(c, {
      name: body.name,
      unit_id: body.unit_id,
    })

    return { id: Number(result.insertId) }
  }

  async update(c: Context, id: number, body: UpdateAnalysisParameterRequest) {
    const updateFields = ["name", "unit_id"] as const

    const updateData = updateFields.reduce(
      (acc, field) => {
        if (body[field] !== undefined) {
          acc[field] = body[field]
        }
        return acc
      },
      {} as Record<string, unknown>
    )

    if (Object.keys(updateData).length > 0) {
      await this.repository.update(
        c,
        id,
        updateData as {
          name?: string
          unit_id?: number
        }
      )
    }
  }

  async delete(c: Context, id: number) {
    await this.repository.delete(c, id)
  }
}
