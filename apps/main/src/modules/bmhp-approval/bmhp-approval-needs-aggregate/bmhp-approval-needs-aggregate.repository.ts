import { Context } from "hono"
import { sql } from "kysely"

export class BmhpApprovalNeedsAggregateRepository {
  /**
   * Retrieves the summary of material needs across all cities in a province.
   */
  async getSummary(c: Context, programPlanId: number, provinceId: number) {
    const rows: any[] = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as wpm")
      .innerJoin("ws_bmhp_planning_target_groups as wptg", (join: any) =>
        join
          .onRef("wptg.id", "=", "wpm.planning_target_group_id")
          .on("wptg.deleted_at", "is", null)
      )
      .innerJoin("ws_bmhp_planning as wp", (join: any) =>
        join.onRef("wp.id", "=", "wptg.planning_id").on("wp.deleted_at", "is", null)
      )
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .innerJoin("ws_bmhp_material_variant as wbmv", (join: any) =>
        join
          .onRef("wbmv.id", "=", "wpm.material_template_id")
          .on("wbmv.deleted_at", "is", null)
      )
      .leftJoin("ws_materials as wm", (join: any) =>
        join
          .onRef("wm.global_id", "=", "wbmv.material_id")
          .on("wbmv.is_variant", "=", 0)
          .on("wbmv.program_plan_id", "=", (eb: any) => eb.val(programPlanId))
      )
      .leftJoin("ws_bmhp_material_variant_detail as wbmvd", (join: any) =>
        join
          .onRef("wbmvd.material_variant_id", "=", "wbmv.id")
          .onRef("wbmvd.id", "=", "wpm.variant_id")
          .on("wbmv.program_plan_id", "=", (eb: any) => eb.val(programPlanId))
          .on("wbmvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_mvd", "mu_mvd.id", "wbmvd.unit_id")
      .select([
        sql<string>`MAX(CASE WHEN wbmv.is_variant = 1 THEN wbmvd.name ELSE wm.name END)`.as("material_name"),
        sql<string>`MAX(CASE WHEN wbmv.is_variant = 1 THEN mu_mvd.name ELSE wm.unit_of_distribution END)`.as("unit"),
        sql<number>`COALESCE(SUM(wpm.lab_usage), 0)`.as("total_needed"),
      ])
      .where("e.province_id", "=", String(provinceId))
      .where("be.program_plan_id", "=", programPlanId)
      .where("e.deleted_at", "is", null)
      .where("wpm.deleted_at", "is", null)
      .groupBy(["wbmv.material_id"])
      .execute()

    return rows
  }

  /**
   * Retrieves the paginated list of cities and their approval status.
   */
  async getList(
    c: Context,
    params: {
      programPlanId: number
      provinceId: number
      page: number
      paginate: number
    }
  ) {
    const { programPlanId, provinceId, page, paginate } = params
    const offset = (page - 1) * paginate

    // year is no longer needed for approval_periods; program_plan_id is used directly

    const query = (c.var.trx as any)
      .selectFrom("locations as city")
      .where("city.parent_id", "=", String(provinceId))
      .where("city.level", "=", 1)

    const [cities, totalResult] = await Promise.all([
      query
        .select(["city.id as city_id", "city.name as city_name"])
        .orderBy("city.name", "asc")
        .limit(paginate)
        .offset(offset)
        .execute(),
      query.select((eb: any) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    const total = Number(totalResult?.total || 0)

    if (cities.length === 0) {
      return { list: [], total }
    }

    const cityIds = cities.map((c: any) => String(c.city_id))

    // Get total needs per city
    const needsRows: any[] = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as wpm")
      .innerJoin("ws_bmhp_planning_target_groups as wptg", (join: any) =>
        join.onRef("wptg.id", "=", "wpm.planning_target_group_id").on("wptg.deleted_at", "is", null)
      )
      .innerJoin("ws_bmhp_planning as wp", (join: any) =>
        join.onRef("wp.id", "=", "wptg.planning_id").on("wp.deleted_at", "is", null)
      )
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .select([
        "e.regency_id as city_id",
        sql<number>`COALESCE(SUM(wpm.lab_usage), 0)`.as("total_needs"),
      ])
      .where("e.regency_id", "in", cityIds)
      .where("be.program_plan_id", "=", programPlanId)
      .where("e.deleted_at", "is", null)
      .where("wpm.deleted_at", "is", null)
      .groupBy("e.regency_id")
      .execute()

    // Get approval periods for these cities
    // We match by year and entities.regency_id to get the dinkes approval period
    const approvalRows: any[] = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods as ap")
      .innerJoin("entities as e", "e.id", "ap.entity_id")
      .leftJoin("ws_users as wsu", "wsu.id", "ap.updated_by")
      .select([
        "e.regency_id as city_id",
        "ap.id as ap_id",
        "ap.status as ap_status",
        "ap.updated_at",
        "wsu.id as user_id",
        "wsu.firstname as user_firstname",
        "wsu.lastname as user_lastname",
      ])
      .where("ap.program_plan_id", "=", programPlanId)
      .where("e.regency_id", "in", cityIds)
      .where("e.deleted_at", "is", null)
      .where("ap.deleted_at", "is", null)
      .execute()

    const needsMap = new Map()
    for (const r of needsRows) needsMap.set(String(r.city_id), Number(r.total_needs))

    const approvalMap = new Map()
    for (const r of approvalRows) approvalMap.set(String(r.city_id), r)

    const list = cities.map((city: any) => {
      const cityIdStr = String(city.city_id)
      const needs = needsMap.get(cityIdStr) || 0
      const approval = approvalMap.get(cityIdStr)

      let statusLabel = "pending"
      if (approval) {
        if (approval.ap_status === 1) statusLabel = "approved"
        else if (approval.ap_status === 2) statusLabel = "rejected"
      }

      return {
        id: approval?.ap_id || null,
        city_id: Number(city.city_id),
        city_name: city.city_name,
        total_needs: needs,
        status: statusLabel,
        updated_at: approval?.updated_at || null,
        user_updated_by: approval?.user_firstname
          ? {
              id: Number(approval.user_id),
              name: `${approval.user_firstname} ${approval.user_lastname || ""}`.trim(),
            }
          : null,
      }
    })

    return { list, total }
  }

  /**
   * Retrieves detail targets and target adjustments for a specific city.
   */
  async getDetails(c: Context, programPlanId: number, cityId: number) {
    const rows = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups as wptg")
      .innerJoin("ws_bmhp_planning as wp", (join: any) =>
        join.onRef("wp.id", "=", "wptg.planning_id").on("wp.deleted_at", "is", null)
      )
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("target_groups as tg", "tg.id", "wptg.target_group_id")
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .innerJoin("ws_bmhp_planning_materials as wpm", (join: any) =>
        join.onRef("wpm.planning_target_group_id", "=", "wptg.id").on("wpm.deleted_at", "is", null)
      )
      .innerJoin("ws_bmhp_material_variant as wbmv", (join: any) =>
        join.onRef("wbmv.id", "=", "wpm.material_template_id").on("wbmv.deleted_at", "is", null)
      )
      .leftJoin("ws_materials as wm", (join: any) =>
        join.onRef("wm.global_id", "=", "wbmv.material_id").on("wbmv.is_variant", "=", 0).on("wbmv.program_plan_id", "=", (eb: any) => eb.val(programPlanId))
      )
      .leftJoin("ws_bmhp_material_variant_detail as wbmvd", (join: any) =>
        join.onRef("wbmvd.material_variant_id", "=", "wbmv.id").onRef("wbmvd.id", "=", "wpm.variant_id").on("wbmv.program_plan_id", "=", (eb: any) => eb.val(programPlanId)).on("wbmvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_mvd", "mu_mvd.id", "wbmvd.unit_id")
      .select([
        "be.name as examination_name",
        "tg.title as target_group_name",
        sql<number>`SUM(wpm.lab_usage)`.as("total_needs"),
        sql<string>`MAX(CASE WHEN wbmv.is_variant = 1 THEN mu_mvd.name ELSE wm.unit_of_distribution END)`.as("unit"),
      ])
      .where("e.regency_id", "=", String(cityId))
      .where("be.program_plan_id", "=", programPlanId)
      .where("wptg.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .where("wpm.deleted_at", "is", null)
      .groupBy(["be.id", "be.name", "tg.id", "tg.title"])
      .orderBy("be.name", "asc")
      .orderBy("tg.title", "asc")
      .execute()

    return rows
  }

  /**
   * Updates the status of the city (regency) level approval.
   */
  async updateStatus(
    c: Context,
    programPlanId: number,
    cityId: number,
    status: number
  ) {
    // Find the Dinkes entity for this city
    const dinkesRow = await (c.var.trx as any)
      .selectFrom("entities")
      .select("id")
      .where("regency_id", "=", String(cityId))
      .where("name", "like", "%DINKES%")
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (!dinkesRow) return false
    
    // Check if period exists
    const periodRow = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods")
      .select("id")
      .where("program_plan_id", "=", programPlanId)
      .where("entity_id", "=", dinkesRow.id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (periodRow) {
      await (c.var.trx as any)
        .updateTable("ws_bmhp_approval_periods")
        .set({
          status: status,
          updated_by: c.var.userId,
          updated_at: new Date(),
        })
        .where("id", "=", periodRow.id)
        .execute()
    } else {
      await (c.var.trx as any)
        .insertInto("ws_bmhp_approval_periods")
        .values({
          program_plan_id: programPlanId,
          entity_id: dinkesRow.id,
          status,
          created_by: c.var.userId,
          updated_by: c.var.userId,
        })
        .execute()
    }
    
    return true
  }

  /**
   * Retrieves data for Excel Export — per-material-row detail per city.
   */
  async getExcelData(c: Context, programPlanId: number, provinceId: number) {
    const cities = await (c.var.trx as any)
      .selectFrom("locations as city")
      .select(["city.id as city_id", "city.name as city_name"])
      .where("city.parent_id", "=", String(provinceId))
      .where("city.level", "=", 1)
      .orderBy("city.name", "asc")
      .execute()

    if (cities.length === 0) return []
    const cityIds = cities.map((c: any) => String(c.city_id))

    const approvalRows: any[] = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods as ap")
      .innerJoin("entities as e", "e.id", "ap.entity_id")
      .leftJoin("ws_users as wsu", "wsu.id", "ap.updated_by")
      .select([
        "e.regency_id as city_id",
        "ap.status as ap_status",
        "ap.updated_at",
        "wsu.firstname as user_firstname",
        "wsu.lastname as user_lastname",
      ])
      .where("ap.program_plan_id", "=", programPlanId)
      .where("e.regency_id", "in", cityIds)
      .where("e.deleted_at", "is", null)
      .where("ap.deleted_at", "is", null)
      .execute()

    const approvalMap = new Map()
    for (const r of approvalRows) approvalMap.set(String(r.city_id), r)

    // Get per-material-row detail for all cities (type + template + variant + needs + unit)
    const details = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups as wptg")
      .innerJoin("ws_bmhp_planning as wp", (join: any) =>
        join.onRef("wp.id", "=", "wptg.planning_id").on("wp.deleted_at", "is", null)
      )
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .innerJoin("ws_bmhp_planning_materials as wpm", (join: any) =>
        join.onRef("wpm.planning_target_group_id", "=", "wptg.id").on("wpm.deleted_at", "is", null)
      )
      .innerJoin("bmhp_materials as bm", (join: any) =>
        join.onRef("bm.id", "=", "wpm.material_id").on("bm.deleted_at", "is", null)
      )
      .innerJoin("ws_bmhp_material_variant as wbmv", (join: any) =>
        join.onRef("wbmv.id", "=", "wpm.material_template_id").on("wbmv.deleted_at", "is", null)
      )
      .leftJoin("ws_materials as wm", (join: any) =>
        join.onRef("wm.global_id", "=", "wbmv.material_id").on("wbmv.is_variant", "=", 0).on("wbmv.program_plan_id", "=", (eb: any) => eb.val(programPlanId))
      )
      .leftJoin("ws_bmhp_material_variant_detail as wbmvd", (join: any) =>
        join.onRef("wbmvd.material_variant_id", "=", "wbmv.id").onRef("wbmvd.id", "=", "wpm.variant_id").on("wbmv.program_plan_id", "=", (eb: any) => eb.val(programPlanId)).on("wbmvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_mvd", "mu_mvd.id", "wbmvd.unit_id")
      .select([
        "e.regency_id as city_id",
        "bm.id as bm_material_id",
        "bm.name as bm_material_name",
        sql<string>`'Screening'`.as("type"),
        sql<string>`MAX(wm.name)`.as("template_name"),
        sql<string>`MAX(CASE WHEN wbmv.is_variant = 1 THEN COALESCE(wbmvd.name, wm.name) ELSE wbmvd.name END)`.as("variant_name"),
        sql<string>`MAX(COALESCE(NULLIF(CASE WHEN wbmv.is_variant = 1 THEN mu_mvd.name ELSE wm.unit_of_distribution END, ''), '-'))`.as("unit"),
        sql<number>`COALESCE(SUM(wpm.lab_usage), 0)`.as("total_needs"),
      ])
      .where("e.regency_id", "in", cityIds)
      .where("be.program_plan_id", "=", programPlanId)
      .where("wptg.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .where("wpm.deleted_at", "is", null)
      .groupBy(["e.regency_id", "bm.id", "bm.name", "wbmv.material_id", "wpm.variant_id"])
      .orderBy("bm.name", "asc")
      .execute()

    // Group detail rows by city_id, then by bm_material_id
    type MaterialRow = {
      type: string
      template_name: string
      variant_name: string
      unit: string
      total_needs: number
    }
    type MaterialGroup = {
      bm_material_id: number
      bm_material_name: string
      rows: MaterialRow[]
    }

    const detailsMap = new Map<string, Map<number, MaterialGroup>>()
    for (const d of details) {
      const cityId = String(d.city_id)
      if (!detailsMap.has(cityId)) detailsMap.set(cityId, new Map())
      const groupMap = detailsMap.get(cityId)!
      const bmId = Number(d.bm_material_id)
      if (!groupMap.has(bmId)) {
        groupMap.set(bmId, {
          bm_material_id: bmId,
          bm_material_name: d.bm_material_name || "Unknown",
          rows: [],
        })
      }
      groupMap.get(bmId)!.rows.push({
        type: d.type || "Screening",
        template_name: d.template_name || "",
        variant_name: d.variant_name || "",
        unit: d.unit || "-",
        total_needs: Number(d.total_needs) || 0,
      })
    }

    return cities.map((city: any) => {
      const cityIdStr = String(city.city_id)
      const approval = approvalMap.get(cityIdStr)
      const groupMap = detailsMap.get(cityIdStr) || new Map()
      const material_groups: MaterialGroup[] = Array.from(groupMap.values())

      let statusLabel = "Pending"
      if (approval) {
        if (approval.ap_status === 1) statusLabel = "Approved"
        else if (approval.ap_status === 2) statusLabel = "Rejected"
      }

      return {
        city_id: Number(city.city_id),
        city_name: city.city_name,
        status: statusLabel,
        updated_by: approval?.user_firstname
          ? `${approval.user_firstname} ${approval.user_lastname || ""}`.trim()
          : "-",
        updated_at: approval?.updated_at || null,
        material_groups,
      }
    })
  }
}
