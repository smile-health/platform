import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import { GetBmhpExaminationParametersQueries } from "./bmhp-examination-parameters.schema.js"

export class BmhpExaminationParameterRepository extends BaseRepository<"ws_bmhp_examination_parameters"> {
  constructor() {
    super("ws_bmhp_examination_parameters", false, false, false, false) // No program filter, no soft delete, no audit
  }

  async findWithPagination(
    c: Context,
    query: GetBmhpExaminationParametersQueries
  ) {
    const { page, paginate, examination_id, parameter_id, sort_by, sort_type } =
      query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "sort_order"
    const sortType = sort_type || "asc"

    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_examination_parameters")
      .innerJoin(
        "bmhp_examinations",
        "bmhp_examinations.id",
        "ws_bmhp_examination_parameters.examination_id"
      )
      .innerJoin(
        "bmhp_parameters",
        "bmhp_parameters.id",
        "ws_bmhp_examination_parameters.parameter_id"
      )
      .select([
        "ws_bmhp_examination_parameters.id",
        "ws_bmhp_examination_parameters.examination_id",
        "ws_bmhp_examination_parameters.parameter_id",
        "ws_bmhp_examination_parameters.sort_order",
        "ws_bmhp_examination_parameters.created_at",
        "ws_bmhp_examination_parameters.updated_at",
        "ws_bmhp_examination_parameters.updated_by",
        "bmhp_examinations.name as examination_name",
        "bmhp_parameters.name as parameter_name",
        "bmhp_parameters.unit as parameter_unit",
        "bmhp_parameters.description as parameter_description",
        "bmhp_parameters.updated_at as parameter_updated_at",
        "bmhp_parameters.updated_by as parameter_updated_by",
      ])

    // Filter by examination_id if provided
    if (examination_id) {
      dbQuery = dbQuery.where(
        "ws_bmhp_examination_parameters.examination_id",
        "=",
        examination_id
      )
    }

    // Filter by parameter_id if provided
    if (parameter_id) {
      dbQuery = dbQuery.where(
        "ws_bmhp_examination_parameters.parameter_id",
        "=",
        parameter_id
      )
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .orderBy(sortBy, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("ws_bmhp_examination_parameters")
        .select((eb) => [eb.fn.count("id").as("total")])
        .$if(!!examination_id, (qb) =>
          qb.where(
            "ws_bmhp_examination_parameters.examination_id",
            "=",
            examination_id
          )
        )
        .$if(!!parameter_id, (qb) =>
          qb.where(
            "ws_bmhp_examination_parameters.parameter_id",
            "=",
            parameter_id
          )
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findByExaminationId(c: Context, examinationId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_parameters")
      .innerJoin(
        "bmhp_parameters",
        "bmhp_parameters.id",
        "ws_bmhp_examination_parameters.parameter_id"
      )
      .select([
        "ws_bmhp_examination_parameters.id",
        "ws_bmhp_examination_parameters.examination_id",
        "ws_bmhp_examination_parameters.parameter_id",
        "ws_bmhp_examination_parameters.sort_order",
        "ws_bmhp_examination_parameters.created_at",
        // "ws_bmhp_examination_parameters.updated_at",
        // "ws_bmhp_examination_parameters.updated_by",
        "bmhp_parameters.name as parameter_name",
        "bmhp_parameters.unit as parameter_unit",
        "bmhp_parameters.description as parameter_description",
        "bmhp_parameters.updated_at as parameter_updated_at",
        "bmhp_parameters.updated_by as parameter_updated_by",
      ])
      .where(
        "ws_bmhp_examination_parameters.examination_id",
        "=",
        examinationId
      )
      .orderBy("ws_bmhp_examination_parameters.sort_order", "asc")
      .execute()
  }

  async findOneByExaminationIdAndParameterId(
    c: Context,
    examinationId: number,
    parameterId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_parameters")
      .selectAll()
      .where(
        "ws_bmhp_examination_parameters.examination_id",
        "=",
        examinationId
      )
      .where("ws_bmhp_examination_parameters.parameter_id", "=", parameterId)
      .executeTakeFirst()
  }

  async deleteByExaminationId(c: Context, examinationId: number) {
    return await c.var.trx
      .deleteFrom("ws_bmhp_examination_parameters")
      .where(
        "ws_bmhp_examination_parameters.examination_id",
        "=",
        examinationId
      )
      .execute()
  }

  async findByExaminationIds(c: Context, examinationIds: number[]) {
    if (examinationIds.length === 0) return []
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_parameters as wep")
      .innerJoin("bmhp_parameters as bp", "bp.id", "wep.parameter_id")
      .select([
        "wep.examination_id",
        "bp.id as parameter_id",
        "bp.name as parameter_name",
        "bp.unit as parameter_unit",
        "wep.sort_order",
      ])
      .where("wep.examination_id", "in", examinationIds)
      .orderBy("wep.sort_order", "asc")
      .execute()
  }

  async findExaminationById(c: Context, examinationId: number) {
    return await c.var.trx
      .selectFrom("bmhp_examinations")
      .selectAll()
      .where("id", "=", examinationId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findParameterById(c: Context, parameterId: number) {
    return await c.var.trx
      .selectFrom("bmhp_parameters")
      .selectAll()
      .where("id", "=", parameterId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findDetailWithRelations(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_parameters")
      .innerJoin(
        "bmhp_examinations",
        "bmhp_examinations.id",
        "ws_bmhp_examination_parameters.examination_id"
      )
      .innerJoin(
        "bmhp_parameters",
        "bmhp_parameters.id",
        "ws_bmhp_examination_parameters.parameter_id"
      )
      .select([
        "ws_bmhp_examination_parameters.id",
        "ws_bmhp_examination_parameters.examination_id",
        "ws_bmhp_examination_parameters.parameter_id",
        "ws_bmhp_examination_parameters.sort_order",
        "ws_bmhp_examination_parameters.created_at",
        "bmhp_examinations.name as examination_name",
        "bmhp_parameters.name as parameter_name",
        "bmhp_parameters.unit as parameter_unit",
        "bmhp_parameters.description as parameter_description",
      ])
      .where("ws_bmhp_examination_parameters.id", "=", id)
      .executeTakeFirst()
  }

  async getMaxSortOrder(c: Context, examinationId: number) {
    const result = await c.var.trx
      .selectFrom("ws_bmhp_examination_parameters")
      .select((eb) => [eb.fn.max("sort_order").as("max_sort")])
      .where(
        "ws_bmhp_examination_parameters.examination_id",
        "=",
        examinationId
      )
      .executeTakeFirst()

    return Number(result?.max_sort || 0)
  }
}
