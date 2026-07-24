/**
 * Non-Bias Immunization Logistics Cron Job
 *
 * This cron job recalculates non-bias (routine) immunization logistics data daily.
 * It only updates EXISTING data in the database - it does NOT create new records.
 *
 * Flow:
 * 1. Get all microplanningIds for next year
 * 2. For each microplanning, get only villages that already have data in DB
 * 3. Recalculate vial needs and logistics based on current target counts
 * 4. Update the existing records with new calculated values
 *
 * Tables updated:
 * - ws_material_needs (total_needs)
 * - ws_material_needs_details (kept as-is, only recalculate utilization_rate)
 * - ws_monthly_vaccine_need_details (min_stock, max_stock, request_qty)
 * - ws_vaccine_utilization_rate (vaccine_utilization_rate)
 * - ws_additional_needs (total)
 */
import {
  PERCENTAGE_100,
  PERCENTAGE_50,
  TARGET_GROUP,
  TOTAL_MONTH,
  VILLAGE_TARGET_GROUPS,
} from "@/common/constants/target.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import {
  NON_BIAS_CALC_CONFIG,
  aggregateByLogisticsGroup,
  buildParentIdToKeyMap,
  calculateVialNeedsDynamic,
  resolveLogisticsIds,
  resolveNonBiasMaterialIds,
  type VialNeedResult,
} from "@/common/utils/material-key.utils.js"
import { Context } from "@smile-health/lib/types/context.js"
import moment from "moment-timezone"
import { MaterialRepository } from "../../material/material.repository.js"
import {
  calcVialNeed,
  calcVialNeedNoBuffer,
  calcVialNeedNoTd,
  safeDiv,
} from "../../microplanning/immunization-logistics/immunization-logistics.formula.js"
import { TargetsRepository } from "../../microplanning/targets/targets.repository.js"
import { MpConfigRepository } from "../mp-config/mp-config.repository.js"
import { TargetEstimationNonBiasRepository } from "../target-estimation-non-bias/target-estimation-non-bias.repository.js"
import { TargetEstimationRepository } from "../target-estimation/target-estimation.repository.js"
import { NonBiasImmunizationLogisticsRepository } from "./non-bias-immunization-logistics.repository.js"

type NullableNumberOrString = number | string | null

export class NonBiasImmunizationCron {
  constructor(
    private readonly targetsRepo: TargetsRepository,
    private readonly targetEstimationRepo: TargetEstimationRepository,
    private readonly logisticsRepo: NonBiasImmunizationLogisticsRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly nonBiasRepo: TargetEstimationNonBiasRepository,
    private readonly mpConfigRepo: MpConfigRepository
  ) {}

  async #getMaterialIds(
    c: Context<DB>,
    type: "primary" | "additional",
    category: "bias" | "non_bias"
  ): Promise<{
    materialIds: number[]
    codeToIdMap: Map<string, number>
    idToCodeMap: Map<number, string>
    idToNameMap: Map<number, string>
  }> {
    const materialTargets = await this.materialRepo.findMaterialsFromTargets(
      c as any,
      type,
      category
    )

    const materialIds = materialTargets.map((m) => m.material_id)
    const rawMaterials = await this.materialRepo.findWsMaterialsByIds(
      c as any,
      materialIds
    )

    const codeToIdMap = new Map<string, number>()
    const idToCodeMap = new Map<number, string>()
    const idToNameMap = new Map<number, string>()

    const materialTargetNameMap = new Map(
      materialTargets.map((m) => [m.material_id, m.name])
    )

    rawMaterials.forEach((m) => {
      codeToIdMap.set(m.code, m.id)
      idToCodeMap.set(m.id, m.code)
      const name = materialTargetNameMap.get(m.id) ?? m.name
      idToNameMap.set(m.id, name)
    })

    return { materialIds, codeToIdMap, idToCodeMap, idToNameMap }
  }

  #extractVillageTargets(countMap: Map<number, number>) {
    return {
      bbl: countMap.get(1) ?? 0,
      si: countMap.get(2) ?? 0,
      baduta: countMap.get(3) ?? 0,
      wus: countMap.get(9) ?? 0,
    }
  }

  #getNonBiasMaterialIds(materialKeyMap: Map<string, number>) {
    return resolveNonBiasMaterialIds(materialKeyMap)
  }

  #getLogisticsIds(materialKeyMap: Map<string, number>) {
    return resolveLogisticsIds(materialKeyMap)
  }

  #calculateVialNeeds(
    targetCounts: { bbl: number; si: number; baduta: number; wus: number },
    utilizationRates: { id: number; value: number | null }[],
    materialKeyMap: Map<string, number>
  ): Map<number, VialNeedResult> {
    const parentIdToKey = buildParentIdToKeyMap(materialKeyMap)
    return calculateVialNeedsDynamic(
      NON_BIAS_CALC_CONFIG,
      targetCounts,
      utilizationRates,
      parentIdToKey,
      new Map(), // cron doesn't have variants
      {
        noBuffer: calcVialNeedNoBuffer,
        withBuffer: calcVialNeed,
        noTd: calcVialNeedNoTd,
      }
    )
  }

  #getVialNeedByMaterialId(
    materialId: number,
    vialNeedsMap: Map<number, VialNeedResult>
  ): number {
    return vialNeedsMap.get(materialId)?.vialNeed ?? 0
  }

  #getLogisticsNeedByMaterialId(
    materialId: number,
    logisticIds: {
      ads5mlId: number
      ads05mlId: number
      ads005mlId: number
      sb25lId: number
      sb5lId: number
    },
    logisticsNeeds: {
      ads5ml: { yearly: number; total: number }
      ads05ml: { yearly: number; total: number }
      ads005ml: { yearly: number; total: number }
      sb25ltr: { yearly: number; total: number }
      sb5ltr: { yearly: number; total: number }
    }
  ): { yearly: number; total: number } {
    const materialToLogistics: Record<
      number,
      { yearly: number; total: number }
    > = {
      [logisticIds.ads5mlId]: logisticsNeeds.ads5ml,
      [logisticIds.ads05mlId]: logisticsNeeds.ads05ml,
      [logisticIds.ads005mlId]: logisticsNeeds.ads005ml,
      [logisticIds.sb25lId]: logisticsNeeds.sb25ltr,
      [logisticIds.sb5lId]: logisticsNeeds.sb5ltr,
    }
    return materialToLogistics[materialId] ?? { yearly: 0, total: 0 }
  }

  #calculateLogisticsNeeds(
    vialNeedsMap: Map<number, VialNeedResult>,
    logisticIds: {
      ads5mlId: number
      ads05mlId: number
      ads005mlId: number
      sb25lId: number
      sb5lId: number
    },
    additionalRemainingStock: Map<number, number>
  ) {
    const { getVialNeed, getDoses } = aggregateByLogisticsGroup(
      vialNeedsMap,
      NON_BIAS_CALC_CONFIG as Record<string, { logisticsGroup?: string }>
    )

    const adsYearly5ML = Math.round(getVialNeed("bcg") + getVialNeed("mr"))
    const adsYearly05ML = Math.round(
      getDoses("ipv") +
        getDoses("pcv") +
        getDoses("dpt") +
        getDoses("mr") +
        getDoses("td")
    )
    const adsYearly005ML = Math.round(getDoses("bcg"))
    const sbYearly25LTR = Math.round(
      (adsYearly5ML + adsYearly05ML + adsYearly005ML) / PERCENTAGE_50
    )
    const sbYearly5LTR = Math.round(
      (adsYearly5ML + adsYearly05ML + adsYearly005ML) / PERCENTAGE_100
    )

    const calcMonthly = (yearly: number, materialId: number) => {
      const calcBasedOnVaccine = Math.ceil((yearly / TOTAL_MONTH) * 1.25)
      const remainingStock = additionalRemainingStock.get(materialId) ?? 0
      const requestQty = calcBasedOnVaccine - remainingStock
      return { total: calcBasedOnVaccine, requestQty }
    }

    return {
      ads5ml: {
        yearly: adsYearly5ML,
        ...calcMonthly(adsYearly5ML, logisticIds.ads5mlId),
      },
      ads05ml: {
        yearly: adsYearly05ML,
        ...calcMonthly(adsYearly05ML, logisticIds.ads05mlId),
      },
      ads005ml: {
        yearly: adsYearly005ML,
        ...calcMonthly(adsYearly005ML, logisticIds.ads005mlId),
      },
      sb25ltr: {
        yearly: sbYearly25LTR,
        ...calcMonthly(sbYearly25LTR, logisticIds.sb25lId),
      },
      sb5ltr: {
        yearly: sbYearly5LTR,
        ...calcMonthly(sbYearly5LTR, logisticIds.sb5lId),
      },
    }
  }

  async #updatePrimaryMaterialNeeds(
    c: Context<DB>,
    existingItem: {
      material_need_id: number | null
      material_id: number | null
      absolute_number_of_routine_immunization: NullableNumberOrString
      number_of_vials_used: NullableNumberOrString
    },
    newTotalNeeds: number,
    detailRemainingStock: Map<number, number>
  ) {
    const materialNeedId = existingItem.material_need_id
    const materialId = existingItem.material_id
    if (materialNeedId === null || materialId === null) return

    const monthly = newTotalNeeds / TOTAL_MONTH
    const minStock =
      Math.round(monthly * 0.25 * PERCENTAGE_100) / PERCENTAGE_100
    const maxStock =
      Math.round(monthly * 1.25 * PERCENTAGE_100) / PERCENTAGE_100
    const availableStock = detailRemainingStock.get(materialId) ?? 0
    const newRequestQty = maxStock - availableStock

    const absolute = Number(
      existingItem.absolute_number_of_routine_immunization ?? 0
    )
    const vialsUsed = Number(existingItem.number_of_vials_used ?? 0)
    const newUtilizationRate =
      vialsUsed > 0 ? Math.ceil(safeDiv(absolute, vialsUsed)) : null

    await this.logisticsRepo.updateMaterialNeed(
      c as any,
      materialNeedId,
      newTotalNeeds
    )

    await this.logisticsRepo.updateMonthlyVaccineNeedDetail(
      c as any,
      materialNeedId,
      {
        min_stock: minStock,
        max_stock: maxStock,
        request_qty: newRequestQty,
      }
    )

    if (newUtilizationRate !== null) {
      await this.logisticsRepo.updateVaccineUtilizationRate(
        c as any,
        materialNeedId,
        newUtilizationRate
      )
    }

    console.log(
      `    Updated material ${materialId}: total_needs=${newTotalNeeds}, min=${minStock}, max=${maxStock}, request_qty=${newRequestQty}, utilization_rate=${newUtilizationRate}`
    )
  }

  async #updateAdditionalMaterialNeeds(
    c: Context<DB>,
    existingItem: {
      material_need_id: number | null
      material_id: number | null
      additional_remaining_stock: NullableNumberOrString
    },
    logisticsNeed: { yearly: number; total: number }
  ) {
    const materialNeedId = existingItem.material_need_id
    const materialId = existingItem.material_id
    if (materialNeedId === null || materialId === null) return

    await this.logisticsRepo.updateMaterialNeed(
      c as any,
      materialNeedId,
      logisticsNeed.yearly
    )

    await this.logisticsRepo.updateAdditionalNeed(c as any, materialNeedId, {
      remaining_stock: Number(existingItem.additional_remaining_stock ?? 0),
      total: logisticsNeed.total,
    })

    console.log(
      `    Updated additional ${materialId}: yearly=${logisticsNeed.yearly}, monthly_total=${logisticsNeed.total}`
    )
  }

  #buildStockMaps(
    existingData: Array<{
      type: string
      material_id: number | null
      additional_remaining_stock: number | string | null
      detail_remaining_stock: number | string | null
    }>
  ) {
    const additionalRemainingStock = new Map<number, number>()
    const detailRemainingStock = new Map<number, number>()

    for (const e of existingData) {
      if (e.material_id === null) continue

      if (e.type === "additional") {
        additionalRemainingStock.set(
          e.material_id,
          Number(e.additional_remaining_stock ?? 0)
        )
      } else if (e.type === "primary") {
        detailRemainingStock.set(
          e.material_id,
          Number(e.detail_remaining_stock ?? 0)
        )
      }
    }

    return { additionalRemainingStock, detailRemainingStock }
  }

  async #processVillage(
    c: Context<DB>,
    village: { village_id: number; village_name: string },
    microplanningId: number,
    primaryMaterials: { materialIds: number[] },
    materialIdsMap: {
      hb0Id: number
      bcgId: number
      polioId: number
      ipvId: number
      pcvId: number
      dptId: number
      mrId: number
      rotavirusId: number
      tdId: number
    },
    logisticIds: {
      ads5mlId: number
      ads05mlId: number
      ads005mlId: number
      sb25lId: number
      sb5lId: number
    },
    promotionCounts: Record<number, number>
  ) {
    const villageId = village.village_id

    console.log(`  Processing village: ${villageId} (${village.village_name})`)

    const existingData = await this.logisticsRepo.getExistingMaterialNeeds(
      c as any,
      villageId,
      "village",
      microplanningId
    )

    if (existingData.length === 0) {
      console.log(`    No existing data for village ${villageId}, skipping`)
      return
    }

    const utilizationRates = primaryMaterials.materialIds.map((materialId) => {
      const existing = existingData.find(
        (e) => e.material_id === materialId && e.type === "primary"
      )
      const absolute = Number(
        existing?.absolute_number_of_routine_immunization ?? 0
      )
      const vialsUsed = Number(existing?.number_of_vials_used ?? 0)
      const rate =
        vialsUsed > 0 ? Math.ceil(safeDiv(absolute, vialsUsed)) : null
      return { id: materialId, value: rate }
    })

    const counts = await this.nonBiasRepo.getTargetCountsByVillageId(
      c as any,
      villageId,
      VILLAGE_TARGET_GROUPS,
      microplanningId
    )

    const formattedCounts = counts.map((row) => ({
      target_group_id: row.target_group_id,
      count:
        Number(row.count) +
        (row.target_group_id !== null
          ? (promotionCounts[row.target_group_id] ?? 0)
          : 0),
    }))

    const countMap = new Map(
      formattedCounts
        .filter((item) => item.target_group_id !== null)
        .map((item) => [item.target_group_id as number, item.count])
    )
    const targetCounts = this.#extractVillageTargets(countMap)

    const vialNeedsCalculated = this.#calculateVialNeeds(
      targetCounts,
      utilizationRates,
      materialKeyMap
    )

    const { additionalRemainingStock, detailRemainingStock } =
      this.#buildStockMaps(existingData)

    const logisticsNeeds = this.#calculateLogisticsNeeds(
      vialNeedsCalculated,
      logisticIds,
      additionalRemainingStock
    )

    for (const existingItem of existingData) {
      if (existingItem.type !== "primary") continue
      if (existingItem.material_id === null) continue

      const newTotalNeeds = this.#getVialNeedByMaterialId(
        existingItem.material_id,
        vialNeedsCalculated
      )

      await this.#updatePrimaryMaterialNeeds(
        c,
        existingItem,
        newTotalNeeds,
        detailRemainingStock
      )
    }

    for (const existingItem of existingData) {
      if (existingItem.type !== "additional") continue
      if (existingItem.material_id === null) continue

      const logisticsNeed = this.#getLogisticsNeedByMaterialId(
        existingItem.material_id,
        logisticIds,
        logisticsNeeds
      )

      await this.#updateAdditionalMaterialNeeds(c, existingItem, logisticsNeed)
    }
  }

  async #processMicroplanning(
    c: Context<DB>,
    microplanning: { id: number; entity_id: number | null },
    primaryMaterials: { materialIds: number[] },
    materialIdsMap: {
      hb0Id: number
      bcgId: number
      polioId: number
      ipvId: number
      pcvId: number
      dptId: number
      mrId: number
      rotavirusId: number
      tdId: number
    },
    logisticIds: {
      ads5mlId: number
      ads05mlId: number
      ads005mlId: number
      sb25lId: number
      sb5lId: number
    }
  ) {
    const microplanningId = microplanning.id
    const microplanningEntityId = microplanning.entity_id
    console.log(
      `\nProcessing microplanning ID: ${microplanningId}, Entity ID: ${microplanningEntityId}`
    )

    console.log("=== Starting Target Group Promotion Check ===")
    const promotionCounts = await this.#handleTargetGroupPromotion(
      c,
      microplanningId
    )
    console.log("=== End Target Group Promotion Check ===")

    console.log("=== Starting Recalculate Non-Bias Immunization Logistics ===")

    if (microplanningEntityId === null) {
      console.log(
        `  Skipping microplanning ${microplanningId} - no entity_id found`
      )
      return
    }

    const entity = await this.targetEstimationRepo.getEntitySubDistrictId(
      c,
      microplanningEntityId
    )

    if (!entity?.sub_district_id) {
      console.log(
        `  Skipping microplanning ${microplanningId} - no sub_district_id found`
      )
      return
    }

    const villagesWithData =
      await this.logisticsRepo.getVillagesBySubDistrictWithMaterialNeeds(
        c as any,
        Number(entity.sub_district_id),
        microplanningId
      )

    const villagesToProcess = villagesWithData.filter(
      (v) => v.material_need_id !== null
    )

    console.log(
      `  Found ${villagesToProcess.length} villages with data to recalculate`
    )

    for (const village of villagesToProcess) {
      await this.#processVillage(
        c,
        village,
        microplanningId,
        primaryMaterials,
        materialIdsMap,
        logisticIds,
        promotionCounts
      )
    }

    console.log("=== End Recalculate Non-Bias Immunization Logistics ===")
  }

  async #handleTargetGroupPromotion(c: Context<DB>, microplanningId: number) {
    const today = new Date()

    const targetsWithActiveConsumptions =
      await this.targetEstimationRepo.getUniqueTargetsWithActiveConsumptions(
        c,
        microplanningId,
        today
      )

    console.log(
      `  Found ${targetsWithActiveConsumptions.length} targets with active consumptions`
    )

    const counts: Record<number, number> = {}
    let skippedCount = 0

    for (const target of targetsWithActiveConsumptions) {
      const targetId = target.target_id
      const currentTargetGroupId = target.current_target_group_id
      const gender = target.gender

      const firstConsumption =
        await this.targetEstimationRepo.getFirstConsumptionTargetGroup(
          c,
          targetId,
          today,
          target.target_group_id
        )

      if (!firstConsumption) {
        skippedCount++
        continue
      }

      const firstTargetGroupId = firstConsumption.target_group_id

      if (currentTargetGroupId === null) {
        skippedCount++
        continue
      }

      if (currentTargetGroupId === firstTargetGroupId) {
        skippedCount++
        continue
      }

      const validTargetGroups =
        (gender === 1 ? TARGET_GROUP.MALE : TARGET_GROUP.FEMALE) ?? []
      if (
        firstTargetGroupId === null ||
        !validTargetGroups.includes(firstTargetGroupId)
      ) {
        console.log(
          `    Skipping target ${targetId}: target_group_id ${firstTargetGroupId} not valid for gender ${gender}`
        )
        skippedCount++
        continue
      }

      if (firstTargetGroupId !== null) {
        counts[firstTargetGroupId] = (counts[firstTargetGroupId] ?? 0) + 1
      }

      console.log(
        `    Target ${targetId} would promote: ${currentTargetGroupId} -> ${firstTargetGroupId}`
      )
    }

    console.log(`  Target group promotion counts:`, counts)
    console.log(
      `  Total would promote: ${Object.values(counts).reduce((a, b) => a + b, 0)}, skipped: ${skippedCount}`
    )

    return counts
  }

  /**
   * Main cron handler to recalculate non-bias immunization logistics
   *
   * This method:
   * 1. Gets all microplannings for next year
   * 2. For each microplanning, finds villages with EXISTING material needs data
   * 3. Recalculates vaccine vial needs based on updated target counts
   * 4. Updates logistics needs (ADS, Safety Box) based on vaccine calculations
   *
   * Important: Only updates existing records, does NOT create new ones
   */
  public readonly handleRecalculateNonBiasImmunization = async (
    c: Context<DB>
  ) => {
    console.log(
      "=== Start Daily Non-Bias Immunization Logistics Recalculation ==="
    )
    console.log("Start Process", moment().format("YYYY-MM-DD HH:mm:ss"))

    // Step 1: Get all microplanningIds for next year
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    console.log(`Fetching microplannings for year: ${nextYear}`)

    const microplannings = await this.targetsRepo.getAllMicroplanningsByYear(
      c,
      nextYear
    )
    console.log(
      `Found ${microplannings.length} microplannings for year ${nextYear}`
    )

    // Get material IDs once (outside the loop for efficiency)
    const primaryMaterials = await this.#getMaterialIds(
      c,
      "primary",
      "non_bias"
    )

    const mpProgramConfigIdNonBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c as any,
        nextYear,
        "non_bias"
      )
    const materialKeyMap = mpProgramConfigIdNonBias
      ? await this.mpConfigRepo.getMaterialKeyMap(
          c as any,
          mpProgramConfigIdNonBias
        )
      : new Map()

    const materialIdsMap = this.#getNonBiasMaterialIds(materialKeyMap)
    const logisticIds = this.#getLogisticsIds(materialKeyMap)

    // Step 2: Process each microplanning
    for (const microplanning of microplannings) {
      await this.#processMicroplanning(
        c,
        microplanning,
        primaryMaterials,
        materialIdsMap,
        logisticIds
      )
    }

    console.log("\nEnd Process", moment().format("YYYY-MM-DD HH:mm:ss"))
    console.log(
      "=== End Daily Non-Bias Immunization Logistics Recalculation ==="
    )
  }
}
