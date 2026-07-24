import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"

export class BmhpApprovalMaterialNeedsRepository extends BaseRepository<"ws_bmhp_planning_materials"> {
  constructor() {
    super("ws_bmhp_planning_materials", false, false, true, true)
  }

  async findRegencyIdByEntityId(c: Context, entityId: number) {
    const result = await (c.var.trx as any)
      .selectFrom("entities")
      .select("regency_id")
      .where("id", "=", entityId)
      .executeTakeFirst()

    return result?.regency_id ?? null
  }

  private _buildMaterialNeedsQuery(
    c: Context,
    params: { program_plan_id: number; entity_id?: number; examination_id?: number; material_id?: number },
    userRegencyId?: number
  ) {
    const { program_plan_id, entity_id, examination_id, material_id } = params

    let dbQuery = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as wpm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as wptg",
        (join: any) =>
          join
            .onRef("wptg.id", "=", "wpm.planning_target_group_id")
            .on("wptg.deleted_at", "is", null)
      )
      .innerJoin(
        "ws_bmhp_planning as wp",
        (join: any) =>
          join
            .onRef("wp.id", "=", "wptg.planning_id")
            .on("wp.deleted_at", "is", null)
      )
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        (join: any) =>
          join
            .onRef("wap.id", "=", "wp.approval_period_id")
            .on("wap.program_plan_id", "=", (eb: any) => eb.val(program_plan_id))
            .on("wap.deleted_at", "is", null)
      )
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .leftJoin("entities as parent", "parent.id", "e.parent_id")
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("target_groups as tg", "tg.id", "wptg.target_group_id")
      .innerJoin("bmhp_materials as bm", (join: any) =>
        join
          .onRef("bm.id", "=", "wpm.material_id")
          .on("bm.deleted_at", "is", null)
      )
      .innerJoin(
        "ws_bmhp_material_variant as wbmv",
        (join: any) =>
          join
            .onRef("wbmv.id", "=", "wpm.material_template_id")
            .on("wbmv.deleted_at", "is", null)
      )
      .leftJoin("ws_materials as wm", "wm.global_id", "wbmv.material_id")
      .leftJoin(
        "ws_bmhp_material_variant_detail as wbmvd",
        (join: any) =>
          join
            .onRef("wbmvd.id", "=", "wpm.variant_id")
            .on("wbmvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_mvd", "mu_mvd.id", "wbmvd.unit_id")
      .leftJoin("material_units as mu_cons", "mu_cons.id", "wm.unit_of_consumption_id")
      .select([
        "wpm.id as wpm_id",
        "e.id as puskesmas_id",
        "e.name as puskesmas_name",
        "parent.name as sub_district_name",
        sql<number>`wbmv.material_id`.as("ws_material_id"),
        "bm.name as bm_material_name",
        "wbmv.material_id as material_id",
        sql<string>`wm.name`.as("material_name"),
        sql<string>`CASE WHEN wbmv.is_variant = 1 THEN COALESCE(wbmvd.name, wm.name) ELSE wbmvd.name END`.as("material_variant"),
        sql<string>`COALESCE(mu_cons.name, '-')`.as("unit"),
        sql<string>`'Screening'`.as("type"),
        "wpm.lab_usage as total_needed",
      ])
      .distinct()
      .where("e.deleted_at", "is", null)
      .where("wpm.deleted_at", "is", null)

    if (userRegencyId) {
      dbQuery = dbQuery.where("e.regency_id", "=", userRegencyId)
    }

    if (entity_id) {
      dbQuery = dbQuery.where("e.id", "=", entity_id)
    }

    if (examination_id) {
      dbQuery = dbQuery.where("be.id", "=", examination_id)
    }

    if (material_id) {
      dbQuery = dbQuery.where("bm.id", "=", material_id)
    }

    return dbQuery
      .orderBy("e.name", "asc")
      .orderBy("bm.name", "asc")
      .orderBy("wm.name", "asc")
  }

  async findAllForExcel(
    c: Context,
    params: {
      program_plan_id: number
      entity_id?: number
      examination_id?: number
      material_id?: number
    },
    userRegencyId?: number
  ) {
    return this.findMaterialNeeds(c, params, userRegencyId)
  }

  async findMaterialNeeds(
    c: Context,
    params: {
      program_plan_id: number
      entity_id?: number
      examination_id?: number
      material_id?: number
    },
    userRegencyId?: number
  ): Promise<any[]> {
    const rows: any[] = await this._buildMaterialNeedsQuery(
      c,
      params,
      userRegencyId
    ).execute()
    return rows
  }
  async calculateMaterialNeeds(
    c: Context,
    approvalPeriodId: number
  ): Promise<number> {
    const result = await (c.var.trx as any)
      .selectFrom("ws_bmhp_material_calculations as mc")
      .select((eb: any) => [eb.fn.countAll().as("count")])
      .where("mc.approval_period_id", "=", approvalPeriodId)
      .where("mc.deleted_at", "is", null)
      .executeTakeFirstOrThrow()

    return Number(result.count)
  }
}
