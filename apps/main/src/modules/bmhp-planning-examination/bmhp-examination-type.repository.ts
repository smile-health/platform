import { BaseRepository } from "@/modules/base.repository.js"
import { Context } from "hono"
import { GetListExaminationTypeQuery } from "./bmhp-examination.schema.js"

export class BmhpExaminationTypeRepository extends BaseRepository<"bmhp_examination_types"> {
  constructor() {
    super(
      "bmhp_examination_types",
      /* filterProgram */ false,
      /* filterActivity */ false,
      /* useSoftDelete */ true,
      /* useAudit */ true
    )
  }

  async findList(c: Context, params: GetListExaminationTypeQuery) {
    const { page, paginate, keyword, sort_by, sort_type, program_plan_id } =
      params
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "updated_at"
    const sortType = sort_type || "desc"

    let dbQuery = c.var.trx
      .selectFrom("bmhp_examination_types as bet")
      .leftJoin("ws_users as cu", "cu.id", "bet.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bet.created_by")
      .where("bet.deleted_at", "is", null)

    if (keyword) {
      dbQuery = dbQuery.where("bet.name", "like", `%${keyword}%`)
    }

    if (program_plan_id) {
      dbQuery = dbQuery.where("bet.program_plan_id", "=", program_plan_id)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .select([
          "bet.id",
          "bet.name",
          "bet.program_plan_id",
          "bet.description",
          "bet.created_at",
          "bet.updated_at",
          "bet.created_by",
          "bet.updated_by",
          "cu.id as id_updated",
          "cu.username as username_updated",
          "cu.firstname as firstname_updated",
          "cu.lastname as lastname_updated",
          "cc.id as id_created",
          "cc.username as username_created",
          "cc.firstname as firstname_created",
          "cc.lastname as lastname_created",
        ])
        .orderBy(`bet.${sortBy}`, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("bmhp_examination_types")
        .select((eb) => [eb.fn.count("id").as("total")])
        .where("deleted_at", "is", null)
        .$if(!!keyword, (qb) => qb.where("name", "like", `%${keyword}%`))
        .$if(!!program_plan_id, (qb) =>
          qb.where("program_plan_id", "=", program_plan_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findDetailById(c: Context, id: number) {
    return c.var.trx
      .selectFrom("bmhp_examination_types as bet")
      .leftJoin("ws_users as cu", "cu.id", "bet.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bet.created_by")
      .select([
        "bet.id",
        "bet.name",
        "bet.program_plan_id",
        "bet.description",
        "bet.created_at",
        "bet.updated_at",
        "bet.created_by",
        "bet.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bet.id", "=", id)
      .where("bet.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findByName(
    c: Context,
    name: string,
    programPlanId?: number,
    excludeId?: number
  ) {
    let query = c.var.trx
      .selectFrom("bmhp_examination_types")
      .select(["id", "name"])
      .where("name", "=", name)
      .where("deleted_at", "is", null)

    if (programPlanId) {
      query = query.where("program_plan_id", "=", programPlanId)
    } else {
      query = query.where("program_plan_id", "is", null)
    }

    if (excludeId) {
      query = query.where("id", "!=", excludeId)
    }

    return query.executeTakeFirst()
  }

  async findAllActive(c: Context) {
    return c.var.trx
      .selectFrom("bmhp_examination_types")
      .select(["id", "name", "description"])
      .where("deleted_at", "is", null)
      .orderBy("name", "asc")
      .execute()
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const result = await c.var.trx
      .selectFrom("bmhp_examinations")
      .select((eb) => [eb.fn.count("id").as("count")])
      .where("examination_type_id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return Number(result?.count || 0) > 0
  }
}
