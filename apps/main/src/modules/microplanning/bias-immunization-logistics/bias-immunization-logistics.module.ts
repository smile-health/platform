import { StockRepository } from "../../stock/stock.repository.js"
import {
  FEMALE_ONLY_TARGET_GROUPS,
  GENDER_FEMALE,
  GENDER_MALE,
  MALE_ONLY_TARGET_GROUPS,
  PERCENTAGE_100,
  PERCENTAGE_50,
  SCHOOL_TARGET_GROUPS,
  TARGET_GROUP_ORDER,
} from "@/common/constants/target.js"
import {
  aggregateByLogisticsGroup,
  BIAS_CALC_CONFIG,
  buildParentIdToKeyMap,
  calculateVialNeedsDynamic,
  resolveBiasMaterialIds,
  resolveLogisticsIds,
  type VialNeedResult,
} from "@/common/utils/material-key.utils.js"
import { ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import moment from "moment"
import { MaterialRepository } from "../../material/material.repository.js"
import {
  calcVialNeedNoBuffer,
  safeDiv,
} from "../../microplanning/immunization-logistics/immunization-logistics.formula.js"
import { MaterialTargetsRepository } from "../../microplanning/material-targets/material-targets.repository.js"
import { TargetsRepository } from "../../microplanning/targets/targets.repository.js"
import { doDecrypt } from "../../transaction/utils/transaction.encryption.js"
import { MpConfigRepository } from "../mp-config/mp-config.repository.js"
import { TargetEstimationBiasRepository } from "../target-estimation-bias/target-estimation-bias.repository.js"
import { BiasImmunizationLogisticsRepository } from "./bias-immunization-logistics.repository.js"
import {
  BiasCalculateDetailQueryDTO,
  BiasCalculateDetailResponse,
  RecalculateEstimationDTO,
  RecalculateEstimationResponse,
  RecalculateIpRateDTO,
  RecalculateIpRateResponse,
  SaveBiasImmunizationLogisticsDTO,
  SaveImmunizationAchievementDTO,
  SaveImmunizationDataResponse,
  SchoolListResponse,
  UpdateBiasImmunizationLogisticsDTO,
} from "./bias-immunization-logistics.schema.js"

export class BiasImmunizationLogisticsModule {
  constructor(
    private readonly biasRepo: TargetEstimationBiasRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly materialTargetsRepo: MaterialTargetsRepository,
    private readonly logisticsRepo: BiasImmunizationLogisticsRepository,
    private readonly targetsRepo: TargetsRepository,
    private readonly stockRepo: StockRepository,
    private readonly mpConfigRepo: MpConfigRepository
  ) {}

  async #getMaterialIds(
    c: Context,
    type: "primary" | "additional",
    category: "bias" | "non_bias",
    month?: "august" | "november"
  ): Promise<{
    materialIds: number[]
    codeToIdMap: Map<string, number>
    idToCodeMap: Map<number, string>
    idToNameMap: Map<number, string>
  }> {
    const materialTargets = await this.materialRepo.findMaterialsFromTargets(
      c,
      type,
      category,
      month
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
            return variant.map((v) => ({
              material_id: v.id,
              name: v.name,
            }))
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

  #extractSchoolGrades(countMap: Map<number, number>) {
    const targetGroupId11 = 10
    return {
      grade1: countMap.get(4) ?? 0,
      grade2: countMap.get(5) ?? 0,
      grade5Female: countMap.get(7) ?? 0,
      grade5Male: countMap.get(targetGroupId11) ?? 0,
    }
  }

  #buildTargetItems(
    c: Context,
    gradeCounts: {
      grade1: number
      grade2: number
      grade5Female: number
      grade5Male: number
    }
  ) {
    return [
      {
        id: 4,
        name: c.var.t("targets.school_target.4"),
        value: gradeCounts.grade1,
      },
      {
        id: 5,
        name: c.var.t("targets.school_target.5"),
        value: gradeCounts.grade2,
      },
      {
        id: 7,
        name: c.var.t("targets.school_target.7"),
        targets: [
          {
            name: c.var.t("bias_immunization_logistics.td_male_female"),
            value: gradeCounts.grade5Female + gradeCounts.grade5Male,
          },
          {
            name: c.var.t("bias_immunization_logistics.hpv_female"),
            value: gradeCounts.grade5Female,
          },
        ],
      },
    ]
  }

  #passesSchoolGenderFilter(targetGroupId: number, gender: number): boolean {
    if (FEMALE_ONLY_TARGET_GROUPS.includes(targetGroupId))
      return gender === GENDER_FEMALE
    if (MALE_ONLY_TARGET_GROUPS.includes(targetGroupId))
      return gender === GENDER_MALE
    return true
  }

  #isPromotedToTargetGroup(
    prevGroupId: number,
    matchedGroupId: number,
    targetGroupId: number
  ): boolean {
    const origIdx = TARGET_GROUP_ORDER.indexOf(prevGroupId)
    const queryIdx = TARGET_GROUP_ORDER.indexOf(targetGroupId)
    return queryIdx > origIdx && matchedGroupId === targetGroupId
  }

  #countPromotedInTargets(
    targets: Array<{ date_of_birth: string | null; gender: number | null }>,
    targetGroupId: number,
    prevGroupId: number,
    allTargetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    today: Date
  ): number {
    let count = 0
    for (const target of targets) {
      if (!target.date_of_birth || !target.gender) continue
      if (!this.#passesSchoolGenderFilter(targetGroupId, target.gender))
        continue
      const dob = doDecrypt(target.date_of_birth)
      const ageInDays = moment(today).diff(moment(dob), "days")
      if (ageInDays < 0) continue
      const matched = allTargetGroups.find(
        (tg) => ageInDays >= tg.age_min && ageInDays <= tg.age_max
      )
      if (
        matched &&
        this.#isPromotedToTargetGroup(prevGroupId, matched.id, targetGroupId)
      )
        count++
    }
    return count
  }

  async #getPromotedCountsForGroupBySchool(
    c: Context,
    schoolId: number,
    microplanningIds: number[],
    allTargetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    today: Date,
    targetGroupId: number
  ): Promise<number> {
    const idx = TARGET_GROUP_ORDER.indexOf(targetGroupId)
    if (idx <= 0) return 0

    const prevGroupIds = TARGET_GROUP_ORDER.slice(0, idx).filter((id) =>
      SCHOOL_TARGET_GROUPS.includes(id)
    )
    let count = 0
    for (const prevGroupId of prevGroupIds) {
      const targets =
        await this.targetsRepo.getTargetsWithDateOfBirthBySchoolId(
          c,
          schoolId,
          prevGroupId,
          microplanningIds
        )
      count += this.#countPromotedInTargets(
        targets,
        targetGroupId,
        prevGroupId,
        allTargetGroups,
        today
      )
    }
    return count
  }

  async #fetchCommonData(c: Context, schoolId: number, materialIds: number[]) {
    const {
      id: entityId,
      sub_district_id,
      name: entityName,
    } = c.var.userEntity ?? {}
    if (!entityId)
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))

    const microplanningId = c.var.microplanningId!

    const isOutOfSchool = schoolId === entityId

    const [materials, counts, schoolName, absoluteTarget] = await Promise.all([
      this.materialRepo.findWsMaterialsByIds(c, materialIds),
      isOutOfSchool
        ? this.biasRepo.getOutOfSchoolTargetCounts(
            c,
            Number(sub_district_id),
            SCHOOL_TARGET_GROUPS,
            microplanningId
          )
        : this.biasRepo.getTargetCountsByEntityId(
            c,
            schoolId,
            SCHOOL_TARGET_GROUPS,
            microplanningId
          ),
      isOutOfSchool
        ? Promise.resolve({ name: entityName })
        : this.biasRepo.getSchoolName(c, schoolId),
      isOutOfSchool
        ? this.targetsRepo.getAbsoluteTargetsBySubDistrict(
            c,
            Number(sub_district_id),
            SCHOOL_TARGET_GROUPS,
            microplanningId
          )
        : this.targetsRepo.getAbsoluteTargetsByReffId(
            c,
            schoolId,
            SCHOOL_TARGET_GROUPS,
            "school"
          ),
    ])

    const countMap = new Map(
      counts
        .filter((item) => item.target_group_id !== null)
        .map((item) => [item.target_group_id as number, Number(item.count)])
    )
    const gradeCounts = this.#extractSchoolGrades(countMap)

    const absoluteTargetMap = new Map(
      absoluteTarget
        .filter((item) => item.target_group_id !== null)
        .map((item) => [
          item.target_group_id as number,
          Math.abs(Number(item.count)),
        ])
    )
    const absoluteGradeCounts = this.#extractSchoolGrades(absoluteTargetMap)

    const mergedGradeCounts = {
      grade1: gradeCounts.grade1 + absoluteGradeCounts.grade1,
      grade2: gradeCounts.grade2 + absoluteGradeCounts.grade2,
      grade5Female: gradeCounts.grade5Female + absoluteGradeCounts.grade5Female,
      grade5Male: gradeCounts.grade5Male + absoluteGradeCounts.grade5Male,
    }

    return {
      entityId,
      microplanningId,
      materials,
      schoolName: schoolName?.name ?? entityName ?? "Unknown School",
      puskesmasId: entityId,
      puskesmasName: entityName ?? "",
      gradeCounts: mergedGradeCounts,
    }
  }

  #calculateVialNeeds(
    gradeCounts: {
      grade1: number
      grade2: number
      grade5Female: number
      grade5Male: number
    },
    utilizationRates: { id: number; value: number | null }[],
    materialKeyMap: Map<string, number>,
    variantParentMap: Map<number, number | null> = new Map()
  ): Map<number, VialNeedResult> {
    const parentIdToKey = buildParentIdToKeyMap(materialKeyMap)
    return calculateVialNeedsDynamic(
      BIAS_CALC_CONFIG,
      gradeCounts,
      utilizationRates,
      parentIdToKey,
      variantParentMap,
      {
        noBuffer: calcVialNeedNoBuffer,
        withBuffer: calcVialNeedNoBuffer,
        noTd: calcVialNeedNoBuffer,
      }
    )
  }

  #buildVialNeedsResponse(
    c,
    vialNeedsMap: Map<number, VialNeedResult>,
    stockData: Map<number, number>,
    materialIds: number[],
    idToNameMap: Map<number, string>,
    parentMap?: Map<number, number | null>
  ) {
    return materialIds.map((materialId) => {
      const vialNeed = vialNeedsMap.get(materialId)?.vialNeed ?? 0
      const availableStock = stockData.get(materialId) ?? 0
      const needsQty = vialNeed - availableStock

      return {
        id: materialId,
        name:
          idToNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        min_stock: null,
        max_stock: vialNeed,
        available_stock: availableStock,
        request_qty: needsQty,
        parent_id: parentMap?.get(materialId) ?? null,
      }
    })
  }

  #buildAdsSbNeeds(
    c: Context,
    vialNeedsMap: Map<number, VialNeedResult>,
    logisticIds: {
      ads5mlId: number
      ads05mlId: number
      sb25lId: number
      sb5lId: number
    },
    availableStock: {
      MR: number
      DT: number
      Td: number
      HPV: number
    },
    idToNameMap: Map<number, string>
  ) {
    const { getVialNeed } = aggregateByLogisticsGroup(
      vialNeedsMap,
      BIAS_CALC_CONFIG as Record<string, { logisticsGroup?: string }>
    )

    // Request qty = vialNeed - availableStock (per vaccine type)
    const needsQtyMR = getVialNeed("mr_aug") - availableStock.MR
    const needsQtyHPV = getVialNeed("hpv_aug") - availableStock.HPV
    const needsQtyDT = getVialNeed("dt_nov") - availableStock.DT
    const needsQtyTd = getVialNeed("td_nov") - availableStock.Td

    // Compute IP averages for each group
    const getAvgIp = (group: string): number => {
      const vn = aggregateByLogisticsGroup(
        vialNeedsMap,
        BIAS_CALC_CONFIG as Record<string, { logisticsGroup?: string }>
      )
      const totalVial = vn.getVialNeed(group)
      const totalDoses = vn.getDoses(group)
      return totalVial > 0 ? totalDoses / totalVial : 0
    }

    const augustADS5ML = Math.ceil(needsQtyMR)
    const augustADS05ML = Math.ceil(
      needsQtyMR * getAvgIp("mr_aug") + needsQtyHPV * getAvgIp("hpv_aug")
    )
    const augustSB25LTR = Math.ceil(
      (augustADS5ML + augustADS05ML) / PERCENTAGE_50
    )
    const augustSB5LTR = Math.ceil(
      (augustADS5ML + augustADS05ML) / PERCENTAGE_100
    )

    const novemberADS05ML = Math.ceil(
      needsQtyDT * getAvgIp("dt_nov") + needsQtyTd * getAvgIp("td_nov")
    )
    const novemberSB25LTR = Math.ceil(novemberADS05ML / PERCENTAGE_50)
    const novemberSB5LTR = Math.ceil(novemberADS05ML / PERCENTAGE_100)

    return [
      {
        label: c.var.t("target_estimation.august"),
        targets: [
          {
            id: logisticIds.ads5mlId,
            name: idToNameMap.get(logisticIds.ads5mlId) ?? "ADS 5 ML",
            value: augustADS5ML,
          },
          {
            id: logisticIds.ads05mlId,
            name: idToNameMap.get(logisticIds.ads05mlId) ?? "ADS 0.5 ML",
            value: augustADS05ML,
          },
          {
            id: logisticIds.sb25lId,
            name: idToNameMap.get(logisticIds.sb25lId) ?? "SB 2.5 Ltr",
            value: augustSB25LTR,
          },
          {
            id: logisticIds.sb5lId,
            name: idToNameMap.get(logisticIds.sb5lId) ?? "SB 5 Ltr",
            value: augustSB5LTR,
          },
        ],
      },
      {
        label: c.var.t("target_estimation.november"),
        targets: [
          {
            id: logisticIds.ads05mlId,
            name: idToNameMap.get(logisticIds.ads05mlId) ?? "ADS 0.5 ML",
            value: novemberADS05ML,
          },
          {
            id: logisticIds.sb25lId,
            name: idToNameMap.get(logisticIds.sb25lId) ?? "SB 2.5 Ltr",
            value: novemberSB25LTR,
          },
          {
            id: logisticIds.sb5lId,
            name: idToNameMap.get(logisticIds.sb5lId) ?? "SB 5 Ltr",
            value: novemberSB5LTR,
          },
        ],
      },
    ]
  }

  #buildResponse(
    c: Context,
    locationData: {
      schoolId: number
      schoolName: string
      puskesmasId: number
      puskesmasName: string
    },
    immunizationData: {
      absoluteImmunization: {
        id: number
        name: string
        value: number | null
        parent_id?: number | null
      }[]
      targets: any[]
      vialsUsed: {
        id: number
        name: string
        value: number | null
        parent_id?: number | null
      }[]
      utilizationRate: {
        id: number
        name: string
        value: number | null
        parent_id?: number | null
      }[]
    },
    needsData: {
      vialNeeds: any[]
      adsSbNeeds: any[]
    }
  ): SaveImmunizationDataResponse {
    return {
      school_id: locationData.schoolId,
      school_name: locationData.schoolName,
      puskesmas_id: locationData.puskesmasId,
      puskesmas_name: locationData.puskesmasName,
      number_of_immunization: {
        title: c.var.t(
          "bias_immunization_logistics.number_of_immunization_title"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: immunizationData.absoluteImmunization,
      },
      number_of_target: {
        title: c.var.t("bias_immunization_logistics.number_of_target_title"),
        name_label: c.var.t("bias_immunization_logistics.target"),
        value_label: c.var.t("bias_immunization_logistics.target_value"),
        items: immunizationData.targets,
      },
      vaccine_vials_used: {
        title: c.var.t("bias_immunization_logistics.vaccine_vials_used_title"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_vials"),
        items: immunizationData.vialsUsed,
      },
      vaccine_utilization_rate: {
        title: c.var.t(
          "bias_immunization_logistics.vaccine_utilization_rate_title"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: immunizationData.utilizationRate,
      },
      vial_needs: {
        title: c.var.t("bias_immunization_logistics.vial_needs_title"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: needsData.vialNeeds,
      },
      ads_sb_needs: {
        title: c.var.t("bias_immunization_logistics.ads_sb_needs_title"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: needsData.adsSbNeeds,
      },
    }
  }

  #getBiasIds(materialKeyMap: Map<string, number>) {
    return resolveBiasMaterialIds(materialKeyMap)
  }

  #getLogisticsIds(materialKeyMap: Map<string, number>) {
    return resolveLogisticsIds(materialKeyMap)
  }

  async #fetchMaterialTargetMaps(
    c: Context,
    primaryMaterialIds: number[],
    augustMaterialIds: number[],
    novemberMaterialIds: number[]
  ) {
    const [
      primaryAugustTargets,
      primaryNovemberTargets,
      augustAdditionalTargets,
      novemberAdditionalTargets,
    ] = await Promise.all([
      primaryMaterialIds.length > 0
        ? this.materialTargetsRepo.getMpMaterialTargetsByMaterialIdsAndMonth(
            c,
            primaryMaterialIds,
            "bias",
            "august"
          )
        : Promise.resolve([]),
      primaryMaterialIds.length > 0
        ? this.materialTargetsRepo.getMpMaterialTargetsByMaterialIdsAndMonth(
            c,
            primaryMaterialIds,
            "bias",
            "november"
          )
        : Promise.resolve([]),
      augustMaterialIds.length > 0
        ? this.materialTargetsRepo.getMaterialTargetsByMaterialIdsAndMonth(
            c,
            augustMaterialIds,
            "bias",
            "additional",
            "august"
          )
        : Promise.resolve([]),
      novemberMaterialIds.length > 0
        ? this.materialTargetsRepo.getMaterialTargetsByMaterialIdsAndMonth(
            c,
            novemberMaterialIds,
            "bias",
            "additional",
            "november"
          )
        : Promise.resolve([]),
    ])

    return {
      primaryAugustTargetMap: new Map(
        primaryAugustTargets.map((t) => [t.material_id, t.id])
      ),
      primaryNovemberTargetMap: new Map(
        primaryNovemberTargets.map((t) => [t.material_id, t.id])
      ),
      augustAdditionalTargetMap: new Map(
        augustAdditionalTargets.map((t) => [t.material_id, t.id])
      ),
      novemberAdditionalTargetMap: new Map(
        novemberAdditionalTargets.map((t) => [t.material_id, t.id])
      ),
    }
  }

  #extractMaterialIdsFromBody(
    c: Context,
    body: SaveBiasImmunizationLogisticsDTO | UpdateBiasImmunizationLogisticsDTO
  ) {
    const primaryMaterialIds = body.vial_needs.items.map((item) => item.id)
    const primaryParentIds = body.vial_needs.items
      .map((item) => item.parent_id)
      .filter((id): id is number => id != null)
    const allPrimaryMaterialIds = [
      ...new Set([...primaryMaterialIds, ...primaryParentIds]),
    ]

    const augustMaterialIds =
      body.ads_sb_needs.items
        .find(
          (m) =>
            m.label.toLowerCase() ===
            c.var.t("target_estimation.august").toLowerCase()
        )
        ?.targets.map((item) => item.id) ?? []
    const novemberMaterialIds =
      body.ads_sb_needs.items
        .find(
          (m) =>
            m.label.toLowerCase() ===
            c.var.t("target_estimation.november").toLowerCase()
        )
        ?.targets.map((item) => item.id) ?? []

    return {
      primaryMaterialIds,
      allPrimaryMaterialIds,
      augustMaterialIds,
      novemberMaterialIds,
    }
  }

  async #saveVialNeedsForMonth(
    c: Context,
    materialTargetId: number,
    materialId: number,
    microplanningId: number,
    schoolId: number,
    vialData: {
      planningDetail: number | null
      availableStockDetail: number | null
      needsQtyDetail: number | null
      absoluteImmunizationValue: number | null
      vialsUsedValue: number | null
      utilizationRateValue: number | null
    }
  ) {
    const materialNeed = await this.logisticsRepo.saveMaterialNeed(c, {
      material_target_id: materialTargetId,
      material_id: materialId,
      microplanning_id: microplanningId,
      reference_type: "school",
      reference_id: schoolId,
      total_needs: vialData.planningDetail,
    })

    await this.logisticsRepo.saveMaterialNeedDetail(c, {
      material_need_id: materialNeed.id,
      absolute_number_of_routine_immunization:
        vialData.absoluteImmunizationValue,
      number_of_vials_used: vialData.vialsUsedValue,
      remaining_stock: vialData.availableStockDetail,
    })

    await this.logisticsRepo.saveMonthlyVaccineNeedDetail(c, {
      material_need_id: materialNeed.id,
      request_qty: vialData.needsQtyDetail,
    })

    if (
      vialData.utilizationRateValue !== null &&
      vialData.utilizationRateValue !== undefined
    ) {
      await this.logisticsRepo.saveVaccineUtilizationRate(c, {
        material_need_id: materialNeed.id,
        vaccine_utilization_rate: vialData.utilizationRateValue,
      })
    }
  }

  async #updateVialNeedsForMonth(
    c: Context,
    materialNeedId: number,
    vialData: {
      planningDetail: number | null
      availableStockDetail: number | null
      needsQtyDetail: number | null
      absoluteImmunizationValue: number | null
      vialsUsedValue: number | null
      utilizationRateValue: number | null
    }
  ) {
    await this.logisticsRepo.updateMaterialNeed(
      c,
      materialNeedId,
      vialData.planningDetail
    )

    await this.logisticsRepo.updateMaterialNeedDetail(c, materialNeedId, {
      absolute_number_of_routine_immunization:
        vialData.absoluteImmunizationValue,
      number_of_vials_used: vialData.vialsUsedValue,
      remaining_stock: vialData.availableStockDetail,
    })

    await this.logisticsRepo.updateMonthlyVaccineNeedDetail(c, materialNeedId, {
      request_qty: vialData.needsQtyDetail,
    })

    if (
      vialData.utilizationRateValue !== null &&
      vialData.utilizationRateValue !== undefined
    ) {
      await this.logisticsRepo.updateVaccineUtilizationRate(
        c,
        materialNeedId,
        vialData.utilizationRateValue
      )
    }
  }

  #extractVialDataFromBody(
    body: SaveBiasImmunizationLogisticsDTO | UpdateBiasImmunizationLogisticsDTO,
    vialNeedItem: {
      id: number
      max_stock: number | null
      available_stock: number | null
      request_qty: number | null
    }
  ) {
    return {
      planningDetail: vialNeedItem.max_stock ?? null,
      availableStockDetail: vialNeedItem.available_stock ?? null,
      needsQtyDetail: vialNeedItem.request_qty ?? null,
      absoluteImmunizationValue:
        body.number_of_immunization.items.find((i) => i.id === vialNeedItem.id)
          ?.value ?? null,
      vialsUsedValue:
        body.vaccine_vials_used.items.find((i) => i.id === vialNeedItem.id)
          ?.value ?? null,
      utilizationRateValue:
        body.vaccine_utilization_rate.items.find(
          (i) => i.id === vialNeedItem.id
        )?.value ?? null,
    }
  }

  async #processAdsSbNeedsForSave(
    c: Context,
    body: SaveBiasImmunizationLogisticsDTO,
    microplanningId: number,
    schoolId: number,
    augustAdditionalTargetMap: Map<number, number>,
    novemberAdditionalTargetMap: Map<number, number>
  ) {
    for (const monthData of body.ads_sb_needs.items) {
      const month = monthData.label.toLowerCase()
      const targetMap =
        month === c.var.t("target_estimation.august").toLowerCase()
          ? augustAdditionalTargetMap
          : novemberAdditionalTargetMap

      for (const item of monthData.targets) {
        const materialTargetId = targetMap.get(item.id)
        if (!materialTargetId) continue

        const materialNeed = await this.logisticsRepo.saveMaterialNeed(c, {
          material_target_id: materialTargetId,
          material_id: item.id,
          microplanning_id: microplanningId,
          reference_type: "school",
          reference_id: schoolId,
          total_needs: null,
        })

        await this.logisticsRepo.saveAdditionalNeed(c, {
          material_need_id: materialNeed.id,
          material_target_id: materialTargetId,
          total: item.value ?? null,
        })
      }
    }
  }

  async #processAdsSbNeedsForUpdate(
    c: Context,
    body: UpdateBiasImmunizationLogisticsDTO,
    existingDataMap: Map<string, number>,
    augustAdditionalTargetMap: Map<number, number>,
    novemberAdditionalTargetMap: Map<number, number>
  ) {
    for (const monthData of body.ads_sb_needs.items) {
      const month = monthData.label.toLowerCase()
      const targetMap =
        month === c.var.t("target_estimation.august").toLowerCase()
          ? augustAdditionalTargetMap
          : novemberAdditionalTargetMap

      for (const item of monthData.targets) {
        const materialTargetId = targetMap.get(item.id)
        if (!materialTargetId) continue

        const materialNeedId = existingDataMap.get(
          `${item.id}:${materialTargetId}`
        )
        if (!materialNeedId) continue

        await this.logisticsRepo.updateAdditionalNeed(c, materialNeedId, {
          total: item.value ?? null,
        })
      }
    }
  }

  async getCalculateDetail(
    c: Context,
    query: BiasCalculateDetailQueryDTO
  ): Promise<BiasCalculateDetailResponse> {
    const {
      id: entityId,
      sub_district_id,
      name: entityName,
    } = c.var.userEntity ?? {}
    if (!entityId)
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!
    const currentYear = nextYear - 1

    const [
      logisticMaterialsAugust,
      logisticMaterialsNovember,
      mpProgramConfigId,
    ] = await Promise.all([
      this.#getMaterialIds(c, "additional", "bias", "august"),
      this.#getMaterialIds(c, "additional", "bias", "november"),
      this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias"),
    ])

    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []

    // Fallback ke ws_material_targets jika ws_mp_* belum dikonfigurasi untuk tahun ini
    const primaryMaterials =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(c, "primary", "bias")

    // Material list + parent_id langsung dari ws_mp_material_target_config (via ws_materials.parent_id)
    // Tidak perlu findMaterialChildrenByName lagi
    const primaryMaterialNameMap = new Map<number, string>(
      primaryMaterials.map((m) => [Number(m.material_id), m.name])
    )
    const primaryMaterialParentMap = new Map<number, number>(
      primaryMaterials
        .filter((m) => "parent_id" in m && m.parent_id != null)
        .map((m) => [Number(m.material_id), Number(m.parent_id)])
    )
    const primaryMaterialIds = primaryMaterials.map((m) =>
      Number(m.material_id)
    )

    const isOutOfSchool = query.school_id === entityId

    const [counts, schoolName, existingData, existingAdsData, absoluteTarget] =
      await Promise.all([
        isOutOfSchool
          ? this.biasRepo.getOutOfSchoolTargetCounts(
              c,
              Number(sub_district_id),
              SCHOOL_TARGET_GROUPS,
              microplanningId
            )
          : this.biasRepo.getTargetCountsByEntityId(
              c,
              query.school_id,
              SCHOOL_TARGET_GROUPS,
              microplanningId
            ),
        isOutOfSchool
          ? Promise.resolve({ name: entityName })
          : this.biasRepo.getSchoolName(c, query.school_id),
        this.logisticsRepo.getExistingMaterialNeeds(
          c,
          query.school_id,
          "school",
          microplanningId,
          mpProgramConfigId
        ),
        this.logisticsRepo.getExistingMaterialAds(
          c,
          query.school_id,
          "school",
          microplanningId
        ),
        isOutOfSchool
          ? this.targetsRepo.getAbsoluteTargetsBySubDistrict(
              c,
              Number(sub_district_id),
              SCHOOL_TARGET_GROUPS,
              microplanningId
            )
          : this.targetsRepo.getAbsoluteTargetsByReffId(
              c,
              query.school_id,
              SCHOOL_TARGET_GROUPS,
              "school"
            ),
      ])

    const countMap = new Map(
      counts
        .filter((item) => item.target_group_id !== null)
        .map((item) => [item.target_group_id as number, Number(item.count)])
    )
    const gradeCounts = this.#extractSchoolGrades(countMap)

    const absoluteTargetMap = new Map(
      absoluteTarget
        .filter((item) => item.target_group_id !== null)
        .map((item) => [
          item.target_group_id as number,
          Math.abs(Number(item.count)),
        ])
    )
    const absoluteGradeCounts = this.#extractSchoolGrades(absoluteTargetMap)

    const mergedGradeCounts = {
      grade1: gradeCounts.grade1 + absoluteGradeCounts.grade1,
      grade2: gradeCounts.grade2 + absoluteGradeCounts.grade2,
      grade5Female: gradeCounts.grade5Female + absoluteGradeCounts.grade5Female,
      grade5Male: gradeCounts.grade5Male + absoluteGradeCounts.grade5Male,
    }

    const targets = this.#buildTargetItems(c, mergedGradeCounts)

    const existingDataMap = new Map(
      existingData.map((item) => [item.material_id, item])
    )

    const hasTotalNeeds = existingData.some(
      (item) => item.total_needs !== null && Number(item.total_needs) > 0
    )

    const lastYearAbsoluteMap = new Map<number, number>()
    if (!hasTotalNeeds) {
      const lastYearData =
        await this.logisticsRepo.getLastYearAbsoluteImmunization(
          c,
          query.school_id,
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

    const biasParentIdToKey = mpProgramConfigId
      ? buildParentIdToKeyMap(
          await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigId)
        )
      : new Map<number, string>()

    // primaryMaterialIds sudah ter-filter per provinsi (dari ws_mp_*) atau semua (fallback)
    const activePrimaryMaterialIds = primaryMaterialIds

    const immunizations = activePrimaryMaterialIds.map((materialId) => {
      const parentId = primaryMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)

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
          primaryMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: value,
        parent_id: parentId ?? null,
      }
    })

    const vialsUsed = activePrimaryMaterialIds.map((materialId) => {
      const parentId = primaryMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          primaryMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.number_of_vials_used ?? null,
        parent_id: parentId ?? null,
      }
    })

    const utilizationRate = primaryMaterialIds.map((materialId) => {
      const parentId = primaryMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)
      return {
        id: materialId,
        name:
          primaryMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        value: existing?.vaccine_utilization_rate ?? null,
        parent_id: parentId ?? null,
      }
    })

    const vialNeeds = activePrimaryMaterialIds.map((materialId) => {
      const parentId = primaryMaterialParentMap.get(materialId)
      const existing =
        existingDataMap.get(materialId) ??
        (parentId ? existingDataMap.get(parentId) : undefined)

      if (
        existing &&
        existing.number_of_vials_used !== null &&
        existing.number_of_vials_used !== undefined
      ) {
        return {
          id: materialId,
          name:
            primaryMaterialNameMap.get(materialId) ??
            c.var.t("immunization_logistics.unknown"),
          min_stock: null,
          max_stock: existing.total_needs,
          available_stock: existing.detail_remaining_stock ?? null,
          request_qty:
            (existing.total_needs ?? 0) -
            (existing.detail_remaining_stock ?? 0),
          parent_id: parentId ?? null,
        }
      }

      return {
        id: materialId,
        name:
          primaryMaterialNameMap.get(materialId) ??
          c.var.t("immunization_logistics.unknown"),
        min_stock: null,
        max_stock: null,
        available_stock: null,
        request_qty: null,
        parent_id: parentId ?? null,
      }
    })

    const augustData = existingAdsData.filter(
      (item) => item.type === "additional" && item.injection_month === "august"
    )
    const novemberData = existingAdsData.filter(
      (item) =>
        item.type === "additional" && item.injection_month === "november"
    )

    const adsSbNeeds =
      augustData.length > 0 || novemberData.length > 0
        ? [
            {
              label: c.var.t("target_estimation.august"),
              targets: logisticMaterialsAugust.materialIds.map((materialId) => {
                const existing = augustData.find(
                  (item) => item.material_id === materialId
                )
                return {
                  id: materialId,
                  name:
                    logisticMaterialsAugust.idToNameMap.get(materialId) ??
                    c.var.t("immunization_logistics.unknown"),
                  value: existing?.additional_total ?? null,
                }
              }),
            },
            {
              label: c.var.t("target_estimation.november"),
              targets: logisticMaterialsNovember.materialIds.map(
                (materialId) => {
                  const existing = novemberData.find(
                    (item) => item.material_id === materialId
                  )
                  return {
                    id: materialId,
                    name:
                      logisticMaterialsNovember.idToNameMap.get(materialId) ??
                      c.var.t("immunization_logistics.unknown"),
                    value: existing?.additional_total ?? null,
                  }
                }
              ),
            },
          ]
        : [
            {
              label: c.var.t("target_estimation.august"),
              targets: logisticMaterialsAugust.materialIds.map((materialId) => {
                return {
                  id: materialId,
                  name:
                    logisticMaterialsAugust.idToNameMap.get(materialId) ??
                    c.var.t("immunization_logistics.unknown"),
                  value: null,
                }
              }),
            },
            {
              label: c.var.t("target_estimation.november"),
              targets: logisticMaterialsNovember.materialIds.map(
                (materialId) => {
                  return {
                    id: materialId,
                    name:
                      logisticMaterialsNovember.idToNameMap.get(materialId) ??
                      c.var.t("immunization_logistics.unknown"),
                    value: null,
                  }
                }
              ),
            },
          ]

    return {
      school_id: query.school_id,
      school_name:
        schoolName?.name ?? c.var.userEntity?.name ?? "Unknown School",
      puskesmas_id: c.var.userEntity?.id ?? 0,
      puskesmas_name: c.var.userEntity?.name ?? "",
      number_of_immunization: {
        title: c.var.t(
          "bias_immunization_logistics.number_of_immunization_title"
        ),
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
        title: c.var.t("bias_immunization_logistics.vaccine_vials_used_title"),
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
      vial_needs: {
        title: c.var.t("bias_immunization_logistics.vial_needs_title"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: vialNeeds,
      },
      ads_sb_needs: {
        title: c.var.t("bias_immunization_logistics.ads_sb_needs_title"),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.number_of_doses"),
        items: adsSbNeeds,
      },
    }
  }

  async saveImmunizationData(
    c: Context,
    body: SaveImmunizationAchievementDTO
  ): Promise<SaveImmunizationDataResponse> {
    const bodyMaterialIds = body.items.map((val) => val.id)
    const bodyItemsMap = new Map(
      body.items.map((val) => [val.id, val.value ?? 0])
    )
    const bodyItemsParentMap = new Map(
      body.items.map((val) => [val.id, val.parent_id])
    )

    const logisticMaterials = await this.#getMaterialIds(
      c,
      "additional",
      "bias"
    )

    const nextYear = c.var.microplanningYear!
    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const additionalKeyMap =
      await this.materialRepo.getAdditionalMaterialKeyMap(c, "bias")
    for (const [key, id] of additionalKeyMap) {
      if (!materialKeyMap.has(key)) {
        materialKeyMap.set(key, id)
      }
    }

    const { mrId, dtId, tdId, hpvId } = this.#getBiasIds(materialKeyMap)
    const { ads5mlId, ads05mlId, sb25lId, sb5lId } =
      this.#getLogisticsIds(materialKeyMap)
    const logisticIds = { ads5mlId, ads05mlId, sb25lId, sb5lId }

    const commonData = await this.#fetchCommonData(
      c,
      body.school_id,
      bodyMaterialIds
    )

    const materialMap = new Map(commonData.materials.map((m) => [m.id, m]))
    const idToNameMap = new Map(commonData.materials.map((m) => [m.id, m.name]))

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

    const availableStock = {
      MR: stockMap.get(mrId) ?? 0,
      DT: stockMap.get(dtId) ?? 0,
      Td: stockMap.get(tdId) ?? 0,
      HPV: stockMap.get(hpvId) ?? 0,
    }

    const absoluteImmunization = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: bodyItemsMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    const targets = this.#buildTargetItems(c, commonData.gradeCounts)

    const vialsUsed = bodyMaterialIds.map((materialId) => {
      const inputValue = bodyItemsMap.get(materialId) ?? 0
      const material = materialMap.get(materialId)
      const consumptionUnit =
        material?.consumption_unit_per_distribution_unit ?? 1
      const calculatedValue =
        inputValue > 0 ? Math.ceil(inputValue / consumptionUnit) : 0

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
      const rate = vialUsed > 0 ? Math.ceil(safeDiv(absolute, vialUsed)) : 0

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
      commonData.gradeCounts,
      utilizationRate,
      materialKeyMap
    )
    const vialNeedsItems = this.#buildVialNeedsResponse(
      c,
      vialNeedsCalculated,
      stockMap,
      bodyMaterialIds,
      idToNameMap,
      bodyItemsParentMap
    )
    const adsSbNeeds = this.#buildAdsSbNeeds(
      c,
      vialNeedsCalculated,
      logisticIds,
      availableStock,
      logisticMaterials.idToNameMap
    )

    return this.#buildResponse(
      c,
      {
        schoolId: body.school_id,
        schoolName: commonData.schoolName,
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
        vialNeeds: vialNeedsItems,
        adsSbNeeds,
      }
    )
  }

  async recalculateEstimation(
    c: Context,
    body: RecalculateEstimationDTO
  ): Promise<RecalculateEstimationResponse> {
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

    const logisticMaterials = await this.#getMaterialIds(
      c,
      "additional",
      "bias"
    )

    const nextYear = c.var.microplanningYear!
    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const { mrId, dtId, tdId, hpvId } = this.#getBiasIds(materialKeyMap)
    const { ads5mlId, ads05mlId, sb25lId, sb5lId } =
      this.#getLogisticsIds(materialKeyMap)
    const logisticIds = { ads5mlId, ads05mlId, sb25lId, sb5lId }

    const commonData = await this.#fetchCommonData(
      c,
      body.school_id,
      bodyMaterialIds
    )

    const materialMap = new Map(commonData.materials.map((m) => [m.id, m]))
    const idToNameMap = new Map(commonData.materials.map((m) => [m.id, m.name]))

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

    const availableStock = {
      MR: stockMap.get(mrId) ?? 0,
      DT: stockMap.get(dtId) ?? 0,
      Td: stockMap.get(tdId) ?? 0,
      HPV: stockMap.get(hpvId) ?? 0,
    }

    const absoluteImmunization = bodyMaterialIds.map((materialId) => ({
      id: materialId,
      name:
        materialMap.get(materialId)?.name ??
        c.var.t("immunization_logistics.unknown"),
      value: bodyItemsMap.get(materialId) ?? 0,
      parent_id: bodyItemsParentMap.get(materialId) ?? null,
    }))

    const targets = this.#buildTargetItems(c, commonData.gradeCounts)

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
        vialUsed > 0
          ? Math.ceil(safeDiv(absolute, vialUsed) * PERCENTAGE_100) /
            PERCENTAGE_100
          : 0

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
      commonData.gradeCounts,
      utilizationRate,
      materialKeyMap
    )
    const vialNeedsItems = this.#buildVialNeedsResponse(
      c,
      vialNeedsCalculated,
      stockMap,
      bodyMaterialIds,
      idToNameMap,
      bodyItemsParentMap
    )
    const adsSbNeeds = this.#buildAdsSbNeeds(
      c,
      vialNeedsCalculated,
      logisticIds,
      availableStock,
      logisticMaterials.idToNameMap
    )

    return this.#buildResponse(
      c,
      {
        schoolId: body.school_id,
        schoolName: commonData.schoolName,
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
        vialNeeds: vialNeedsItems,
        adsSbNeeds,
      }
    )
  }

  async recalculateIpRate(
    c: Context,
    body: RecalculateIpRateDTO
  ): Promise<RecalculateIpRateResponse> {
    // Validasi entity
    const { id: entityId } = c.var.userEntity ?? {}
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    // Get material IDs dari body
    const materialIds = body.items.map((item) => item.id)

    // Fetch materials data untuk mendapatkan nama
    const materials = await this.materialRepo.findWsMaterialsByIds(
      c,
      materialIds
    )
    const materialMap = new Map(materials.map((m) => [m.id, m]))

    // Get school name
    const isOutOfSchool = body.school_id === entityId
    let schoolName: string

    if (isOutOfSchool) {
      schoolName = c.var.t("bias_immunization_logistics.out_of_school")
    } else {
      const schoolData = await this.biasRepo.getSchoolById(c, body.school_id)
      schoolName =
        schoolData?.school_name ?? c.var.t("immunization_logistics.unknown")
    }

    // Calculate IP for each material
    const utilizationRateItems = body.items.map((item) => {
      const absoluteImmunization = item.absolute_immunization
      const vialsUsed = item.vials_used

      // Calculate IP: Math.ceil(absolute / vials_used)
      const ipRate =
        vialsUsed > 0 ? Math.ceil(safeDiv(absoluteImmunization, vialsUsed)) : 0

      return {
        id: item.id,
        name:
          materialMap.get(item.id)?.name ??
          c.var.t("immunization_logistics.unknown"),
        value: ipRate,
        parent_id: null,
      }
    })

    return {
      school_id: body.school_id,
      school_name: schoolName,
      vaccine_utilization_rate: {
        title: c.var.t(
          "bias_immunization_logistics.vaccine_utilization_rate_title"
        ),
        name_label: c.var.t("bias_immunization_logistics.material_name"),
        value_label: c.var.t("bias_immunization_logistics.dose_count"),
        items: utilizationRateItems,
      },
    }
  }

  #determineCalculationMode(body: RecalculateFullDTO): "calculate" | "manual" {
    const hasManualIP =
      body.vaccine_utilization_rate && body.vaccine_utilization_rate.length > 0
    const hasAbsolute =
      body.absolute_immunization && body.absolute_immunization.length > 0
    const hasVials = body.vials_used && body.vials_used.length > 0

    // Priority 1: Manual IP rate (if provided)
    if (hasManualIP) {
      return "manual"
    }

    // Priority 2: Calculate from absolute + vials
    if (hasAbsolute && hasVials) {
      return "calculate"
    }

    // Validation: Must provide one mode
    throw new ValidationError(
      "Must provide either vaccine_utilization_rate OR (absolute_immunization + vials_used)"
    )
  }

  async recalculateFull(
    c: Context,
    body: RecalculateFullDTO
  ): Promise<RecalculateFullResponse> {
    // 1. Validate entity
    const { id: entityId } = c.var.userEntity ?? {}
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    // 2. Determine mode
    const mode = this.#determineCalculationMode(body)

    // 3. Extract material IDs and parent map
    const bodyMaterialIds = body.items.map((v) => v.id)
    const bodyItemsParentMap = new Map(
      body.items.map((v) => [v.id, v.parent_id])
    )

    // 4. Fetch materials and logistics IDs
    const logisticMaterials = await this.#getMaterialIds(
      c,
      "additional",
      "bias"
    )

    const nextYear = c.var.microplanningYear!
    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const { mrId, dtId, tdId, hpvId } = this.#getBiasIds(materialKeyMap)
    const { ads5mlId, ads05mlId, sb25lId, sb5lId } =
      this.#getLogisticsIds(materialKeyMap)
    const logisticIds = { ads5mlId, ads05mlId, sb25lId, sb5lId }

    // 5. Fetch common data (targets, materials, etc.)
    const commonData = await this.#fetchCommonData(
      c,
      body.school_id,
      bodyMaterialIds
    )
    const materialMap = new Map(commonData.materials.map((m) => [m.id, m]))
    const idToNameMap = new Map(commonData.materials.map((m) => [m.id, m.name]))

    // 6. Fetch stock data
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

    const availableStock = {
      MR: stockMap.get(mrId) ?? 0,
      DT: stockMap.get(dtId) ?? 0,
      Td: stockMap.get(tdId) ?? 0,
      HPV: stockMap.get(hpvId) ?? 0,
    }

    // 7. Build sections based on mode
    let absoluteImmunization: GlobalSummary[]
    let vialsUsed: GlobalSummary[]
    let utilizationRate: GlobalSummary[]

    if (mode === "calculate") {
      // Calculate mode: use provided absolute + vials
      const absoluteMap = new Map(
        (body.absolute_immunization ?? []).map((v) => [v.id, v.value])
      )
      const vialsMap = new Map(
        (body.vials_used ?? []).map((v) => [v.id, v.value])
      )

      absoluteImmunization = bodyMaterialIds.map((materialId) => {
        const parentId = bodyItemsParentMap.get(materialId) ?? null
        return {
          id: materialId,
          name:
            materialMap.get(materialId)?.name ??
            c.var.t("immunization_logistics.unknown"),
          value: absoluteMap.get(materialId) ?? 0,
          parent_id: parentId,
        }
      })

      vialsUsed = bodyMaterialIds.map((materialId) => {
        const parentId = bodyItemsParentMap.get(materialId) ?? null
        return {
          id: materialId,
          name:
            materialMap.get(materialId)?.name ??
            c.var.t("immunization_logistics.unknown"),
          value: vialsMap.get(materialId) ?? 0,
          parent_id: parentId,
        }
      })

      // Calculate IP rate
      utilizationRate = bodyMaterialIds.map((materialId) => {
        const absolute = absoluteMap.get(materialId) ?? 0
        const vialUsed = vialsMap.get(materialId) ?? 0
        const rate = vialUsed > 0 ? Math.ceil(safeDiv(absolute, vialUsed)) : 0
        const parentId = bodyItemsParentMap.get(materialId) ?? null

        return {
          id: materialId,
          name:
            materialMap.get(materialId)?.name ??
            c.var.t("immunization_logistics.unknown"),
          value: rate,
          parent_id: parentId,
        }
      })
    } else {
      // Manual mode: use provided IP rates
      const manualIPMap = new Map(
        (body.vaccine_utilization_rate ?? []).map((v) => [v.id, v.value])
      )
      const absoluteMap = new Map(
        (body.absolute_immunization ?? []).map((v) => [v.id, v.value])
      )
      const vialsMap = new Map(
        (body.vials_used ?? []).map((v) => [v.id, v.value])
      )

      // Use provided values or 0
      absoluteImmunization = bodyMaterialIds.map((materialId) => {
        const parentId = bodyItemsParentMap.get(materialId) ?? null
        return {
          id: materialId,
          name:
            materialMap.get(materialId)?.name ??
            c.var.t("immunization_logistics.unknown"),
          value: absoluteMap.get(materialId) ?? 0,
          parent_id: parentId,
        }
      })

      vialsUsed = bodyMaterialIds.map((materialId) => {
        const parentId = bodyItemsParentMap.get(materialId) ?? null
        return {
          id: materialId,
          name:
            materialMap.get(materialId)?.name ??
            c.var.t("immunization_logistics.unknown"),
          value: vialsMap.get(materialId) ?? 0,
          parent_id: parentId,
        }
      })

      // Use manual IP rates
      utilizationRate = bodyMaterialIds.map((materialId) => {
        const parentId = bodyItemsParentMap.get(materialId) ?? null
        return {
          id: materialId,
          name:
            materialMap.get(materialId)?.name ??
            c.var.t("immunization_logistics.unknown"),
          value: manualIPMap.get(materialId) ?? 0,
          parent_id: parentId,
        }
      })
    }

    // 8. Build targets
    const targets = this.#buildTargetItems(c, commonData.gradeCounts)

    // 9. Calculate vial needs from IP rates
    const vialNeedsCalculated = this.#calculateVialNeeds(
      commonData.gradeCounts,
      utilizationRate,
      materialKeyMap
    )

    const vialNeedsItems = this.#buildVialNeedsResponse(
      c,
      vialNeedsCalculated,
      stockMap,
      bodyMaterialIds,
      idToNameMap,
      bodyItemsParentMap
    )

    // 10. Calculate ADS/SB needs
    const adsSbNeeds = this.#buildAdsSbNeeds(
      c,
      vialNeedsCalculated,
      logisticIds,
      availableStock,
      logisticMaterials.idToNameMap
    )

    // 11. Build full response
    return this.#buildResponse(
      c,
      {
        schoolId: body.school_id,
        schoolName: commonData.schoolName,
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
        vialNeeds: vialNeedsItems,
        adsSbNeeds,
      }
    )
  }

  async saveBiasImmunizationLogistics(
    c: Context,
    body: SaveBiasImmunizationLogisticsDTO
  ) {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const { allPrimaryMaterialIds, augustMaterialIds, novemberMaterialIds } =
      this.#extractMaterialIdsFromBody(c, body)

    const {
      primaryAugustTargetMap,
      primaryNovemberTargetMap,
      augustAdditionalTargetMap,
      novemberAdditionalTargetMap,
    } = await this.#fetchMaterialTargetMaps(
      c,
      allPrimaryMaterialIds,
      augustMaterialIds,
      novemberMaterialIds
    )

    const allTargetIds = [
      ...primaryAugustTargetMap.values(),
      ...primaryNovemberTargetMap.values(),
      ...augustAdditionalTargetMap.values(),
      ...novemberAdditionalTargetMap.values(),
    ]

    const existingData = await this.logisticsRepo.checkExistingData(
      c,
      body.school_id,
      "school",
      microplanningId,
      allTargetIds
    )

    if (existingData.length > 0) {
      throw new ValidationError(
        c.var.t("bias_immunization_logistics.data_already_exists", {
          school_id: body.school_id,
          year: nextYear,
        })
      )
    }

    await this.#processVialNeedsForSave(
      c,
      body,
      microplanningId,
      primaryAugustTargetMap,
      primaryNovemberTargetMap
    )
    await this.#processAdsSbNeedsForSave(
      c,
      body,
      microplanningId,
      body.school_id,
      augustAdditionalTargetMap,
      novemberAdditionalTargetMap
    )

    return {
      success: true,
      message: c.var.t("bias_immunization_logistics.save_success"),
    }
  }

  async #processVialNeedsForSave(
    c: Context,
    body: SaveBiasImmunizationLogisticsDTO,
    microplanningId: number,
    primaryAugustTargetMap: Map<number, number>,
    primaryNovemberTargetMap: Map<number, number>
  ) {
    for (const vialNeedItem of body.vial_needs.items) {
      const vialData = this.#extractVialDataFromBody(body, vialNeedItem)

      for (const monthMap of [
        primaryAugustTargetMap,
        primaryNovemberTargetMap,
      ]) {
        const materialTargetId =
          monthMap.get(vialNeedItem.id) ?? monthMap.get(vialNeedItem.parent_id)
        if (!materialTargetId) continue

        await this.#saveVialNeedsForMonth(
          c,
          materialTargetId,
          vialNeedItem.id,
          microplanningId,
          body.school_id,
          vialData
        )
      }
    }
  }

  async getDataChecker(
    c: Context,
    subDistrictId: number,
    keyword?: string
  ): Promise<SchoolListResponse> {
    const entityId = c.var.userEntity?.id
    if (!entityId)
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))

    const microplanningId = c.var.microplanningId!

    const [outOfSchoolMaterialNeeds, rawData] = await Promise.all([
      this.logisticsRepo.checkExistingDataByReference(
        c,
        entityId,
        "school",
        microplanningId
      ),
      this.logisticsRepo.getSchoolsBySubDistrictWithMaterialNeeds(
        c,
        subDistrictId,
        microplanningId,
        keyword
      ),
    ])

    const outOfSchoolHasData = outOfSchoolMaterialNeeds.length > 0

    const outOfSchoolEntities = [
      {
        id: entityId,
        name: c.var.t("target_estimation.children_not_in_school"),
        has_data: outOfSchoolHasData,
      },
    ]

    let dataCount = 0
    const entities = rawData.map((school) => {
      const hasData = school.material_need_id !== null
      if (hasData) dataCount++

      return {
        id: school.school_id,
        name: (school.school_name ?? "").toUpperCase(),
        has_data: hasData,
      }
    })

    return {
      data_out_of_school: {
        total: 1,
        total_with_data: outOfSchoolHasData ? 1 : 0,
        entities: outOfSchoolEntities,
      },
      data: {
        total: rawData.length,
        total_with_data: dataCount,
        entities,
      },
    }
  }

  async updateBiasImmunizationLogistics(
    c: Context,
    schoolId: number,
    body: UpdateBiasImmunizationLogisticsDTO
  ) {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const { allPrimaryMaterialIds, augustMaterialIds, novemberMaterialIds } =
      this.#extractMaterialIdsFromBody(c, body)

    const {
      primaryAugustTargetMap,
      primaryNovemberTargetMap,
      augustAdditionalTargetMap,
      novemberAdditionalTargetMap,
    } = await this.#fetchMaterialTargetMaps(
      c,
      allPrimaryMaterialIds,
      augustMaterialIds,
      novemberMaterialIds
    )

    const allTargetIds = [
      ...primaryAugustTargetMap.values(),
      ...primaryNovemberTargetMap.values(),
      ...augustAdditionalTargetMap.values(),
      ...novemberAdditionalTargetMap.values(),
    ]

    const existingData = await this.logisticsRepo.checkExistingData(
      c,
      schoolId,
      "school",
      microplanningId,
      allTargetIds
    )

    if (existingData.length === 0) {
      throw new ValidationError(
        c.var.t("bias_immunization_logistics.data_not_found", {
          school_id: schoolId,
          year: nextYear,
        })
      )
    }

    const existingDataMap = new Map(
      existingData.map((item) => [
        `${item.material_id}:${item.material_target_id}`,
        item.id,
      ])
    )

    await this.#processVialNeedsForUpdate(
      c,
      body,
      existingDataMap,
      primaryAugustTargetMap,
      primaryNovemberTargetMap
    )

    await this.#processAdsSbNeedsForUpdate(
      c,
      body,
      existingDataMap,
      augustAdditionalTargetMap,
      novemberAdditionalTargetMap
    )

    return {
      success: true,
      message: c.var.t("bias_immunization_logistics.update_success"),
    }
  }

  async #processVialNeedsForUpdate(
    c: Context,
    body: UpdateBiasImmunizationLogisticsDTO,
    existingDataMap: Map<string, number>,
    primaryAugustTargetMap: Map<number, number>,
    primaryNovemberTargetMap: Map<number, number>
  ) {
    for (const vialNeedItem of body.vial_needs.items) {
      const vialData = this.#extractVialDataFromBody(body, vialNeedItem)

      for (const monthMap of [
        primaryAugustTargetMap,
        primaryNovemberTargetMap,
      ]) {
        const materialTargetId =
          monthMap.get(vialNeedItem.id) ?? monthMap.get(vialNeedItem.parent_id)
        if (!materialTargetId) continue

        const materialNeedId = existingDataMap.get(
          `${vialNeedItem.id}:${materialTargetId}`
        )
        if (!materialNeedId) continue

        await this.#updateVialNeedsForMonth(c, materialNeedId, vialData)
      }
    }
  }
}
