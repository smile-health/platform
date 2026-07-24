import { datamart } from "@/common/infrastructure/database/datamart.js"
import type { Datamart } from "@/common/infrastructure/database/types/datamart.js"
import { Context } from "hono"
import { sql, type Kysely } from "kysely"
import {
  GetEmonevProvinceQueries,
  GetEmonevRegencyQueries,
} from "./emonev.schema.js"

type DateOrString = Date | string

type DatamartDb = Kysely<Datamart>

const getDatamartDb = (): DatamartDb | null => {
  if (!datamart) return null

  if ("selectFrom" in datamart) {
    return datamart
  }

  if ("getClient" in datamart && typeof datamart.getClient === "function") {
    return datamart.getClient() as unknown as DatamartDb
  }

  return null
}

const asSubquery = <T extends object>(query: string) =>
  sql<T>`(${sql.raw(query)})`.as("subq")

export type EmonevProvinceParams = GetEmonevProvinceQueries & {
  date_cutoff: string
}

export type EmonevRegencyParams = GetEmonevRegencyQueries & {
  date_cutoff: string
}

interface DatamartStockRow {
  material_id: number
  qty: number
}

interface DatamartStockByActivityRow {
  material_id: number
  activity_id: number | null
  qty: number
}

interface DatamartConsumptionRow {
  material_id: number
  consumption: number
}

interface DatamartProvinceStockRow {
  stock_id: number
  material_id: number
  allocated_qty: number | null
  created_at: DateOrString
  updated_at: DateOrString | null
  activity_id: number | null
  activity_name: string | null
  batch_id: number | null
  batch_code: string | null
  batch_expired_date: DateOrString | null
  batch_production_date: DateOrString | null
  manufacture_id: number | null
  manufacture_name: string | null
  manufacture_address: string | null
  qty: number
}

type WsMaterialRow = {
  id: number
  name: string
  code: string
  material_type_id: number | null
  material_subtype_id?: number | null
  consumption_unit_per_distribution_unit: number | null
  unit_of_consumption: unknown
}

type WsActivityRow = {
  id: number
  name: string
}

type AnnualNeedResultBaseRow = {
  material_id: number | null
  activity_id: number | null
  yearly_need: unknown
  yearly_need_vial: unknown
  ip: unknown
  target_group_id: number | null
}

type AnnualNeedResultRow = AnnualNeedResultBaseRow & {
  coverage_number: number | null
  number_of_dose: number | null
}

export class EmonevRepository {
  private formatProvinceResponse(
    province: {
      province_id: number
      code: string | null
      trader_id: string | null
      name: string | null
    },
    data: Array<Record<string, unknown>>
  ) {
    return {
      province: {
        id_smile: province.province_id,
        code_emonev: province.code,
        code: province.trader_id,
        name: province.name,
      },
      data,
    }
  }

  private formatRegencyResponse(
    regency: {
      regency_id: number | null
      code: string | null
      trader_id: string | null
      name: string | null
    },
    data: Array<Record<string, unknown>>
  ) {
    return {
      regency: {
        id_smile: regency.regency_id,
        code_emonev: regency.code,
        code: regency.trader_id,
        name: regency.name,
      },
      data,
    }
  }

  private getUniqueMaterialIds(items: Array<{ material_id: number | null }>) {
    return Array.from(
      new Set(
        items
          .map((m) => m.material_id)
          .filter((id): id is number => typeof id === "number")
      )
    )
  }

  private indexById<T extends { id: number }>(rows: T[]) {
    const map = new Map<number, T>()
    for (const row of rows) {
      map.set(row.id, row)
    }

    return map
  }

  private groupByMaterialId<T extends { material_id: number }>(rows: T[]) {
    const map = new Map<number, T[]>()
    for (const row of rows) {
      const materialId = row.material_id
      const list = map.get(materialId) ?? []
      list.push(row)
      map.set(materialId, list)
    }

    return map
  }

  private async getProvinceStocksFromDatamart(params: {
    programId: number
    provinceId: number
    materialIds: number[]
    dateCutoff: string
  }): Promise<DatamartProvinceStockRow[]> {
    const stocks: DatamartProvinceStockRow[] = []
    const dm = getDatamartDb()
    if (!dm) return stocks

    const isValidCutoff = /^\d{4}-\d{2}-\d{2}$/.test(params.dateCutoff)
    const safeMaterialIds = params.materialIds
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0)

    if (!isValidCutoff || safeMaterialIds.length === 0) return stocks

    const materialIdsStr = safeMaterialIds.join(",")

    const query = `
          SELECT
            transactions_stock_id AS stock_id,
            dmm_parent_id AS material_id,
            rws.allocated_qty AS allocated_qty,
            rws.created_at AS created_at,
            rws.updated_at AS updated_at,
            stock_activity_id as activity_id,
            rwa.name AS activity_name,
            batches_id AS batch_id,
            batches_code AS batch_code,
            rwb.expired_date AS batch_expired_date,
            rwb.production_date AS batch_production_date,
            rwb.manufacture_id AS manufacture_id,
            rwmf.name AS manufacture_name,
            rwmf.address AS manufacture_address,
            SUM(
              CASE
                WHEN transactions_transaction_type_id = 1
                  THEN transactions_change_qty
                ELSE transactions_opening_qty + transactions_change_qty
              END
            ) AS qty
          FROM datamart_transactions_v5 s FINAL
          JOIN raw_ws_materials rwm FINAL
            ON rwm.id = s.dmm_parent_id
          JOIN raw_ws_stocks rws FINAL
            ON rws.id = s.transactions_stock_id
          JOIN raw_ws_batches rwb FINAL
            ON rwb.id = s.batches_id
          LEFT JOIN raw_ws_manufactures rwmf FINAL
            ON rwmf.id = rwb.manufacture_id
          JOIN raw_ws_activities rwa FINAL
            ON rwa.id = s.stock_activity_id
          WHERE transactions_id IN (
            SELECT max(transactions_id)
            FROM datamart_transactions_v5 s FINAL
            PREWHERE program_id = ${params.programId}
              AND toDate(transactions_created_at + interval 7 hours)
                BETWEEN toDate('2021-01-01') AND toDate('${params.dateCutoff}')
            WHERE entities_is_vendor = 1
              AND entities_type <> 5
              AND entity_tags_id IN (5,7,9,11)
              AND (
                (join_date <= toDate('${params.dateCutoff}') AND end_date >= toDate('${params.dateCutoff}'))
                OR (end_date IS NULL AND join_date <= toDate('${params.dateCutoff}'))
              )
              AND transactions_deleted_at IS NULL
              AND master_deleted_at IS NULL
              AND entities_province_id = ${params.provinceId}
              AND dmm_parent_id IN (${materialIdsStr})
            GROUP BY transactions_stock_id
          )
          AND transactions_deleted_at IS NULL
          AND master_deleted_at IS NULL
          AND s.program_id = ${params.programId}
          AND s.dmm_parent_id IN (${materialIdsStr})
          AND entities_province_id = ${params.provinceId}
          AND entity_tags_id IN (5,7,9,11)
          GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14
          ORDER BY qty DESC
        `

    try {
      const rows = await dm
        .selectFrom(asSubquery<DatamartProvinceStockRow>(query))
        .select([
          "stock_id",
          "material_id",
          "allocated_qty",
          "created_at",
          "updated_at",
          "activity_id",
          "activity_name",
          "batch_id",
          "batch_code",
          "batch_expired_date",
          "batch_production_date",
          "manufacture_id",
          "manufacture_name",
          "manufacture_address",
          "qty",
        ] as const)
        .execute()

      for (const r of rows as unknown as DatamartProvinceStockRow[]) {
        const materialId = Number(r?.material_id)
        if (!Number.isFinite(materialId) || materialId <= 0) continue
        if (Number(r.qty ?? 0) <= 0) continue
        stocks.push({ ...r, material_id: materialId })
      }
    } catch (err) {
      console.error(
        "[Emonev] Failed to query datamart for province stocks:",
        err
      )
    }

    return stocks
  }

  private buildProvinceDataRows(params: {
    year: number
    dateCutoff: string
    emonevMaterials: Array<{
      material_id: number | null
      nama_xls: unknown
      obat_id: unknown
    }>
    materials: Array<{
      id: number
      name: string
      code: string
      consumption_unit_per_distribution_unit: number | null
      unit_of_consumption: unknown
    }>
    materialById: Map<number, (typeof params.materials)[number]>
    stocksByMaterial: Map<number, DatamartProvinceStockRow[]>
    stockUpdateMap: Map<number, number>
    stockLastYearMap: Map<number, number>
    consumptionMap: Map<number, number>
  }) {
    const data: Array<Record<string, unknown>> = []

    for (const item of params.emonevMaterials) {
      const materialId = item.material_id
      if (!materialId) continue

      const material = params.materialById.get(materialId)
      if (!material) continue

      const rows = params.stocksByMaterial.get(materialId) ?? []

      const stocksDto = rows.map((row) => {
        const qty = Number(row.qty ?? 0)
        const allocated = Number(row.allocated_qty ?? 0)
        const batchId = row.batch_id

        return {
          available: qty - allocated,
          id: row.stock_id,
          qty,
          allocated,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          activity_id: row.activity_id,
          batch: batchId
            ? {
                manufacture_name: row.manufacture_name,
                id: batchId,
                code: row.batch_code,
                expired_date: row.batch_expired_date,
                production_date: row.batch_production_date,
                manufacture_id: row.manufacture_id,
                manufacture: {
                  name: row.manufacture_name,
                  address: row.manufacture_address,
                },
              }
            : null,
          activity: row.activity_id
            ? {
                id: row.activity_id,
                name: row.activity_name,
              }
            : null,
        }
      })

      let lastUpdate: Date | null = null
      for (const s of stocksDto) {
        const updatedAt = s.updatedAt ? new Date(s.updatedAt) : null
        if (updatedAt && (!lastUpdate || updatedAt > lastUpdate)) {
          lastUpdate = updatedAt
        }
      }

      const stockUpdate = params.stockUpdateMap.get(material.id) ?? 0
      const stockLastYear = params.stockLastYearMap.get(material.id) ?? 0
      const yearlyConsumption = params.consumptionMap.get(material.id) ?? 0
      const monthlyConsumption = Math.round(yearlyConsumption / 12)

      data.push({
        id: material.id,
        year: String(params.year),
        consumption: monthlyConsumption,
        timestamp_utc: new Date(),
        stock_lastyear: stockLastYear,
        stock_update: stockUpdate,
        date_cutoff: params.dateCutoff,
        master_material_id: material.id,
        nama_xls: item.nama_xls,
        obat_id: item.obat_id,
        stock_last_update: lastUpdate,
        material: {
          id: material.id,
          name: material.name,
          code: material.code,
          pieces_per_unit: material.consumption_unit_per_distribution_unit ?? 0,
          unit: material.unit_of_consumption,
        },
        stocks: stocksDto,
      })
    }

    return data
  }

  private async getAnnualNeedForRegency(
    c: Context,
    params: {
      regencyId: number
      year: number
    }
  ) {
    return c.var.trx
      .selectFrom("ws_annual_needs as wan")
      .innerJoin("ws_program_plans as wpp", "wan.program_plan_id", "wpp.id")
      .select([
        "wan.id as annual_need_id",
        "wan.program_plan_id as program_plan_id",
        "wan.province_id as province_id",
      ])
      .where("wan.regency_id", "=", params.regencyId)
      .where("wpp.year", "=", params.year)
      .where("wan.status", "=", 1)
      .where("wan.deleted_at", "is", null)
      .executeTakeFirst()
  }

  private async getAnnualNeedResultsBase(c: Context, annualNeedId: number) {
    return c.var.trx
      .selectFrom("ws_annual_need_results as anr")
      .leftJoin("ws_annual_need_ipvs as wani", (join) =>
        join
          .onRef("wani.annual_need_id", "=", "anr.annual_need_id")
          .onRef("wani.material_id", "=", "anr.material_id")
          .onRef("wani.activity_id", "=", "anr.activity_id")
          .onRef("wani.target_group_id", "=", "anr.target_group_id")
          .on("wani.deleted_at", "is", null)
      )
      .select([
        "anr.material_id",
        "anr.activity_id",
        "anr.yearly_need",
        "anr.yearly_need_vial",
        sql<number>`COALESCE(wani.regency_ip, wani.national_ip)`.as("ip"),
        "anr.target_group_id",
      ])
      .where("anr.annual_need_id", "=", annualNeedId)
      .where("anr.deleted_at", "is", null)
      .execute() as unknown as AnnualNeedResultBaseRow[]
  }

  private getUniqueNonNullIds(values: Array<number | null | undefined>) {
    return Array.from(new Set(values.filter((id): id is number => id != null)))
  }

  private async getPlanTasksForAnnualNeed(
    c: Context,
    params: {
      programPlanId: number
      materialIds: number[]
      targetGroupIds: number[]
      activityIdsForPlanTasks: number[]
    }
  ) {
    if (params.targetGroupIds.length === 0) return []

    return c.var.trx
      .selectFrom("ws_plan_tasks as pt")
      .select([
        "pt.id as plan_task_id",
        "pt.material_id",
        "pt.activity_id",
        "pt.target_group_id",
        "pt.number_of_dose",
      ])
      .where("pt.deleted_at", "is", null)
      .where("pt.program_plan_id", "=", params.programPlanId)
      .where("pt.material_id", "in", params.materialIds)
      .where("pt.target_group_id", "in", params.targetGroupIds)
      .$if(params.activityIdsForPlanTasks.length > 0, (qb) =>
        qb.where("pt.activity_id", "in", params.activityIdsForPlanTasks)
      )
      .execute()
  }

  private indexPlanTasks(
    planTasks: Array<{
      plan_task_id: unknown
      material_id: number | null
      activity_id: number | null
      target_group_id: number | null
    }>
  ) {
    const planTaskByKey = new Map<string, { plan_task_id: number, number_of_dose: number }>()
    const planTaskIds: number[] = []

    for (const pt of planTasks) {
      const planTaskId = Number(pt.plan_task_id)
      if (
        Number.isNaN(planTaskId) ||
        planTaskId <= 0 ||
        pt.material_id == null ||
        pt.activity_id == null ||
        pt.target_group_id == null
      ) {
        continue
      }

      const key = `${pt.material_id}|${pt.activity_id}|${pt.target_group_id}`
      if (planTaskByKey.has(key)) continue
      planTaskByKey.set(key, { plan_task_id: planTaskId, number_of_dose: pt.number_of_dose })
      planTaskIds.push(planTaskId)
    }

    return { planTaskByKey, planTaskIds }
  }

  private async getCoverageByPlanTaskId(
    c: Context,
    params: {
      provinceId: number
      planTaskIds: number[]
    }
  ) {
    const map = new Map<number, number | null>()
    if (params.planTaskIds.length === 0) return map

    const coverages = await c.var.trx
      .selectFrom("ws_coverage as wc")
      .select(["wc.plan_task_id", "wc.coverage_number"])
      .where("wc.deleted_at", "is", null)
      .where("wc.province_id", "=", params.provinceId)
      .where("wc.plan_task_id", "in", params.planTaskIds)
      .execute()

    for (const wc of coverages) {
      const planTaskId = Number(wc.plan_task_id)
      if (Number.isNaN(planTaskId) || planTaskId <= 0) continue
      if (map.has(planTaskId)) continue

      const cov = wc.coverage_number == null ? null : Number(wc.coverage_number)
      map.set(planTaskId, Number.isNaN(cov) ? null : cov)
    }

    return map
  }

  // attach coverage and number of dose
  private attachTaskDataToAnnualResults(params: {
    annualResultsBase: AnnualNeedResultBaseRow[]
    planTaskByKey: Map<string, { plan_task_id: number, number_of_dose: number }>
    coverageByPlanTaskId: Map<number, number | null>
  }): AnnualNeedResultRow[] {
    return params.annualResultsBase.map((r) => {
      const key =
        r.material_id != null &&
        r.activity_id != null &&
        r.target_group_id != null
          ? `${r.material_id}|${r.activity_id}|${r.target_group_id}`
          : null

      const planTask = key ? params.planTaskByKey.get(key) : undefined
      const planTaskId = planTask?.plan_task_id
      const coverageNumber =
        planTaskId == null
          ? null
          : (params.coverageByPlanTaskId.get(planTaskId) ?? null)

      return {
        ...r,
        coverage_number: coverageNumber,
        number_of_dose: planTask?.number_of_dose ?? 0,
      }
    })
  }

  private async getPopulationByTargetGroup(
    c: Context,
    params: {
      annualNeedId: number
      targetGroupIds: number[]
    }
  ) {
    const map = new Map<number, number>()
    if (params.targetGroupIds.length === 0) return map

    const populations = await c.var.trx
      .selectFrom("ws_annual_need_populations as anp")
      .select([
        "anp.target_group_id",
        "anp.population",
        "anp.population_correction",
      ])
      .where("anp.annual_need_id", "=", params.annualNeedId)
      .where("anp.deleted_at", "is", null)
      .where("anp.target_group_id", "in", params.targetGroupIds)
      .execute()

    for (const p of populations) {
      const next = Number(p.population_correction ?? p.population ?? 0)
      map.set(p.target_group_id, (map.get(p.target_group_id) ?? 0) + next)
    }

    return map
  }

  private indexAnnualNeedResults(annualResults: AnnualNeedResultRow[]) {
    const annualNeedResultsByMaterial = new Map<number, AnnualNeedResultRow[]>()
    const annualNeedActivityCountByMaterial = new Map<
      number,
      Map<number, number>
    >()
    const annualNeedActivityIds = new Set<number>()

    for (const r of annualResults) {
      const materialId = r.material_id
      if (!materialId) continue

      const list = annualNeedResultsByMaterial.get(materialId) ?? []
      list.push(r)
      annualNeedResultsByMaterial.set(materialId, list)

      const activityId = r.activity_id
      if (activityId == null) continue

      annualNeedActivityIds.add(activityId)
      const materialMap =
        annualNeedActivityCountByMaterial.get(materialId) ??
        new Map<number, number>()
      materialMap.set(activityId, (materialMap.get(activityId) ?? 0) + 1)
      annualNeedActivityCountByMaterial.set(materialId, materialMap)
    }

    return {
      annualNeedResultsByMaterial,
      annualNeedActivityCountByMaterial,
      annualNeedActivityIds,
    }
  }

  private async getActivitiesById(c: Context, activityIds: number[]) {
    const map = new Map<number, { id: number; name: string }>()
    if (activityIds.length === 0) return map

    const activities = (await c.var.trx
      .selectFrom("ws_activities")
      .select(["id", "name"] as const)
      .where("id", "in", activityIds)
      .where("deleted_at", "is", null)
      .execute()) as WsActivityRow[]

    for (const a of activities) {
      if (a?.id == null) continue
      map.set(a.id, { id: a.id, name: a.name })
    }

    return map
  }

  private getBestActivityId(activityCounts?: Map<number, number>) {
    if (!activityCounts || activityCounts.size === 0) return null

    return Array.from(activityCounts.entries()).reduce(
      (best, cur) => (cur[1] > best[1] ? cur : best),
      [0, 0] as [number, number]
    )[0]
  }

  private getTargetPercentage(results: AnnualNeedResultRow[]) {
    let targetPercentage = 100
    for (const r of results) {
      if (r.coverage_number == null) continue
      const val = Number(r.coverage_number)
      if (Number.isNaN(val)) continue
      targetPercentage = val
      break
    }

    return targetPercentage
  }

  private selectRelevantAnnualResults(
    materialAnnualResults: AnnualNeedResultRow[],
    activityCounts?: Map<number, number>
  ) {
    const selectedActivityId = this.getBestActivityId(activityCounts)
    if (selectedActivityId == null) {
      return {
        selectedActivityId: null,
        relevantAnnualResults: materialAnnualResults,
      }
    }

    const filtered = materialAnnualResults.filter(
      (r) => r.activity_id === selectedActivityId
    )

    return {
      selectedActivityId,
      relevantAnnualResults:
        filtered.length > 0 ? filtered : materialAnnualResults,
    }
  }

  private filterAnnualResultsForTargetGroup(
    annualResults: AnnualNeedResultRow[],
    rowTargetGroupId: number | null
  ) {
    if (rowTargetGroupId == null) return annualResults

    return annualResults.filter((r) => r.target_group_id === rowTargetGroupId)
  }

  private getTargetPopulationForRow(
    relevantAnnualResults: AnnualNeedResultRow[],
    rowTargetGroupId: number | null,
    populationByTargetGroup: Map<number, number>
  ): number {
    if (rowTargetGroupId != null) {
      return populationByTargetGroup.get(rowTargetGroupId) ?? 0
    }

    const targetGroupIds = this.getUniqueNonNullIds(
      relevantAnnualResults.map((r) => r.target_group_id)
    )

    return targetGroupIds.reduce(
      (sum, id) => sum + (populationByTargetGroup.get(id) ?? 0),
      0
    )
  }

  private roundUpCeiling(value: number, precision: number) {
    if (precision === 0) return Math.round(value)

    return Math.ceil(value / precision) * precision
  }

  private getYearlyVialForRow(
    relevantAnnualResultsForRow: AnnualNeedResultRow[],
    isVaccine: boolean,
    dosePerVial: number | null
  ) {
    return relevantAnnualResultsForRow.reduce((sum, r) => {
      const doses = Number(r.yearly_need ?? 0)
      const vial = Number((r as AnnualNeedResultBaseRow).yearly_need_vial ?? 0)
      const precision = Number(dosePerVial || 1)

      const yearlyVial = this.roundUpCeiling(
        isVaccine ? vial : doses,
        precision
      )

      return sum + yearlyVial
    }, 0)
  }

  private getIpvForRow(relevantAnnualResultsForRow: AnnualNeedResultRow[]) {
    return relevantAnnualResultsForRow.reduce((best, r) => {
      const val = Number(r.ip ?? 0)

      return Math.max(best, val)
    }, 0)
  }

  private getTargetAndDoseForRow(
    relevantAnnualResultsForRow: AnnualNeedResultRow[]
  ): [number, number] {
    const annualResult = relevantAnnualResultsForRow.find((r) => r.target_group_id != null)
    return [annualResult?.target_group_id ?? 0, annualResult?.number_of_dose ?? 0]
  }

  private getActivityOrNull(
    selectedActivityId: number | null,
    activityById: Map<number, { id: number; name: string }>
  ) {
    if (selectedActivityId == null) return null

    return activityById.get(selectedActivityId) ?? null
  }

  private getActivityIdsForRow(
    relevantAnnualResultsForRow: AnnualNeedResultRow[]
  ) {
    const activityIds = this.getUniqueNonNullIds(
      relevantAnnualResultsForRow.map((r) => r.activity_id)
    )

    return activityIds.length > 0
      ? (activityIds as Array<number | null>)
      : ([null] as Array<number | null>)
  }

  private filterAnnualResultsForActivity(params: {
    relevantAnnualResultsForRow: AnnualNeedResultRow[]
    activityId: number | null
  }) {
    if (params.activityId == null) return params.relevantAnnualResultsForRow

    return params.relevantAnnualResultsForRow.filter(
      (r) => r.activity_id === params.activityId
    )
  }

  private applyTargetGroupZeroing(params: {
    rowTargetGroupId: number | null
    ipv: number
    target: number
    targetDistribution: number
  }) {
    const shouldZeroTargetGroup = params.rowTargetGroupId == null

    return {
      ipvFinal: shouldZeroTargetGroup ? 0 : params.ipv,
      targetFinal: shouldZeroTargetGroup ? 0 : params.target,
      targetDistributionFinal: shouldZeroTargetGroup
        ? 0
        : params.targetDistribution,
    }
  }

  private buildRegencyRow(params: {
    material: {
      id: number
      name: string
      material_subtype_id?: number | null
      consumption_unit_per_distribution_unit: number | null
    }
    item: {
      nama_xls: unknown
      obat_id: unknown
    }
    relevantAnnualResults: AnnualNeedResultRow[]
    activityId: number | null
    rowTargetGroupId: number | null
    activityById: Map<number, { id: number; name: string }>
    populationByTargetGroup: Map<number, number>
    monthlyConsumption: number
    stockLastYearFinal: number
    stockUpdateFinal: number
    dateCutoff: string
  }): Record<string, unknown> {
    const isVaccine = params.material.material_subtype_id === 1
    const yearlyVial = this.getYearlyVialForRow(
      params.relevantAnnualResults,
      isVaccine,
      params.material.consumption_unit_per_distribution_unit
    )

    const ipv = this.getIpvForRow(params.relevantAnnualResults)

    const target = this.getTargetPopulationForRow(
      params.relevantAnnualResults,
      params.rowTargetGroupId,
      params.populationByTargetGroup
    )

    const [targetDistribution, numberOfDose] = this.getTargetAndDoseForRow(
      params.relevantAnnualResults
    )

    const { ipvFinal, targetFinal, targetDistributionFinal } =
      this.applyTargetGroupZeroing({
        rowTargetGroupId: params.rowTargetGroupId,
        ipv,
        target,
        targetDistribution,
      })

    const activity = this.getActivityOrNull(
      params.activityId,
      params.activityById
    )

    const targetPercentage = this.getTargetPercentage(
      params.relevantAnnualResults
    )

    return {
      master_material_id: params.material.id,
      material: params.material.name,
      consumption: params.monthlyConsumption,
      nama_xls: params.item.nama_xls,
      obat_id: params.item.obat_id,
      number_of_dose: numberOfDose,
      target: targetFinal,
      final_target : this.roundUpCeiling(targetFinal * targetPercentage / 100, 0),
      target_distribution: targetDistributionFinal,
      ipv: ipvFinal,
      yearly_vial: yearlyVial,
      target_percentage: targetPercentage,
      stock_lastyear: params.stockLastYearFinal,
      stock_update: params.stockUpdateFinal,
      date_cutoff: params.dateCutoff,
      timestamp_utc: new Date(),
      activity,
    }
  }

  private buildRegencyDataRows(params: {
    year: number
    dateCutoff: string
    emonevMaterials: Array<{
      material_id: number | null
      target_group_id: unknown
      nama_xls: unknown
      obat_id: unknown
    }>
    materials: Array<{
      id: number
      name: string
      material_type_id: number | null
      material_subtype_id?: number | null
      consumption_unit_per_distribution_unit: number | null
      unit_of_consumption: unknown
    }>
    materialById: Map<number, (typeof params.materials)[number]>
    annualNeedResultsByMaterial: Map<number, AnnualNeedResultRow[]>
    annualNeedActivityCountByMaterial: Map<number, Map<number, number>>
    populationByTargetGroup: Map<number, number>
    activityById: Map<number, { id: number; name: string }>
    stockUpdateMap: Map<string, number>
    stockLastYearMap: Map<string, number>
    consumptionMap: Map<number, number>
  }): Array<Record<string, unknown>> {
    const data: Array<Record<string, unknown>> = []

    for (const item of params.emonevMaterials) {
      const materialId = item.material_id
      if (!materialId) continue

      const material = params.materialById.get(materialId)
      if (!material) continue
      const yearlyConsumption = params.consumptionMap.get(material.id) ?? 0
      const monthlyConsumption = Math.round(yearlyConsumption / 12)

      const materialAnnualResults =
        params.annualNeedResultsByMaterial.get(materialId) ?? []

      const rowTargetGroupId =
        item.target_group_id == null ? null : Number(item.target_group_id)

      const relevantAnnualResultsForRow =
        this.filterAnnualResultsForTargetGroup(
          materialAnnualResults,
          rowTargetGroupId
        )

      const activityIds = this.getActivityIdsForRow(relevantAnnualResultsForRow)
      for (const activityId of activityIds) {
        const activityKey = activityId == null ? "null" : String(activityId)
        const stockUpdateFinal =
          params.stockUpdateMap.get(`${material.id}:${activityKey}`) ?? 0
        const stockLastYearFinal =
          params.stockLastYearMap.get(`${material.id}:${activityKey}`) ?? 0

        const relevantAnnualResultsForRowAndActivity =
          this.filterAnnualResultsForActivity({
            relevantAnnualResultsForRow,
            activityId,
          })

        data.push(
          this.buildRegencyRow({
            material,
            item,
            relevantAnnualResults: relevantAnnualResultsForRowAndActivity,
            activityId,
            rowTargetGroupId,
            activityById: params.activityById,
            populationByTargetGroup: params.populationByTargetGroup,
            monthlyConsumption,
            stockLastYearFinal,
            stockUpdateFinal,
            dateCutoff: params.dateCutoff,
          })
        )
      }
    }

    return data
  }

  private async getConsumptionFromDatamartByProvince(
    programId: number,
    provinceId: number,
    materialIds: number[],
    fromDate: string,
    toDate: string
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    const dm = getDatamartDb()
    if (!dm || materialIds.length === 0) return result

    const materialIdsStr = materialIds.join(",")

    const query = `
      SELECT
        t.dmm_parent_id as material_id,
        COALESCE(sum(t.transactions_change_qty * -1), 0) as consumption
      FROM datamart_monitoring_transactions_v5 t FINAL
      PREWHERE toDate(t.transactions_created_at + interval 7 hour) BETWEEN toDate('${fromDate}') AND toDate('${toDate}')
      WHERE t.transactions_deleted_at IS NULL
        AND t.master_deleted_at IS NULL
        AND t.entities_id IS NOT NULL
        AND t.entities_is_vendor = 1
        AND t.entities_status = 1
        AND (
          (t.join_date <= toDate('${toDate}') AND t.end_date >= toDate('${toDate}'))
          OR (t.end_date IS NULL AND t.join_date <= toDate('${toDate}'))
        )
        AND t.program_id = ${programId}
        AND t.entities_province_id = ${provinceId}
        AND t.dmm_parent_id IN (${materialIdsStr})
        AND t.entity_tags_id IN (5,7,9,11)
        AND t.transactions_transaction_type_id IN (10, 5)
        AND t.transactions_order_id IS NULL
      GROUP BY t.dmm_parent_id
    `

    try {
      const rows = await dm
        .selectFrom(asSubquery<DatamartConsumptionRow>(query))
        .select(["material_id", "consumption"] as const)
        .execute()

      for (const row of rows as unknown as DatamartConsumptionRow[]) {
        const materialId = Number(row.material_id)
        if (!Number.isFinite(materialId) || materialId <= 0) continue
        result.set(materialId, Number(row.consumption ?? 0))
      }
    } catch (err) {
      console.error("[Emonev] Failed to query datamart for consumption:", err)
    }

    return result
  }

  private async getStockFromDatamartByProvince(
    programId: number,
    provinceId: number,
    materialIds: number[],
    asOfDate: string
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    const dm = getDatamartDb()
    if (!dm || materialIds.length === 0) return result

    const materialIdsStr = materialIds.join(",")

    const query = `
      SELECT
        dmm_parent_id as material_id,
        SUM(
          CASE
            WHEN transactions_transaction_type_id = 1 THEN transactions_change_qty
            ELSE transactions_opening_qty + transactions_change_qty
          END
        ) as qty
      FROM datamart_transactions_v5 s FINAL
      PREWHERE program_id = ${programId}
        AND toDate(transactions_created_at + interval 7 hours) BETWEEN toDate('2021-01-01') AND toDate('${asOfDate}')
      WHERE transactions_id IN (
        SELECT max(transactions_id)
        FROM datamart_transactions_v5 FINAL
        PREWHERE program_id = ${programId}
          AND toDate(transactions_created_at + interval 7 hours) BETWEEN toDate('2021-01-01') AND toDate('${asOfDate}')
        WHERE entities_is_vendor = 1
          AND entities_type <> 5
          AND entity_tags_id IN (5,7,9,11)
          AND (
            (join_date <= toDate('${asOfDate}') AND end_date >= toDate('${asOfDate}'))
            OR (end_date IS NULL AND join_date <= toDate('${asOfDate}'))
          )
          AND transactions_deleted_at IS NULL
          AND master_deleted_at IS NULL
          AND entities_province_id = ${provinceId}
          AND dmm_parent_id IN (${materialIdsStr})
        GROUP BY transactions_stock_id
      )
      GROUP BY dmm_parent_id
    `

    try {
      const rows = await dm
        .selectFrom(asSubquery<DatamartStockRow>(query))
        .select(["material_id", "qty"] as const)
        .execute()

      for (const row of rows as unknown as DatamartStockRow[]) {
        const materialId = Number(row.material_id)
        if (!Number.isFinite(materialId) || materialId <= 0) continue
        result.set(materialId, Number(row.qty ?? 0))
      }
    } catch (err) {
      console.error("[Emonev] Failed to query datamart for stock:", err)
    }

    return result
  }

  private async getStockFromDatamartByRegency(
    programId: number,
    regencyId: number,
    materialIds: number[],
    asOfDate: string
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>()
    const dm = getDatamartDb()
    if (!dm || materialIds.length === 0) return result

    const materialIdsStr = materialIds.join(",")

    const query = `
      SELECT
        dmm_parent_id as material_id,
        stock_activity_id as activity_id,
        SUM(
          CASE
            WHEN transactions_transaction_type_id = 1 THEN transactions_change_qty
            ELSE transactions_opening_qty + transactions_change_qty
          END
        ) as qty
      FROM datamart_transactions_v5 s FINAL
      PREWHERE program_id = ${programId}
        AND toDate(transactions_created_at + interval 7 hours) BETWEEN toDate('2021-01-01') AND toDate('${asOfDate}')
      WHERE transactions_id IN (
        SELECT max(transactions_id)
        FROM datamart_transactions_v5 FINAL
        PREWHERE program_id = ${programId}
          AND toDate(transactions_created_at + interval 7 hours) BETWEEN toDate('2021-01-01') AND toDate('${asOfDate}')
        WHERE entities_is_vendor = 1
          AND entities_type <> 5
          AND entity_tags_id IN (5,7,9,11)
          AND (
            (join_date <= toDate('${asOfDate}') AND end_date >= toDate('${asOfDate}'))
            OR (end_date IS NULL AND join_date <= toDate('${asOfDate}'))
          )
          AND transactions_deleted_at IS NULL
          AND master_deleted_at IS NULL
          AND entities_regency_id = ${regencyId}
          AND dmm_parent_id IN (${materialIdsStr})
        GROUP BY transactions_stock_id
      )
      GROUP BY dmm_parent_id, stock_activity_id
    `

    try {
      const rows = await dm
        .selectFrom(asSubquery<DatamartStockByActivityRow>(query))
        .select(["material_id", "activity_id", "qty"] as const)
        .execute()

      for (const row of rows as unknown as DatamartStockByActivityRow[]) {
        const materialId = Number(row.material_id)
        if (!Number.isFinite(materialId) || materialId <= 0) continue
        const activityId =
          row.activity_id == null ? null : Number(row.activity_id)
        const activityKey =
          activityId == null || !Number.isFinite(activityId)
            ? "null"
            : String(activityId)
        result.set(`${materialId}:${activityKey}`, Number(row.qty ?? 0))
      }
    } catch (err) {
      console.error("[Emonev] Failed to query datamart for regency stock:", err)
    }

    return result
  }

  private async getConsumptionFromDatamartByRegency(
    programId: number,
    regencyId: number,
    materialIds: number[],
    fromDate: string,
    toDate: string
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    const dm = getDatamartDb()
    if (!dm || materialIds.length === 0) return result

    const materialIdsStr = materialIds.join(",")

    const query = `
      SELECT
        t.dmm_parent_id as material_id,
        COALESCE(sum(t.transactions_change_qty * -1), 0) as consumption
      FROM datamart_monitoring_transactions_v5 t FINAL
      PREWHERE toDate(t.transactions_created_at + interval 7 hour) BETWEEN toDate('${fromDate}') AND toDate('${toDate}')
      WHERE t.transactions_deleted_at IS NULL
        AND t.master_deleted_at IS NULL
        AND t.entities_id IS NOT NULL
        AND t.entities_is_vendor = 1
        AND t.entities_status = 1
        AND (
          (t.join_date <= toDate('${toDate}') AND t.end_date >= toDate('${toDate}'))
          OR (t.end_date IS NULL AND t.join_date <= toDate('${toDate}'))
        )
        AND t.program_id = ${programId}
        AND t.entities_regency_id = ${regencyId}
        AND t.dmm_parent_id IN (${materialIdsStr})
        AND t.entity_tags_id IN (5,7,9,11)
        AND t.transactions_transaction_type_id IN (10, 5)
        AND t.transactions_order_id IS NULL
      GROUP BY t.dmm_parent_id
    `

    try {
      const rows = await dm
        .selectFrom(asSubquery<DatamartConsumptionRow>(query))
        .select(["material_id", "consumption"] as const)
        .execute()

      for (const row of rows as unknown as DatamartConsumptionRow[]) {
        const materialId = Number(row.material_id)
        if (!Number.isFinite(materialId) || materialId <= 0) continue
        result.set(materialId, Number(row.consumption ?? 0))
      }
    } catch (err) {
      console.error(
        "[Emonev] Failed to query datamart for regency consumption:",
        err
      )
    }

    return result
  }

  async getProvinceData(c: Context, params: EmonevProvinceParams) {
    const { year, code } = params
    const dateCutoff = params.date_cutoff

    const programId = c.var.programId ?? 1

    const province = await c.var.trx
      .selectFrom("integration_emonev_provinces")
      .selectAll()
      .where("code", "=", code)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (!province) {
      return null
    }

    const emonevMaterials = await c.var.trx
      .selectFrom("integration_emonev_materials")
      .selectAll()
      .where("tahun", "=", year)
      .where("material_id", "is not", null)
      .where("deleted_at", "is", null)
      .execute()

    if (emonevMaterials.length === 0) {
      return this.formatProvinceResponse(province, [])
    }

    const materialIds = this.getUniqueMaterialIds(emonevMaterials)

    if (materialIds.length === 0) {
      return this.formatProvinceResponse(province, [])
    }

    const materials = (await c.var.trx
      .selectFrom("ws_materials")
      .select([
        "id",
        "name",
        "code",
        "consumption_unit_per_distribution_unit",
        "unit_of_consumption",
      ] as const)
      .where("id", "in", materialIds)
      .execute()) as unknown as WsMaterialRow[]

    const materialById = this.indexById(materials)
    const stocks = await this.getProvinceStocksFromDatamart({
      programId,
      provinceId: province.province_id,
      materialIds,
      dateCutoff,
    })

    const stocksByMaterial = this.groupByMaterialId(stocks)

    const prevYear = year - 1
    const prevYearStart = `${prevYear}-01-01`
    const prevYearEnd = `${prevYear}-12-31`

    const datamartMaterialIds = Array.from(
      new Set(materials.map((m) => Number(m.id)))
    )

    const [stockUpdateMap, stockLastYearMap, consumptionMap] =
      await Promise.all([
        this.getStockFromDatamartByProvince(
          programId,
          province.province_id,
          datamartMaterialIds,
          dateCutoff
        ),
        this.getStockFromDatamartByProvince(
          programId,
          province.province_id,
          datamartMaterialIds,
          prevYearEnd
        ),
        this.getConsumptionFromDatamartByProvince(
          programId,
          province.province_id,
          datamartMaterialIds,
          prevYearStart,
          prevYearEnd
        ),
      ])

    const data = this.buildProvinceDataRows({
      year,
      dateCutoff,
      emonevMaterials,
      materials,
      materialById,
      stocksByMaterial,
      stockUpdateMap,
      stockLastYearMap,
      consumptionMap,
    })

    return this.formatProvinceResponse(province, data)
  }

  async getRegencyData(c: Context, params: EmonevRegencyParams) {
    const { year, code } = params
    const dateCutoff = params.date_cutoff

    const regency = await c.var.trx
      .selectFrom("integration_emonev_regencies")
      .selectAll()
      .where("code", "=", code)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (!regency) {
      return null
    }

    if (regency.regency_id == null) {
      return this.formatRegencyResponse(regency, [])
    }

    const emonevMaterials = await c.var.trx
      .selectFrom("integration_emonev_materials")
      .selectAll()
      .where("tahun", "=", year)
      .where("material_id", "is not", null)
      .where("deleted_at", "is", null)
      .execute()

    if (emonevMaterials.length === 0) {
      return this.formatRegencyResponse(regency, [])
    }

    const materialIds = this.getUniqueMaterialIds(emonevMaterials)

    if (materialIds.length === 0) {
      return this.formatRegencyResponse(regency, [])
    }

    const materials = (await c.var.trx
      .selectFrom("ws_materials")
      .select([
        "id",
        "name",
        "code",
        "material_type_id",
        "material_subtype_id",
        "consumption_unit_per_distribution_unit",
        "unit_of_consumption",
      ] as const)
      .where("id", "in", materialIds)
      .execute()) as unknown as WsMaterialRow[]

    const materialById = this.indexById(materials)

    const annualNeed = await this.getAnnualNeedForRegency(c, {
      regencyId: regency.regency_id,
      year,
    })

    const annualResultsBase = annualNeed
      ? await this.getAnnualNeedResultsBase(c, annualNeed.annual_need_id)
      : []

    const targetGroupIds = this.getUniqueNonNullIds(
      annualResultsBase.map((r) => r.target_group_id)
    )
    const activityIdsForPlanTasks = this.getUniqueNonNullIds(
      annualResultsBase.map((r) => r.activity_id)
    )

    const planTasks = annualNeed
      ? await this.getPlanTasksForAnnualNeed(c, {
          programPlanId: annualNeed.program_plan_id,
          materialIds,
          targetGroupIds,
          activityIdsForPlanTasks,
        })
      : []

    const { planTaskByKey, planTaskIds } = this.indexPlanTasks(
      planTasks as unknown as Array<{
        plan_task_id: unknown
        material_id: number | null
        activity_id: number | null
        target_group_id: number | null
      }>
    )

    const coverageByPlanTaskId = annualNeed
      ? await this.getCoverageByPlanTaskId(c, {
          provinceId: annualNeed.province_id,
          planTaskIds,
        })
      : new Map<number, number | null>()

    const annualResults = this.attachTaskDataToAnnualResults({
      annualResultsBase,
      planTaskByKey,
      coverageByPlanTaskId,
    })

    const populationByTargetGroup = annualNeed
      ? await this.getPopulationByTargetGroup(c, {
          annualNeedId: annualNeed.annual_need_id,
          targetGroupIds,
        })
      : new Map<number, number>()

    const {
      annualNeedResultsByMaterial,
      annualNeedActivityCountByMaterial,
      annualNeedActivityIds,
    } = this.indexAnnualNeedResults(annualResults)

    const activityById = await this.getActivitiesById(
      c,
      Array.from(annualNeedActivityIds)
    )

    const programId = c.var.programId ?? 1
    const prevYear = year - 1
    const prevYearStart = `${prevYear}-01-01`
    const prevYearEnd = `${prevYear}-12-31`

    const datamartMaterialIds = Array.from(
      new Set(materials.map((m) => Number(m.id)))
    )

    const [stockUpdateMap, stockLastYearMap, consumptionMap] =
      await Promise.all([
        this.getStockFromDatamartByRegency(
          programId,
          regency.regency_id,
          datamartMaterialIds,
          dateCutoff
        ),
        this.getStockFromDatamartByRegency(
          programId,
          regency.regency_id,
          datamartMaterialIds,
          prevYearEnd
        ),
        this.getConsumptionFromDatamartByRegency(
          programId,
          regency.regency_id,
          datamartMaterialIds,
          prevYearStart,
          prevYearEnd
        ),
      ])

    const data = this.buildRegencyDataRows({
      year,
      dateCutoff,
      emonevMaterials,
      materials,
      materialById,
      annualNeedResultsByMaterial,
      annualNeedActivityCountByMaterial,
      populationByTargetGroup,
      activityById,
      stockUpdateMap,
      stockLastYearMap,
      consumptionMap,
    })

    return this.formatRegencyResponse(regency, data)
  }
}
