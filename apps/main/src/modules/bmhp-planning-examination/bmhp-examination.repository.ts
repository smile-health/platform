import { DEVICE_TYPE } from "@/common/constants/device.js"
import { BaseRepository } from "@/modules/base.repository.js"
import { Context } from "hono"
import { GetListExaminationQuery } from "./bmhp-examination.schema.js"

export class BmhpExaminationRepository extends BaseRepository<"bmhp_examinations"> {
  constructor() {
    super(
      "bmhp_examinations",
      /* filterProgram */ false,
      /* filterActivity */ false,
      /* useSoftDelete */ true,
      /* useAudit */ true
    )
  }

  async findList(c: Context, params: GetListExaminationQuery) {
    const {
      page,
      paginate,
      keyword,
      sort_by,
      sort_type,
      examination_type_id,
      is_active,
      program_plan_id,
    } = params
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "updated_at"
    const sortType = sort_type || "desc"
    const isMobile = c.var.deviceType === DEVICE_TYPE.mobile

    let dbQuery = c.var.trx
      .selectFrom("bmhp_examinations as be")
      .leftJoin(
        "bmhp_examination_types as bet",
        "bet.id",
        "be.examination_type_id"
      )
      .leftJoin("ws_users as cu", "cu.id", "be.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "be.created_by")
      .$if(isMobile, (qb) =>
        qb
          .innerJoin("ws_program_plans as wpp", "wpp.id", "be.program_plan_id")
          .where("wpp.status", "=", 1)
      )
      .where("be.deleted_at", "is", null)

    if (keyword) {
      dbQuery = dbQuery.where("be.name", "like", `%${keyword}%`)
    }

    if (examination_type_id) {
      dbQuery = dbQuery.where(
        "be.examination_type_id",
        "=",
        examination_type_id
      )
    }

    if (is_active === 0 || is_active === 1) {
      dbQuery = dbQuery.where("be.is_active", "=", is_active)
    }

    if (program_plan_id) {
      dbQuery = dbQuery.where("be.program_plan_id", "=", program_plan_id)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .select([
          "be.id",
          "be.program_plan_id",
          "be.examination_type_id",
          "bet.name as examination_type_name",
          "be.name",
          "be.description",
          "be.is_active",
          "be.created_at",
          "be.updated_at",
          "be.created_by",
          "be.updated_by",
          "cu.id as id_updated",
          "cu.username as username_updated",
          "cu.firstname as firstname_updated",
          "cu.lastname as lastname_updated",
          "cc.id as id_created",
          "cc.username as username_created",
          "cc.firstname as firstname_created",
          "cc.lastname as lastname_created",
        ])
        .orderBy(`be.${sortBy}`, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      c.var.trx
        .selectFrom("bmhp_examinations as be")
        .$if(isMobile, (qb) =>
          qb
            .innerJoin(
              "ws_program_plans as wpp",
              "wpp.id",
              "be.program_plan_id"
            )
            .where("wpp.status", "=", 1)
        )
        .select((eb) => [eb.fn.count("be.id").as("total")])
        .where("be.deleted_at", "is", null)
        .$if(!!keyword, (qb) => qb.where("be.name", "like", `%${keyword}%`))
        .$if(!!examination_type_id, (qb) =>
          qb.where("be.examination_type_id", "=", examination_type_id)
        )
        .$if(is_active === 0 || is_active === 1, (qb) =>
          qb.where("be.is_active", "=", is_active)
        )
        .$if(!!program_plan_id, (qb) =>
          qb.where("be.program_plan_id", "=", program_plan_id)
        )
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return { list, total }
  }

  async findDetailById(c: Context, id: number) {
    return c.var.trx
      .selectFrom("bmhp_examinations as be")
      .leftJoin(
        "bmhp_examination_types as bet",
        "bet.id",
        "be.examination_type_id"
      )
      .leftJoin("ws_users as cu", "cu.id", "be.updated_by")
      .leftJoin("ws_users as cc", "cc.id", "be.created_by")
      .select([
        "be.id",
        "be.program_plan_id",
        "be.examination_type_id",
        "bet.name as examination_type_name",
        "be.name",
        "be.description",
        "be.is_active",
        "be.created_at",
        "be.updated_at",
        "be.created_by",
        "be.updated_by",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
        "cc.id as id_created",
        "cc.username as username_created",
        "cc.firstname as firstname_created",
        "cc.lastname as lastname_created",
      ])
      .where("be.id", "=", id)
      .where("be.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findByName(c: Context, name: string, programPlanId?: number, excludeId?: number) {
    let query = c.var.trx
      .selectFrom("bmhp_examinations")
      .select(["id", "name"])
      .where("name", "=", name)
      .where("deleted_at", "is", null)

    if (programPlanId) {
      query = query.where("program_plan_id", "=", programPlanId)
    }

    if (excludeId) {
      query = query.where("id", "!=", excludeId)
    }

    return query.executeTakeFirst()
  }

  async findProgramPlanYears(c: Context) {
    return c.var.trx
      .selectFrom("ws_program_plans as wpp")
      .select(["wpp.id as program_plan_id", "wpp.year"])
      .where("wpp.program_id", "=", c.var.programId)
      .where("wpp.approach_id", "=", 4)
      .where("wpp.status", "=", 1)
      .where("wpp.deleted_at", "is", null)
      .orderBy("wpp.year", "asc")
      .execute()
  }

  async findActiveGroupedByType(c: Context) {
    return c.var.trx
      .selectFrom("bmhp_examinations as be")
      .innerJoin(
        "bmhp_examination_types as bet",
        "bet.id",
        "be.examination_type_id"
      )
      .select([
        "be.id",
        "be.name",
        "be.description",
        "be.examination_type_id",
        "bet.name as examination_type_name",
      ])
      .where("be.is_active", "=", 1)
      .where("be.deleted_at", "is", null)
      .where("bet.deleted_at", "is", null)
      .orderBy("bet.name", "asc")
      .orderBy("be.name", "asc")
      .execute()
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const result = await c.var.trx
      .selectFrom("ws_bmhp_planning" as any)
      .select((eb: any) => [eb.fn.count("id").as("count")])
      .where("examination_id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return Number(result?.count || 0) > 0
  }
}
