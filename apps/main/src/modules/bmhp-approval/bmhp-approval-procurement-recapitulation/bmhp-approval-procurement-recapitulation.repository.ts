import { Context } from "hono"
import { sql } from "kysely"
import { ENTITY_TAG } from "@/common/constants/entity.js"
import { BadRequestError } from "@smile/lib/error.js"

export class BmhpApprovalProcurementRecapitulationRepository {
  /**
   * Resolve or create approval period for a regency entity + year
   * Returns approval period ID
   */
  async getOrCreateApprovalPeriod(
    c: Context,
    entityId: number,
    program_plan_id: number
  ): Promise<number> {
    const existing = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods as ap")
      .select(["ap.id"])
      .where("ap.entity_id", "=", entityId)
      .where("ap.program_plan_id", "=", program_plan_id)
      .where("ap.deleted_at", "is", null)
      .executeTakeFirst()

    if (existing) return Number(existing.id)

    const inserted = await (c.var.trx as any)
      .insertInto("ws_bmhp_approval_periods")
      .values({
        entity_id: entityId,
        program_plan_id,
        status: 0,
        current_step: 1,
        created_by: (c.var as any).userId ?? null,
        updated_by: (c.var as any).userId ?? null,
      })
      .executeTakeFirst()

    return Number(inserted.insertId)
  }

  /**
   * Get year from program_plan_id
   */
  async getYearByProgramPlanId(
    c: Context,
    programPlanId: number
  ): Promise<number | null> {
    const row = await (c.var.trx as any)
      .selectFrom("ws_program_plans as wpp")
      .select(["wpp.year"])
      .where("wpp.id", "=", programPlanId)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()

    return row ? Number(row.year) : null
  }

  /**
   * Get procurement recapitulation data
   */
  async countAll(
    c: Context,
    params: {
      programPlanId: number
      keyword?: string
    }
  ): Promise<number> {
    const { programPlanId, keyword } = params

    // Subquery to match the GROUP BY logic in findAll
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
      .leftJoin(
        "material_units as mu_cons",
        "mu_cons.id",
        "m.unit_of_consumption_id"
      )
      .select([
        sql<number>`mv.id`.as("id"),
        sql<string>`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`.as(
          "name"
        ),
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
      .$if(!!keyword, (qb) =>
        qb.where(
          sql`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`,
          "like",
          `%${keyword}%`
        )
      )
      .groupBy(["mv.id", sql.raw("`name`"), sql.raw("`unit`")])

    // Count the grouped results (matching findAll's GROUP BY mv.id, name, unit)
    const result = await (c.var.trx as any)
      .selectFrom(subquery.as("subq"))
      .select([sql<number>`COUNT(*)`.as("total")])
      .executeTakeFirst()

    return Number(result?.total ?? 0)
  }

  async findAll(
    c: Context,
    params: {
      programPlanId: number
      approvalPeriodId: number
      keyword?: string
      entityId: number
      regencyId?: number | null
      page?: number
      itemPerPage?: number
      remainingStockDate?: string | null
    }
  ): Promise<{
    rows: any[]
    wsStockTotalQtyMap: Map<string | number, number>
    totalNeedsMap: Map<string, number>
  }> {
    const {
      programPlanId,
      approvalPeriodId,
      keyword,
      entityId,
      regencyId,
      page,
      itemPerPage,
      remainingStockDate,
    } = params

    // Phase 1: rows query + closingQtyMap are independent — run in parallel
    const rowsQuery = (c.var.trx as any)
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
      .leftJoin(
        "material_units as mu_cons",
        "mu_cons.id",
        "m.unit_of_consumption_id"
      )
      .leftJoin("ws_bmhp_stock_recaps as sr", (join: any) =>
        join
          .onRef("sr.material_id", "=", "mv.material_id")
          .on("sr.approval_period_id", "=", (eb: any) =>
            eb.val(approvalPeriodId)
          )
          .on("sr.deleted_at", "is", null)
          .on(
            sql`CASE WHEN mv.is_variant = 0 THEN sr.variant_id = mvd.id ELSE sr.variant_id IS NULL END`
          )
      )
      .select([
        sql<number>`mv.id`.as("id"),
        sql<number>`mv.material_id`.as("material_id"),
        sql<number>`mv.is_variant`.as("is_variant"),
        sql<string>`GROUP_CONCAT(mvd.id)`.as("variant_detail_ids"),
        sql<number>`MAX(mvd.id)`.as("variant_id"),
        sql<number | null>`MAX(mvd.material_id)`.as("physical_material_id"),
        sql<string>`CASE WHEN mv.is_variant = 0 THEN COALESCE(mvd.name, m.name) ELSE m.name END`.as(
          "name"
        ),
        sql<string>`COALESCE(mu_cons.name, '-')`.as("unit"),
        sql<number | null>`MAX(sr.stock_on_hand)`.as("stock_on_hand"),
        sql<number>`MAX(COALESCE(sr.total_needed, 0))`.as("total_needed"),
        sql<number>`MAX(COALESCE(sr.proposal_qty, 0))`.as(
          "procurement_proposal"
        ),
        sql<number>`MAX(COALESCE(sr.buffer_percentage, 10))`.as(
          "buffer_percentage"
        ),
        sql<number>`MAX(COALESCE(sr.buffer_qty, 0))`.as("buffer_qty"),
        sql<number>`MAX(COALESCE(sr.id, NULL))`.as("stock_recap_id"),
        sql<number | null>`MAX(COALESCE(sr.desk_result, 0))`.as("desk_result"),
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
      .$if(!!keyword, (qb) =>
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
      .$if(page !== undefined && itemPerPage !== undefined, (qb) =>
        qb.limit(itemPerPage!).offset((page! - 1) * itemPerPage!)
      )
      .execute()

    // Phase 1: rows only
    const rows = await rowsQuery

    // Phase 2: all three maps are independent of each other but need materialIds from rows
    const materialIds: number[] = (rows as any[])
      .map((r): number => Number(r.material_id))
      .filter((v, i, self): boolean => self.indexOf(v) === i)

    const [totalNeedsMap, wsStockTotalQtyMap] = await Promise.all([
      materialIds.length > 0
        ? this.getTotalNeedsMap(c, programPlanId, entityId, materialIds)
        : Promise.resolve(new Map<string, number>()),
      materialIds.length > 0 && regencyId
        ? this.getWsStockTotalQtyMap(c, regencyId, materialIds, remainingStockDate)
        : Promise.resolve(new Map<string | number, number>()),
    ])

    return { rows, wsStockTotalQtyMap, totalNeedsMap }
  }

  /**
   * Upsert stock recap row to update remaining_stock (stock_on_hand).
   * Jika item punya variant (variantId != null), baris disimpan per variant.
   * Jika item plain material (variantId = null), baris disimpan per material.
   * Recalculates proposal_qty = MAX(0, total_needed - stock_on_hand).
   */
  async upsertStockRecap(
    c: Context,
    params: {
      approvalPeriodId: number
      materialId: number
      variantId?: number | null
      stockOnHand: number
      totalNeeded: number
    }
  ) {
    const {
      approvalPeriodId,
      materialId,
      variantId,
      stockOnHand,
      totalNeeded,
    } = params
    const proposalQty = Math.max(0, totalNeeded - stockOnHand)

    let existingQuery = (c.var.trx as any)
      .selectFrom("ws_bmhp_stock_recaps as sr")
      .select(["sr.id", "sr.buffer_percentage"])
      .where("sr.approval_period_id", "=", approvalPeriodId)
      .where("sr.material_id", "=", materialId)
      .where("sr.deleted_at", "is", null)

    if (variantId) {
      existingQuery = existingQuery.where("sr.variant_id", "=", variantId)
    } else {
      existingQuery = existingQuery.where("sr.variant_id", "is", null)
    }

    const existing = await existingQuery.executeTakeFirst()

    const bufferPct =
      existing?.buffer_percentage == null
        ? 10
        : Number(existing.buffer_percentage)
    const bufferQty = Math.ceil(
      Math.round(proposalQty * (1 + bufferPct / 100) * 1e10) / 1e10
    )

    if (existing) {
      await (c.var.trx as any)
        .updateTable("ws_bmhp_stock_recaps")
        .set({
          total_needed: totalNeeded,
          stock_on_hand: stockOnHand,
          proposal_qty: proposalQty,
          buffer_qty: bufferQty,
          updated_at: new Date(),
        })
        .where("id", "=", Number(existing.id))
        .execute()
    } else {
      await (c.var.trx as any)
        .insertInto("ws_bmhp_stock_recaps")
        .values({
          approval_period_id: approvalPeriodId,
          material_id: materialId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variant_id: (variantId ?? null) as any,
          total_needed: totalNeeded,
          stock_on_hand: stockOnHand,
          proposal_qty: proposalQty,
          buffer_percentage: 10,
          buffer_qty: bufferQty,
        })
        .execute()
    }
  }

  /**
   * Upsert desk_result for a material/variant combination.
   * Jika record belum ada, create dengan nilai default 0 untuk field lain.
   */
  async upsertDeskResult(
    c: Context,
    params: {
      approvalPeriodId: number
      materialId: number
      variantId?: number | null
      deskResult: number
    }
  ) {
    const { approvalPeriodId, materialId, variantId, deskResult } = params

    let existingQuery = (c.var.trx as any)
      .selectFrom("ws_bmhp_stock_recaps as sr")
      .select(["sr.id"])
      .where("sr.approval_period_id", "=", approvalPeriodId)
      .where("sr.material_id", "=", materialId)
      .where("sr.deleted_at", "is", null)

    if (variantId) {
      existingQuery = existingQuery.where("sr.variant_id", "=", variantId)
    } else {
      existingQuery = existingQuery.where("sr.variant_id", "is", null)
    }

    const existing = await existingQuery.executeTakeFirst()

    if (existing) {
      await (c.var.trx as any)
        .updateTable("ws_bmhp_stock_recaps")
        .set({
          desk_result: deskResult,
          updated_at: new Date(),
        })
        .where("id", "=", Number(existing.id))
        .execute()
    } else {
      await (c.var.trx as any)
        .insertInto("ws_bmhp_stock_recaps")
        .values({
          approval_period_id: approvalPeriodId,
          material_id: materialId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variant_id: (variantId ?? null) as any,
          total_needed: 0,
          stock_on_hand: 0,
          proposal_qty: 0,
          buffer_percentage: 10,
          desk_result: deskResult,
        })
        .execute()
    }
  }

  /**
   * Pre-fetch the latest closing_qty per material directly from ws_stocks logic
   * Product Template: fetched by wm.global_id mapping.
   * Product Variant: fetched by wm_parent.global_id mapping.
   */
  private async getWsStockTotalQtyMap(
    c: Context,
    regencyId: number,
    materialIds: number[],
    remainingStockDate?: string | null
  ): Promise<Map<string | number, number>> {
    if (materialIds.length === 0) return new Map()

    const rows = await (c.var.trx as any)
      .selectFrom("ws_stocks as s")
      .innerJoin("ws_materials as wm", "wm.id", "s.material_id")
      .leftJoin(
        "ws_materials as wm_parent",
        "wm_parent.id",
        "s.parent_material_id"
      )
      .innerJoin("ws_entities as e", "e.id", "s.entity_id")
      .select([
        sql<number>`wm.global_id`.as("global_id"),
        sql<number | null>`wm_parent.global_id`.as("parent_global_id"),
        sql<number>`SUM(s.qty)`.as("closing_qty"),
        sql<string>`wm.name`.as("name"),
      ])
      .where("e.regency_id", "=", String(regencyId))
      .where("e.entity_tag_id", "in", [
        ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE,
        ENTITY_TAG.COMMUNITY_HEALTH_CENTER,
      ])
      .where("s.deleted_at", "is", null)
      .where("wm.deleted_at", "is", null)
      .where((eb: any) =>
        eb.or([
          eb("wm.global_id", "in", materialIds),
          eb("wm_parent.global_id", "in", materialIds),
        ])
      )
      .$if(!!remainingStockDate, (qb) =>
        qb.where("s.updated_at", "<=", `${remainingStockDate} 23:59:59`)
      )
      .groupBy(["wm.global_id", "wm_parent.global_id", sql.raw("`name`")])
      .execute()

    return this.buildTransactionMap(rows)
  }

  private buildTransactionMap(rows: any[]): Map<string | number, number> {
    const map = new Map<string | number, number>()
    for (const row of rows) {
      const globalId = Number(row.global_id)
      const parentGlobalId = row.parent_global_id
        ? Number(row.parent_global_id)
        : null
      const qty = Number(row.closing_qty)
      const name = row.name

      if (!Number.isNaN(globalId)) map.set(globalId, (map.get(globalId) ?? 0) + qty)
      if (parentGlobalId)
        map.set(parentGlobalId, (map.get(parentGlobalId) ?? 0) + qty)
      if (name) map.set(name, (map.get(name) ?? 0) + qty)
    }
    return map
  }

  /**
   * Get total_needed for a list of material_ids from ws_bmhp_planning_materials.
   * - Regency entity (regency_id present): aggregates across puskesmas in that regency.
   * - Province entity (regency_id null): falls back to province_id and aggregates
   *   across all puskesmas in the province.
   */
  async getTotalNeedsMap(
    c: Context,
    program_plan_id: number,
    entityId: number,
    materialIds: number[]
  ): Promise<Map<string, number>> {
    if (materialIds.length === 0) return new Map()

    const entityInfo = await (c.var.trx as any)
      .selectFrom("entities")
      .select(["regency_id", "province_id"])
      .where("id", "=", entityId)
      .executeTakeFirst()

    const regencyCode = entityInfo?.regency_id
    const provinceCode = entityInfo?.province_id
    if (!regencyCode && !provinceCode) return new Map()

    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_materials as pm")
      .innerJoin(
        "ws_bmhp_planning_target_groups as ptg",
        "ptg.id",
        "pm.planning_target_group_id"
      )
      .innerJoin("ws_bmhp_planning as p", "p.id", "ptg.planning_id")
      .innerJoin("ws_bmhp_approval_periods as wap", (join: any) =>
        join
          .onRef("wap.id", "=", "p.approval_period_id")
          .on("wap.program_plan_id", "=", (eb: any) => eb.val(program_plan_id))
          .on("wap.deleted_at", "is", null)
      )
      .innerJoin("entities as e", "e.id", "p.entity_id")
      .innerJoin(
        "ws_bmhp_material_variant as wbmv",
        "wbmv.id",
        "pm.material_template_id"
      )
      // planning-side variant detail → get its name
      .leftJoin("ws_bmhp_material_variant_detail as pm_mvd", (join: any) =>
        join
          .onRef("pm_mvd.id", "=", "pm.variant_id")
          .on("pm_mvd.deleted_at", "is", null)
      )
      // procurement-side variant detail → match by name under the same wbmv
      .leftJoin("ws_bmhp_material_variant_detail as r_mvd", (join: any) =>
        join
          .onRef("r_mvd.material_variant_id", "=", "wbmv.id")
          .onRef("r_mvd.name", "=", "pm_mvd.name")
          .on("r_mvd.deleted_at", "is", null)
      )
      .select([
        sql<number>`wbmv.material_id`.as("material_id"),
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

    if (regencyCode) {
      query = query.where("e.regency_id", "=", regencyCode)
    } else {
      query = query.where("e.province_id", "=", provinceCode)
    }

    const rows = await query
      .groupBy("wbmv.material_id")
      .groupBy("pm.material_template_id")
      .groupBy("r_mvd.id")
      .execute()

    const resultMap = new Map<string, number>()
    for (const r of rows as any[]) {
      const needed = Number(r.total_needed)
      if (!needed) continue

      // For variant materials: key by procurement-side mvd.id (matched by name)
      // For plain materials or unmatched variants: key by material_template_id
      const key =
        r.variant_detail_id == null
          ? `t_${r.material_template_id}`
          : `d_${r.variant_detail_id}`
      resultMap.set(key, (resultMap.get(key) ?? 0) + needed)

      // Also set v_ and m_ keys for updateRemainingStock logic
      if (r.variant_detail_id == null) {
        const mKey = `m_${r.material_id}`
        resultMap.set(mKey, (resultMap.get(mKey) ?? 0) + needed)
      } else {
        const vKey = `v_${r.variant_detail_id}`
        resultMap.set(vKey, (resultMap.get(vKey) ?? 0) + needed)
      }
    }

    return resultMap
  }

  /**
   * Get material_ids linked to a program_plan_id
   */
  async getMaterialIdsByProgramPlan(
    c: Context,
    programPlanId: number
  ): Promise<number[]> {
    const rows = await (c.var.trx as any)
      .selectFrom("ws_bmhp_material_variant as mv")
      .select([sql<number>`mv.material_id`.as("material_id")])
      .where("mv.program_plan_id", "=", programPlanId)
      .where("mv.deleted_at", "is", null)
      .execute()

    return (rows as any[])
      .map((r): number => Number(r.material_id))
      .filter((v, i, self): boolean => self.indexOf(v) === i)
  }

  /**
   * Create desk result record in ws_bmhp_desk_results
   * Also insert to ws_bmhp_approval_signature if user has signature
   */
  async createDeskResult(
    c: Context,
    params: {
      approvalPeriodId: number
      entityId: number
      statusDesk?: number
      baFileUrl?: string | null
      signatureLink?: string | null
      deskDate?: string | null
      deskBy?: number
    }
  ) {
    const {
      approvalPeriodId,
      statusDesk = 0,
      baFileUrl,
      signatureLink,
      deskDate,
    } = params
    // desk_by from payload is ws_users.global_id; fallback to logged-in user's global_id
    const deskByGlobalId = params.deskBy ?? (c.var as any).userId

    // desk_by (global_id) → ws_users.id → bmhp_approval_signatures.user_id
    const wsUser = await (c.var.trx as any)
      .selectFrom("ws_users")
      .select(["id"])
      .where("global_id", "=", deskByGlobalId)
      .where("program_id", "=", c.var.programId)
      .executeTakeFirst()

    const deskByWsUserId = wsUser ? Number(wsUser.id) : null

    // --- Validate & get Kemenkes user's signature ID (by ws_users.id) ---
    const kemenkesSignature = deskByWsUserId
      ? await (c.var.trx as any)
          .selectFrom("bmhp_approval_signatures")
          .select(["id"])
          .where("user_id", "=", deskByWsUserId)
          .where("deleted_at", "is", null)
          .executeTakeFirst()
      : null

    if (!kemenkesSignature) {
      throw new BadRequestError(
        "Tanda tangan Kemenkes belum tersedia. Pastikan pihak Kemenkes sudah menginput tanda tangan."
      )
    }

    const kemenkesSignatureId = kemenkesSignature
      ? Number(kemenkesSignature.id)
      : null

    const existingDeskResult = await (c.var.trx as any)
      .selectFrom("ws_bmhp_desk_results")
      .select(["id"])
      .where("approval_period_id", "=", approvalPeriodId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    let deskResultId: number

    if (existingDeskResult) {
      // UPDATE existing record
      await (c.var.trx as any)
        .updateTable("ws_bmhp_desk_results")
        .set({
          status_desk: statusDesk,
          ba_file_url: baFileUrl ?? null,
          signature_link: signatureLink ?? null,
          desk_date: deskDate ? new Date(deskDate) : null,
          desk_by: deskByGlobalId,
          approval_signature_id: kemenkesSignatureId,
          updated_at: new Date(),
        })
        .where("id", "=", existingDeskResult.id)
        .execute()

      deskResultId = Number(existingDeskResult.id)
    } else {
      // INSERT new record
      const result = await (c.var.trx as any)
        .insertInto("ws_bmhp_desk_results")
        .values({
          approval_period_id: approvalPeriodId,
          status_desk: statusDesk,
          ba_file_url: baFileUrl ?? null,
          signature_link: signatureLink ?? null,
          desk_date: deskDate ? new Date(deskDate) : null,
          desk_by: deskByGlobalId,
          approval_signature_id: kemenkesSignatureId,
        })
        .executeTakeFirst()

      deskResultId = Number(result.insertId)
    }

    return {
      id: deskResultId,
      approval_period_id: approvalPeriodId,
    }
  }

  /**
   * Get desk result BA data for PDF generation
   */
  async getDeskResultBAData(
    c: Context,
    params: {
      programPlanId: number
      entityId: number
    }
  ) {
    const { programPlanId, entityId } = params

    const approvalPeriodId = await this.getOrCreateApprovalPeriod(
      c,
      entityId,
      programPlanId
    )

    // Get entity info
    const entityInfo = await (c.var.trx as any)
      .selectFrom("entities as e")
      .leftJoin("locations as reg", "reg.id", "e.regency_id")
      .leftJoin("locations as prov", "prov.id", "e.province_id")
      .select([
        "e.id as entity_id",
        "e.name as entity_name",
        "e.regency_id as regency_id",
        "reg.name as regency_name",
        "prov.name as province_name",
      ])
      .where("e.id", "=", entityId)
      .where("e.deleted_at", "is", null)
      .executeTakeFirst()

    if (!entityInfo) {
      return null
    }

    // Get program plan info separately
    const programPlanInfo = await (c.var.trx as any)
      .selectFrom("ws_program_plans as pp")
      .select(["pp.year", "pp.program_id"])
      .where("pp.id", "=", programPlanId)
      .where("pp.deleted_at", "is", null)
      .executeTakeFirst()

    const programPlanName = `Tahun ${programPlanInfo.year}`

    // Get desk result info (include approval_signature_id for Kemenkes TTD lookup)
    const deskResultInfo = await (c.var.trx as any)
      .selectFrom("ws_bmhp_desk_results as wdr")
      .leftJoin("ws_users as desk_by_user", "desk_by_user.id", "wdr.desk_by")
      .select([
        "wdr.status_desk",
        "wdr.signature_link",
        "wdr.ba_file_url",
        "wdr.desk_date",
        "wdr.approval_signature_id",
        sql<string>`CONCAT(COALESCE(desk_by_user.firstname, ''), ' ', COALESCE(desk_by_user.lastname, ''))`.as(
          "desk_by_name"
        ),
      ])
      .where("wdr.approval_period_id", "=", approvalPeriodId)
      .where("wdr.deleted_at", "is", null)
      .executeTakeFirst()

    // Get approval period's approval_signature_id (KAKO TTD)
    const approvalPeriodData = await (c.var.trx as any)
      .selectFrom("ws_bmhp_approval_periods")
      .select(["approval_signature_id"])
      .where("id", "=", approvalPeriodId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    const signatureSelectFields = [
      "bas.user_id",
      "bas.signature_url",
      "bas.name as signer_name",
      "bas.position as signer_position",
      "bas.program",
      "u.entity_id as user_entity_id",
    ]

    // TTD KEMENKES — dari ws_bmhp_desk_results.approval_signature_id
    let signature_kemenkes: any = null
    if (deskResultInfo?.approval_signature_id) {
      signature_kemenkes =
        (await (c.var.trx as any)
          .selectFrom("bmhp_approval_signatures as bas")
          .leftJoin("ws_users as u", "u.id", "bas.user_id")
          .select(signatureSelectFields)
          .where("bas.id", "=", Number(deskResultInfo.approval_signature_id))
          .executeTakeFirst()) ?? null
    }

    // TTD KAKO — dari ws_bmhp_approval_periods.approval_signature_id
    let signature_kako: any = null
    if (approvalPeriodData?.approval_signature_id) {
      signature_kako =
        (await (c.var.trx as any)
          .selectFrom("bmhp_approval_signatures as bas")
          .leftJoin("ws_users as u", "u.id", "bas.user_id")
          .select(signatureSelectFields)
          .where(
            "bas.id",
            "=",
            Number(approvalPeriodData.approval_signature_id)
          )
          .executeTakeFirst()) ?? null
    }

    // Get material data with desk results
    const raw = await this.findAll(c, {
      programPlanId,
      approvalPeriodId,
      keyword: undefined,
      entityId,
      regencyId: Number(entityInfo.regency_id) || null,
      remainingStockDate: null,
    })

    // Format materials for BA
    const materials = raw.rows.map((row: any, index: number) => {
      let totalNeeds = 0
      let procurementProposal = 0
      let remainingStock = 0

      if (row.stock_on_hand != null) {
        remainingStock = Number(row.stock_on_hand)
      } else if (Number(row.is_variant) === 0) {
        remainingStock =
          raw.wsStockTotalQtyMap.get(row.name) ??
          raw.wsStockTotalQtyMap.get(row.physical_material_id) ??
          0
      } else {
        remainingStock = raw.wsStockTotalQtyMap.get(row.material_id) ?? 0
      }

      totalNeeds =
        Number(row.is_variant) === 0 && row.variant_id
          ? (raw.totalNeedsMap.get(`d_${row.variant_id}`) ??
            raw.totalNeedsMap.get(`t_${row.id}`) ??
            0)
          : (raw.totalNeedsMap.get(`t_${row.id}`) ?? 0)

      const baseProposal = Math.max(0, totalNeeds - remainingStock)
      procurementProposal = Math.ceil(baseProposal * 1.1)

      return {
        no: index + 1,
        name: row.name ?? "",
        unit: row.unit ?? "-",
        total_needs: totalNeeds,
        remaining_stock: remainingStock,
        procurement_proposal: procurementProposal,
        desk_result: Number(row.desk_result ?? 0),
      }
    })

    // Calculate totals
    const totalItems = materials.length
    const totalProcurementProposal = materials.reduce(
      (sum, m) => sum + m.procurement_proposal,
      0
    )
    const totalDeskResult = materials.reduce((sum, m) => sum + m.desk_result, 0)

    return {
      program_plan_name: programPlanName,
      regency_name: entityInfo.regency_name || "",
      province_name: entityInfo.province_name || "",
      entity_name: entityInfo.entity_name || "",
      desk_date: deskResultInfo?.desk_date || null,
      status_desk: deskResultInfo?.status_desk || null,
      signature_link:
        signature_kemenkes?.signature_url ||
        deskResultInfo?.signature_link ||
        null,
      signer_name: signature_kemenkes?.signer_name || null,
      signer_position: signature_kemenkes?.signer_position || null,
      signature_kemenkes,
      signature_kako,
      ba_file_url: deskResultInfo?.ba_file_url || null,
      desk_by_name: deskResultInfo?.desk_by_name?.trim() || null,
      materials,
      total_items: totalItems,
      total_procurement_proposal: totalProcurementProposal,
      total_desk_result: totalDeskResult,
    }
  }

  /**
   * Check if a user (by global_id) has a signature record in bmhp_approval_signatures
   */
  async checkUserHasSignature(
    c: Context,
    userGlobalId: number
  ): Promise<boolean> {
    if (!userGlobalId) {
      return false
    }

    // Check if signature exists (user_id in bmhp_approval_signatures stores global_id)
    const signature = await c.var.trx
      .selectFrom("bmhp_approval_signatures")
      .select(["id"])
      .where("user_id", "=", userGlobalId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return !!signature
  }
}
