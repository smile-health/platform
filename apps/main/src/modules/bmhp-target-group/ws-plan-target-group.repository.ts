import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import {
  BulkCreateWsPlanTargetGroupRequest,
  ListWsPlanTargetGroupQueries,
} from "./ws-plan-target-group.schema.js"

export class WsPlanTargetGroupRepository extends BaseRepository<"ws_plan_target_group"> {
  constructor() {
    // tableName, filterProgram, filterActivity, useSoftDelete, useAudit
    super("ws_plan_target_group", false, false, true, true)
  }

  async findWithPagination(c: Context, query: ListWsPlanTargetGroupQueries) {
    const { page, paginate, sort_by, sort_type, program_plan_id, keyword } =
      query
    const offset = (page - 1) * paginate

    let sortBy: string
    if (sort_by === "title") {
      sortBy = "tg.title"
    } else if (sort_by) {
      sortBy = `wptg.${sort_by}`
    } else {
      sortBy = "wptg.created_at"
    }
    const sortType = (sort_type || "desc") as "asc" | "desc"

    let dbQuery = c.var.trx
      .selectFrom("ws_plan_target_group as wptg")
      .innerJoin("target_groups as tg", "tg.id", "wptg.target_group_id")
      .leftJoin("ws_users as updated_user", (join) =>
        join
          .onRef("updated_user.id", "=", "wptg.updated_by")
          .on("updated_user.deleted_by", "is", null)
      )
      .leftJoin("ws_users as created_user", (join) =>
        join
          .onRef("created_user.id", "=", "wptg.created_by")
          .on("created_user.deleted_by", "is", null)
      )
      .where("wptg.deleted_at", "is", null)

    if (program_plan_id) {
      dbQuery = dbQuery.where("wptg.program_plan_id", "=", program_plan_id)
    }

    if (keyword) {
      dbQuery = dbQuery.where("tg.title", "like", `%${keyword}%`)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .select([
          "wptg.id",
          "wptg.program_plan_id",
          "wptg.target_group_id",
          "tg.title as name",
          "wptg.created_at",
          "wptg.created_by",
          "wptg.updated_at",
          "wptg.updated_by",
          "wptg.deleted_at",
          "wptg.deleted_by",
          "updated_user.id as updated_user_id",
          "updated_user.username as updated_user_username",
          "updated_user.email as updated_user_email",
          "updated_user.firstname as updated_user_firstname",
          "updated_user.lastname as updated_user_lastname",
          "created_user.id as created_user_id",
          "created_user.username as created_user_username",
          "created_user.email as created_user_email",
          "created_user.firstname as created_user_firstname",
          "created_user.lastname as created_user_lastname",
        ])
        .orderBy(sortBy as never, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      dbQuery
        .select((eb) => [eb.fn.count("wptg.id").as("total")])
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    const data = list.map((item) => ({
      id: item.id,
      program_plan_id: item.program_plan_id,
      target_group_id: item.target_group_id,
      name: item.name,
      created_at: item.created_at,
      created_by: item.created_by,
      updated_at: item.updated_at,
      updated_by: item.updated_by,
      deleted_at: item.deleted_at,
      deleted_by: item.deleted_by,
      user_updated_by: item.updated_user_id
        ? {
            id: item.updated_user_id,
            username: item.updated_user_username,
            email: item.updated_user_email,
            firstname: item.updated_user_firstname,
            lastname: item.updated_user_lastname,
          }
        : null,
      user_created_by: item.created_user_id
        ? {
            id: item.created_user_id,
            username: item.created_user_username,
            email: item.created_user_email,
            firstname: item.created_user_firstname,
            lastname: item.created_user_lastname,
          }
        : null,
    }))

    return {
      page: Number(page || 1),
      item_per_page: Number(paginate || 10),
      total_item: total,
      total_page: Math.ceil(total / Number(paginate || 10)),
      list_pagination: [10, 25, 50, 100],
      data,
    }
  }

  async bulkCreate(c: Context, data: BulkCreateWsPlanTargetGroupRequest) {
    const { program_plan_id, target_group_ids } = data
    const userId = c.var.userId

    if (target_group_ids.length === 0) return

    const inserts = target_group_ids.map((id) => ({
      program_plan_id,
      target_group_id: id,
      created_by: userId,
      updated_by: userId,
    }))

    await c.var.trx.insertInto("ws_plan_target_group").values(inserts).execute()
  }

  async findExistingTargetGroups(c: Context, programPlanId: number) {
    const results = await c.var.trx
      .selectFrom("ws_plan_target_group")
      .select("target_group_id")
      .where("program_plan_id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .execute()

    return results.map((r) => r.target_group_id)
  }

  async findExistingByProgramPlanAndTargetGroupIds(
    c: Context,
    programPlanId: number,
    targetGroupIds: number[]
  ) {
    if (targetGroupIds.length === 0) return []
    const results = await c.var.trx
      .selectFrom("ws_plan_target_group")
      .select(["target_group_id"])
      .where("program_plan_id", "=", programPlanId)
      .where("target_group_id", "in", targetGroupIds)
      .where("deleted_at", "is", null)
      .execute()

    return results.map((r) => r.target_group_id)
  }

  async checkUsage(c: Context, id: number): Promise<boolean> {
    const wsPlanTargetGroup = await c.var.trx
      .selectFrom("ws_plan_target_group")
      .select(["program_plan_id", "target_group_id"])
      .where("id", "=", id)
      .executeTakeFirst()

    if (!wsPlanTargetGroup) return false

    const result = await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups as we")
      .innerJoin("bmhp_examinations as be", "be.id", "we.examination_id")
      .select((eb) => [eb.fn.count("we.id").as("count")])
      .where("be.program_plan_id", "=", wsPlanTargetGroup.program_plan_id)
      .where("we.target_group_id", "=", wsPlanTargetGroup.target_group_id)
      .where("be.deleted_at", "is", null)
      .executeTakeFirst()

    return Number(result?.count || 0) > 0
  }
}
