import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import {
  GetBmhpExaminationMethodsQueries,
  GetWsBmhpExaminationMethodsQueries,
} from "./bmhp-examination-methods.schema.js"

export class BmhpExaminationMethodRepository extends BaseRepository<"bmhp_examination_methods"> {
  constructor() {
    super("bmhp_examination_methods", false) // No program filter for bmhp_examination_methods
  }

  async findWithPagination(
    c: Context,
    query: GetBmhpExaminationMethodsQueries
  ) {
    const { page, paginate, keyword, sort_by, sort_type, program_plan_id } =
      query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "created_at"
    const sortType = sort_type || "desc"

    let dbQuery = c.var.trx
      .selectFrom("bmhp_examination_methods as bem")
      .leftJoin("ws_users as cu", "cu.id", "bem.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bem.created_by")
      .select([
        "bem.id",
        "bem.name",
        "bem.description",
        "bem.program_plan_id",
        "bem.created_at",
        "bem.updated_at",
        "bem.created_by",
        "bem.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bem.deleted_at", "is", null)

    // Search by name or description if provided
    if (keyword) {
      dbQuery = dbQuery.where((eb) =>
        eb.or([
          eb("bem.name", "like", `%${keyword}%`),
          eb("bem.description", "like", `%${keyword}%`),
        ])
      )
    }

    // Filter by program_plan_id if provided
    if (program_plan_id) {
      dbQuery = dbQuery.where("bem.program_plan_id", "=", program_plan_id)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .orderBy(`bem.${sortBy}`, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("bmhp_examination_methods as bem")
        .select((eb) => [eb.fn.count("bem.id").as("total")])
        .where("bem.deleted_at", "is", null)
        .$if(!!keyword, (qb) =>
          qb.where((eb) =>
            eb.or([
              eb("bem.name", "like", `%${keyword}%`),
              eb("bem.description", "like", `%${keyword}%`),
            ])
          )
        )
        .$if(!!program_plan_id, (qb) =>
          qb.where("bem.program_plan_id", "=", program_plan_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findByName(c: Context, name: string, programPlanId?: number) {
    let query = c.var.trx
      .selectFrom("bmhp_examination_methods")
      .selectAll()
      .where("bmhp_examination_methods.name", "=", name)
      .where("bmhp_examination_methods.deleted_at", "is", null)

    if (programPlanId) {
      query = query.where(
        "bmhp_examination_methods.program_plan_id",
        "=",
        programPlanId
      )
    }

    return await query.executeTakeFirst()
  }

  async findByIdWithExaminations(c: Context, id: number) {
    const methodData = await c.var.trx
      .selectFrom("bmhp_examination_methods as bem")
      .leftJoin("ws_users as cu", "cu.id", "bem.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "bem.created_by")
      .select([
        "bem.id",
        "bem.name",
        "bem.description",
        "bem.program_plan_id",
        "bem.created_at",
        "bem.updated_at",
        "bem.created_by",
        "bem.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("bem.id", "=", id)
      .executeTakeFirst()

    if (!methodData) {
      return null
    }

    // Get all examinations that use this method
    const examinations = await c.var.trx
      .selectFrom("ws_bmhp_examination_methods")
      .innerJoin(
        "bmhp_examinations",
        "ws_bmhp_examination_methods.examination_id",
        "bmhp_examinations.id"
      )
      .select([
        "bmhp_examinations.id",
        "bmhp_examinations.examination_type_id",
        "bmhp_examinations.name",
        "bmhp_examinations.description",
        "bmhp_examinations.is_active",
      ])
      .where("ws_bmhp_examination_methods.method_id", "=", id)
      .execute()

    return {
      ...methodData,
      examinations: examinations || [],
    }
  }

  async findByExaminationId(c: Context, examinationId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_methods")
      .innerJoin(
        "bmhp_examination_methods",
        "ws_bmhp_examination_methods.method_id",
        "bmhp_examination_methods.id"
      )
      .select([
        "bmhp_examination_methods.id",
        "bmhp_examination_methods.name",
        "bmhp_examination_methods.description",
        "bmhp_examination_methods.created_at",
        "bmhp_examination_methods.updated_at",
        "bmhp_examination_methods.updated_by",
      ])
      .where("ws_bmhp_examination_methods.examination_id", "=", examinationId)
      .execute()
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const [wsMethodResult, planningMethodResult] = await Promise.all([
      c.var.trx
        .selectFrom("ws_bmhp_examination_methods")
        .select((eb) => [eb.fn.count("id").as("count")])
        .where("method_id", "=", id)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_bmhp_planning_methods" as any)
        .select((eb: any) => [eb.fn.count("id").as("count")])
        .where("method_id", "=", id)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
    ])
    return (
      Number(wsMethodResult?.count || 0) > 0 ||
      Number(planningMethodResult?.count || 0) > 0
    )
  }
}

export class WsBmhpExaminationMethodRepository extends BaseRepository<"ws_bmhp_examination_methods"> {
  constructor() {
    super("ws_bmhp_examination_methods", false, false, false, false) // No audit fields
  }

  private buildDetailQuery(c: Context) {
    return c.var.trx
      .selectFrom("ws_bmhp_examination_methods")
      .innerJoin(
        "bmhp_examinations",
        "ws_bmhp_examination_methods.examination_id",
        "bmhp_examinations.id"
      )
      .innerJoin(
        "bmhp_examination_methods",
        "ws_bmhp_examination_methods.method_id",
        "bmhp_examination_methods.id"
      )
      .select([
        // Workspace relation data
        "ws_bmhp_examination_methods.id",
        "ws_bmhp_examination_methods.examination_id",
        "ws_bmhp_examination_methods.method_id",
        "ws_bmhp_examination_methods.created_at",
        // BMHP Examination data
        "bmhp_examinations.id as examination_id",
        "bmhp_examinations.examination_type_id",
        "bmhp_examinations.name as examination_name",
        "bmhp_examinations.description as examination_description",
        "bmhp_examinations.is_active as examination_is_active",
        "bmhp_examinations.updated_at as examination_updated_at",
        "bmhp_examinations.updated_by as examination_updated_by",
        // BMHP Examination Method data
        "bmhp_examination_methods.id as method_id",
        "bmhp_examination_methods.name as method_name",
        "bmhp_examination_methods.description as method_description",
        "bmhp_examination_methods.updated_at as method_updated_at",
        "bmhp_examination_methods.updated_by as method_updated_by",
      ])
  }

  async findWithPagination(
    c: Context,
    query: GetWsBmhpExaminationMethodsQueries
  ) {
    const { page, paginate, examination_id, method_id, sort_by, sort_type } =
      query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "created_at"
    const sortType = sort_type || "desc"

    let dbQuery = this.buildDetailQuery(c)

    // Filter by examination_id if provided
    if (examination_id) {
      dbQuery = dbQuery.where(
        "ws_bmhp_examination_methods.examination_id",
        "=",
        examination_id
      )
    }

    // Filter by method_id if provided
    if (method_id) {
      dbQuery = dbQuery.where(
        "ws_bmhp_examination_methods.method_id",
        "=",
        method_id
      )
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .orderBy(sortBy, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("ws_bmhp_examination_methods")
        .select((eb) => [eb.fn.count("id").as("total")])
        .$if(!!examination_id, (qb) =>
          qb.where(
            "ws_bmhp_examination_methods.examination_id",
            "=",
            examination_id
          )
        )
        .$if(!!method_id, (qb) =>
          qb.where("ws_bmhp_examination_methods.method_id", "=", method_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findByExaminationAndMethod(
    c: Context,
    examinationId: number,
    methodId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_methods")
      .selectAll()
      .where("ws_bmhp_examination_methods.examination_id", "=", examinationId)
      .where("ws_bmhp_examination_methods.method_id", "=", methodId)
      .executeTakeFirst()
  }

  async findByIdWithDetails(c: Context, id: number) {
    return this.buildDetailQuery(c)
      .where("ws_bmhp_examination_methods.id", "=", id)
      .executeTakeFirst()
  }

  async deleteByExaminationId(c: Context, examinationId: number) {
    return await c.var.trx
      .deleteFrom("ws_bmhp_examination_methods")
      .where("ws_bmhp_examination_methods.examination_id", "=", examinationId)
      .execute()
  }
}
