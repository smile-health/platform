import { VILLAGE_LABEL } from "@/common/constants/target.js"
import {
  resolveBiasMaterialIds,
  resolveLogisticsIds,
} from "@/common/utils/material-key.utils.js"
import { Context } from "hono"
import { MaterialRepository } from "../../material/material.repository.js"
import { MpConfigRepository } from "../mp-config/mp-config.repository.js"
import { TargetEstimationNonBiasRepository } from "../target-estimation-non-bias/target-estimation-non-bias.repository.js"
import { TargetsRepository } from "../targets/targets.repository.js"
import { ImmunizationLogisticsRepository } from "./immunization-logistics.repository.js"
import {
  AbsoluteNumberofRoutineImmunization,
  AdsSbNeeds,
  DetailMonthlyProjectedVaccine,
  DetailMonthlyVaccineLogistic,
  DetailVialNeedsBySchool,
  ImmunizationAchievementsSummary,
  ImmunizationLogisticsNeed,
  NumberOfVaccineUtilizationRate,
  NumberVaccineVialsUsed,
  ProjectedMonthlyVaccine,
  ProjectedOneYearVaccine,
  VaccineUtilizationRateBias,
  VaccineVialsUsedBySchool,
  VialNeedsBySchool,
} from "./immunization-logistics.schema.js"

export class ImmunizationLogisticsModule {
  constructor(
    private readonly nonBiasRepo: TargetEstimationNonBiasRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly immunizationLogisticsRepo: ImmunizationLogisticsRepository,
    private readonly targetsRepo: TargetsRepository,
    private readonly mpConfigRepo: MpConfigRepository
  ) {}

  async #getVariantMaterials(
    c: Context,
    materialTargets: { material_id: number; name: string }[]
  ): Promise<{
    materialAll: { material_id: number; name: string; parent_id?: number }[]
    materialNameMap: Map<number, string>
    materialParentMap: Map<number, number>
  }> {
    const expanded = (
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
              name: v.name.replace(/\s*\([^)]*\)/g, "").trim(),
              parent_id: m.material_id,
            }))
          }
          return [{ material_id: m.material_id, name }]
        })
      )
    ).filter(Boolean)

    const materialAll = [
      ...new Map(
        expanded.flat().map((m) => [Number(m.material_id), m])
      ).values(),
    ]

    const materialNameMap = new Map<number, string>(
      materialAll.map((m) => [Number(m.material_id), m.name])
    )

    const materialParentMap = new Map<number, number>(
      materialAll
        .filter(
          (m): m is typeof m & { parent_id: number } =>
            "parent_id" in m && m.parent_id != null
        )
        .map((m) => [Number(m.material_id), Number(m.parent_id)])
    )

    return { materialAll, materialNameMap, materialParentMap }
  }

  async getNumberOfRoutineImmunization(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<AbsoluteNumberofRoutineImmunization> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const villages = await this.nonBiasRepo.getVillagesBySubDistrict(
      c,
      subDistrictId,
      microplanningId
    )

    const dbData = await this.immunizationLogisticsRepo.getVillageMaterialData(
      c,
      subDistrictId,
      microplanningId
    )

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const mpProgramConfigId =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c,
        nextYear,
        "non_bias"
      )
    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []
    const materialTargets =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)
    const villageDataMap = new Map<number, Map<number, number>>()
    const materialSummary = new Map<number, number>()

    for (const row of dbData) {
      if (!villageDataMap.has(row.village_id)) {
        villageDataMap.set(row.village_id, new Map())
      }

      if (
        row.material_id &&
        row.absolute_number_of_routine_immunization !== null
      ) {
        villageDataMap
          .get(row.village_id)!
          .set(row.material_id, row.absolute_number_of_routine_immunization)

        const current = materialSummary.get(row.material_id) ?? 0
        materialSummary.set(
          row.material_id,
          current + row.absolute_number_of_routine_immunization
        )
      }
    }

    const summary = materialAll.map((m) => ({
      label: materialNameMap.get(m.material_id) ?? "",
      type: "number",
      count:
        materialSummary.get(m.material_id) ??
        materialSummary.get(materialParentMap.get(m.material_id)!) ??
        0,
    }))

    const entities = villages.map((v) => {
      const materials = villageDataMap.get(v.village_id) ?? new Map()
      return {
        id: v.village_id,
        label: VILLAGE_LABEL + " " + v.village_name.toUpperCase(),
        data: materialAll.map((m) => ({
          label: materialNameMap.get(m.material_id) ?? "",
          type: "number",
          count:
            materials.get(m.material_id) ??
            materials.get(materialParentMap.get(m.material_id)!) ??
            0,
        })),
      }
    })

    return {
      summary,
      absolute_number_of_routine_immunization_by_villages: {
        data: entities,
      },
    }
  }

  async getVaccineVialsUsedBySchool(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<VaccineVialsUsedBySchool> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const { mrId, dtId, tdId, hpvId } = resolveBiasMaterialIds(materialKeyMap)

    const [schools, materialNeedsData, outOfSchoolMaterialData] =
      await Promise.all([
        this.immunizationLogisticsRepo.getSchoolsBySubDistrict(
          c,
          subDistrictId,
          microplanningId
        ),
        this.immunizationLogisticsRepo.getSchoolMaterialNeedsDetails(
          c,
          subDistrictId,
          microplanningId,
          entityId
        ),
        this.immunizationLogisticsRepo.getOutOfSchoolMaterialNeeds(
          c,
          subDistrictId,
          microplanningId
        ),
      ])

    const materialDataMap = new Map<number, Map<number, number>>()

    for (const row of materialNeedsData) {
      if (!row.school_id || !row.material_id) continue

      if (!materialDataMap.has(row.school_id)) {
        materialDataMap.set(row.school_id, new Map())
      }

      const vialsUsed = Number(row.number_of_vials_used || 0)
      materialDataMap.get(row.school_id)!.set(row.material_id, vialsUsed)
    }

    const outOfSchoolMaterialMap = new Map<number, number>()
    for (const row of outOfSchoolMaterialData) {
      if (!row.material_id) continue
      const vialsUsed = Number(row.number_of_vials_used || 0)
      outOfSchoolMaterialMap.set(row.material_id, vialsUsed)
    }

    const outOfSchoolMrVials = outOfSchoolMaterialMap.get(mrId) ?? 0
    const outOfSchoolDtVials = outOfSchoolMaterialMap.get(dtId) ?? 0
    const outOfSchoolTdVials = outOfSchoolMaterialMap.get(tdId) ?? 0
    const outOfSchoolHpvVials = outOfSchoolMaterialMap.get(hpvId) ?? 0

    const schoolsData: Array<{
      id: number
      label: string
      data: Array<{ label: string; type: string; count: number }>
    }> = []
    const aggregatedCounts = {
      mr: 0,
      dt: 0,
      td: 0,
      hpv: 0,
    }

    for (const school of schools) {
      const materials = materialDataMap.get(school.school_id) ?? new Map()

      const mrVials = materials.get(mrId) ?? 0
      const dtVials = materials.get(dtId) ?? 0
      const tdVials = materials.get(tdId) ?? 0
      const hpvVials = materials.get(hpvId) ?? 0

      aggregatedCounts.mr += mrVials
      aggregatedCounts.dt += dtVials
      aggregatedCounts.td += tdVials
      aggregatedCounts.hpv += hpvVials

      schoolsData.push({
        id: school.school_id,
        label: school.school_name ?? "",
        data: [
          {
            label: c.var.t("immunization_logistics.mr_grade_1"),
            type: "number",
            count: mrVials,
          },
          {
            label: c.var.t("immunization_logistics.dt_grade_1"),
            type: "number",
            count: dtVials,
          },
          {
            label: c.var.t("immunization_logistics.td_grade_2_5"),
            type: "number",
            count: tdVials,
          },
          {
            label: c.var.t("immunization_logistics.hpv_grade_5"),
            type: "number",
            count: hpvVials,
          },
        ],
      })
    }

    const outOfSchoolData = {
      id: 0,
      label: c.var.t("immunization_logistics.children_not_in_school"),
      data: [
        {
          label: c.var.t("immunization_logistics.mr_grade_1"),
          type: "number",
          count: outOfSchoolMrVials,
        },
        {
          label: c.var.t("immunization_logistics.dt_grade_1"),
          type: "number",
          count: outOfSchoolDtVials,
        },
        {
          label: c.var.t("immunization_logistics.td_grade_2_5"),
          type: "number",
          count: outOfSchoolTdVials,
        },
        {
          label: c.var.t("immunization_logistics.hpv_grade_5"),
          type: "number",
          count: outOfSchoolHpvVials,
        },
      ],
    }

    return {
      summary: [
        {
          label: c.var.t("immunization_logistics.mr_grade_1"),
          type: "number",
          count: aggregatedCounts.mr + outOfSchoolMrVials,
        },
        {
          label: c.var.t("immunization_logistics.dt_grade_1"),
          type: "number",
          count: aggregatedCounts.dt + outOfSchoolDtVials,
        },
        {
          label: c.var.t("immunization_logistics.td_grade_2_5"),
          type: "number",
          count: aggregatedCounts.td + outOfSchoolTdVials,
        },
        {
          label: c.var.t("immunization_logistics.hpv_grade_5"),
          type: "number",
          count: aggregatedCounts.hpv + outOfSchoolHpvVials,
        },
      ],
      vaccine_vials_used_by_school: {
        data_out_of_school: [outOfSchoolData],
        data: schoolsData,
      },
    }
  }

  async getNumberVaccineVialsUsed(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<NumberVaccineVialsUsed> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const villages = await this.nonBiasRepo.getVillagesBySubDistrict(
      c,
      subDistrictId,
      microplanningId
    )

    const dbData = await this.immunizationLogisticsRepo.getVillageMaterialData(
      c,
      subDistrictId,
      microplanningId
    )

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const mpProgramConfigId =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c,
        nextYear,
        "non_bias"
      )
    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []
    const materialTargets =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)

    const villageDataMap = new Map<number, Map<number, number>>()
    const materialSummary = new Map<number, number>()

    for (const row of dbData) {
      if (!villageDataMap.has(row.village_id)) {
        villageDataMap.set(row.village_id, new Map())
      }

      if (row.material_id && row.number_of_vials_used !== null) {
        villageDataMap
          .get(row.village_id)!
          .set(row.material_id, row.number_of_vials_used)

        const current = materialSummary.get(row.material_id) ?? 0
        materialSummary.set(row.material_id, current + row.number_of_vials_used)
      }
    }

    const summary = materialAll.map((m) => ({
      label: materialNameMap.get(m.material_id) ?? "",
      type: "number",
      count:
        materialSummary.get(m.material_id) ??
        materialSummary.get(materialParentMap.get(m.material_id)!) ??
        0,
    }))

    const entities = villages.map((v) => {
      const materials = villageDataMap.get(v.village_id) ?? new Map()
      return {
        id: v.village_id,
        label:
          c.var.t("targets.village_label") + " " + v.village_name.toUpperCase(),
        data: materialAll.map((m) => ({
          label: materialNameMap.get(m.material_id) ?? "",
          type: "number",
          count:
            materials.get(m.material_id) ??
            materials.get(materialParentMap.get(m.material_id)!) ??
            0,
        })),
      }
    })
    return {
      summary,
      number_vaccine_vials_used_by_villages: {
        data: entities,
      },
    }
  }

  async getVaccineUtilizationRateSummary(
    c: Context,
    subDistrictId: number,
    entityId: number,
    category: "bias" | "non-bias" = "bias"
  ): Promise<{
    summary: Array<{ label: string; type: string; count: number }>
  }> {
    if (category === "non-bias") {
      const routineImmunization = await this.getNumberOfRoutineImmunization(
        c,
        subDistrictId,
        entityId
      )
      const vialsUsed = await this.getNumberVaccineVialsUsed(
        c,
        subDistrictId,
        entityId
      )

      const summary = routineImmunization.summary.map((routine) => {
        const vial = vialsUsed.summary.find((v) => v.label === routine.label)
        let count = 0
        if (vial && vial.count > 0) {
          count = parseFloat((routine.count / vial.count).toFixed(1))
        }
        return {
          label: routine.label,
          type: "number",
          count,
        }
      })

      return {
        summary,
      }
    }

    const achievements = await this.getImmunizationAchievements(
      c,
      subDistrictId,
      entityId
    )
    const vials = await this.getVaccineVialsUsedBySchool(
      c,
      subDistrictId,
      entityId
    )

    const summary = achievements.summary.map((achievement) => {
      const vial = vials.summary.find((v) => v.label === achievement.label)
      let count = 0
      if (vial && vial.count > 0) {
        count = Math.ceil(achievement.count / vial.count)
      }
      return {
        label: achievement.label,
        type: "number",
        count,
      }
    })

    return {
      summary,
    }
  }

  async getVaccineUtilizationRate(
    c: Context,
    subDistrictId: number,
    entityId: number,
    category?: "bias" | "non-bias"
  ): Promise<NumberOfVaccineUtilizationRate | VaccineUtilizationRateBias> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    if (category === "bias") {
      const dbData =
        await this.immunizationLogisticsRepo.getSchoolVaccineUtilizationRate(
          c,
          subDistrictId,
          microplanningId,
          entityId
        )

      const materialTargets =
        await this.materialRepo.findMpMaterialsFromTargets(c, "primary", "bias")

      const materialIds = materialTargets.map((m) => m.material_id)
      const rawMaterial = await this.materialRepo.findWsMaterialsByIds(
        c,
        materialIds
      )

      const materialNameMap = new Map<number, string>()
      materialTargets.forEach((m) => {
        materialNameMap.set(m.material_id, m.name)
      })

      const materialSummary = new Map<number, { sum: number; count: number }>()

      for (const row of dbData) {
        if (row.material_id && row.vaccine_utilization_rate !== null) {
          const current = materialSummary.get(row.material_id) ?? {
            sum: 0,
            count: 0,
          }
          materialSummary.set(row.material_id, {
            sum: current.sum + row.vaccine_utilization_rate,
            count: current.count + 1,
          })
        }
      }

      const summary = rawMaterial.map((m) => {
        const data = materialSummary.get(m.id)
        return {
          label: materialNameMap.get(m.id) ?? "",
          type: "number",
          count: data ? parseFloat((data.sum / data.count).toFixed(1)) : 0,
        }
      })

      return {
        summary,
      }
    }

    const dbData =
      await this.immunizationLogisticsRepo.getVillageVaccineUtilizationRate(
        c,
        subDistrictId,
        microplanningId
      )

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const mpProgramConfigId =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c,
        nextYear,
        "non_bias"
      )
    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []
    const materialTargets =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)

    const materialSummary = new Map<number, { sum: number; count: number }>()

    for (const row of dbData) {
      if (row.material_id && row.vaccine_utilization_rate !== null) {
        const current = materialSummary.get(row.material_id) ?? {
          sum: 0,
          count: 0,
        }
        materialSummary.set(row.material_id, {
          sum: current.sum + row.vaccine_utilization_rate,
          count: current.count + 1,
        })
      }
    }

    const summary = materialAll.map((m) => {
      const data =
        materialSummary.get(m.material_id) ??
        materialSummary.get(materialParentMap.get(m.material_id)!)
      return {
        label: materialNameMap.get(m.material_id) ?? "",
        type: "number",
        count: data ? parseFloat((data.sum / data.count).toFixed(1)) : 0,
      }
    })

    return {
      summary,
    }
  }

  async getNumberOfProjectedOneYearVaccine(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<ProjectedOneYearVaccine> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const villages = await this.nonBiasRepo.getVillagesBySubDistrict(
      c,
      subDistrictId,
      microplanningId
    )

    const dbData = await this.immunizationLogisticsRepo.getVillageMaterialData(
      c,
      subDistrictId,
      microplanningId
    )

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const mpProgramConfigId =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c,
        nextYear,
        "non_bias"
      )
    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []
    const materialTargets =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)

    const villageDataMap = new Map<number, Map<number, number>>()
    const materialSummary = new Map<number, number>()

    for (const row of dbData) {
      if (!villageDataMap.has(row.village_id)) {
        villageDataMap.set(row.village_id, new Map())
      }

      if (row.material_id && row.total_needs !== null) {
        villageDataMap
          .get(row.village_id)!
          .set(row.material_id, row.total_needs)

        const current = materialSummary.get(row.material_id) ?? 0
        materialSummary.set(row.material_id, current + row.total_needs)
      }
    }

    const summary = materialAll.map((m) => ({
      label: materialNameMap.get(m.material_id) ?? "",
      type: "number",
      count:
        materialSummary.get(m.material_id) ??
        materialSummary.get(materialParentMap.get(m.material_id)!) ??
        0,
    }))

    const entities = villages.map((v) => {
      const materials = villageDataMap.get(v.village_id) ?? new Map()
      return {
        id: v.village_id,
        label:
          c.var.t("targets.village_label") + " " + v.village_name.toUpperCase(),
        data: materialAll.map((m) => ({
          label: materialNameMap.get(m.material_id) ?? "",
          type: "number",
          count:
            materials.get(m.material_id) ??
            materials.get(materialParentMap.get(m.material_id)!) ??
            0,
        })),
      }
    })

    return {
      summary,
      projected_one_year_vaccine: {
        data: entities,
      },
    }
  }

  async getNumberOfProjectedMonthlyVaccine(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<ProjectedMonthlyVaccine> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const villages = await this.nonBiasRepo.getVillagesBySubDistrict(
      c,
      subDistrictId,
      microplanningId
    )

    const dbData =
      await this.immunizationLogisticsRepo.getVillageMonthlyVaccineData(
        c,
        subDistrictId,
        microplanningId
      )

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const mpProgramConfigId =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c,
        nextYear,
        "non_bias"
      )
    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []
    const materialTargets =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)

    const villageDataMap = new Map<
      number,
      Map<number, { request_qty: number }>
    >()
    const materialSummary = new Map<number, number>()

    for (const row of dbData) {
      if (!villageDataMap.has(row.village_id)) {
        villageDataMap.set(row.village_id, new Map())
      }

      if (row.material_id && row.request_qty !== null) {
        villageDataMap.get(row.village_id)!.set(row.material_id, {
          request_qty: row.request_qty,
        })

        const current = materialSummary.get(row.material_id) ?? 0
        materialSummary.set(row.material_id, current + row.request_qty)
      }
    }

    const summary = materialAll.map((m) => ({
      label: materialNameMap.get(m.material_id) ?? "",
      type: "number",
      count:
        materialSummary.get(m.material_id) ??
        materialSummary.get(materialParentMap.get(m.material_id)!) ??
        0,
    }))

    const entities = villages.map((v) => {
      const materials = villageDataMap.get(v.village_id) ?? new Map()
      return {
        id: v.village_id,
        label:
          c.var.t("targets.village_label") + " " + v.village_name.toUpperCase(),
        data: materialAll.map((m) => {
          const parentId = materialParentMap.get(m.material_id)
          return {
            label: materialNameMap.get(m.material_id) ?? "",
            type: "number",
            count:
              materials.get(m.material_id)?.request_qty ??
              (parentId ? materials.get(parentId)?.request_qty : undefined) ??
              0,
          }
        }),
      }
    })

    return {
      summary,
      projected_monthly_vaccine: {
        data: entities,
      },
    }
  }

  async getDetailMonthlyVaccine(
    c: Context,
    villageId: number,
    entityId: number
  ): Promise<DetailMonthlyProjectedVaccine> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const village = await this.nonBiasRepo.getLocationName(c, villageId)

    const dbData =
      await this.immunizationLogisticsRepo.getVillageVaccineDetailData(
        c,
        villageId,
        microplanningId
      )

    const provinceId = Number(c.var.userEntity?.province_id ?? 0)
    const mpProgramConfigId =
      await this.mpConfigRepo.getActiveMpProgramConfigId(
        c,
        nextYear,
        "non_bias"
      )
    const mpMaterialsRaw = mpProgramConfigId
      ? await this.mpConfigRepo.getMpMaterialsForCategory(
          c,
          mpProgramConfigId,
          provinceId
        )
      : []
    const materialTargets =
      mpMaterialsRaw.length > 0
        ? mpMaterialsRaw
        : await this.materialRepo.findMaterialsFromTargets(
            c,
            "primary",
            "non_bias"
          )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)

    const materialDataMap = new Map<
      number,
      {
        min_stock: number
        max_stock: number
        remaining_stock: number
        request_qty: number
      }
    >()

    for (const row of dbData) {
      if (row.material_id) {
        materialDataMap.set(row.material_id, {
          min_stock: row.min_stock ?? 0,
          max_stock: row.max_stock ?? 0,
          remaining_stock: row.remaining_stock ?? 0,
          request_qty: row.request_qty ?? 0,
        })
      }
    }

    const vaccines = materialAll.map((m) => {
      const parentId = materialParentMap.get(m.material_id)
      const data =
        materialDataMap.get(m.material_id) ??
        (parentId ? materialDataMap.get(parentId) : undefined)
      return {
        label: materialNameMap.get(m.material_id) ?? "",
        id: m.material_id,
        data: [
          {
            label: c.var.t("immunization_logistics.min_stock"),
            type: "number",
            count: data?.min_stock ?? 0,
          },
          {
            label: c.var.t("immunization_logistics.max_stock"),
            type: "number",
            count: data?.max_stock ?? 0,
          },
          {
            label: c.var.t("immunization_logistics.available_stock"),
            type: "number",
            count: data?.remaining_stock ?? 0,
          },
          {
            label: c.var.t("immunization_logistics.request_qty"),
            type: "number",
            count: data?.request_qty ?? 0,
          },
        ],
      }
    })

    return {
      id: villageId,
      label: village?.name
        ? c.var.t("targets.village_label") + " " + village.name.toUpperCase()
        : c.var.t("immunization_logistics.unknown"),
      data: vaccines,
    }
  }

  async getMonthlyImmunizationLogisticsNeed(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<ImmunizationLogisticsNeed> {
    const microplanningId = c.var.microplanningId!

    const villages = await this.nonBiasRepo.getVillagesBySubDistrict(
      c,
      subDistrictId,
      microplanningId
    )

    const dbData =
      await this.immunizationLogisticsRepo.getVillageAdditionalNeedsData(
        c,
        subDistrictId,
        microplanningId
      )

    const materialTargets = await this.materialRepo.findMaterialsFromTargets(
      c,
      "additional",
      "non_bias"
    )

    const { materialAll, materialNameMap, materialParentMap } =
      await this.#getVariantMaterials(c, materialTargets)

    const villageDataMap = new Map<
      number,
      Map<number, { total: number; remaining_stock: number }>
    >()
    const materialSummary = new Map<number, number>()

    for (const row of dbData) {
      if (!villageDataMap.has(row.village_id)) {
        villageDataMap.set(row.village_id, new Map())
      }

      if (
        row.material_id &&
        row.total !== null &&
        row.remaining_stock !== null
      ) {
        const requestQty = row.total - row.remaining_stock
        villageDataMap.get(row.village_id)!.set(row.material_id, {
          total: row.total,
          remaining_stock: row.remaining_stock,
        })

        const current = materialSummary.get(row.material_id) ?? 0
        materialSummary.set(row.material_id, current + requestQty)
      }
    }

    const summary = materialAll.map((m) => ({
      label: materialNameMap.get(m.material_id) ?? "",
      type: "number",
      count:
        materialSummary.get(m.material_id) ??
        materialSummary.get(materialParentMap.get(m.material_id)!) ??
        0,
    }))

    const entities = villages.map((v) => {
      const materials = villageDataMap.get(v.village_id) ?? new Map()
      return {
        id: v.village_id,
        label:
          c.var.t("targets.village_label") + " " + v.village_name.toUpperCase(),
        data: materialAll.map((m) => {
          const parentId = materialParentMap.get(m.material_id)
          const data =
            materials.get(m.material_id) ??
            (parentId ? materials.get(parentId) : undefined)
          const requestQty = data ? data.total - data.remaining_stock : 0
          return {
            label: materialNameMap.get(m.material_id) ?? "",
            type: "number",
            count: requestQty,
          }
        }),
      }
    })

    return {
      summary,
      immunization_logistics_need: {
        data: entities,
      },
    }
  }

  async getDetailMonthlyImmunization(
    c: Context,
    villageId: number,
    entityId: number
  ): Promise<DetailMonthlyVaccineLogistic> {
    const microplanningId = c.var.microplanningId!

    const village = await this.nonBiasRepo.getLocationName(c, villageId)

    const dbData =
      await this.immunizationLogisticsRepo.getVillageLogisticsDetailData(
        c,
        villageId,
        microplanningId
      )

    const materialTargets = await this.materialRepo.findMaterialsFromTargets(
      c,
      "additional",
      "non_bias"
    )

    const materialDataMap = new Map<
      number,
      {
        total: number
        remaining_stock: number
      }
    >()

    for (const row of dbData) {
      if (row.material_id) {
        materialDataMap.set(row.material_id, {
          total: row.total ?? 0,
          remaining_stock: row.remaining_stock ?? 0,
        })
      }
    }

    const logistics = materialTargets.map((m) => {
      const data = materialDataMap.get(m.material_id)
      const requestQty = data ? data.total - data.remaining_stock : 0
      return {
        label: m.name,
        id: m.material_id,
        data: [
          {
            label: c.var.t(
              "immunization_logistics.calculation_based_on_vaccine_needs"
            ),
            type: "number",
            count: data?.total ?? 0,
          },
          {
            label: c.var.t("immunization_logistics.available_stock"),
            type: "number",
            count: data?.remaining_stock ?? 0,
          },
          {
            label: c.var.t("immunization_logistics.request_qty"),
            type: "number",
            count: requestQty,
          },
        ],
      }
    })

    return {
      id: villageId,
      label: village?.name
        ? c.var.t("targets.village_label") + " " + village.name.toUpperCase()
        : "UNKNOWN",
      data: logistics,
    }
  }

  async getImmunizationAchievements(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<ImmunizationAchievementsSummary> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const { mrId, dtId, tdId, hpvId } = resolveBiasMaterialIds(materialKeyMap)

    const [schools, materialNeedsData, outOfSchoolMaterialData] =
      await Promise.all([
        this.immunizationLogisticsRepo.getSchoolsBySubDistrict(
          c,
          subDistrictId,
          microplanningId
        ),
        this.immunizationLogisticsRepo.getSchoolMaterialNeedsDetails(
          c,
          subDistrictId,
          microplanningId,
          entityId
        ),
        this.immunizationLogisticsRepo.getOutOfSchoolMaterialNeeds(
          c,
          subDistrictId,
          microplanningId
        ),
      ])

    const materialDataMap = new Map<number, Map<number, number>>()

    for (const row of materialNeedsData) {
      if (!row.school_id || !row.material_id) continue

      if (!materialDataMap.has(row.school_id)) {
        materialDataMap.set(row.school_id, new Map())
      }

      const absoluteImmunization = Number(
        row.absolute_number_of_routine_immunization || 0
      )
      materialDataMap
        .get(row.school_id)!
        .set(row.material_id, absoluteImmunization)
    }

    const outOfSchoolMaterialMap = new Map<number, number>()
    for (const row of outOfSchoolMaterialData) {
      if (!row.material_id) continue
      const absoluteImmunization = Number(
        row.absolute_number_of_routine_immunization || 0
      )
      outOfSchoolMaterialMap.set(row.material_id, absoluteImmunization)
    }

    const outOfSchoolMrCount = outOfSchoolMaterialMap.get(mrId) ?? 0
    const outOfSchoolDtCount = outOfSchoolMaterialMap.get(dtId) ?? 0
    const outOfSchoolTdCount = outOfSchoolMaterialMap.get(tdId) ?? 0
    const outOfSchoolHpvCount = outOfSchoolMaterialMap.get(hpvId) ?? 0

    const schoolsData: Array<{
      id: number
      label: string
      data: Array<{ label: string; type: string; count: number }>
    }> = []
    const aggregatedCounts = {
      mr: 0,
      dt: 0,
      td: 0,
      hpv: 0,
    }

    for (const school of schools) {
      const materials = materialDataMap.get(school.school_id) ?? new Map()

      const mrCount = materials.get(mrId) ?? 0
      const dtCount = materials.get(dtId) ?? 0
      const tdCount = materials.get(tdId) ?? 0
      const hpvCount = materials.get(hpvId) ?? 0

      aggregatedCounts.mr += mrCount
      aggregatedCounts.dt += dtCount
      aggregatedCounts.td += tdCount
      aggregatedCounts.hpv += hpvCount

      schoolsData.push({
        id: school.school_id,
        label: school.school_name ?? "",
        data: [
          {
            label: c.var.t("immunization_logistics.mr_grade_1"),
            type: "number",
            count: mrCount,
          },
          {
            label: c.var.t("immunization_logistics.dt_grade_1"),
            type: "number",
            count: dtCount,
          },
          {
            label: c.var.t("immunization_logistics.td_grade_2_5"),
            type: "number",
            count: tdCount,
          },
          {
            label: c.var.t("immunization_logistics.hpv_grade_5"),
            type: "number",
            count: hpvCount,
          },
        ],
      })
    }

    const outOfSchoolData = {
      id: 0,
      label: c.var.t("immunization_logistics.children_not_in_school"),
      data: [
        {
          label: c.var.t("immunization_logistics.mr_grade_1"),
          type: "number",
          count: outOfSchoolMrCount,
        },
        {
          label: c.var.t("immunization_logistics.dt_grade_1"),
          type: "number",
          count: outOfSchoolDtCount,
        },
        {
          label: c.var.t("immunization_logistics.td_grade_2_5"),
          type: "number",
          count: outOfSchoolTdCount,
        },
        {
          label: c.var.t("immunization_logistics.hpv_grade_5"),
          type: "number",
          count: outOfSchoolHpvCount,
        },
      ],
    }

    return {
      summary: [
        {
          label: c.var.t("immunization_logistics.mr_grade_1"),
          type: "number",
          count: aggregatedCounts.mr + outOfSchoolMrCount,
        },
        {
          label: c.var.t("immunization_logistics.dt_grade_1"),
          type: "number",
          count: aggregatedCounts.dt + outOfSchoolDtCount,
        },
        {
          label: c.var.t("immunization_logistics.td_grade_2_5"),
          type: "number",
          count: aggregatedCounts.td + outOfSchoolTdCount,
        },
        {
          label: c.var.t("immunization_logistics.hpv_grade_5"),
          type: "number",
          count: aggregatedCounts.hpv + outOfSchoolHpvCount,
        },
      ],
      achievements_by_school: {
        data_out_of_school: [outOfSchoolData],
        data: schoolsData,
      },
    }
  }

  async getVialNeedsBySchool(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<VialNeedsBySchool> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const { mrId, dtId, tdId, hpvId } = resolveBiasMaterialIds(materialKeyMap)

    const [schools, vialNeedsData, outOfSchoolVialNeedsData] =
      await Promise.all([
        this.immunizationLogisticsRepo.getSchoolsBySubDistrict(
          c,
          subDistrictId,
          microplanningId
        ),
        this.immunizationLogisticsRepo.getSchoolVialNeedsData(
          c,
          subDistrictId,
          microplanningId,
          entityId
        ),
        this.immunizationLogisticsRepo.getOutOfSchoolVialNeedsData(
          c,
          subDistrictId,
          microplanningId
        ),
      ])

    const vialDataMap = new Map<
      number,
      Map<
        number,
        { planning: number; available_stock: number; request_qty: number }
      >
    >()

    for (const row of vialNeedsData) {
      if (!row.school_id || !row.material_id) continue

      if (!vialDataMap.has(row.school_id)) {
        vialDataMap.set(row.school_id, new Map())
      }

      vialDataMap.get(row.school_id)!.set(row.material_id, {
        planning: Number(row.planning || 0),
        available_stock: Number(row.available_stock || 0),
        request_qty: Number(row.request_qty || 0),
      })
    }

    const outOfSchoolVialMap = new Map<
      number,
      { planning: number; available_stock: number; request_qty: number }
    >()
    for (const row of outOfSchoolVialNeedsData) {
      if (!row.material_id) continue
      outOfSchoolVialMap.set(row.material_id, {
        planning: Number(row.planning || 0),
        available_stock: Number(row.available_stock || 0),
        request_qty: Number(row.request_qty || 0),
      })
    }

    const outOfSchoolMrData = outOfSchoolVialMap.get(mrId)
    const outOfSchoolDtData = outOfSchoolVialMap.get(dtId)
    const outOfSchoolTdData = outOfSchoolVialMap.get(tdId)
    const outOfSchoolHpvData = outOfSchoolVialMap.get(hpvId)

    const outOfSchoolMrNeeds = outOfSchoolMrData?.request_qty ?? 0
    const outOfSchoolDtNeeds = outOfSchoolDtData?.request_qty ?? 0
    const outOfSchoolTdNeeds = outOfSchoolTdData?.request_qty ?? 0
    const outOfSchoolHpvNeeds = outOfSchoolHpvData?.request_qty ?? 0

    const schoolsData: Array<{
      id: number
      label: string
      data: Array<{ label: string; type: string; count: number }>
    }> = []
    const aggregatedCounts = {
      mr: 0,
      dt: 0,
      td: 0,
      hpv: 0,
    }

    for (const school of schools) {
      const materials = vialDataMap.get(school.school_id) ?? new Map()

      const mrData = materials.get(mrId)
      const dtData = materials.get(dtId)
      const tdData = materials.get(tdId)
      const hpvData = materials.get(hpvId)

      const mrNeeds = mrData?.request_qty ?? 0
      const dtNeeds = dtData?.request_qty ?? 0
      const tdNeeds = tdData?.request_qty ?? 0
      const hpvNeeds = hpvData?.request_qty ?? 0

      aggregatedCounts.mr += mrNeeds
      aggregatedCounts.dt += dtNeeds
      aggregatedCounts.td += tdNeeds
      aggregatedCounts.hpv += hpvNeeds

      schoolsData.push({
        id: school.school_id,
        label: school.school_name ?? "",
        data: [
          {
            label: c.var.t("immunization_logistics.mr_grade_1"),
            type: "number",
            count: mrNeeds,
          },
          {
            label: c.var.t("immunization_logistics.dt_grade_1"),
            type: "number",
            count: dtNeeds,
          },
          {
            label: c.var.t("immunization_logistics.td_grade_2_5"),
            type: "number",
            count: tdNeeds,
          },
          {
            label: c.var.t("immunization_logistics.hpv_grade_5"),
            type: "number",
            count: hpvNeeds,
          },
        ],
      })
    }

    const outOfSchoolData = {
      id: c.var.userEntity.id,
      label: c.var.t("immunization_logistics.children_not_in_school"),
      data: [
        {
          label: c.var.t("immunization_logistics.mr_grade_1"),
          type: "number",
          count: outOfSchoolMrNeeds,
        },
        {
          label: c.var.t("immunization_logistics.dt_grade_1"),
          type: "number",
          count: outOfSchoolDtNeeds,
        },
        {
          label: c.var.t("immunization_logistics.td_grade_2_5"),
          type: "number",
          count: outOfSchoolTdNeeds,
        },
        {
          label: c.var.t("immunization_logistics.hpv_grade_5"),
          type: "number",
          count: outOfSchoolHpvNeeds,
        },
      ],
    }

    return {
      summary: [
        {
          label: c.var.t("immunization_logistics.mr_grade_1"),
          type: "number",
          count: aggregatedCounts.mr + outOfSchoolMrNeeds,
        },
        {
          label: c.var.t("immunization_logistics.dt_grade_1"),
          type: "number",
          count: aggregatedCounts.dt + outOfSchoolDtNeeds,
        },
        {
          label: c.var.t("immunization_logistics.td_grade_2_5"),
          type: "number",
          count: aggregatedCounts.td + outOfSchoolTdNeeds,
        },
        {
          label: c.var.t("immunization_logistics.hpv_grade_5"),
          type: "number",
          count: aggregatedCounts.hpv + outOfSchoolHpvNeeds,
        },
      ],
      vial_needs_by_school: {
        data_out_of_school: [outOfSchoolData],
        data: schoolsData,
      },
    }
  }

  async getDetailVialNeedsBySchool(
    c: Context,
    schoolId: number,
    entityId: number
  ): Promise<DetailVialNeedsBySchool> {
    const microplanningId = c.var.microplanningId!
    const nextYear = c.var.microplanningYear!

    const mpProgramConfigIdBias =
      await this.mpConfigRepo.getActiveMpProgramConfigId(c, nextYear, "bias")
    const materialKeyMap = mpProgramConfigIdBias
      ? await this.mpConfigRepo.getMaterialKeyMap(c, mpProgramConfigIdBias)
      : new Map()

    const { mrId, dtId, tdId, hpvId } = resolveBiasMaterialIds(materialKeyMap)

    const [vialNeedsData, school] = await Promise.all([
      this.immunizationLogisticsRepo.getSchoolDetailVialNeedsData(
        c,
        schoolId,
        microplanningId
      ),
      this.immunizationLogisticsRepo.getSchoolsBySubDistrict(
        c,
        Number(c.var?.userEntity?.sub_district_id || 0),
        microplanningId
      ),
    ])

    const schoolData = school.find((s) => s.school_id === schoolId)

    const materialMap = new Map<
      number,
      { planning: number; available_stock: number; request_qty: number }
    >()

    for (const row of vialNeedsData) {
      if (!row.material_id) continue
      materialMap.set(row.material_id, {
        planning: Number(row.planning || 0),
        available_stock: Number(row.available_stock || 0),
        request_qty: Number(row.request_qty || 0),
      })
    }

    const mrData = materialMap.get(mrId)
    const dtData = materialMap.get(dtId)
    const tdData = materialMap.get(tdId)
    const hpvData = materialMap.get(hpvId)

    return {
      id: schoolId,
      label:
        schoolData?.school_name ??
        c.var?.userEntity?.name ??
        c.var.t("immunization_logistics.school"),
      data: [
        {
          label: c.var.t("immunization_logistics.grade_1"),
          data: [
            {
              label: c.var.t("immunization_logistics.mr"),
              data: [
                {
                  label: c.var.t("immunization_logistics.planning"),
                  type: "number",
                  count: mrData?.planning ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.available_stock"),
                  type: "number",
                  count: mrData?.available_stock ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.needs_qty"),
                  type: "number",
                  count: mrData?.request_qty ?? 0,
                },
              ],
            },
            {
              label: c.var.t("immunization_logistics.dt"),
              data: [
                {
                  label: c.var.t("immunization_logistics.planning"),
                  type: "number",
                  count: dtData?.planning ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.available_stock"),
                  type: "number",
                  count: dtData?.available_stock ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.needs_qty"),
                  type: "number",
                  count: dtData?.request_qty ?? 0,
                },
              ],
            },
          ],
        },
        {
          label: c.var.t("immunization_logistics.grade_2_5"),
          data: [
            {
              label: c.var.t("immunization_logistics.td"),
              data: [
                {
                  label: c.var.t("immunization_logistics.planning"),
                  type: "number",
                  count: tdData?.planning ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.available_stock"),
                  type: "number",
                  count: tdData?.available_stock ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.needs_qty"),
                  type: "number",
                  count: tdData?.request_qty ?? 0,
                },
              ],
            },
          ],
        },
        {
          label: c.var.t("immunization_logistics.grade_5"),
          data: [
            {
              label: c.var.t("immunization_logistics.hpv"),
              data: [
                {
                  label: c.var.t("immunization_logistics.planning"),
                  type: "number",
                  count: hpvData?.planning ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.available_stock"),
                  type: "number",
                  count: hpvData?.available_stock ?? 0,
                },
                {
                  label: c.var.t("immunization_logistics.needs_qty"),
                  type: "number",
                  count: hpvData?.request_qty ?? 0,
                },
              ],
            },
          ],
        },
      ],
    }
  }

  async getVaccineLogisticsSummary(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<AdsSbNeeds> {
    const microplanningId = c.var.microplanningId!

    const additionalKeyMap =
      await this.materialRepo.getAdditionalMaterialKeyMap(c, "bias")

    const { ads5mlId, ads05mlId, sb25lId, sb5lId } =
      resolveLogisticsIds(additionalKeyMap)

    const [schools, logisticsData, outOfSchoolLogisticsData] =
      await Promise.all([
        this.immunizationLogisticsRepo.getSchoolsBySubDistrict(
          c,
          subDistrictId,
          microplanningId
        ),
        this.immunizationLogisticsRepo.getSchoolLogisticsData(
          c,
          subDistrictId,
          microplanningId,
          entityId
        ),
        this.immunizationLogisticsRepo.getOutOfSchoolLogisticsData(
          c,
          subDistrictId,
          microplanningId
        ),
      ])

    const logisticsDataMap = new Map<
      number,
      {
        august: Map<number, number>
        november: Map<number, number>
      }
    >()

    for (const row of logisticsData) {
      if (!row.school_id || !row.material_id) continue

      if (!logisticsDataMap.has(row.school_id)) {
        logisticsDataMap.set(row.school_id, {
          august: new Map(),
          november: new Map(),
        })
      }

      const schoolLogistics = logisticsDataMap.get(row.school_id)!
      const total = Number(row.total || 0)
      const month = (row.injection_month ?? "").toLowerCase()

      if (month === "august") {
        schoolLogistics.august.set(row.material_id, total)
      } else if (month === "november") {
        schoolLogistics.november.set(row.material_id, total)
      }
    }

    const outOfSchoolLogisticsMap = {
      august: new Map<number, number>(),
      november: new Map<number, number>(),
    }

    for (const row of outOfSchoolLogisticsData) {
      if (!row.material_id) continue
      const total = Number(row.total || 0)
      const month = (row.injection_month ?? "").toLowerCase()

      if (month === "august") {
        outOfSchoolLogisticsMap.august.set(row.material_id, total)
      } else if (month === "november") {
        outOfSchoolLogisticsMap.november.set(row.material_id, total)
      }
    }

    const outOfSchoolAugustAds5ml =
      outOfSchoolLogisticsMap.august.get(ads5mlId) ?? 0
    const outOfSchoolAugustAds05ml =
      outOfSchoolLogisticsMap.august.get(ads05mlId) ?? 0
    const outOfSchoolAugustSb25l =
      outOfSchoolLogisticsMap.august.get(sb25lId) ?? 0
    const outOfSchoolAugustSb5l =
      outOfSchoolLogisticsMap.august.get(sb5lId) ?? 0
    const outOfSchoolNovemberAds05ml =
      outOfSchoolLogisticsMap.november.get(ads05mlId) ?? 0
    const outOfSchoolNovemberSb25l =
      outOfSchoolLogisticsMap.november.get(sb25lId) ?? 0
    const outOfSchoolNovemberSb5l =
      outOfSchoolLogisticsMap.november.get(sb5lId) ?? 0

    const schoolsData: Array<{
      id: number
      label: string
      data: Array<{
        label: string
        data: Array<{ label: string; type: string; count: number }>
      }>
    }> = []

    const aggregatedCounts = {
      august_ads_5ml: 0,
      august_ads_05ml: 0,
      august_sb_25l: 0,
      august_sb_5l: 0,
      november_ads_5ml: 0,
      november_ads_05ml: 0,
      november_sb_25l: 0,
      november_sb_5l: 0,
    }

    for (const school of schools) {
      const logistics = logisticsDataMap.get(school.school_id)

      const augustAds5ml = logistics?.august.get(ads5mlId) ?? 0
      const augustAds05ml = logistics?.august.get(ads05mlId) ?? 0
      const augustSb25l = logistics?.august.get(sb25lId) ?? 0
      const augustSb5l = logistics?.august.get(sb5lId) ?? 0
      const novemberAds05ml = logistics?.november.get(ads05mlId) ?? 0
      const novemberSb25l = logistics?.november.get(sb25lId) ?? 0
      const novemberSb5l = logistics?.november.get(sb5lId) ?? 0

      aggregatedCounts.august_ads_5ml += augustAds5ml
      aggregatedCounts.august_ads_05ml += augustAds05ml
      aggregatedCounts.august_sb_25l += augustSb25l
      aggregatedCounts.august_sb_5l += augustSb5l
      aggregatedCounts.november_ads_05ml += novemberAds05ml
      aggregatedCounts.november_sb_25l += novemberSb25l
      aggregatedCounts.november_sb_5l += novemberSb5l

      schoolsData.push({
        id: school.school_id,
        label: school.school_name ?? "",
        data: [
          {
            label: c.var.t("immunization_logistics.august"),
            data: [
              {
                label: c.var.t("immunization_logistics.ads_5ml"),
                type: "number",
                count: augustAds5ml,
              },
              {
                label: c.var.t("immunization_logistics.ads_05ml"),
                type: "number",
                count: augustAds05ml,
              },
              {
                label: c.var.t("immunization_logistics.sb_25ltr"),
                type: "number",
                count: augustSb25l,
              },
              {
                label: c.var.t("immunization_logistics.sb_5ltr"),
                type: "number",
                count: augustSb5l,
              },
            ],
          },
          {
            label: c.var.t("immunization_logistics.november"),
            data: [
              {
                label: c.var.t("immunization_logistics.ads_05ml"),
                type: "number",
                count: novemberAds05ml,
              },
              {
                label: c.var.t("immunization_logistics.sb_25ltr"),
                type: "number",
                count: novemberSb25l,
              },
              {
                label: c.var.t("immunization_logistics.sb_5ltr"),
                type: "number",
                count: novemberSb5l,
              },
            ],
          },
        ],
      })
    }

    const outOfSchoolData = {
      id: c.var.userEntity.id,
      label: c.var.t("immunization_logistics.children_not_in_school"),
      data: [
        {
          label: c.var.t("immunization_logistics.august"),
          data: [
            {
              label: c.var.t("immunization_logistics.ads_5ml"),
              type: "number",
              count: outOfSchoolAugustAds5ml,
            },
            {
              label: c.var.t("immunization_logistics.ads_05ml"),
              type: "number",
              count: outOfSchoolAugustAds05ml,
            },
            {
              label: c.var.t("immunization_logistics.sb_25ltr"),
              type: "number",
              count: outOfSchoolAugustSb25l,
            },
            {
              label: c.var.t("immunization_logistics.sb_5ltr"),
              type: "number",
              count: outOfSchoolAugustSb5l,
            },
          ],
        },
        {
          label: c.var.t("immunization_logistics.november"),
          data: [
            {
              label: c.var.t("immunization_logistics.ads_05ml"),
              type: "number",
              count: outOfSchoolNovemberAds05ml,
            },
            {
              label: c.var.t("immunization_logistics.sb_25ltr"),
              type: "number",
              count: outOfSchoolNovemberSb25l,
            },
            {
              label: c.var.t("immunization_logistics.sb_5ltr"),
              type: "number",
              count: outOfSchoolNovemberSb5l,
            },
          ],
        },
      ],
    }

    return {
      summary: [
        {
          label: c.var.t("immunization_logistics.august"),
          data: [
            {
              label: c.var.t("immunization_logistics.ads_5ml"),
              type: "number",
              count: aggregatedCounts.august_ads_5ml + outOfSchoolAugustAds5ml,
            },
            {
              label: c.var.t("immunization_logistics.ads_05ml"),
              type: "number",
              count:
                aggregatedCounts.august_ads_05ml + outOfSchoolAugustAds05ml,
            },
            {
              label: c.var.t("immunization_logistics.sb_25ltr"),
              type: "number",
              count: aggregatedCounts.august_sb_25l + outOfSchoolAugustSb25l,
            },
            {
              label: c.var.t("immunization_logistics.sb_5ltr"),
              type: "number",
              count: aggregatedCounts.august_sb_5l + outOfSchoolAugustSb5l,
            },
          ],
        },
        {
          label: c.var.t("immunization_logistics.november"),
          data: [
            {
              label: c.var.t("immunization_logistics.ads_05ml"),
              type: "number",
              count:
                aggregatedCounts.november_ads_05ml + outOfSchoolNovemberAds05ml,
            },
            {
              label: c.var.t("immunization_logistics.sb_25ltr"),
              type: "number",
              count:
                aggregatedCounts.november_sb_25l + outOfSchoolNovemberSb25l,
            },
            {
              label: c.var.t("immunization_logistics.sb_5ltr"),
              type: "number",
              count: aggregatedCounts.november_sb_5l + outOfSchoolNovemberSb5l,
            },
          ],
        },
      ],
      ads_sb_needs: {
        data_out_of_school: [outOfSchoolData],
        data: schoolsData,
      },
    }
  }
}
