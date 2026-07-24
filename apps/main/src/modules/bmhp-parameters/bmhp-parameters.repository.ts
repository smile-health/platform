import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import { GetBmhpParametersQueries } from "./bmhp-parameters.schema.js"

export class BmhpParameterRepository extends BaseRepository<"bmhp_parameters"> {
  constructor() {
    super("bmhp_parameters", false) // No program filter for bmhp_parameters
  }

  async findWithPagination(c: Context, query: GetBmhpParametersQueries) {
    let dbQuery = c.var.trx
      .selectFrom("bmhp_parameters as bp")
      .leftJoin("ws_users as cu", "cu.id", "bp.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bp.created_by")
      .select([
        "bp.id",
        "bp.program_plan_id",
        "bp.name",
        "bp.unit",
        "bp.description",
        "bp.created_at",
        "bp.updated_at",
        "bp.created_by",
        "bp.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bp.deleted_at", "is", null)

    // Search by name, unit, or description if provided
    if (query.keyword) {
      dbQuery = dbQuery.where((eb) =>
        eb.or([
          eb("bp.name", "like", `%${query.keyword}%`),
          eb("bp.unit", "like", `%${query.keyword}%`),
          eb("bp.description", "like", `%${query.keyword}%`),
        ])
      )
    }

    // Filter by program_plan_id if provided
    if (query.program_plan_id) {
      dbQuery = dbQuery.where("bp.program_plan_id", "=", query.program_plan_id)
    }

    // Sorting
    const sortBy = query.sort_by || "created_at"
    const sortType = query.sort_type || "desc"
    dbQuery = dbQuery.orderBy(`bp.${sortBy}`, sortType)

    // Pagination
    const page = query.page || 1
    const perPage = query.paginate || 10
    const offset = (page - 1) * perPage

    const [data, totalResult] = await Promise.all([
      dbQuery.limit(perPage).offset(offset).execute(),
      dbQuery
        .clearSelect()
        .clearOrderBy()
        .select((eb) => [eb.fn.count("bp.id").as("total")])
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return {
      list: data,
      total,
    }
  }

  async findByName(c: Context, name: string, programPlanId?: number) {
    let query = c.var.trx
      .selectFrom("bmhp_parameters")
      .selectAll()
      .where("bmhp_parameters.name", "=", name)
      .where("bmhp_parameters.deleted_at", "is", null)

    if (programPlanId) {
      query = query.where("bmhp_parameters.program_plan_id", "=", programPlanId)
    }

    return await query.executeTakeFirst()
  }
  async findDetailById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("bmhp_parameters as bp")
      .leftJoin("ws_users as cu", "cu.id", "bp.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bp.created_by")
      .select([
        "bp.id",
        "bp.program_plan_id",
        "bp.name",
        "bp.unit",
        "bp.description",
        "bp.created_at",
        "bp.updated_at",
        "bp.created_by",
        "bp.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bp.id", "=", id)
      .where("bp.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const result = await c.var.trx
      .selectFrom("ws_bmhp_examination_parameters")
      .select((eb) => [eb.fn.count("id").as("count")])
      .where("parameter_id", "=", id)
      .executeTakeFirst()
    return Number(result?.count || 0) > 0
  }
}
