import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import { GetBmhpTargetGroupsQueries } from "./bmhp-target-groups.schema.js"

export class BmhpTargetGroupRepository extends BaseRepository<any> {
  constructor() {
    super("target_groups" as any, false)
  }

  async findWithPagination(c: Context, query: GetBmhpTargetGroupsQueries) {
    const { page, paginate, search, is_active, sort_by, sort_type } = query
    const offset = (page - 1) * paginate

    const sortBy = sort_by === "name" ? "tg.title" : sort_by || "tg.created_at"
    const sortType = sort_type || "desc"

    const programId = c.var.programId

    let dbQuery = c.var.trx
      .selectFrom("target_groups as tg")
      .innerJoin(
        "target_group_workspaces as tgw",
        "tgw.target_group_id",
        "tg.id"
      )
      .leftJoin("ws_users as cc", "cc.id", "tg.created_by")
      .leftJoin("ws_users as cu", "cu.id", "tg.updated_by")
      .where("tg.deleted_at", "is", null)
      .where("tgw.program_id", "=", programId)

    // Search by title if provided
    if (search) {
      dbQuery = dbQuery.where("tg.title", "like", `%${search}%`)
    }

    // Filter by is_active if provided
    if (is_active !== undefined) {
      dbQuery = dbQuery.where("tg.is_active", "=", is_active)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .select([
          "tg.id",
          "tg.title as name",
          "tg.is_active",
          "tg.created_at",
          "tg.updated_at",
          "tg.deleted_at",
          "tg.created_by",
          "tg.updated_by",
          "tg.deleted_by",
          "tg.age_min",
          "tg.age_max",
          "tgw.program_id",
          "cc.id as id_created",
          "cc.username as username_created",
          "cc.firstname as firstname_created",
          "cc.lastname as lastname_created",
          "cu.id as id_updated",
          "cu.username as username_updated",
          "cu.firstname as firstname_updated",
          "cu.lastname as lastname_updated",
        ])
        .orderBy(sortBy as any, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      dbQuery
        .select((eb) => [eb.fn.count("tg.id").as("total")])
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    // Map to legacy BMHP format
    const mappedList = list.map((item) => {
      const {
        id_created,
        username_created,
        firstname_created,
        lastname_created,
        id_updated,
        username_updated,
        firstname_updated,
        lastname_updated,
        ...rest
      } = item as any
      return {
        ...rest,
        code: "-",
        description: "-",
        age_range: `${item.age_min}-${item.age_max}`,
        is_active: item.is_active ? 1 : 0,
        user_created_by: id_created
          ? {
              id: id_created,
              username: username_created,
              firstname: firstname_created,
              lastname: lastname_created,
            }
          : null,
        user_updated_by: id_updated
          ? {
              id: id_updated,
              username: username_updated,
              firstname: firstname_updated,
              lastname: lastname_updated,
            }
          : null,
      }
    })

    return { list: mappedList, total }
  }

  async findByIdWithExaminations(c: Context, id: number) {
    const targetGroup = await c.var.trx
      .selectFrom("target_groups")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (!targetGroup) {
      return null
    }

    // Get examinations for this target group
    const examinations = await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups")
      .innerJoin(
        "bmhp_examinations",
        "bmhp_examinations.id",
        "ws_bmhp_examination_target_groups.examination_id"
      )
      .select([
        "ws_bmhp_examination_target_groups.id as relation_id",
        "bmhp_examinations.id",
        "bmhp_examinations.examination_type_id",
        "bmhp_examinations.name",
        "bmhp_examinations.description",
        "bmhp_examinations.is_active",
        "bmhp_examinations.created_at",
      ])
      .where("ws_bmhp_examination_target_groups.target_group_id", "=", id)
      .execute()

    return {
      ...targetGroup,
      name: targetGroup.title,
      code: "-",
      description: "-",
      age_range: `${targetGroup.age_min}-${targetGroup.age_max}`,
      is_active: targetGroup.is_active ? 1 : 0,
      examinations,
    }
  }

  async findByCode() {
    // legacy method, might not be relevant for core target_groups which uses title
    return null
  }

  async associateWithWorkspace(
    c: Context,
    params: {
      target_group_id: number
      program_id: number
    }
  ) {
    const { target_group_id, program_id } = params

    await c.var.trx
      .deleteFrom("target_group_workspaces")
      .where("target_group_id", "=", target_group_id)
      .where("program_id", "=", program_id)
      .execute()

    await c.var.trx
      .insertInto("target_group_workspaces")
      .values({
        target_group_id,
        program_id,
      })
      .execute()
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const [examTargetGroupResult, planningTargetGroupResult] = await Promise.all([
      c.var.trx
        .selectFrom("ws_bmhp_examination_target_groups")
        .select((eb) => [eb.fn.count("id").as("count")])
        .where("target_group_id", "=", id)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_bmhp_planning_target_groups" as any)
        .select((eb: any) => [eb.fn.count("id").as("count")])
        .where("target_group_id", "=", id)
        .where("deleted_at", "is", null)
        .executeTakeFirst(),
    ])
    return (
      Number(examTargetGroupResult?.count || 0) > 0 ||
      Number(planningTargetGroupResult?.count || 0) > 0
    )
  }
}
