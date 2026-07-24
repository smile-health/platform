import { Context } from "hono"
import { sql } from "kysely"
import { GetMinistryApprovalListQuery } from "./bmhp-approval-ministry.schema.js"

/**
 * Submission status labels derived from ws_bmhp_approval_periods.submitted_at
 */
const SUBMISSION_STATUS = {
  SENT: "Dikirim",
  NOT_SENT: "Belum dikirim",
} as const

/**
 * Approval status labels derived from ws_bmhp_approval_periods.approved_at
 */
const APPROVAL_STATUS = {
  APPROVED: "Disetujui",
  DESKED: "Didesk",
  NOT_SENT: "Belum dikirim",
} as const

export class BmhpApprovalMinistryRepository {
  async getTotalProvince(c: Context, params?: { province_id?: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (c.var.trx as any)
      .selectFrom("locations")
      .select((eb: any) => eb.fn.count("id").as("total"))
      .where("level", "=", 0)

    if (params?.province_id) {
      query = query.where("id", "=", params.province_id)
    }

    const result = await query.executeTakeFirst()
    return Number(result?.total) || 0
  }

  async getProgramInfoFromProgramPlan(c: Context, programPlanId: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planRow = await (c.var.trx as any)
      .selectFrom("ws_program_plans")
      .select(["year", "program_id"])
      .where("id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return planRow ?? undefined
  }

  async getSummaryAggregates(
    c: Context,
    params: {
      year?: number
      program_id?: number
      province_id?: number
      status?: number
    }
  ) {
    const { year, program_id, province_id, status } = params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aggQuery = (c.var.trx as any)
      .selectFrom("locations as prov")
      .where("prov.level", "=", 0)
      .leftJoin("entities as e", (join: any) =>
        join
          .onRef("e.province_id", "=", "prov.id")
          .on("e.entity_tag_id", "=", 5)
          .on("e.deleted_at", "is", null)
      )
      .leftJoin("ws_bmhp_approval_period_province as ap", (join: any) =>
        join.onRef("ap.entity_id", "=", "e.id").on("ap.deleted_at", "is", null)
      )
      .leftJoin("ws_program_plans as wpp", (join: any) =>
        join
          .onRef("wpp.id", "=", "ap.program_plan_id")
          .on("wpp.approach_id", "=", 4)
          .on("wpp.deleted_at", "is", null)
      )

    if (year !== undefined) {
      aggQuery = aggQuery.where("wpp.year", "=", year)
    }
    if (program_id !== undefined) {
      aggQuery = aggQuery.where("wpp.program_id", "=", program_id)
    }
    if (province_id) {
      aggQuery = aggQuery.where("prov.id", "=", province_id)
    }
    if (status !== undefined) {
      aggQuery = aggQuery.where((eb: any) =>
        status === 0
          ? eb.or([eb("ap.status", "=", 0), eb("ap.status", "is", null)])
          : eb("ap.status", "=", status)
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aggRows: any[] = await aggQuery
      .select([
        "prov.id as province_id",
        "wpp.id as id",
        "ap.status as approval_status",
        "ap.submitted_at",
      ])
      .execute()

    return aggRows
  }

  /**
   * Count how many province submissions (status = 1) occurred today.
   * Used for the "+N Hari ini" badge in the summary.
   */
  async getTodaySubmissionCount(
    c: Context,
    params: {
      programPlanId?: number
      year?: number
      program_id?: number
      province_id?: number
    }
  ) {
    const { programPlanId, year, program_id, province_id } = params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_period_province as ap")
      .select((eb: any) => eb.fn.count("ap.id").as("count"))
      .where("ap.status", "=", 1)
      .where("ap.deleted_at", "is", null)
      .where(sql`DATE(ap.created_at)`, "=", sql`CURDATE()`)

    if (programPlanId) {
      query = query.where("ap.program_plan_id", "=", programPlanId)
    }

    if (
      year !== undefined ||
      program_id !== undefined ||
      province_id !== undefined
    ) {
      query = query
        .leftJoin("ws_program_plans as wpp", (join: any) =>
          join
            .onRef("wpp.id", "=", "ap.program_plan_id")
            .on("wpp.deleted_at", "is", null)
        )
        .leftJoin("entities as e", (join: any) =>
          join.onRef("e.id", "=", "ap.entity_id").on("e.deleted_at", "is", null)
        )

      if (year !== undefined) {
        query = query.where("wpp.year", "=", year)
      }
      if (program_id !== undefined) {
        query = query.where("wpp.program_id", "=", program_id)
      }
      if (province_id) {
        query = query.where("e.province_id", "=", province_id)
      }
    }

    const result = await query.executeTakeFirst()
    return Number(result?.count ?? 0)
  }

  async findMinistryApprovalListBase(
    c: Context,
    params: GetMinistryApprovalListQuery,
    year?: number,
    programId?: number
  ) {
    const { page, paginate, province_id } = params
    const offset = (page - 1) * paginate

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let baseQuery = (c.var.trx as any)
      .selectFrom("locations as prov")
      .where("prov.level", "=", 0)
      .leftJoin(
        (eb: any) => {
          let sub = eb
            .selectFrom("entities as e")
            .where("e.entity_tag_id", "=", 5)
            .where("e.deleted_at", "is", null)
            .leftJoin("ws_bmhp_approval_period_province as ap", (apJoin: any) =>
              apJoin
                .onRef("ap.entity_id", "=", "e.id")
                .on("ap.deleted_at", "is", null)
            )
            .leftJoin("ws_program_plans as wpp", (wppJoin: any) =>
              wppJoin
                .onRef("wpp.id", "=", "ap.program_plan_id")
                .on("wpp.approach_id", "=", 4)
                .on("wpp.deleted_at", "is", null)
            )
            .select([
              "e.province_id",
              "wpp.id as latest_ap_id",
              "ap.status as approval_status",
              "ap.submitted_at",
              "wpp.updated_at",
            ])

          if (year !== undefined) sub = sub.where("wpp.year", "=", year)
          if (programId !== undefined)
            sub = sub.where("wpp.program_id", "=", programId)

          return sub.as("plan_data")
        },
        "plan_data.province_id",
        "prov.id"
      )

    if (params.status !== undefined) {
      baseQuery = baseQuery.where((eb: any) =>
        params.status === 0
          ? eb.or([eb("plan_data.approval_status", "=", 0), eb("plan_data.approval_status", "is", null)])
          : eb("plan_data.approval_status", "=", params.status)
      )
    }
    if (province_id) {
      baseQuery = baseQuery.where("prov.id", "=", province_id)
    }

    const [list, totalResult] = await Promise.all([
      baseQuery
        .select([
          "plan_data.latest_ap_id",
          "plan_data.approval_status",
          "plan_data.submitted_at",
          "plan_data.updated_at",
          "prov.id as province_id",
          "prov.name as province_name",
        ])
        .orderBy("prov.name", "asc")
        .limit(paginate)
        .offset(offset)
        .execute(),

      baseQuery
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select((eb: any) => eb.fn.count("prov.id").as("total"))
        .executeTakeFirst(),
    ])

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      list: list as any[],
      total: Number(totalResult?.total) || 0,
    }
  }

  async findApprovalsUsers(c: Context, latestIds: number[]) {
    if (latestIds.length === 0) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRows: any[] = await (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .leftJoin("ws_users as wsu_c", "wsu_c.id", "wpp.created_by")
      .leftJoin("ws_users as wsu_u", "wsu_u.id", "wpp.updated_by")
      .select([
        "wpp.id as ap_id",
        "wsu_c.id as created_id",
        "wsu_c.username as created_username",
        "wsu_c.firstname as created_firstname",
        "wsu_c.lastname as created_lastname",
        "wsu_u.id as updated_id",
        "wsu_u.username as updated_username",
        "wsu_u.firstname as updated_firstname",
        "wsu_u.lastname as updated_lastname",
      ])
      .where("wpp.id", "in", latestIds)
      .execute()

    return userRows
  }

  /**
   * Get procurement recapitulation total variants
   */
  async countAllRecapitulation(
    c: Context,
    params: {
      programPlanId: number
      keyword?: string
    }
  ): Promise<number> {
    const { programPlanId, keyword } = params

    const subquery = (c.var.trx as any)
      .selectFrom("ws_bmhp_material_variant as mv")
      // is_variant = 1 → material (no variant) → join global ws_materials for name
      .leftJoin("ws_materials as m", (join: any) =>
        join
          .onRef("m.global_id", "=", "mv.material_id")
          .on("m.deleted_at", "is", null)
      )
      // is_variant = 0 → has variant → join variant_detail for name
      .leftJoin("ws_bmhp_material_variant_detail as mvd", (join: any) =>
        join
          .onRef("mvd.material_variant_id", "=", "mv.id")
          .on("mvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_cons", "mu_cons.id", "m.unit_of_consumption_id")
      .select([
        sql<number>`mv.id`.as("id"),
        sql<string>`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`.as("name"),
        sql<string>`COALESCE(mu_cons.name, '-')`.as("unit"),
      ])
      .where("mv.program_plan_id", "=", programPlanId)
      .where("mv.deleted_at", "is", null)
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "!=",
        ""
      )
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "is not",
        null
      )
      .$if(!!keyword, (qb: any) =>
        qb.where(
          sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
          "like",
          `%${keyword}%`
        )
      )
      .groupBy([
        "mv.id",
        sql.raw("`name`"),
        sql.raw("`unit`"),
      ])

    const result = await (c.var.trx as any)
      .selectFrom(subquery.as("subq"))
      .select([sql<number>`COUNT(*)`.as("total")])
      .executeTakeFirst()

    return Number(result?.total ?? 0)
  }

  async findRecapitulation(
    c: Context,
    params: {
      programPlanId: number
      keyword?: string
      year: number
      page?: number
      itemPerPage?: number
      province_id?: number
    }
  ) {
    const { programPlanId, keyword, page, itemPerPage, province_id } = params

    const rows = await (c.var.trx as any)
      .selectFrom("ws_bmhp_material_variant as mv")
      .leftJoin("ws_materials as m", (join: any) =>
        join
          .onRef("m.global_id", "=", "mv.material_id")
          .on("m.deleted_at", "is", null)
      )
      .leftJoin("ws_bmhp_material_variant_detail as mvd", (join: any) =>
        join
          .onRef("mvd.material_variant_id", "=", "mv.id")
          .on("mvd.deleted_at", "is", null)
      )
      .leftJoin("material_units as mu_cons", "mu_cons.id", "m.unit_of_consumption_id")
      .leftJoin("ws_bmhp_stock_recaps as sr", (join: any) =>
        join
          .onRef("sr.material_id", "=", "mv.material_id")
          .on("sr.deleted_at", "is", null)
          .on(
            sql`CASE WHEN mv.is_variant = 0 THEN sr.variant_id = mvd.id ELSE sr.variant_id IS NULL END`
          )
      )
      .leftJoin("ws_bmhp_approval_periods as ap", (join: any) =>
        join
          .onRef("ap.id", "=", "sr.approval_period_id")
          .on("ap.program_plan_id", "=", (eb: any) => eb.val(programPlanId))
          .on("ap.deleted_at", "is", null)
      )
      .leftJoin("entities as e_ap", "e_ap.id", "ap.entity_id")
      .select([
        sql<number>`mv.id`.as("id"),
        sql<number>`mv.material_id`.as("material_id"),
        sql<number>`mv.is_variant`.as("is_variant"),
        sql<number | null>`MAX(mvd.id)`.as("variant_id"),
        sql<string>`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`.as("name"),
        sql<string>`COALESCE(mu_cons.name, '-')`.as("unit"),
        sql<number>`SUM(CASE WHEN ap.id IS NOT NULL ${
          province_id ? sql`AND e_ap.province_id = ${province_id}` : sql``
        } THEN COALESCE(sr.stock_on_hand, 0) ELSE 0 END)`.as("remaining_stock"),
        sql<number>`SUM(CASE WHEN ap.id IS NOT NULL ${
          province_id ? sql`AND e_ap.province_id = ${province_id}` : sql``
        } THEN COALESCE(sr.total_needed, 0) ELSE 0 END)`.as("total_needs_db"),
        sql<number>`SUM(CASE WHEN ap.id IS NOT NULL ${
          province_id ? sql`AND e_ap.province_id = ${province_id}` : sql``
        } THEN COALESCE(sr.proposal_qty, 0) ELSE 0 END)`.as("procurement_proposal_db"),
        sql<number>`SUM(CASE WHEN ap.id IS NOT NULL ${
          province_id ? sql`AND e_ap.province_id = ${province_id}` : sql``
        } THEN COALESCE(sr.buffer_qty, 0) ELSE 0 END)`.as("proposal_buffer_db"),
        sql<number>`SUM(CASE WHEN ap.id IS NOT NULL ${
          province_id ? sql`AND e_ap.province_id = ${province_id}` : sql``
        } THEN COALESCE(sr.desk_result, 0) ELSE 0 END)`.as("desk_result"),
      ])
      .where("mv.program_plan_id", "=", programPlanId)
      .where("mv.deleted_at", "is", null)
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "!=",
        ""
      )
      .where(
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        "is not",
        null
      )
      .$if(!!keyword, (qb: any) =>
        qb.where(
          sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
          "like",
          `%${keyword}%`
        )
      )
      .groupBy([
        "mv.id",
        "mv.material_id",
        "mv.is_variant",
        "m.name",
        "m.unit_of_consumption_id",
        sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
        sql`COALESCE(mu_cons.name, '-')`,
      ])
      .orderBy("name", "asc")
      .$if(page !== undefined && itemPerPage !== undefined, (qb: any) =>
        qb.limit(itemPerPage!).offset((page! - 1) * itemPerPage!)
      )
      .execute()

    return (rows as any[]).map((row: any) => {
      const remainingStock = Number(row.remaining_stock)
      const totalNeeds = Number(row.total_needs_db)
      const procurementProposal = Number(row.procurement_proposal_db)
      const proposalBuffer = Number(row.proposal_buffer_db)

      return {
        id: Number(row.id),
        material_id: Number(row.material_id),
        name: row.name ?? "",
        unit: c.var.t(`material_unit.label.${row.unit || "-"}`),
        total_needs: totalNeeds,
        remaining_stock: remainingStock,
        procurement_proposal: procurementProposal,
        proposal_buffer: proposalBuffer,
        desk_result: Number(row.desk_result ?? 0),
      }
    })
  }

  /**
   * Get total_needed for a list of material_ids from ws_bmhp_material_calculations.
   * Aggregates across the entire country for the currently matching material variants.
   */
  async getTotalNeedsMapNational(
    c: Context,
    programPlanId: number,
    materialIds: number[],
    province_id?: number
  ): Promise<Map<string, number>> {
    const rows = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as pm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as ptg",
        "ptg.id",
        "pm.planning_target_group_id"
      )
      .innerJoin("ws_bmhp_planning as p", "p.id", "ptg.planning_id")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        (join: any) =>
          join
            .onRef("wap.id", "=", "p.approval_period_id")
            .on("wap.program_plan_id", "=", (eb: any) => eb.val(programPlanId))
            .on("wap.deleted_at", "is", null)
      )
      .innerJoin("entities as e", "e.id", "p.entity_id")
      .innerJoin(
        "ws_bmhp_material_variant as wbmv",
        "wbmv.id",
        "pm.material_template_id"
      )
      .leftJoin("ws_bmhp_material_variant_detail as pm_mvd", (join: any) =>
        join
          .onRef("pm_mvd.id", "=", "pm.variant_id")
          .on("pm_mvd.deleted_at", "is", null)
      )
      .leftJoin("ws_bmhp_material_variant_detail as r_mvd", (join: any) =>
        join
          .onRef("r_mvd.material_variant_id", "=", "wbmv.id")
          .onRef("r_mvd.name", "=", "pm_mvd.name")
          .on("r_mvd.deleted_at", "is", null)
      )
      .select([
        sql<number>`pm.material_template_id`.as("material_template_id"),
        sql<number | null>`r_mvd.id`.as("variant_detail_id"),
        sql<number>`SUM(pm.lab_usage)`.as("total_needed"),
      ])
      .where("wbmv.material_id", "in", materialIds)
      .where("pm.deleted_at", "is", null)
      .where("ptg.deleted_at", "is", null)
      .where("p.deleted_at", "is", null)
      .where("wap.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .where("wbmv.deleted_at", "is", null)
      .$if(!!province_id, (qb: any) =>
        qb.where("e.province_id", "=", province_id!)
      )
      .groupBy("pm.material_template_id")
      .groupBy("r_mvd.id")
      .execute()

    const resultMap = new Map<string, number>()
    for (const r of rows as any[]) {
      const needed = Number(r.total_needed)
      if (!needed) continue

      const key = r.variant_detail_id != null
        ? `d_${r.variant_detail_id}`
        : `t_${r.material_template_id}`
      resultMap.set(key, (resultMap.get(key) ?? 0) + needed)
    }

    return resultMap
  }
}
