import { Context } from "hono"
import { BaseRepository } from "../base.repository.js"
import { GetBmhpHistoryQueries } from "./bmhp-histories.schema.js"
import { sql } from "kysely"

export class BmhpHistoryRepository extends BaseRepository<"ws_bmhp_planning"> {
  constructor() {
    super("ws_bmhp_planning", false, false, true, true) // entity_id based, not program_id
  }

  async findWithPagination(
    c: Context,
    entityId: number,
    query: GetBmhpHistoryQueries
  ) {
    const {
      page,
      paginate,
      search,
      year,
      examination_id,
      status,
      province_id,
      regency_id,
      sub_district_id,
      puskesmas_id,
      sort_by,
      sort_type,
    } = query
    const offset = (page - 1) * paginate

    const sortBy = sort_by || "updated_at"
    const sortType = sort_type || "desc"

    let dbQuery = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .leftJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .leftJoin(
        "ws_program_plans as wpp",
        "wpp.id",
        "wap.program_plan_id"
      )
      .leftJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .leftJoin("bmhp_examination_types as bet", "bet.id", "be.examination_type_id")
      .leftJoin("entities as e", "e.id", "wp.entity_id")
      .leftJoin("ws_users as cu", "cu.id", "wp.updated_by")
      .select([
        "wp.id",
        "wp.entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
        "wpp.year as year",
        "wp.approval_period_id",
        "wap.program_plan_id as period_program_plan_id",
        "wp.examination_id",
        "be.name as examination_name",
        "bet.name as examination_type",
        "wp.status",
        "wp.submitted_at",
        "wp.approved_at",
        "wp.created_at",
        "wp.updated_at",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",

        sql<number>`COALESCE((SELECT COUNT(*) FROM ws_bmhp_planning_target_groups WHERE planning_id = wp.id AND deleted_at IS NULL), 0)`.as(
          "target_group_count"
        ),
      ])
      .where("wp.deleted_at", "is", null)

    if (search) {
      dbQuery = dbQuery.where("be.name", "like", `%${search}%`)
    }

    if (year) {
      dbQuery = dbQuery.where("wpp.year", "=", year)
    }

    if (examination_id) {
      dbQuery = dbQuery.where("wp.examination_id", "=", examination_id)
    }

    if (status) {
      dbQuery = dbQuery.where("wp.status", "=", status)
    }

    if (province_id) {
      dbQuery = dbQuery.where("e.province_id", "=", String(province_id))
    }

    if (regency_id) {
      dbQuery = dbQuery.where("e.regency_id", "=", String(regency_id))
    }

    if (sub_district_id) {
      dbQuery = dbQuery.where("e.sub_district_id", "=", String(sub_district_id))
    }

    if (puskesmas_id) {
      dbQuery = dbQuery.where("wp.entity_id", "=", puskesmas_id)
    }

    const [list, totalResult] = await Promise.all([
      dbQuery
        .orderBy(
          sortBy === "examination_name" ? "be.name" : `wp.${sortBy}`,
          sortType
        )
        .limit(paginate)
        .offset(offset)
        .execute(),
      dbQuery
        .clearSelect()
        .clearOrderBy()
        .clearLimit()
        .clearOffset()
        .select((c.var.trx as any).fn.count("wp.id").as("total"))
        .executeTakeFirst(),
    ])

    return { list, total: Number(totalResult?.total || 0) }
  }

  async findAll(
    c: Context,
    entityId: number,
    query: GetBmhpHistoryQueries
  ) {
    const {
      search,
      year,
      examination_id,
      status,
      province_id,
      regency_id,
      sub_district_id,
      puskesmas_id,
      sort_by,
      sort_type,
    } = query

    const sortBy = sort_by || "updated_at"
    const sortType = sort_type || "desc"

    let dbQuery = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .leftJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .leftJoin(
        "ws_program_plans as wpp",
        "wpp.id",
        "wap.program_plan_id"
      )
      .leftJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .leftJoin("bmhp_examination_types as bet", "bet.id", "be.examination_type_id")
      .leftJoin("entities as e", "e.id", "wp.entity_id")
      .leftJoin("ws_users as cu", "cu.id", "wp.updated_by")
      .select([
        "wp.id",
        "wp.entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
        "wpp.year as year",
        "wp.examination_id",
        "be.name as examination_name",
        "bet.name as examination_type",
        "wp.status",
        "wp.submitted_at",
        "wp.approved_at",
        "wp.created_at",
        "wp.updated_at",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",

        sql<number>`COALESCE((SELECT COUNT(*) FROM ws_bmhp_planning_target_groups WHERE planning_id = wp.id AND deleted_at IS NULL), 0)`.as(
          "target_group_count"
        ),
      ])
      .where("wp.deleted_at", "is", null)

    if (search) {
      dbQuery = dbQuery.where("be.name", "like", `%${search}%`)
    }

    if (year) {
      dbQuery = dbQuery.where("wpp.year", "=", year)
    }

    if (examination_id) {
      dbQuery = dbQuery.where("wp.examination_id", "=", examination_id)
    }

    if (status) {
      dbQuery = dbQuery.where("wp.status", "=", status)
    }

    if (province_id) {
      dbQuery = dbQuery.where("e.province_id", "=", String(province_id))
    }

    if (regency_id) {
      dbQuery = dbQuery.where("e.regency_id", "=", String(regency_id))
    }

    if (sub_district_id) {
      dbQuery = dbQuery.where("e.sub_district_id", "=", String(sub_district_id))
    }

    if (puskesmas_id) {
      dbQuery = dbQuery.where("wp.entity_id", "=", puskesmas_id)
    }

    return dbQuery
      .orderBy(
        sortBy === "examination_name" ? "be.name" : `wp.${sortBy}`,
        sortType
      )
      .execute()
  }

  async findDetailPlanning(c: Context, id: number) {
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .leftJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .leftJoin(
        "ws_program_plans as wpp",
        "wpp.id",
        "wap.program_plan_id"
      )
      .leftJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .leftJoin(
        "bmhp_examination_types as bet",
        "bet.id",
        "be.examination_type_id"
      )
      .leftJoin("entities as e", "e.id", "wp.entity_id")
      .leftJoin("ws_users as cu", "cu.id", "wp.updated_by")
      .select([
        "wp.id",
        "wp.entity_id",
        "e.name as entity_name",
        "e.address as entity_address",
        "wpp.year as year",
        "wp.examination_id",
        "be.name as examination_name",
        "bet.name as examination_type",
        "wp.status",
        "wp.submitted_at",
        "wp.approved_at",
        "wp.created_at",
        "wp.updated_at",
        "cu.id as id_updated",
        "cu.username as username_updated",
        "cu.firstname as firstname_updated",
        "cu.lastname as lastname_updated",
      ])
      .where("wp.id", "=", id)
      .where("wp.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findDetailMethods(c: Context, planningId: number) {
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_methods as wpm")
      .leftJoin(
        "bmhp_examination_methods as bem" as any,
        "bem.id",
        "wpm.method_id"
      )
      .select(["bem.name as method_name"])
      .where("wpm.planning_id", "=", planningId)
      .where("wpm.deleted_at", "is", null)
      .execute()
  }

  async findDetailTargetGroups(c: Context, planningId: number) {
    return this.findDetailTargetGroupsBulk(c, [planningId])
  }

  async findDetailTargetGroupsBulk(c: Context, planningIds: number[]) {
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups as wptg")
      .leftJoin("target_groups as tg" as any, "tg.id", "wptg.target_group_id")
      .select([
        "wptg.id",
        "wptg.planning_id",
        "tg.title as target_name",
        "wptg.sample_count",
        "wptg.test_count",
      ])
      .where("wptg.planning_id", "in", planningIds)
      .where("wptg.deleted_at", "is", null)
      .execute()
  }

  async findDetailMethodsBulk(c: Context, planningIds: number[]) {
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_methods as wpm")
      .leftJoin(
        "bmhp_examination_methods as bem" as any,
        "bem.id",
        "wpm.method_id"
      )
      .select(["wpm.planning_id", "bem.name as method_name"])
      .where("wpm.planning_id", "in", planningIds)
      .where("wpm.deleted_at", "is", null)
      .execute()
  }

  async findDetailMaterials(c: Context, targetGroupIds: number[]) {
    return (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as wpmm")
      .leftJoin("bmhp_materials as bm" as any, "bm.id", "wpmm.material_id")
      .leftJoin(
        "ws_bmhp_material_variant as wbmv" as any,
        "wbmv.id",
        "wpmm.material_template_id"
      )
      .leftJoin("ws_materials as wm" as any, "wm.global_id", "wbmv.material_id")
      .select([
        "wpmm.id",
        "wpmm.planning_target_group_id",
        "bm.is_reagen",
        "bm.name as material_name",
        "wpmm.lab_usage",
        "wm.name as product_template",
        "wm.unit_of_distribution as unit_name",
        sql<string>`(
          SELECT bmvd.name FROM ws_bmhp_material_variant_detail bmvd
          WHERE bmvd.id = wpmm.variant_id AND bmvd.deleted_at IS NULL
          LIMIT 1
        )`.as("product_variant"),
        sql<number>`(
          SELECT bmvd2.test_qty FROM ws_bmhp_material_variant_detail bmvd2
          WHERE bmvd2.id = wpmm.variant_id AND bmvd2.deleted_at IS NULL
          LIMIT 1
        )`.as("test_qty"),
        "wpmm.calculated_requirement",
      ])
      .where("wpmm.planning_target_group_id", "in", targetGroupIds)
      .where("wpmm.deleted_at", "is", null)
      .execute()
  }
}
