import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import { GetBmhpExaminationTargetGroupsQueries } from "./bmhp-examination-target-groups.schema.js"

export class BmhpExaminationTargetGroupRepository extends BaseRepository<"ws_bmhp_examination_target_groups"> {
  constructor() {
    super("ws_bmhp_examination_target_groups", false, false, false, false) // No program filter, no soft delete, no audit
  }

  async findWithPagination(
    c: Context,
    query: GetBmhpExaminationTargetGroupsQueries
  ) {
    let dbQuery = c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups")
      .innerJoin(
        "bmhp_examinations",
        "bmhp_examinations.id",
        "ws_bmhp_examination_target_groups.examination_id"
      )
      .innerJoin(
        "target_groups",
        "target_groups.id",
        "ws_bmhp_examination_target_groups.target_group_id"
      )
      .select([
        "ws_bmhp_examination_target_groups.id",
        "ws_bmhp_examination_target_groups.examination_id",
        "ws_bmhp_examination_target_groups.target_group_id",
        "ws_bmhp_examination_target_groups.created_at",
        "bmhp_examinations.name as examination_name",
        "target_groups.title as target_group_name",
        // "target_groups.code as target_group_code",
        // "target_groups.age_range as target_group_age_range",
      ])

    // Filter by examination_id if provided
    if (query.examination_id) {
      dbQuery = dbQuery.where(
        "ws_bmhp_examination_target_groups.examination_id",
        "=",
        query.examination_id
      )
    }

    // Filter by target_group_id if provided
    if (query.target_group_id) {
      dbQuery = dbQuery.where(
        "ws_bmhp_examination_target_groups.target_group_id",
        "=",
        query.target_group_id
      )
    }

    // Sorting
    const sortBy = query.sort_by || "created_at"
    const sortType = query.sort_type || "desc"
    dbQuery = dbQuery.orderBy(sortBy, sortType)

    // Pagination
    const page = query.page || 1
    const perPage = query.paginate || 10
    const offset = (page - 1) * perPage

    const [data, totalResult] = await Promise.all([
      dbQuery.limit(perPage).offset(offset).execute(),
      dbQuery
        .select((eb) => [eb.fn.count("ws_bmhp_examination_target_groups.id").as("total")])
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    return {
      list: data,
      total,
    }
  }

  async findByExaminationId(c: Context, examinationId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups")
      .innerJoin(
        "target_groups",
        "target_groups.id",
        "ws_bmhp_examination_target_groups.target_group_id"
      )
      .select([
        "ws_bmhp_examination_target_groups.id",
        "ws_bmhp_examination_target_groups.examination_id",
        "ws_bmhp_examination_target_groups.target_group_id",
        "ws_bmhp_examination_target_groups.created_at",
        "target_groups.title as target_group_name",
        // "target_groups.age_range as target_group_age_range",
      ])
      .where("ws_bmhp_examination_target_groups.examination_id", "=", examinationId)
      .execute()
  }

  async findByTargetGroupId(c: Context, targetGroupId: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups")
      .innerJoin(
        "bmhp_examinations",
        "bmhp_examinations.id",
        "ws_bmhp_examination_target_groups.examination_id"
      )
      .select([
        "ws_bmhp_examination_target_groups.id",
        "ws_bmhp_examination_target_groups.examination_id",
        "ws_bmhp_examination_target_groups.target_group_id",
        "ws_bmhp_examination_target_groups.created_at",
        "bmhp_examinations.name as examination_name",
        "bmhp_examinations.description as examination_description",
      ])
      .where("ws_bmhp_examination_target_groups.target_group_id", "=", targetGroupId)
      .execute()
  }

  async findOneByExaminationIdAndTargetGroupId(
    c: Context,
    examinationId: number,
    targetGroupId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups")
      .selectAll()
      .where("ws_bmhp_examination_target_groups.examination_id", "=", examinationId)
      .where("ws_bmhp_examination_target_groups.target_group_id", "=", targetGroupId)
      .executeTakeFirst()
  }

  async findExaminationById(c: Context, examinationId: number) {
    return await c.var.trx
      .selectFrom("bmhp_examinations")
      .selectAll()
      .where("id", "=", examinationId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findTargetGroupById(c: Context, targetGroupId: number) {
    return await c.var.trx
      .selectFrom("bmhp_target_groups")
      .selectAll()
      .where("id", "=", targetGroupId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findDetailWithRelations(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("ws_bmhp_examination_target_groups")
      .innerJoin(
        "bmhp_examinations",
        "bmhp_examinations.id",
        "ws_bmhp_examination_target_groups.examination_id"
      )
      .innerJoin(
        "bmhp_target_groups",
        "bmhp_target_groups.id",
        "ws_bmhp_examination_target_groups.target_group_id"
      )
      .select([
        "ws_bmhp_examination_target_groups.id",
        "ws_bmhp_examination_target_groups.examination_id",
        "ws_bmhp_examination_target_groups.target_group_id",
        "ws_bmhp_examination_target_groups.created_at",
        "bmhp_examinations.name as examination_name",
        "bmhp_examinations.description as examination_description",
        "bmhp_target_groups.name as target_group_name",
        "bmhp_target_groups.code as target_group_code",
        "bmhp_target_groups.age_range as target_group_age_range",
        "bmhp_target_groups.description as target_group_description",
      ])
      .where("ws_bmhp_examination_target_groups.id", "=", id)
      .executeTakeFirst()
  }

  async deleteByExaminationId(c: Context, examinationId: number) {
    return await c.var.trx
      .deleteFrom("ws_bmhp_examination_target_groups")
      .where("ws_bmhp_examination_target_groups.examination_id", "=", examinationId)
      .execute()
  }
}
