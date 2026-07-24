import { Context } from "hono"
import { GetAnalysisParameterListQuery } from "./environmental-analysis-parameter.schema.js"

export class EnvironmentalAnalysisParameterRepository {
  async getList(c: Context, params: GetAnalysisParameterListQuery) {
    const { page, paginate, keyword, sort_by, sort_type } =
      params
    const offset = (page - 1) * paginate

    const sortBy = sort_by ?? "updated_at"
    const sortType = sort_type ?? "desc"

    const sortColumnMap = {
      name: "eap.name",
      unit: "eu.name",
      created_at: "eap.created_at",
      updated_at: "eap.updated_at",
    } as const

    const sortColumn =
      sortColumnMap[sortBy as keyof typeof sortColumnMap] ?? "eap.updated_at"

    let query = c.var.trx
      .selectFrom("environmental_analysis_parameters as eap")
      .leftJoin("environmental_units as eu", "eap.unit_id", "eu.id")
      .where("eap.deleted_at", "is", null)

    if (keyword) {
      query = query.where((eb) =>
        eb.or([
          eb("eap.name", "like", `%${keyword}%`),
          eb("eu.name", "like", `%${keyword}%`),
        ])
      )
    }

    const [list, totalResult] = await Promise.all([
      query
        .select([
          "eap.id",
          "eap.name",
          "eap.unit_id",
          "eu.name as unit",
          "eap.created_at",
          "eap.updated_at",
        ])
        .orderBy(sortColumn, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return {
      list,
      total: Number(totalResult?.total) || 0,
    }
  }

  async getById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_analysis_parameters as eap")
      .leftJoin("environmental_units as eu", "eap.unit_id", "eu.id")
      .select([
        "eap.id",
        "eap.name",
        "eap.unit_id",
        "eu.name as unit",
        "eap.created_at",
        "eap.updated_at",
      ])
      .where("eap.id", "=", id)
      .where("eap.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getOnlyById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_analysis_parameters")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async create(
    c: Context,
    data: {
      name: string
      unit_id: number
    }
  ) {
    return await c.var.trx
      .insertInto("environmental_analysis_parameters")
      .values({
        name: data.name,
        unit_id: data.unit_id,
      })
      .executeTakeFirstOrThrow()
  }

  async update(
    c: Context,
    id: number,
    data: {
      name?: string
      unit_id?: number | null
    }
  ) {
    return await c.var.trx
      .updateTable("environmental_analysis_parameters")
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async delete(c: Context, id: number) {
    return await c.var.trx
      .updateTable("environmental_analysis_parameters")
      .set({
        deleted_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async checkNameExists(c: Context, name: string, excludeId?: number) {
    let query = c.var.trx
      .selectFrom("environmental_analysis_parameters")
      .select("id")
      .where("name", "=", name)
      .where("deleted_at", "is", null)

    if (excludeId) {
      query = query.where("id", "!=", excludeId)
    }

    return await query.executeTakeFirst()
  }
}
