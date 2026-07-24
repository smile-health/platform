import { associate } from "@smile/lib/utils.js"
import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../base.repository.js"
import {
  BmhpStatus,
  GetListProgramPlanQueries,
} from "./annual-planning-program-plan.schema.js"

export class AnnualPlanningProgramPlanRepository extends BaseRepository<"ws_program_plans"> {
  constructor() {
    super("ws_program_plans")
  }

  async getListProgramPlan(
    c: Context,
    params: GetListProgramPlanQueries,
    programId: number
  ) {
    const { page, paginate, year, sort_by, sort_type } = params
    const offset = (page - 1) * paginate

    let query = c.var.trx
      .selectFrom(`${this.tableName} as ws_program_plans`)
      .innerJoin("plan_approaches as pa", (join) =>
        join
          .onRef("pa.id", "=", "ws_program_plans.approach_id")
          .on("pa.deleted_at", "is", null)
      )
      .leftJoin(
        "ws_users as wsu_created",
        "wsu_created.id",
        "ws_program_plans.created_by"
      )
      .leftJoin(
        "ws_users as wsu_updated",
        "wsu_updated.id",
        "ws_program_plans.updated_by"
      )
      .where("ws_program_plans.deleted_at", "is", null)
      .where("ws_program_plans.program_id", "=", programId)

    if (year) {
      query = query.where("ws_program_plans.year", "=", sql<number>`${year}`)
    }

    switch (sort_by) {
      case "year":
        query = query.orderBy(sql.ref("ws_program_plans.year"), sort_type)
        break
      case "is_final":
        query = query.orderBy(sql.ref("ws_program_plans.status"), sort_type)
        break
      case "updated_at":
        query = query.orderBy(sql.ref("ws_program_plans.updated_at"), sort_type)
        break
      default:
        query = query.orderBy(sql.ref("ws_program_plans.id"), "asc")
    }

    const [list, totalList] = await Promise.all([
      query
        .select([
          "ws_program_plans.id",
          "ws_program_plans.year",
          "ws_program_plans.program_id",
          "ws_program_plans.is_active",
          "ws_program_plans.status",
          "ws_program_plans.updated_at",
          "pa.id as approach_id",
          "pa.name as approach_name",
          "wsu_created.id as id_created",
          "wsu_created.username as username_created",
          "wsu_created.firstname as firstname_created",
          "wsu_created.lastname as lastname_created",
          "wsu_updated.id as id_updated",
          "wsu_updated.username as username_updated",
          "wsu_updated.firstname as firstname_updated",
          "wsu_updated.lastname as lastname_updated",
        ])
        .limit(paginate)
        .offset(offset)
        .execute(),
      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return {
      list,
      total: Number(totalList?.total) || 0,
    }
  }

  async getDetailProgramPlan(c: Context, id: number, programId: number) {
    return c.var.trx
      .selectFrom(`${this.tableName} as ws_program_plans`)
      .innerJoin("plan_approaches as pa", (join) =>
        join
          .onRef("pa.id", "=", "ws_program_plans.approach_id")
          .on("pa.deleted_at", "is", null)
      )
      .where("ws_program_plans.deleted_at", "is", null)
      .where("ws_program_plans.id", "=", id)
      .where("ws_program_plans.program_id", "=", programId)
      .select([
        "ws_program_plans.id",
        "ws_program_plans.year",
        "ws_program_plans.program_id",
        "ws_program_plans.status",
        "pa.id as approach_id",
        "pa.name as approach_name",
        sql<number>`EXISTS(
          SELECT 1
          FROM ws_plan_target_group wptg
          WHERE wptg.program_plan_id = ws_program_plans.id
            AND wptg.deleted_at IS NULL
        )`.as("id_target_group"),
        sql<number>`EXISTS(
          SELECT 1
          FROM ws_plan_target_group wptg
          INNER JOIN populations p
            ON p.target_group_id = wptg.target_group_id
            AND p.year = ws_program_plans.year
            AND p.deleted_at IS NULL
          WHERE wptg.program_plan_id = ws_program_plans.id
            AND p.status = 1
            AND wptg.deleted_at IS NULL
        )`.as("id_population"),
        sql<number>`EXISTS(
          SELECT 1
          FROM ws_plan_tasks wpt
          WHERE wpt.program_plan_id = ws_program_plans.id
            AND wpt.deleted_at IS NULL
        )`.as("id_tasks"),
        sql<number>`EXISTS(
          SELECT 1
          FROM ws_material_ratios wmr
          WHERE wmr.program_plan_id = ws_program_plans.id
            AND wmr.deleted_at IS NULL
        )`.as("id_material_ratio"),
        sql<number>`EXISTS(
          SELECT 1
          FROM ws_material_substitutions wms
          WHERE wms.program_plan_id = ws_program_plans.id
            AND wms.deleted_at IS NULL
        )`.as("id_material_substitution"),
      ])
      .executeTakeFirst()
  }

  async getBmhpStatus(c: Context, programPlanId: number): Promise<BmhpStatus> {
    const result = await sql<{
      master_pemeriksaan: number
      jenis_pemeriksaan: number
      method: number
      parameter: number
      variant: number
      material: number
    }>`
      SELECT
        EXISTS(SELECT 1 FROM bmhp_examinations WHERE program_plan_id = ${programPlanId} AND deleted_at IS NULL) as master_pemeriksaan,
        EXISTS(SELECT 1 FROM bmhp_examination_types WHERE program_plan_id = ${programPlanId} AND deleted_at IS NULL) as jenis_pemeriksaan,
        EXISTS(SELECT 1 FROM bmhp_examination_methods WHERE program_plan_id = ${programPlanId} AND deleted_at IS NULL) as method,
        EXISTS(SELECT 1 FROM bmhp_parameters WHERE program_plan_id = ${programPlanId} AND deleted_at IS NULL) as parameter,
        EXISTS(SELECT 1 FROM ws_bmhp_material_variant WHERE program_plan_id = ${programPlanId} AND deleted_at IS NULL) as variant,
        EXISTS(SELECT 1 FROM bmhp_materials WHERE program_plan_id = ${programPlanId} AND deleted_at IS NULL) as material
    `.execute(c.var.trx)

    const row = result.rows[0]!
    return {
      master_pemeriksaan: !!row.master_pemeriksaan,
      jenis_pemeriksaan: !!row.jenis_pemeriksaan,
      method: !!row.method,
      parameter: !!row.parameter,
      variant: !!row.variant,
      material: !!row.material,
    }
  }

  async getProgramPlanMapped(c: Context, programPlanIds: number[]) {
    if (!programPlanIds || programPlanIds.length === 0) return {}

    const plans = await c.var.trx
      .selectFrom("ws_program_plans")
      .selectAll()
      .where("id", "in", programPlanIds)
      .execute()

    return associate(plans, "id")
  }

  async getStreamData(c: Context) {
    return c.var.trx
      .selectFrom(`ws_program_plans`)
      .where("is_active", "=", 1)
      .where("ws_program_plans.deleted_at", "is", null)
      .where("ws_program_plans.program_id", "=", c.var.programId)
      .select(["ws_program_plans.id", "ws_program_plans.year"])
      .orderBy("ws_program_plans.year", "asc")
      .stream()
  }

  async getCoverageByPlanTaskId(c: Context, planTaskIds: number[]) {
    if (planTaskIds.length === 0) return []
    return c.var.trx
      .selectFrom("ws_coverage")
      .where("plan_task_id", "in", planTaskIds)
      .where("deleted_at", "is", null)
      .select(["plan_task_id", "province_id", "coverage_number"])
      .orderBy("plan_task_id", "asc")
      .execute()
  }
}
