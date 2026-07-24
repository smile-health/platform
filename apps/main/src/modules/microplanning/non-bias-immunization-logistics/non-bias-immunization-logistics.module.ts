import {
  PERCENTAGE_100,
  PERCENTAGE_50,
  TARGET_GROUP_ORDER,
  VILLAGE_LABEL,
  VILLAGE_TARGET_GROUPS,
} from "@/common/constants/target.js"
import {
  NON_BIAS_CALC_CONFIG,
  aggregateByLogisticsGroup,
  buildParentIdToKeyMap,
  calculateVialNeedsDynamic,
  resolveLogisticsIds,
  type VialNeedResult,
} from "@/common/utils/material-key.utils.js"
import { ValidationError } from "@smile/lib/error.js"
import { ExportTemplate } from "@smile/lib/excel.js"
import Excel from "exceljs"
import { Context } from "hono"
import moment from "moment"
import { MaterialRepository } from "../../material/material.repository.js"
import {
  calcVialNeed,
  calcVialNeedNoBuffer,
  calcVialNeedNoTd,
  safeDiv,
} from "../../microplanning/immunization-logistics/immunization-logistics.formula.js"
import { MaterialTargetsRepository } from "../../microplanning/material-targets/material-targets.repository.js"
import { TargetsRepository } from "../../microplanning/targets/targets.repository.js"
import { StockRepository } from "../../stock/stock.repository.js"
import { doDecrypt } from "../../transaction/utils/transaction.encryption.js"
import { MpConfigRepository } from "../mp-config/mp-config.repository.js"
import { TargetEstimationNonBiasRepository } from "../target-estimation-non-bias/target-estimation-non-bias.repository.js"
import { NonBiasImmunizationLogisticsRepository } from "./non-bias-immunization-logistics.repository.js"
import {
  NonBiasCalculateDetailQueryDTO,
  NonBiasCalculateDetailResponse,
  RecalculateFullVillageDTO,
  RecalculateFullVillageResponse,
  RecalculateVillageEstimationDTO,
  RecalculateVillageEstimationResponse,
  SaveVillageImmunizationAchievementDTO,
  SaveVillageImmunizationDataResponse,
  UpdateNonBiasImmunizationLogisticsDTO,
  VillageListResponse,
} from "./non-bias-immunization-logistics.schema.js"

export class NonBiasImmunizationLogisticsModule {
  constructor(
    private readonly nonBiasRepo: TargetEstimationNonBiasRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly materialTargetsRepo: MaterialTargetsRepository,
    private readonly logisticsRepo: NonBiasImmunizationLogisticsRepository,
    private readonly targetsRepo: TargetsRepository,
    private readonly stockRepo: StockRepository,
    private readonly mpConfigRepo: MpConfigRepository
  ) {}

  async #getMaterialIds(
    c: Context,
    type: "primary" | "additional",
    category: "bias" | "non_bias"
  ): Promise<{
    materialIds: number[]
    codeToIdMap: Map<string, number>
    idToCodeMap: Map<number, string>
    idToNameMap: Map<number, string>
  }> {
    const materialTargets = await this.materialRepo.findMaterialsFromTargets(
      c,
      type,
      category
    )

    const materialTargetsWithVariant = (
      await Promise.all(
        materialTargets.map(async (m) => {
          const name = m.name.replace(/\s*(@.*|\([^)]*\))/g, "").trim()
          const variant = await this.materialRepo.findMaterialChildrenByName(
            c,
            name
          )

          if (variant.length > 0) {
            return variant.map((v) => {
              return {
                material_id: v.id,
                name: v.name,
              }
            })
          }

          return [{ material_id: m.material_id, name: name }]
        })
      )
    ).filter(Boolean)

    const materialTargetsAll = [...materialTargetsWithVariant.flat()]

    const materialIds = materialTargetsAll
      .map((m) => m.material_id)
      .filter((id): id is number => id != null)
    const rawMaterials = await this.materialRepo.findWsMaterialsByIds(
      c,
      materialIds
    )

    const codeToIdMap = new Map<string, number>()
    const idToCodeMap = new Map<number, string>()
    const idToNameMap = new Map<number, string>()

    const materialTargetNameMap = new Map(
      materialTargetsAll.map((m) => [m.material_id, m.name])
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

  #buildTargetItems(
    c,
    targetCounts: {
      bbl: number
      si: number
      baduta: number
      wus: number
    }
  ) {
    return [
      {
        id: 1,
        name: c.var.t("targets.target_group.1"),
        value: targetCounts.bbl,
      },
      {
        id: 2,
        name: c.var.t("targets.target_group.2"),
        value: targetCounts.si,
      },
      {
        id: 3,
        name: c.var.t("targets.target_group.3"),
        value: targetCounts.baduta,
      },
      {
        id: 9,
        name: c.var.t("targets.target_group.9"),
        value: targetCounts.wus,
      },
    ]
  }

  #isVillageTargetPromoted(
    target: { date_of_birth: string | null; gender: number | null },
    prevGroupId: number,
    targetGroupId: number,
    allTargetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    today: Date
  ): boolean {
    if (!target.date_of_birth || !target.gender) return false
    const dob = doDecrypt(target.date_of_birth)
    const ageInDays = moment(today).diff(moment(dob), "days")
    if (ageInDays < 0) return false
    const matched = allTargetGroups.find(
      (tg) => ageInDays >= tg.age_min && ageInDays <= tg.age_max
    )
    if (!matched) return false
    const origIdx = TARGET_GROUP_ORDER.indexOf(prevGroupId)
    const queryIdx = TARGET_GROUP_ORDER.indexOf(targetGroupId)
    return queryIdx > origIdx && matched.id === targetGroupId
  }

  async #getPromotedCountsForGroupByVillage(
    c: Context,
    villageId: number,
    microplanningIds: number[],
    allTargetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    today: Date,
    targetGroupId: number
  ): Promise<number> {
    const idx = TARGET_GROUP_ORDER.indexOf(targetGroupId)
    if (idx <= 0) return 0

    const prevGroupIds = TARGET_GROUP_ORDER.slice(0, idx).filter((id) =>
      VILLAGE_TARGET_GROUPS.includes(id)
    )
    let count = 0
    for (const prevGroupId of prevGroupIds) {
      const targets = await this.targetsRepo.getTargetsWithDateOfBirthByVillage(
        c,
        villageId,
        prevGroupId,
        microplanningIds
      )
      count += targets.filter((t) =>
        this.#isVillageTargetPromoted(
          t,
          prevGroupId,
          targetGroupId,
          allTargetGroups,
          today
        )
      ).length
    }
    return count
  }

  async #fetchCommonData(c: Context, villageId: number, materialIds: number[]) {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const [materials, counts, villageName, absoluteTargets, allTargetGroups] =
      await Promise.all([
        this.materialRepo.findWsMaterialsByIds(c, materialIds),
        this.nonBiasRepo.getTargetCountsByVillageId(
          c,
          villageId,
          VILLAGE_TARGET_GROUPS,
          microplanningId
        ),
        this.nonBiasRepo.getLocationName(c, villageId),
        this.nonBiasRepo.getAbsoluteTargetGroup(
          c,
          villageId,
          VILLAGE_TARGET_GROUPS,
          microplanningId
        ),
        this.targetsRepo.getAllTargetGroups(c),
      ])

    const countMap = new Map(
      counts
        .filter((item) => item.target_group_id !== null)
        .map((item) => [item.target_group_id as number, Number(item.count)])
    )

    const now = new Date()
    const today = new Date(nextYear, now.getMonth(), now.getDate())
    for (const tgId of VILLAGE_TARGET_GROUPS) {
      const promoted = await this.#getPromotedCountsForGroupByVillage(
        c,
        villageId,
        [microplanningId],
        allTargetGroups,
        today,
        tgId
      )
      if (promoted > 0) {
        countMap.set(tgId, (countMap.get(tgId) ?? 0) + promoted)
      }
    }

    for (const abs of absoluteTargets) {
      const qty = Number(abs.count)
      if (qty === 0) continue
      countMap.set(
        Number(abs.target_group_id),
        (countMap.get(Number(abs.target_group_id)) ?? 0) + qty
      )
    }

    const targetCounts = this.#extractVillageTargets(countMap)

    return {
      entityId,
      microplanningId,
      materials,
      villageName:
        c.var.t("targets.village_label") + " " + villageName?.name ||
        "Unknown Village",
      puskesmasId: entityId,
      puskesmasName: c.var.userEntity?.name ?? "",
      targetCounts,
    }
  }

  /**
   * Dynamically calculate vial needs for ALL materials in utilizationRates.
   * Uses centralized NON_BIAS_CALC_CONFIG — adding new DB variants requires ZERO code changes.
   */
  #calculateVialNeeds(
    targetCounts: { bbl: number; si: number; baduta: number; wus: number },
    utilizationRates: { id: number; value: number | null }[],
    materialKeyMap: Map<string, number>,
    variantParentMap: Map<number, number | null> = new Map()
  ): Map<number, VialNeedResult> {
    const parentIdToKey = buildParentIdToKeyMap(materialKeyMap)
    return calculateVialNeedsDynamic(
      NON_BIAS_CALC_CONFIG,
      targetCounts,
      utilizationRates,
      parentIdToKey,
      variantParentMap,
      {
        noBuffer: calcVialNeedNoBuffer,
        withBuffer: calcVialNeed,
        noTd: calcVialNeedNoTd,
      }
    )
  }

  /**
   * Build projected yearly needs — simple map lookup, no hardcoded material matching.
   */
  #buildProjectedYearlyNeeds(
    c,
    vialNeedsMap: Map<
      number,
      { ip: number; vialNeed: number; materialKey: string }
    >,
    biasMaterialIds: number[],
    biasMaterialNameMap: Map<number, string>,
    bodyItemsParentMap: Map<number, number>
  ) {
    return biasMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        biasMaterialNameMap.get(materialId) ??
        c.var.t("immunization_logistics.unknown"),
      value: vialNeedsMap.get(materialId)?.vialNeed ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))
  }

  #buildProjectedMonthlyNeeds(
    projected1Year: { id: number; name: string; value: number }[],
    stockData: Map<number, number>,
    bodyItemsParentMap: Map<number, number>
  ) {
    return projected1Year.map((item) => {
      const monthly = item.value / 12
      const minStock = Math.ceil(monthly * 0.25)
      const maxStock = Math.ceil(monthly * 1.25)
      const availableStock = stockData.get(item.id) ?? 0
      const requestQty = maxStock - availableStock

      return {
        id: item.id,
        name: item.name,
        min_stock: minStock,
        max_stock: maxStock,
        available_stock: availableStock,
        request_qty: requestQty,
        parent_id: bodyItemsParentMap.get(item.id) ?? null,
      }
    })
  }

  /**
   * Build logistics needs (ADS/SB) by aggregating vial needs per logistics group.
   * No hardcoded material matching — aggregates dynamically from vialNeedsMap.
   */
  #buildLogisticsNeeds(
    c,
    vialNeedsMap: Map<number, VialNeedResult>,
    logisticMaterialIds: number[],
    logisticMaterialNameMap: Map<number, string>,
    logisticIdsMap: {
      ads5mlId: number
      ads05mlId: number
      ads005mlId: number
      sb25lId: number
      sb5lId: number
    },
    logisticsStockMap: Map<number, number>
  ) {
    const { getVialNeed, getDoses } = aggregateByLogisticsGroup(
      vialNeedsMap,
      NON_BIAS_CALC_CONFIG as Record<string, { logisticsGroup?: string }>
    )

    // ADS 5ml: BCG + MR vials
    const adsYearly5ML = Math.ceil(getVialNeed("bcg") + getVialNeed("mr"))
    // ADS 0.5ml: total doses for IPV + PCV + DPT + MR + Td
    const adsYearly05ML =
      getDoses("ipv") +
      getDoses("pcv") +
      getDoses("dpt") +
      getDoses("mr") +
      getDoses("td")
    // ADS 0.05ml: BCG doses
    const adsYearly005ML = Math.ceil(getDoses("bcg"))
    // Safety boxes
    const sbYearly25LTR = Math.ceil(
      (adsYearly5ML + adsYearly05ML + adsYearly005ML) / PERCENTAGE_50
    )
    const sbYearly5LTR = Math.ceil(
      (adsYearly5ML + adsYearly05ML + adsYearly005ML) / PERCENTAGE_100
    )

    const projectedYearlyLogistics = logisticMaterialIds.map((materialId) => {
      let logisticValue = 0

      if (materialId === logisticIdsMap.ads5mlId) {
        logisticValue = adsYearly5ML
      } else if (materialId === logisticIdsMap.ads05mlId) {
        logisticValue = adsYearly05ML
      } else if (materialId === logisticIdsMap.ads005mlId) {
        logisticValue = adsYearly005ML
      } else if (materialId === logisticIdsMap.sb25lId) {
        logisticValue = sbYearly25LTR
      } else if (materialId === logisticIdsMap.sb5lId) {
        logisticValue = sbYearly5LTR
      }

      return {
        id: materialId,
        name:
          logisticMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: logisticValue,
      }
    })

    const projectedMonthlyLogistics = projectedYearlyLogistics.map((item) => {
      const calcBasedOnVaccine = Math.ceil((item.value / 12) * 1.25) + 1
      const availableStock = logisticsStockMap.get(item.id) ?? 0
      const requestQty = calcBasedOnVaccine - availableStock

      return {
        id: item.id,
        name: item.name,
        calculation_based_on_vaccine_needs: calcBasedOnVaccine,
        available_stock: availableStock,
        request_qty: requestQty,
      }
    })

    return { projectedYearlyLogistics, projectedMonthlyLogistics }
  }

  #buildResponse(
    c,
    locationData: {
      villageId: number
      villageName: string
      puskesmasId: number
      puskesmasName: string
    },
    vaccineData: {
      absoluteImmunization: { id: number; name: string; value: number | null }[]
      targets: { id: number; name: string; value: number }[]
      vialsUsed: { id: number; name: string; value: number | null }[]
      utilizationRate: { id: number; name: string; value: number | null }[]
    },
    projectedVaccineNeeds: {
      yearly: { id: number; name: string; value: number }[]
      monthly: any[]
    },
    projectedLogisticsNeeds: {
      yearly: any[]
      monthly: any[]
    }
  ): SaveVillageImmunizationDataResponse {
    return {
      village_id: locationData.villageId,
      village_name: locationData.villageName,
      puskesmas_id: locationData.puskesmasId,
      puskesmas_name: locationData.puskesmasName,
      absolute_immunization: {
        title: c.var.t("non_bias_immunization_logistics.absolute_number"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: vaccineData.absoluteImmunization,
      },
      number_of_target: {
        title: c.var.t("bias_immunization_logistics.number_of_target_title"),
        name_label: c.var.t("bias_immunization_logistics.target"),
        value_label: c.var.t("bias_immunization_logistics.target_value"),
        items: vaccineData.targets,
      },
      vaccine_vials_used: {
        title: c.var.t("non_bias_immunization_logistics.vial_used"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_vials"),
        items: vaccineData.vialsUsed,
      },
      vaccine_utilization_rate: {
        title: c.var.t(
          "bias_immunization_logistics.vaccine_utilization_rate_title"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: vaccineData.utilizationRate,
      },
      projected_yearly_needs: {
        title: c.var.t("non_bias_immunization_logistics.projected_yearly_need"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: projectedVaccineNeeds.yearly,
      },
      projected_monthly_vaccine_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_monthly_need"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: projectedVaccineNeeds.monthly,
      },
      projected_yearly_immunization_logistics_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_yearly_immunization"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: projectedLogisticsNeeds.yearly,
      },
      projected_monthly_immunization_logistics_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_monthly_immunization"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: projectedLogisticsNeeds.monthly,
      },
    }
  }

  async getCalculateDetail(
    c: Context,
    query: NonBiasCalculateDetailQueryDTO
  ): Promise<NonBiasCalculateDetailResponse> {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const currentYear = nextYear - 1
    const [prevMicroplanningCalc, mpProgramConfigId] = await Promise.all([
      this.targetsRepo.findMicroplanningByYear(c, entityId, currentYear),
      this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "non_bias"),
    ])

    const [
      counts,
      location,
      existingData,
      mpMaterialsRaw,
      logisticMaterials,
      materialWithDose,
      absoluteTargets,
    ] = await Promise.all([
      this.nonBiasRepo.getTargetCountsByVillageId(
        c,
        query.village_id,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
      this.nonBiasRepo.getLocationName(c, query.village_id),
      this.logisticsRepo.getExistingMaterialNeeds(
        c,
        query.village_id,
        "village",
        microplanningId,
        mpProgramConfigId
      ),
      mpProgramConfigId
        ? this.mpConfigRepo.getMpMaterialsForCategory(
            c,
            mpProgramConfigId,
            provinceId
          )
        : Promise.resolve([]),
      this.materialRepo.findMaterialsFromTargets(c, "additional", "non_bias"),
      this.targetsRepo.getImmunizationMaterialTargetsWithDose(c),
      this.nonBiasRepo.getAbsoluteTargetGroup(
        c,
        query.village_id,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
    ])

    console.log('databroo', {
      counts,
      location,
      existingData,
      mpMaterialsRaw,
      logisticMaterials,
      materialWithDose,
      absoluteTargets,
    });
    

    // Fallback ke ws_material_targets jika ws_mp_* belum dikonfigurasi untuk tahun ini
    const biasMaterials =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const biasMaterialsWithVariant = (
      await Promise.all(
        biasMaterials.map(async (m) => {
          const name = m.name.replace(/\s*(@.*|\([^)]*\))/g, "").trim()
          const variant = await this.materialRepo.findMaterialChildrenByName(
            c,
            name
          )

          if (variant.length > 0) {
            return variant.map((v) => {
              return {
                material_id: v.id,
                name: v.name.replace(/\s*\([^)]*\)/g, "").trim(),
                parent_id: m.material_id,
                consumption_unit_per_distribution_unit:
                  v.consumption_unit_per_distribution_unit,
              }
            })
          }

          return [{ material_id: m.material_id, name: name }]
        })
      )
    ).filter(Boolean)

    const biasMaterialAll = [
      ...new Map(
        biasMaterialsWithVariant.flat().map((m) => [Number(m.material_id), m])
      ).values(),
    ]
    const biasMaterialNameMap = new Map<number, string>(
      biasMaterialAll.map((m) => [Number(m.material_id), m.name])
    )
    const biasMaterialParentMap = new Map<number, number>(
      biasMaterialAll
        .filter(
          (m): m is typeof m & { parent_id: number } =>
            "parent_id" in m && m.parent_id != null
        )
        .map((m) => [Number(m.material_id), Number(m.parent_id)])
    )

    const consumptionUnitMap = new Map<number, number>(
      biasMaterialAll
        .filter(
          (
            m
          ): m is typeof m & {
            consumption_unit_per_distribution_unit: number
          } =>
            "consumption_unit_per_distribution_unit" in m &&
            m.consumption_unit_per_distribution_unit != null
        )
        .map((m) => [
          Number(m.material_id),
          Number(m.consumption_unit_per_distribution_unit),
        ])
    )

    const biasMaterialIds = biasMaterialAll.map((m) => Number(m.material_id))

    const logisticMaterialNameMap = new Map<number, string>()
    logisticMaterials.forEach((m) => {
      logisticMaterialNameMap.set(m.material_id, m.name)
    })
    const logisticMaterialIds = logisticMaterials.map((m) => m.material_id)

    const countMap = new Map(
      counts
        .filter((item) => item.target_group_id !== null)
        .map((item) => [item.target_group_id as number, Number(item.count)])
    )

    for (const item of absoluteTargets) {
      if (item.target_group_id === null) continue
      const tgId = item.target_group_id as number
      const prev = countMap.get(tgId) ?? 0
      countMap.set(tgId, prev + Number(item.count))
    }

    const targetCounts = this.#extractVillageTargets(countMap)
    const targets = this.#buildTargetItems(c, targetCounts)

    const parentIdToKey = mpProgramConfigId
      ? buildParentIdToKeyMap(
          await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigId)
        )
      : new Map<number, string>()

    const existingDataMap = new Map(
      existingData.map((item) => [item.material_id, item])
    )

    const hasTotalNeeds = existingData.some(
      (item) => item.total_needs !== null && Number(item.total_needs) > 0
    )

    const materialWithDoseMap = new Map<number, number>()
    materialWithDose.forEach((item) => {
      const currentCount = materialWithDoseMap.get(item.material_id) ?? 0
      materialWithDoseMap.set(item.material_id, currentCount + 1)
    })

    const mpDoseMap = new Map<number, number>(
      mpMaterialsRaw
        .filter(
          (m): m is typeof m & { number_of_dose: number } =>
            m.number_of_dose != null
        )
        .map((m) => [m.material_id, m.number_of_dose])
    )

    const lastYearAbsoluteMap = new Map<number, number>()
    const transactionVialsMap = new Map<number, number>()

    const rutinActivityId = await this.logisticsRepo.getActivityId(c)
    const internalEntityId = c.var.userEntity?.id
    const consumptionRows = rutinActivityId
      ? await this.logisticsRepo.getConsumptionByParentMaterial(
          c,
          internalEntityId ?? 0,
          currentYear,
          rutinActivityId
        )
      : []
    const rawResultRows = consumptionRows.map((r) => ({
      material_id: r.parent_material_id,
      total_qty: r.value,
      material_name: null as string | null,
    }))
    const transactionMap = new Map<number, number>()

    const parentIdsFromCH = Array.from(
      new Set(
        rawResultRows
          .map((r) => Number(r.material_id))
          .filter((id) => id != null)
      )
    )
    let variantsFromDb: { id: number; parent_id: number | null }[] = []

    if (parentIdsFromCH.length > 0) {
      variantsFromDb = await this.materialRepo.findVariantsByParentIds(
        c,
        parentIdsFromCH
      )
    }

    this.#fillTransactionMap(
      transactionMap,
      rawResultRows,
      variantsFromDb,
      biasMaterialIds,
      biasMaterialAll
    )

    for (const [materialId, totalQty] of transactionMap) {
      const consumptionUnit = consumptionUnitMap.get(materialId) ?? 1
      transactionVialsMap.set(materialId, (totalQty ?? 0) / consumptionUnit)
    }

    if (!hasTotalNeeds) {
      const lastYearData =
        await this.logisticsRepo.getLastYearAbsoluteImmunization(
          c,
          query.village_id,
          entityId,
          currentYear
        )
      lastYearData.forEach((item) => {
        if (item.material_id == null) return
        const id = Number(item.material_id)
        if (item.absolute_number_of_routine_immunization != null) {
          lastYearAbsoluteMap.set(
            id,
            Number(item.absolute_number_of_routine_immunization)
          )
        }
      })
    }

    // biasMaterialIds sudah ter-filter per provinsi (dari ws_mp_*) atau semua (fallback)
    const activeMaterialIds = biasMaterialIds

    const immunizations = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      const dose =
        mpDoseMap.get(parentId ?? materialId) ??
        materialWithDoseMap.get(materialId)

      let value: number | null = null

      if (
        existing?.absolute_number_of_routine_immunization !== null &&
        Number(existing?.absolute_number_of_routine_immunization) > 0
      ) {
        value = existing?.absolute_number_of_routine_immunization ?? 0
      } else {
        value =
          lastYearAbsoluteMap.get(materialId) ??
          lastYearAbsoluteMap.get(parentId ?? materialId) ??
          0
      }

      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: value,
        parent_id: parentId ?? null,
        info_dose: dose !== undefined && dose > 1 ? dose : null,
      }
    })

    const vialsUsed = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)

      let vialsValue: number | null = null
      if (
        existing?.number_of_vials_used !== null &&
        Number(existing?.number_of_vials_used) > 0
      ) {
        vialsValue = existing?.number_of_vials_used ?? 0
      } else {
        vialsValue =
          transactionVialsMap.get(materialId) ??
          transactionVialsMap.get(parentId ?? materialId) ??
          0
      }

      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: vialsValue,
        parent_id: parentId ?? null,
      }
    })

    const utilizationRate = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.vaccine_utilization_rate ?? 0,
        parent_id: parentId ?? null,
      }
    })

    const vialNeeds = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.total_needs ?? null,
        parent_id: parentId ?? null,
      }
    })

    const projectedMonthly = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        min_stock: existing?.min_stock ?? null,
        max_stock: existing?.max_stock ?? null,
        available_stock: existing?.detail_remaining_stock ?? null,
        request_qty: existing?.request_qty ?? null,
        parent_id: parentId ?? null,
      }
    })

    const yearlyLogisticsNeeds = logisticMaterialIds.map((materialId) => {
      const existing = existingDataMap.get(materialId)
      return {
        id: materialId,
        name:
          logisticMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.total_needs ?? null,
      }
    })

    const monthlyLogisticsNeeds = logisticMaterialIds.map((materialId) => {
      const existing = existingDataMap.get(materialId)
      let request_qty: number | null = null

      if (
        existing?.additional_total != null &&
        existing?.additional_remaining_stock != null
      ) {
        request_qty =
          existing.additional_total - existing.additional_remaining_stock
      }
      return {
        id: materialId,
        name:
          logisticMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        calculation_based_on_vaccine_needs: existing?.additional_total ?? null,
        available_stock: existing?.additional_remaining_stock ?? null,
        request_qty: request_qty ?? null,
      }
    })

    return {
      village_id: query.village_id,
      village_name:
        c.var.t("targets.village_label") + " " + location?.name ||
        "Unknown Village",
      puskesmas_id: c.var.userEntity?.id,
      puskesmas_name: c.var.userEntity?.name ?? "",
      absolute_immunization: {
        title: c.var.t("non_bias_immunization_logistics.absolute_number"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: immunizations,
      },
      number_of_target: {
        title: c.var.t("bias_immunization_logistics.number_of_target_title"),
        name_label: c.var.t("bias_immunization_logistics.target"),
        value_label: c.var.t("bias_immunization_logistics.target_value"),
        items: targets,
      },
      vaccine_vials_used: {
        title: c.var.t("non_bias_immunization_logistics.vial_used"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_vials"),
        items: vialsUsed,
      },
      vaccine_utilization_rate: {
        title: c.var.t(
          "bias_immunization_logistics.vaccine_utilization_rate_title"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: utilizationRate,
      },
      projected_yearly_needs: {
        title: c.var.t("non_bias_immunization_logistics.projected_yearly_need"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: vialNeeds,
      },
      projected_monthly_vaccine_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_monthly_need"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: projectedMonthly,
      },
      projected_yearly_immunization_logistics_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_yearly_immunization"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: yearlyLogisticsNeeds,
      },
      projected_monthly_immunization_logistics_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_monthly_immunization"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: monthlyLogisticsNeeds,
      },
    }
  }

  #fillTransactionMap(
    transactionMap: Map<number, number>,
    rows: Array<{
      material_id: number | string | null
      total_qty: number | string | null
      material_name?: string | null
    }>,
    variantsFromDb: Array<{ id: number; parent_id: number | null }>,
    biasMaterialIds: number[],
    biasMaterialAll: Array<{ material_id: number | string; name: string }>
  ): void {
    for (const r of rows) {
      if (r.material_id == null) continue
      const parentId = Number(r.material_id)
      const matchedVariants = variantsFromDb.filter(
        (v) => v.parent_id === parentId && biasMaterialIds.includes(v.id)
      )
      if (matchedVariants.length > 0) {
        for (const variant of matchedVariants) {
          transactionMap.set(variant.id, Number(r.total_qty))
        }
        continue
      }
      let fallbackNameMatchedId: number | undefined
      if (r.material_name) {
        const chName = r.material_name
          .replace(/\s*(@.*|\([^)]*\))/g, "")
          .trim()
          .toLowerCase()
        const foundViaName = biasMaterialAll.find(
          (m) => m.name.toLowerCase() === chName
        )
        if (foundViaName)
          fallbackNameMatchedId = Number(foundViaName.material_id)
      }
      transactionMap.set(fallbackNameMatchedId ?? parentId, Number(r.total_qty))
    }
  }

  async #getCalculateDetailForExport(
    c: Context,
    villageId: number,
    entityId: number,
    puskesmasName: string,
    provinceId: number
  ): Promise<NonBiasCalculateDetailResponse> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const currentYear = nextYear - 1

    const [_prevMicroplanningExport, mpProgramConfigId] = await Promise.all([
      this.targetsRepo.findMicroplanningByYear(c, entityId, currentYear),
      this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "non_bias"),
    ])
    // const exportMicroplanningIds = [microplanningId, prevMicroplanningExport?.id].filter((id): id is number => id != null)

    const [
      counts,
      location,
      existingData,
      mpMaterialsRaw,
      logisticMaterials,
      materialWithDose,
      absoluteTargets,
    ] = await Promise.all([
      this.nonBiasRepo.getTargetCountsByVillageId(
        c,
        villageId,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
      this.nonBiasRepo.getLocationName(c, villageId),
      this.logisticsRepo.getExistingMaterialNeeds(
        c,
        villageId,
        "village",
        microplanningId,
        mpProgramConfigId
      ),
      mpProgramConfigId
        ? this.mpConfigRepo.getMpMaterialsForCategory(
            c,
            mpProgramConfigId,
            provinceId
          )
        : Promise.resolve([]),
      this.materialRepo.findMaterialsFromTargets(c, "additional", "non_bias"),
      this.targetsRepo.getImmunizationMaterialTargetsWithDose(c),
      this.nonBiasRepo.getAbsoluteTargetGroup(
        c,
        villageId,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
    ])

    const biasMaterials =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const biasMaterialsWithVariant = (
      await Promise.all(
        biasMaterials.map(async (m) => {
          const name = m.name.replace(/\s*(@.*|\([^)]*\))/g, "").trim()
          const variant = await this.materialRepo.findMaterialChildrenByName(
            c,
            name
          )
          if (variant.length > 0) {
            return variant.map((v) => ({
              material_id: v.id,
              name: v.name.replace(/\s*\([^)]*\)/g, "").trim(),
              parent_id: m.material_id,
              consumption_unit_per_distribution_unit:
                v.consumption_unit_per_distribution_unit,
            }))
          }
          return [{ material_id: m.material_id, name }]
        })
      )
    ).filter(Boolean)

    const biasMaterialAll = [
      ...new Map(
        biasMaterialsWithVariant.flat().map((m) => [Number(m.material_id), m])
      ).values(),
    ]
    const biasMaterialNameMap = new Map<number, string>(
      biasMaterialAll.map((m) => [Number(m.material_id), m.name])
    )
    const biasMaterialParentMap = new Map<number, number>(
      biasMaterialAll
        .filter(
          (m): m is typeof m & { parent_id: number } =>
            "parent_id" in m && m.parent_id != null
        )
        .map((m) => [Number(m.material_id), Number(m.parent_id)])
    )
    const consumptionUnitMap = new Map<number, number>(
      biasMaterialAll
        .filter(
          (
            m
          ): m is typeof m & {
            consumption_unit_per_distribution_unit: number
          } =>
            "consumption_unit_per_distribution_unit" in m &&
            m.consumption_unit_per_distribution_unit != null
        )
        .map((m) => [
          Number(m.material_id),
          Number(m.consumption_unit_per_distribution_unit),
        ])
    )
    const biasMaterialIds = biasMaterialAll.map((m) => Number(m.material_id))

    const logisticMaterialNameMap = new Map<number, string>()
    logisticMaterials.forEach((m) =>
      logisticMaterialNameMap.set(m.material_id, m.name)
    )
    const logisticMaterialIds = logisticMaterials.map((m) => m.material_id)

    const countMap = new Map(
      counts
        .filter((item) => item.target_group_id !== null)
        .map((item) => [item.target_group_id as number, Number(item.count)])
    )

    for (const abs of absoluteTargets) {
      const qty = Number(abs.qty)
      if (qty === 0) continue
      countMap.set(Number(abs.target_group_id), qty)
    }

    const targetCounts = this.#extractVillageTargets(countMap)
    const targets = this.#buildTargetItems(c, targetCounts)
    const existingDataMap = new Map(
      existingData.map((item) => [item.material_id, item])
    )
    const hasTotalNeeds = existingData.some(
      (item) => item.total_needs !== null && Number(item.total_needs) > 0
    )

    const materialWithDoseMap = new Map<number, number>()
    materialWithDose.forEach((item) => {
      materialWithDoseMap.set(
        item.material_id,
        (materialWithDoseMap.get(item.material_id) ?? 0) + 1
      )
    })
    const mpDoseMap = new Map<number, number>(
      mpMaterialsRaw
        .filter(
          (m): m is typeof m & { number_of_dose: number } =>
            m.number_of_dose != null
        )
        .map((m) => [m.material_id, m.number_of_dose])
    )

    const lastYearAbsoluteMap = new Map<number, number>()
    const lastYearVialsMap = new Map<number, number>()
    const clickhouseConsumptionMap = new Map<number, number>()
    if (!hasTotalNeeds) {
      const lastYearData =
        await this.logisticsRepo.getLastYearAbsoluteImmunization(
          c,
          villageId,
          entityId,
          currentYear
        )
      lastYearData.forEach((item) => {
        if (item.material_id == null) return
        const id = Number(item.material_id)
        if (item.absolute_number_of_routine_immunization != null)
          lastYearAbsoluteMap.set(
            id,
            Number(item.absolute_number_of_routine_immunization)
          )
        if (item.number_of_vials_used != null)
          lastYearVialsMap.set(id, Number(item.number_of_vials_used))
      })
      const rutinActivityId = await this.logisticsRepo.getActivityId(c)
      const consumptionRows = rutinActivityId
        ? await this.logisticsRepo.getConsumptionByParentMaterial(
            c,
            entityId,
            currentYear,
            rutinActivityId
          )
        : []
      consumptionRows.forEach((row) =>
        clickhouseConsumptionMap.set(
          Number(row.parent_material_id),
          Number(row.value ?? 0)
        )
      )
    }

    const activeMaterialIds = biasMaterialIds

    const immunizations = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      const dose =
        mpDoseMap.get(parentId ?? materialId) ??
        materialWithDoseMap.get(materialId)
      let value: number | null = null
      if (
        existing?.absolute_number_of_routine_immunization !== null &&
        Number(existing?.absolute_number_of_routine_immunization) > 0
      ) {
        value = existing?.absolute_number_of_routine_immunization ?? 0
      } else {
        value =
          lastYearAbsoluteMap.get(materialId) ??
          lastYearAbsoluteMap.get(parentId ?? materialId) ??
          0
      }
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value,
        parent_id: parentId ?? null,
        info_dose: dose !== undefined && dose > 1 ? dose : null,
      }
    })

    const vialsUsed = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      let vialsValue: number | null = null
      if (
        existing?.number_of_vials_used !== null &&
        Number(existing?.number_of_vials_used) > 0
      ) {
        vialsValue = existing?.number_of_vials_used ?? 0
      } else {
        const clickhouseQty = clickhouseConsumptionMap.get(
          parentId ?? materialId
        )
        if (clickhouseQty != null && clickhouseQty > 0) {
          vialsValue = Math.ceil(
            clickhouseQty / (consumptionUnitMap.get(materialId) ?? 1)
          )
        } else {
          vialsValue =
            lastYearVialsMap.get(materialId) ??
            lastYearVialsMap.get(parentId ?? materialId) ??
            0
        }
      }
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: vialsValue,
        parent_id: parentId ?? null,
      }
    })

    const utilizationRate = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.vaccine_utilization_rate ?? null,
        parent_id: parentId ?? null,
      }
    })

    const vialNeeds = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.total_needs ?? null,
        parent_id: parentId ?? null,
      }
    })

    const projectedMonthly = activeMaterialIds.map((materialId) => {
      const parentId = biasMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          biasMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        min_stock: existing?.min_stock ?? null,
        max_stock: existing?.max_stock ?? null,
        available_stock: existing?.detail_remaining_stock ?? null,
        request_qty: existing?.request_qty ?? null,
        parent_id: parentId ?? null,
      }
    })

    const yearlyLogisticsNeeds = logisticMaterialIds.map((materialId) => {
      const existing = existingDataMap.get(materialId)
      return {
        id: materialId,
        name:
          logisticMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.total_needs ?? null,
      }
    })

    const monthlyLogisticsNeeds = logisticMaterialIds.map((materialId) => {
      const existing = existingDataMap.get(materialId)
      let request_qty: number | null = null
      if (
        existing?.additional_total != null &&
        existing?.additional_remaining_stock != null
      ) {
        request_qty =
          existing.additional_total - existing.additional_remaining_stock
      }
      return {
        id: materialId,
        name:
          logisticMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        calculation_based_on_vaccine_needs: existing?.additional_total ?? null,
        available_stock: existing?.additional_remaining_stock ?? null,
        request_qty: request_qty ?? null,
      }
    })

    return {
      village_id: villageId,
      village_name: location?.name || "Unknown Village",
      puskesmas_id: entityId,
      puskesmas_name: puskesmasName,
      absolute_immunization: {
        title: c.var.t("non_bias_immunization_logistics.absolute_number"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: immunizations,
      },
      number_of_target: {
        title: c.var.t("bias_immunization_logistics.number_of_target_title"),
        name_label: c.var.t("bias_immunization_logistics.target"),
        value_label: c.var.t("bias_immunization_logistics.target_value"),
        items: targets,
      },
      vaccine_vials_used: {
        title: c.var.t("non_bias_immunization_logistics.vial_used"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_vials"),
        items: vialsUsed,
      },
      vaccine_utilization_rate: {
        title: c.var.t(
          "bias_immunization_logistics.vaccine_utilization_rate_title"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: utilizationRate,
      },
      projected_yearly_needs: {
        title: c.var.t("non_bias_immunization_logistics.projected_yearly_need"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: vialNeeds,
      },
      projected_monthly_vaccine_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_monthly_need"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: projectedMonthly,
      },
      projected_yearly_immunization_logistics_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_yearly_immunization"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: yearlyLogisticsNeeds,
      },
      projected_monthly_immunization_logistics_needs: {
        title: c.var.t(
          "non_bias_immunization_logistics.projected_monthly_immunization"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: monthlyLogisticsNeeds,
      },
    }
  }

  async saveVillageImmunizationData(
    c: Context,
    body: SaveVillageImmunizationAchievementDTO
  ): Promise<SaveVillageImmunizationDataResponse> {
    const bodyMaterialIds = body.items.map((val) => val.id)
    const bodyItemsMap = new Map(
      body.items.map((val) => [val.id, val.value ?? 0])
    )
    const bodyItemsParentMap = new Map(
      body.items.map((val) => [val.id, val.parent_id])
    )

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const currentYear = nextYear - 1
    const [PrimaryMaterials, logisticMaterials, mpProgramConfigId] =
      await Promise.all([
        this.materialRepo.findWsMaterialsByIds(c, bodyMaterialIds),
        this.#getMaterialIds(c, "additional", "non_bias"),
        this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "non_bias"),
      ])
    const materialKeyMapSafe =
      (mpProgramConfigId
        ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigId)
        : null) ?? new Map()

    const additionalKeyMap =
      await this.materialRepo.getAdditionalMaterialKeyMap(c, "non_bias")
    for (const [key, id] of additionalKeyMap) {
      if (!materialKeyMapSafe.has(key)) {
        materialKeyMapSafe.set(key, id)
      }
    }

    const idToNameMap = new Map<number, string>(
      PrimaryMaterials.map((m) => [m.id, m.name])
    )

    const commonData = await this.#fetchCommonData(
      c,
      body.village_id,
      bodyMaterialIds
    )

    const materialMap = new Map(commonData.materials.map((m) => [m.id, m]))

    const stockData = await this.stockRepo.getStocksByEntityAndMaterials(
      c,
      commonData.entityId,
      bodyMaterialIds
    )

    const stockMap = new Map(
      stockData
        .filter((s) => s.material_id !== null)
        .map((s) => [s.material_id as number, Number(s.total_qty)])
    )

    const absoluteImmunization = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: bodyItemsMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    const targets = this.#buildTargetItems(c, commonData.targetCounts)

    const rutinActivityId = await this.logisticsRepo.getActivityId(c)
    const internalEntityId = c.var.userEntity?.id
    const stockConsumptionRows = rutinActivityId
      ? await this.logisticsRepo.getConsumptionByParentMaterial(
          c,
          internalEntityId ?? 0,
          currentYear,
          rutinActivityId
        )
      : []
    const rawStockResultRows = stockConsumptionRows.map((r) => ({
      material_id: r.parent_material_id,
      total_qty: r.value,
      material_name: null as string | null,
    }))
    const stockParentIds = Array.from(
      new Set(
        rawStockResultRows
          .map((r) => Number(r.material_id))
          .filter((id) => !isNaN(id))
      )
    )
    let stockVariantsFromDb: { id: number; parent_id: number | null }[] = []
    if (stockParentIds.length > 0) {
      stockVariantsFromDb = await this.materialRepo.findVariantsByParentIds(
        c,
        stockParentIds
      )
    }
    const consumptionUnitMap = new Map<number, number>(
      bodyMaterialIds.map((id) => [
        id,
        Number(
          materialMap.get(id)?.consumption_unit_per_distribution_unit ?? 1
        ),
      ])
    )
    const transactionMap = new Map<number, number>()
    this.#fillTransactionMap(
      transactionMap,
      rawStockResultRows,
      stockVariantsFromDb,
      bodyMaterialIds,
      PrimaryMaterials.map((m) => ({ material_id: m.id, name: m.name }))
    )
    const transactionVialsMap = new Map<number, number>()
    for (const [materialId, totalQty] of transactionMap) {
      const consumptionUnit = consumptionUnitMap.get(materialId) ?? 1
      transactionVialsMap.set(materialId, (totalQty ?? 0) / consumptionUnit)
    }

    const vialsUsed = bodyMaterialIds.map((materialId) => {
      const parentId = bodyItemsParentMap.get(materialId) ?? undefined
      const calculatedValue =
        transactionVialsMap.get(materialId) ??
        transactionVialsMap.get(parentId ?? materialId) ??
        0

      return {
        id: materialId,
        name:
          materialMap.get(materialId)?.name ??
          c.var.t("immunization_logistics.unknown"),
        value: calculatedValue,
        parent_id: bodyItemsParentMap.get(materialId) ?? null,
      }
    })

    const utilizationRate = bodyMaterialIds.map((materialId) => {
      const absolute = bodyItemsMap.get(materialId) ?? 0
      const vialUsed = vialsUsed.find((v) => v.id === materialId)?.value ?? 0
      const rate =
        vialUsed > 0 ? Math.floor(safeDiv(absolute, vialUsed) * 10) / 10 : 0

      return {
        id: materialId,
        name:
          materialMap.get(materialId)?.name ??
          c.var.t("immunization_logistics.unknown"),
        value: rate,
        parent_id: bodyItemsParentMap.get(materialId) ?? null,
      }
    })

    const vialNeedsCalculated = this.#calculateVialNeeds(
      commonData.targetCounts,
      utilizationRate,
      materialKeyMapSafe,
      bodyItemsParentMap
    )

    const projected1Year = this.#buildProjectedYearlyNeeds(
      c,
      vialNeedsCalculated,
      bodyMaterialIds,
      idToNameMap,
      bodyItemsParentMap
    )

    const projectedMonthly = this.#buildProjectedMonthlyNeeds(
      projected1Year,
      stockMap,
      bodyItemsParentMap
    )

    const logisticIdsMap = resolveLogisticsIds(materialKeyMapSafe)

    const logisticsStockData =
      await this.stockRepo.getStocksByEntityAndMaterials(
        c,
        commonData.entityId,
        logisticMaterials.materialIds
      )

    const logisticsStockMap = new Map(
      logisticsStockData
        .filter((s) => s.material_id !== null)
        .map((s) => [s.material_id as number, Number(s.total_qty)])
    )

    const { projectedYearlyLogistics, projectedMonthlyLogistics } =
      this.#buildLogisticsNeeds(
        c,
        vialNeedsCalculated,
        logisticMaterials.materialIds,
        logisticMaterials.idToNameMap,
        logisticIdsMap,
        logisticsStockMap
      )

    return this.#buildResponse(
      c,
      {
        villageId: body.village_id,
        villageName: commonData.villageName,
        puskesmasId: commonData.puskesmasId,
        puskesmasName: commonData.puskesmasName,
      },
      {
        absoluteImmunization,
        targets,
        vialsUsed,
        utilizationRate,
      },
      {
        yearly: projected1Year,
        monthly: projectedMonthly,
      },
      {
        yearly: projectedYearlyLogistics,
        monthly: projectedMonthlyLogistics,
      }
    )
  }

  async recalculateVillageEstimation(
    c: Context,
    body: RecalculateVillageEstimationDTO
  ): Promise<RecalculateVillageEstimationResponse> {
    const bodyMaterialIds = body.items.map((val) => val.id)
    const bodyItemsMap = new Map(
      body.items.map((val) => [val.id, val.value ?? 0])
    )
    const bodyItemsParentMap = new Map(
      body.items.map((val) => [val.id, val.parent_id])
    )
    const bodyVialsUsedMap = new Map(
      body.vials_used.map((val) => [val.id, val.value ?? 0])
    )

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const [rawPrimaryMaterials, logisticMaterials, mpProgramConfigId] =
      await Promise.all([
        this.materialRepo.findWsMaterialsByIds(c, bodyMaterialIds),
        this.#getMaterialIds(c, "additional", "non_bias"),
        this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "non_bias"),
      ])
    const materialKeyMapSafe2 =
      (mpProgramConfigId
        ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigId)
        : null) ?? new Map()

    const additionalKeyMap2 =
      await this.materialRepo.getAdditionalMaterialKeyMap(c, "non_bias")
    for (const [key, id] of additionalKeyMap2) {
      if (!materialKeyMapSafe2.has(key)) {
        materialKeyMapSafe2.set(key, id)
      }
    }

    const idToNameMap = new Map<number, string>(
      rawPrimaryMaterials.map((m) => [m.id, m.name])
    )

    const commonData = await this.#fetchCommonData(
      c,
      body.village_id,
      bodyMaterialIds
    )

    const materialMap = new Map(commonData.materials.map((m) => [m.id, m]))

    const stockData = await this.stockRepo.getStocksByEntityAndMaterials(
      c,
      commonData.entityId,
      bodyMaterialIds
    )
    const stockMap = new Map(
      stockData
        .filter((s) => s.material_id !== null)
        .map((s) => [s.material_id as number, Number(s.total_qty)])
    )

    const absoluteImmunization = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: bodyItemsMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    const targets = this.#buildTargetItems(c, commonData.targetCounts)

    const vialsUsed = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: bodyVialsUsedMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    const utilizationRate = bodyMaterialIds.map((materialId) => {
      const absolute = bodyItemsMap.get(materialId) ?? 0
      const vialUsed = bodyVialsUsedMap.get(materialId) ?? 0
      const rate =
        vialUsed > 0 ? Math.floor(safeDiv(absolute, vialUsed) * 10) / 10 : 0

      return {
        id: materialId,
        name:
          materialMap.get(materialId)?.name ??
          c.var.t("immunization_logistics.unknown"),
        value: rate,
        parent_id: bodyItemsParentMap.get(materialId) ?? null,
      }
    })

    const vialNeedsCalculated = this.#calculateVialNeeds(
      commonData.targetCounts,
      utilizationRate,
      materialKeyMapSafe2,
      bodyItemsParentMap
    )
    const projected1Year = this.#buildProjectedYearlyNeeds(
      c,
      vialNeedsCalculated,
      bodyMaterialIds,
      idToNameMap,
      bodyItemsParentMap
    )
    const projectedMonthly = this.#buildProjectedMonthlyNeeds(
      projected1Year,
      stockMap,
      bodyItemsParentMap
    )

    const logisticIdsMap = resolveLogisticsIds(materialKeyMapSafe2)

    const logisticsStockData =
      await this.stockRepo.getStocksByEntityAndMaterials(
        c,
        commonData.entityId,
        logisticMaterials.materialIds
      )

    const logisticsStockMap = new Map(
      logisticsStockData
        .filter((s) => s.material_id !== null)
        .map((s) => [s.material_id as number, Number(s.total_qty)])
    )

    const { projectedYearlyLogistics, projectedMonthlyLogistics } =
      this.#buildLogisticsNeeds(
        c,
        vialNeedsCalculated,
        logisticMaterials.materialIds,
        logisticMaterials.idToNameMap,
        logisticIdsMap,
        logisticsStockMap
      )

    return this.#buildResponse(
      c,
      {
        villageId: body.village_id,
        villageName: commonData.villageName,
        puskesmasId: commonData.puskesmasId,
        puskesmasName: commonData.puskesmasName,
      },
      {
        absoluteImmunization,
        targets,
        vialsUsed,
        utilizationRate,
      },
      {
        yearly: projected1Year,
        monthly: projectedMonthly,
      },
      {
        yearly: projectedYearlyLogistics,
        monthly: projectedMonthlyLogistics,
      }
    )
  }

  async recalculateIpRate(
    c: Context,
    body: RecalculateFullVillageDTO
  ): Promise<RecalculateFullVillageResponse> {
    // 1. Validate entity
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    // 2. Extract material IDs and parent map from items (= absolute immunization)
    const bodyMaterialIds = body.items.map((v) => v.id)
    const bodyItemsParentMap = new Map(
      body.items.map((v) => [v.id, v.parent_id])
    )
    const bodyItemsAbsoluteMap = new Map(body.items.map((v) => [v.id, v.value]))

    // 3. Build maps from vaccine_utilization_rate (IP rate from user) and optional vials_used
    const ipRateMap = new Map(
      body.vaccine_utilization_rate.map((v) => [v.id, v.value])
    )
    const vialsMap = new Map(
      (body.vials_used ?? []).map((v) => [v.id, v.value])
    )

    // 4. Fetch materials and logistics IDs
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const [rawPrimaryMaterials, logisticMaterials, mpProgramConfigId] =
      await Promise.all([
        this.materialRepo.findWsMaterialsByIds(c, bodyMaterialIds),
        this.#getMaterialIds(c, "additional", "non_bias"),
        this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "non_bias"),
      ])
    const materialKeyMapSafe3 =
      (mpProgramConfigId
        ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigId)
        : null) ?? new Map()

    const additionalKeyMap3 =
      await this.materialRepo.getAdditionalMaterialKeyMap(c, "non_bias")
    for (const [key, id] of additionalKeyMap3) {
      if (!materialKeyMapSafe3.has(key)) {
        materialKeyMapSafe3.set(key, id)
      }
    }

    const idToNameMap = new Map(rawPrimaryMaterials.map((m) => [m.id, m.name]))

    // 5. Fetch common data (targets, materials, etc.)
    const commonData = await this.#fetchCommonData(
      c,
      body.village_id,
      bodyMaterialIds
    )
    const materialMap = new Map(commonData.materials.map((m) => [m.id, m]))

    // 6. Fetch stock data for primary materials
    const stockData = await this.stockRepo.getStocksByEntityAndMaterials(
      c,
      commonData.entityId,
      bodyMaterialIds
    )
    const stockMap = new Map(
      stockData
        .filter((s) => s.material_id !== null)
        .map((s) => [s.material_id as number, Number(s.total_qty)])
    )

    // 7. Build absoluteImmunization from items[].value
    const absoluteImmunization = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: bodyItemsAbsoluteMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    // 8. Build targets
    const targets = this.#buildTargetItems(c, commonData.targetCounts)

    // 9. Build vialsUsed from body.vials_used (optional, display only)
    const vialsUsed = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: vialsMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    // 10. Build utilizationRate from vaccine_utilization_rate (IP rate input by user)
    const utilizationRate = bodyMaterialIds.map((materialId) => {
      const parentId = bodyItemsParentMap.get(materialId) ?? null
      return {
        id: materialId,
        name:
          materialMap.get(materialId)?.name ??
          c.var.t("immunization_logistics.unknown"),
        value: ipRateMap.get(materialId) ?? 0,
        parent_id: parentId,
      }
    })

    // 11. Calculate vial needs from IP rates
    const vialNeedsCalculated = this.#calculateVialNeeds(
      commonData.targetCounts,
      utilizationRate,
      materialKeyMapSafe3,
      bodyItemsParentMap
    )

    // 12. Build projected yearly needs (with parent_id)
    const projected1Year = this.#buildProjectedYearlyNeeds(
      c,
      vialNeedsCalculated,
      bodyMaterialIds,
      idToNameMap,
      bodyItemsParentMap
    )

    // 13. Build projected monthly needs (min_stock, max_stock, available_stock, request_qty)
    const projectedMonthly = this.#buildProjectedMonthlyNeeds(
      projected1Year,
      stockMap,
      bodyItemsParentMap
    )

    // 14. Calculate logistics needs (ADS/SB yearly + monthly with stock from DB)
    const logisticIdsMap = resolveLogisticsIds(materialKeyMapSafe3)

    const logisticsStockData =
      await this.stockRepo.getStocksByEntityAndMaterials(
        c,
        commonData.entityId,
        logisticMaterials.materialIds
      )

    const logisticsStockMap = new Map(
      logisticsStockData
        .filter((s) => s.material_id !== null)
        .map((s) => [s.material_id as number, Number(s.total_qty)])
    )

    const { projectedYearlyLogistics, projectedMonthlyLogistics } =
      this.#buildLogisticsNeeds(
        c,
        vialNeedsCalculated,
        logisticMaterials.materialIds,
        logisticMaterials.idToNameMap,
        logisticIdsMap,
        logisticsStockMap
      )

    // 15. Build response matching calculate-detail structure
    return this.#buildResponse(
      c,
      {
        villageId: body.village_id,
        villageName: commonData.villageName,
        puskesmasId: commonData.puskesmasId,
        puskesmasName: commonData.puskesmasName,
      },
      {
        absoluteImmunization,
        targets,
        vialsUsed,
        utilizationRate,
      },
      {
        yearly: projected1Year,
        monthly: projectedMonthly,
      },
      {
        yearly: projectedYearlyLogistics,
        monthly: projectedMonthlyLogistics,
      }
    )
  }

  async saveNonBiasImmunizationLogistics(
    c: Context,
    body: SaveVillageImmunizationDataResponse
  ) {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!

    const primaryMaterialIds = Array.from(
      new Set(
        body.projected_monthly_vaccine_needs.items.flatMap((item) =>
          item.parent_id ? [item.id, item.parent_id] : [item.id]
        )
      )
    )

    const additionalMaterialIds =
      body.projected_monthly_immunization_logistics_needs.items.map(
        (item) => item.id
      )

    const [primaryTargets, additionalTargets] = await Promise.all([
      this.materialTargetsRepo.getMaterialTargetsPrimaryByMaterialIds(
        c,
        primaryMaterialIds,
        "non_bias"
      ),
      this.materialTargetsRepo.getMaterialTargetsByMaterialIds(
        c,
        additionalMaterialIds,
        "non_bias",
        "additional"
      ),
    ])

    const primaryTargetMap = new Map(
      primaryTargets.map((t) => [t.material_id, t.id])
    )
    const additionalTargetMap = new Map(
      additionalTargets.map((t) => [t.material_id, t.id])
    )

    const allTargetIds = [
      ...primaryTargets.map((t) => t.id),
      ...additionalTargets.map((t) => t.id),
    ]

    const existingData = await this.logisticsRepo.checkExistingData(
      c,
      body.village_id,
      "village",
      microplanningId,
      allTargetIds
    )

    if (existingData.length > 0) {
      throw new ValidationError(
        c.var.t("non_bias_immunization_logistics.data_not_found", {
          village_id: body.village_id,
          microplanningId: microplanningId,
        })
      )
    }

    const missingAdditionalTargets = additionalMaterialIds.filter(
      (id) => !additionalTargetMap.has(id)
    )
    if (missingAdditionalTargets.length > 0) {
      throw new ValidationError(
        c.var.t(
          "non_bias_immunization_logistics.material_targets_not_found_additional",
          {
            ids: missingAdditionalTargets.join(", "),
          }
        )
      )
    }

    for (const item of body.projected_monthly_vaccine_needs.items) {
      const materialTargetId =
        primaryTargetMap.get(item.id) ??
        (item.parent_id ? primaryTargetMap.get(item.parent_id) : undefined)

      if (!materialTargetId) {
        continue
      }

      const materialNeed = await this.logisticsRepo.saveMaterialNeed(c, {
        material_target_id: materialTargetId,
        microplanning_id: microplanningId,
        reference_id: body.village_id,
        reference_type: "village",
        total_needs: Math.ceil(
          body.projected_yearly_needs.items.find((i) => i.id === item.id)
            ?.value ?? 0
        ),
        material_id: item.id,
      })

      await this.logisticsRepo.saveMaterialNeedDetail(c, {
        material_need_id: materialNeed.id,
        absolute_number_of_routine_immunization: Math.ceil(
          body.absolute_immunization.items.find((i) => i.id === item.id)
            ?.value ?? 0
        ),
        number_of_vials_used: Math.ceil(
          body.vaccine_vials_used.items.find((i) => i.id === item.id)?.value ??
            0
        ),
        remaining_stock: item.available_stock,
      })

      await this.logisticsRepo.saveMonthlyVaccineNeedDetail(c, {
        material_need_id: materialNeed.id,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        request_qty: item.request_qty,
      })

      const utilizationRateValue =
        body.vaccine_utilization_rate.items.find((i) => i.id === item.id)
          ?.value ?? null
      if (utilizationRateValue !== null) {
        await this.logisticsRepo.saveVaccineUtilizationRate(c, {
          material_need_id: materialNeed.id,
          vaccine_utilization_rate: utilizationRateValue,
        })
      }
    }

    for (const item of body.projected_monthly_immunization_logistics_needs
      .items) {
      const materialTargetId = additionalTargetMap.get(item.id)
      if (!materialTargetId) {
        continue
      }

      const materialNeed = await this.logisticsRepo.saveMaterialNeed(c, {
        material_target_id: materialTargetId,
        microplanning_id: microplanningId,
        reference_id: body.village_id,
        reference_type: "village",
        total_needs: Math.ceil(
          body.projected_yearly_immunization_logistics_needs.items.find(
            (i) => i.id === item.id
          )?.value ?? 0
        ),
        material_id: item.id,
      })

      await this.logisticsRepo.saveAdditionalNeed(c, {
        material_need_id: materialNeed.id,
        material_target_id: materialTargetId,
        remaining_stock: item.available_stock,
        total: item.calculation_based_on_vaccine_needs,
      })
    }

    return {
      success: true,
      message: c.var.t("non_bias_immunization_logistics.save_success"),
    }
  }

  async getDataChecker(
    c: Context,
    subDistrictId: number,
    keyword?: string
  ): Promise<VillageListResponse> {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!

    const rawData =
      await this.logisticsRepo.getVillagesBySubDistrictWithMaterialNeeds(
        c,
        subDistrictId,
        microplanningId,
        keyword
      )

    let dataCount = 0
    const entities = rawData.map((village) => {
      const hasData = village.material_need_id !== null
      if (hasData) dataCount++

      return {
        id: village.village_id,
        name: VILLAGE_LABEL + ` ${(village.village_name ?? "").toUpperCase()}`,
        has_data: hasData,
      }
    })

    return {
      data: {
        total: rawData.length,
        total_with_data: dataCount,
        entities,
      },
    }
  }

  #getTargetId(
    map: Map<number, number>,
    id: number,
    parentId?: number | null
  ): number | undefined {
    return map.get(id) ?? (parentId ? map.get(parentId) : undefined)
  }

  #findItemValue(
    items: Array<{ id: number; value?: number }>,
    id: number
  ): number {
    return Math.ceil(items.find((i) => i.id === id)?.value ?? 0)
  }

  async #saveNewVaccineNeed(
    c: Context,
    materialTargetId: number,
    microplanningId: number,
    villageId: number,
    item: any,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    const materialNeed = await this.logisticsRepo.saveMaterialNeed(c, {
      material_target_id: materialTargetId,
      microplanning_id: microplanningId,
      reference_id: villageId,
      reference_type: "village",
      total_needs: this.#findItemValue(
        body.projected_yearly_needs.items,
        item.id
      ),
      material_id: item.id,
    })

    await this.logisticsRepo.saveMaterialNeedDetail(c, {
      material_need_id: materialNeed.id,
      absolute_number_of_routine_immunization: this.#findItemValue(
        body.absolute_immunization.items,
        item.id
      ),
      number_of_vials_used: this.#findItemValue(
        body.vaccine_vials_used.items,
        item.id
      ),
      remaining_stock: item.available_stock,
    })

    await this.logisticsRepo.saveMonthlyVaccineNeedDetail(c, {
      material_need_id: materialNeed.id,
      min_stock: item.min_stock,
      max_stock: item.max_stock,
      request_qty: item.request_qty,
    })

    const utilizationRateValue =
      body.vaccine_utilization_rate.items.find((i) => i.id === item.id)
        ?.value ?? null
    if (utilizationRateValue !== null) {
      await this.logisticsRepo.saveVaccineUtilizationRate(c, {
        material_need_id: materialNeed.id,
        vaccine_utilization_rate: utilizationRateValue,
      })
    }
  }

  async #updateExistingVaccineNeed(
    c: Context,
    materialNeedId: number,
    item: any,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    await this.logisticsRepo.updateMaterialNeed(
      c,
      materialNeedId,
      this.#findItemValue(body.projected_yearly_needs.items, item.id)
    )

    await this.logisticsRepo.updateMaterialNeedDetail(c, materialNeedId, {
      absolute_number_of_routine_immunization: this.#findItemValue(
        body.absolute_immunization.items,
        item.id
      ),
      number_of_vials_used: this.#findItemValue(
        body.vaccine_vials_used.items,
        item.id
      ),
      remaining_stock: item.available_stock,
    })

    await this.logisticsRepo.updateMonthlyVaccineNeedDetail(c, materialNeedId, {
      min_stock: item.min_stock,
      max_stock: item.max_stock,
      request_qty: item.request_qty,
    })

    const utilizationRateValue =
      body.vaccine_utilization_rate.items.find((i) => i.id === item.id)
        ?.value ?? null
    if (utilizationRateValue !== null) {
      await this.logisticsRepo.updateVaccineUtilizationRate(
        c,
        materialNeedId,
        utilizationRateValue
      )
    }
  }

  async #processVaccineNeedItem(
    c: Context,
    item: any,
    primaryTargetMap: Map<number, number>,
    existingDataMap: Map<number, number>,
    microplanningId: number,
    villageId: number,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    const materialTargetId = this.#getTargetId(
      primaryTargetMap,
      item.id,
      item.parent_id
    )
    if (!materialTargetId) return

    const materialNeedId = this.#getTargetId(
      existingDataMap,
      item.id,
      item.parent_id
    )

    if (!materialNeedId) {
      await this.#saveNewVaccineNeed(
        c,
        materialTargetId,
        microplanningId,
        villageId,
        item,
        body
      )
    } else {
      await this.#updateExistingVaccineNeed(c, materialNeedId, item, body)
    }
  }

  async #saveNewLogisticsNeed(
    c: Context,
    materialTargetId: number,
    microplanningId: number,
    villageId: number,
    item: any,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    const materialNeed = await this.logisticsRepo.saveMaterialNeed(c, {
      material_target_id: materialTargetId,
      microplanning_id: microplanningId,
      reference_id: villageId,
      reference_type: "village",
      total_needs: this.#findItemValue(
        body.projected_yearly_immunization_logistics_needs.items,
        item.id
      ),
      material_id: item.id,
    })

    await this.logisticsRepo.saveAdditionalNeed(c, {
      material_need_id: materialNeed.id,
      material_target_id: materialTargetId,
      remaining_stock: item.available_stock,
      total: item.calculation_based_on_vaccine_needs,
    })
  }

  async #updateExistingLogisticsNeed(
    c: Context,
    materialNeedId: number,
    item: any,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    await this.logisticsRepo.updateMaterialNeed(
      c,
      materialNeedId,
      this.#findItemValue(
        body.projected_yearly_immunization_logistics_needs.items,
        item.id
      )
    )

    await this.logisticsRepo.updateAdditionalNeed(c, materialNeedId, {
      remaining_stock: item.available_stock,
      total: item.calculation_based_on_vaccine_needs,
    })
  }

  async #processLogisticsNeedItem(
    c: Context,
    item: any,
    additionalTargetMap: Map<number, number>,
    existingDataMap: Map<number, number>,
    microplanningId: number,
    villageId: number,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    const materialTargetId = additionalTargetMap.get(item.id)
    if (!materialTargetId) return

    const materialNeedId = existingDataMap.get(item.id)

    if (!materialNeedId) {
      await this.#saveNewLogisticsNeed(
        c,
        materialTargetId,
        microplanningId,
        villageId,
        item,
        body
      )
    } else {
      await this.#updateExistingLogisticsNeed(c, materialNeedId, item, body)
    }
  }

  async updateNonBiasImmunizationLogistics(
    c: Context,
    villageId: number,
    body: UpdateNonBiasImmunizationLogisticsDTO
  ) {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const primaryMaterialIds = Array.from(
      new Set(
        body.projected_monthly_vaccine_needs.items.flatMap((item) =>
          item.parent_id ? [item.id, item.parent_id] : [item.id]
        )
      )
    )

    const additionalMaterialIds =
      body.projected_monthly_immunization_logistics_needs.items.map(
        (item) => item.id
      )

    const [primaryTargets, additionalTargets] = await Promise.all([
      this.materialTargetsRepo.getMaterialTargetsPrimaryByMaterialIds(
        c,
        primaryMaterialIds,
        "non_bias"
      ),
      this.materialTargetsRepo.getMaterialTargetsByMaterialIds(
        c,
        additionalMaterialIds,
        "non_bias",
        "additional"
      ),
    ])

    const primaryTargetMap = new Map(
      primaryTargets.map((t) => [t.material_id, t.id])
    )
    const additionalTargetMap = new Map(
      additionalTargets.map((t) => [t.material_id, t.id])
    )

    const allTargetIds = [
      ...primaryTargets.map((t) => t.id),
      ...additionalTargets.map((t) => t.id),
    ]

    const existingData = await this.logisticsRepo.checkExistingData(
      c,
      villageId,
      "village",
      microplanningId,
      allTargetIds
    )

    if (existingData.length === 0) {
      throw new ValidationError(
        c.var.t("non_bias_immunization_logistics.no_exist_data", {
          villageId: villageId,
          nextYear: nextYear,
        })
      )
    }

    const existingDataMap = new Map(
      existingData.map((item) => [item.material_id, item.id])
    )

    for (const item of body.projected_monthly_vaccine_needs.items) {
      await this.#processVaccineNeedItem(
        c,
        item,
        primaryTargetMap,
        existingDataMap,
        microplanningId,
        villageId,
        body
      )
    }

    for (const item of body.projected_monthly_immunization_logistics_needs
      .items) {
      await this.#processLogisticsNeedItem(
        c,
        item,
        additionalTargetMap,
        existingDataMap,
        microplanningId,
        villageId,
        body
      )
    }

    return {
      success: true,
      message: c.var.t("non_bias_immunization_logistics.update_success"),
    }
  }

  async exportCalculateDetail(
    c: Context,
    query: NonBiasCalculateDetailQueryDTO
  ) {
    const data = await this.getCalculateDetail(c, query)

    const template = new ExportTemplate("Detail Logistik Non-BIAS")
    template.setColumns([
      { key: "kategori", header: "Kategori", width: 55 },
      {
        key: "nama",
        header: c.var.t("bias_immunization_logistics.material_name"),
        width: 35,
      },
      {
        key: "nilai",
        header: c.var.t("bias_immunization_logistics.number_of_doses"),
        width: 15,
      },
    ])

    for (const item of data.absolute_immunization.items) {
      template.addRow({
        kategori: data.absolute_immunization.title,
        nama: item.name,
        nilai: item.value,
      })
    }

    for (const item of data.number_of_target.items) {
      if (item.targets && item.targets.length > 0) {
        for (const t of item.targets) {
          template.addRow({
            kategori: data.number_of_target.title,
            nama: `${item.name} - ${t.name}`,
            nilai: t.value,
          })
        }
      } else {
        template.addRow({
          kategori: data.number_of_target.title,
          nama: item.name,
          nilai: item.value ?? null,
        })
      }
    }

    for (const item of data.vaccine_vials_used.items) {
      template.addRow({
        kategori: data.vaccine_vials_used.title,
        nama: item.name,
        nilai: item.value,
      })
    }

    for (const item of data.vaccine_utilization_rate.items) {
      template.addRow({
        kategori: data.vaccine_utilization_rate.title,
        nama: item.name,
        nilai: item.value,
      })
    }

    for (const item of data.projected_yearly_needs.items) {
      template.addRow({
        kategori: data.projected_yearly_needs.title,
        nama: item.name,
        nilai: item.value,
      })
    }

    for (const item of data.projected_monthly_vaccine_needs.items) {
      template.addRow({
        kategori: data.projected_monthly_vaccine_needs.title,
        nama: item.name,
        nilai: item.request_qty,
      })
    }

    for (const item of data.projected_yearly_immunization_logistics_needs
      .items) {
      template.addRow({
        kategori: data.projected_yearly_immunization_logistics_needs.title,
        nama: item.name,
        nilai: item.value,
      })
    }

    for (const item of data.projected_monthly_immunization_logistics_needs
      .items) {
      template.addRow({
        kategori: data.projected_monthly_immunization_logistics_needs.title,
        nama: item.name,
        nilai: item.request_qty,
      })
    }

    const villageName = data.village_name
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .trim()
    const timestamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[T:]/g, "-")
    return template.generate(`LogistikNonBIAS_${villageName}_${timestamp}.xlsx`)
  }

  async exportAllVillagesCalculateDetail(c: Context, subDistrictId: number) {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!

    const rawVillages =
      await this.logisticsRepo.getVillagesBySubDistrictWithMaterialNeeds(
        c,
        subDistrictId,
        microplanningId
      )

    const villagesData = await Promise.all(
      rawVillages.map((v) =>
        this.getCalculateDetail(c, { village_id: v.village_id })
      )
    )

    const buffer = await this.#buildAllVillagesWorksheet(villagesData)
    const timestamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[T:]/g, "-")
    return { buffer, filename: `LogistikNonBIAS_${timestamp}.xlsx` }
  }

  async exportDistrictCalculateDetail(
    c: Context,
    params: { regency_id?: number; sub_district_id?: number }
  ) {
    // Tentukan sub-district IDs berdasarkan parameter
    let subDistrictIds: number[]
    if (params.sub_district_id && params.regency_id) {
      // Keduanya diisi: ambil sub-districts dari regency, filter yang cocok
      const all = await this.logisticsRepo.getSubDistrictIdsByRegencyId(
        c,
        params.regency_id
      )
      subDistrictIds = all.filter((id) => id === params.sub_district_id)
    } else if (params.sub_district_id) {
      subDistrictIds = [params.sub_district_id]
    } else {
      subDistrictIds = await this.logisticsRepo.getSubDistrictIdsByRegencyId(
        c,
        params.regency_id!
      )
    }

    if (subDistrictIds.length === 0) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    // Cari semua puskesmas (entity_tag_id=9) dalam sub-district tersebut
    const entities = await this.logisticsRepo.getEntitiesBySubDistrictIds(
      c,
      subDistrictIds
    )
    if (entities.length === 0) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    // Dedup: entitas yang sama bisa muncul di beberapa program_id
    const uniqueEntities = [...new Map(entities.map((e) => [e.id, e])).values()]

    const allVillagesData: NonBiasCalculateDetailResponse[] = []

    for (const entity of uniqueEntities) {
      const entityId = Number(entity.id)
      const subDistrictId = Number(entity.sub_district_id)
      const microplanningId = c.var.microplanningId!

      const rawVillages =
        await this.logisticsRepo.getVillagesBySubDistrictWithMaterialNeeds(
          c,
          subDistrictId,
          microplanningId
        )

      const villagesData = await Promise.all(
        rawVillages.map((v) =>
          this.#getCalculateDetailForExport(
            c,
            v.village_id,
            entityId,
            entity.name ?? "",
            Number(entity.province_id ?? 0)
          )
        )
      )

      allVillagesData.push(...villagesData)
    }

    const buffer = await this.#buildAllVillagesWorksheet(allVillagesData, true)
    const timestamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[T:]/g, "-")
    return { buffer, filename: `LogistikNonBIAS_Regency_${timestamp}.xlsx` }
  }

  async #buildAllVillagesWorksheet(
    villagesData: NonBiasCalculateDetailResponse[],
    includePuskesmas = false
  ) {
    const workbook = new Excel.Workbook()
    const ws = workbook.addWorksheet("Logistik Non-BIAS")

    const firstVillage = villagesData[0]
    const targetItems = firstVillage?.number_of_target.items ?? []
    const materialItems = firstVillage?.absolute_immunization.items ?? []
    // offset: 2 base cols (village_id, village) + 1 extra if puskesmas
    const baseColCount = includePuskesmas ? 3 : 2
    const totalCols = baseColCount + targetItems.length + materialItems.length

    ws.getColumn(1).width = 15
    ws.getColumn(2).width = 30
    if (includePuskesmas) ws.getColumn(3).width = 30
    for (let i = baseColCount + 1; i <= totalCols; i++)
      ws.getColumn(i).width = 18

    // Row 1: Title
    const titleCell = ws.getRow(1).getCell(1)
    titleCell.value = "Target Absolut 1 tahun sebelumnya"
    titleCell.font = { bold: true }
    if (totalCols > 1) ws.mergeCells(1, 1, 1, totalCols)

    // Row 3: Group headers
    if (targetItems.length > 0) {
      const startCol = baseColCount + 1
      const endCol = baseColCount + targetItems.length
      const cell = ws.getRow(3).getCell(startCol)
      cell.value = "Sasaran"
      cell.font = { bold: true }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      if (endCol > startCol) ws.mergeCells(3, startCol, 3, endCol)
    }
    if (materialItems.length > 0) {
      const startCol = baseColCount + targetItems.length + 1
      const cell = ws.getRow(3).getCell(startCol)
      cell.value = "Material"
      cell.font = { bold: true }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      if (totalCols > startCol) ws.mergeCells(3, startCol, 3, totalCols)
    }

    // Row 4: Column headers
    const headerRow = ws.getRow(4)
    headerRow.getCell(1).value = "village_id"
    headerRow.getCell(2).value = "village"
    if (includePuskesmas) headerRow.getCell(3).value = "puskesmas"
    targetItems.forEach((t, i) => {
      headerRow.getCell(baseColCount + 1 + i).value = t.name
    })
    materialItems.forEach((m, i) => {
      headerRow.getCell(baseColCount + 1 + targetItems.length + i).value =
        m.name
    })
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      }
    })

    // Data rows from row 5
    villagesData.forEach((village, rowIdx) => {
      const row = ws.getRow(5 + rowIdx)
      // Hapus prefix label (misal "Desa ") dari village_name khusus untuk XLS
      const villageName = village.village_name.replace(/^[^\s]+\s/, "")
      row.getCell(1).value = village.village_id
      row.getCell(2).value = villageName
      if (includePuskesmas) row.getCell(3).value = village.puskesmas_name

      const targetMap = new Map(
        village.number_of_target.items.map((t) => [t.id, t.value ?? 0])
      )
      targetItems.forEach((t, i) => {
        row.getCell(baseColCount + 1 + i).value = targetMap.get(t.id) ?? 0
      })

      const materialMap = new Map(
        village.absolute_immunization.items.map((m) => [m.id, m.value ?? 0])
      )
      materialItems.forEach((m, i) => {
        row.getCell(baseColCount + 1 + targetItems.length + i).value =
          materialMap.get(m.id) ?? 0
      })
    })

    return workbook.xlsx.writeBuffer()
  }
}
