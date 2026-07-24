import {
  BADUTA_INJECTION_DOSE,
  BBL_INJECTION_DOSE,
  FACILITY_SERVICE_CAPACITY,
  FEMALE_ONLY_TARGET_GROUPS,
  GENDER_FEMALE,
  GENDER_MALE,
  MALE_ONLY_TARGET_GROUPS,
  OUTREACH_SERVICE_CAPACITY,
  PERCENTAGE_100,
  SCHOOL_TARGET_GROUPS,
  SI_INJECTION_DOSE,
  TARGET_GROUP_ORDER,
  TOTAL_MONTH,
  VILLAGE_TARGET_GROUPS,
  WORKERS_PER_SERVICE_POINT,
  WUS_COVERAGE_PERCENTAGE,
} from "@/common/constants/target.js"
import {
  createCountMap,
  createCountRecord,
} from "@/common/utils/target.utils.js"
import { NotFoundError, ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { isEmpty } from "lodash"
import moment from "moment"
import { EntitySchoolReposity } from "../../entity-school/entity-school.repository.js"
import { LocationRepository } from "../../location/location.repository.js"
import { TargetEstimationBiasRepository } from "../../microplanning/target-estimation-bias/target-estimation-bias.repository.js"
import { TargetsRepository } from "../../microplanning/targets/targets.repository.js"
import { doDecrypt } from "../../transaction/utils/transaction.encryption.js"
import { TargetEstimationNonBiasRepository } from "../target-estimation-non-bias/target-estimation-non-bias.repository.js"
import {
  CalculateBiasDetailDTO,
  CalculateTargetEstimationBiasRequestDTO,
  CalculateTargetEstimationPathRequestDTO,
  CalculateTargetEstimationRequestDTO,
  CommunityHealthWorkerSummary,
  EntityListResponse,
  GetDetailCalculateDTO,
  GlobalCategoryRequestDTO,
  ImmunizationServiceBiasSummary,
  ImmunizationServiceSummary,
  InjectionDashboardSummary,
  SaveEstimationBiasRequest,
  SaveEstimationRequest,
  SchoolDataResponse,
  SchoolIdParam,
  TargetSummaryResponse,
  UpdateEstimationBiasRequest,
  UpdateEstimationRequest,
  VillageIdParam,
} from "./target-estimation.schema.js"

export class TargetEstimationModule {
  constructor(
    private readonly nonBiasRepo: TargetEstimationNonBiasRepository,
    private readonly biasRepo: TargetEstimationBiasRepository,
    private readonly locationRepository: LocationRepository,
    private readonly entitySchoolRepo: EntitySchoolReposity,
    private readonly targetsRepo: TargetsRepository
  ) {}

  #getMonthlyInjection(
    countMap: Map<number, number>,
    isAugust: boolean
  ): number {
    const { grade1, grade2, grade5Female, grade5Male } =
      this.#extractSchoolGrades(countMap)

    return isAugust
      ? grade1 + grade5Female
      : grade1 + grade2 + grade5Male + grade5Female
  }

  #calculateBiasInjections(
    counts: Array<{ target_group_id: number; count: number }>,
    data: CalculateTargetEstimationBiasRequestDTO
  ) {
    const map = createCountRecord(counts)
    const { grade1, grade2, grade5Female, grade5Male } =
      this.#extractSchoolGrades(map)

    const augustInjectionYear = grade1 + grade5Female
    const novemberInjectionYear = grade1 + grade2 + grade5Male + grade5Female

    const augustSessions = Math.ceil(
      augustInjectionYear / FACILITY_SERVICE_CAPACITY
    )
    const augustVaccinator = data.august_immunization_service
    const augustServiceDays =
      augustVaccinator > 0 ? Math.ceil(augustSessions / augustVaccinator) : 0

    const novemberSessions = Math.ceil(
      novemberInjectionYear / FACILITY_SERVICE_CAPACITY
    )
    const novemberVaccinator = data.november_immunization_service
    const novemberServiceDays =
      novemberVaccinator > 0
        ? Math.ceil(novemberSessions / novemberVaccinator)
        : 0

    return {
      augustInjectionYear,
      novemberInjectionYear,
      augustSessions,
      augustVaccinator,
      augustServiceDays,
      novemberSessions,
      novemberVaccinator,
      novemberServiceDays,
    }
  }

  #calculateInjections(
    counts: Array<{ target_group_id: number; count: number }>,
    data: CalculateTargetEstimationRequestDTO
  ) {
    const map = createCountRecord(counts)
    const { bbl, si, baduta, wus } = this.#extractVillageTargets(map)

    const yearInfant =
      bbl * BBL_INJECTION_DOSE +
      si * SI_INJECTION_DOSE +
      baduta * BADUTA_INJECTION_DOSE
    const yearWUS = (wus * WUS_COVERAGE_PERCENTAGE) / PERCENTAGE_100
    const monthly = Math.ceil((yearInfant + yearWUS) / TOTAL_MONTH)

    const outreachMonthly = Math.ceil(
      (data.outreach_service_percentage / PERCENTAGE_100) *
        (monthly / OUTREACH_SERVICE_CAPACITY)
    )
    const facilityMonthly =
      Math.ceil(
        (data.facility_based_service_percentage / PERCENTAGE_100) *
          (monthly / FACILITY_SERVICE_CAPACITY)
      ) + 1

    const outreachAdd = outreachMonthly - data.outreach_service_available_number
    const facilityAdd =
      facilityMonthly - data.facility_based_service_available_number

    const outreachVac =
      data.outreach_service_available_number > 0
        ? Math.ceil(outreachMonthly / data.outreach_service_available_number)
        : 0

    const facilityVac =
      data.facility_based_service_available_number > 0
        ? Math.ceil(
            facilityMonthly / data.facility_based_service_available_number
          )
        : 0

    const idealWorker =
      data.outreach_service_available_number * WORKERS_PER_SERVICE_POINT

    return {
      injectionPerYearInfantBaduta: Math.ceil(yearInfant),
      injectionPerYearWUS: Math.ceil(yearWUS),
      injectionPerMonth: Math.ceil(monthly),
      optionalOutreachAdditionalVaccinator: outreachVac,
      optionalFacilityBasedAdditionalVaccinator: facilityVac,
      optionalOutreachAdditionalService: outreachAdd,
      optionalFacilityBasedAdditionalService: facilityAdd,
      idealNeededWorker: idealWorker,
      outreaceServiceNeededEveryMonth: outreachMonthly,
      facilityBasedServiceNeededEveryMonth: facilityMonthly,
    }
  }

  #extractVillageTargets(
    countMap: Map<number, number> | Record<number, number>
  ) {
    const isMap = countMap instanceof Map
    return {
      bbl: isMap ? (countMap.get(1) ?? 0) : (countMap[1] ?? 0),
      si: isMap ? (countMap.get(2) ?? 0) : (countMap[2] ?? 0),
      baduta: isMap ? (countMap.get(3) ?? 0) : (countMap[3] ?? 0),
      wus: isMap ? (countMap.get(9) ?? 0) : (countMap[9] ?? 0),
    }
  }

  #calcYearlyInjections(bbl: number, si: number, baduta: number, wus: number) {
    const yearlyBblBaduta =
      bbl * BBL_INJECTION_DOSE +
      si * SI_INJECTION_DOSE +
      baduta * BADUTA_INJECTION_DOSE
    const yearlyWus = Math.ceil(
      (wus * WUS_COVERAGE_PERCENTAGE) / PERCENTAGE_100
    )
    const monthly = Math.ceil((yearlyBblBaduta + yearlyWus) / TOTAL_MONTH)
    return { yearlyBblBaduta, yearlyWus, monthly }
  }

  #extractSchoolGrades(countMap: Map<number, number> | Record<number, number>) {
    const isMap = countMap instanceof Map
    const targetGroupId11 = 10
    return {
      grade1: isMap ? (countMap.get(4) ?? 0) : (countMap[4] ?? 0),
      grade2: isMap ? (countMap.get(5) ?? 0) : (countMap[5] ?? 0),
      grade5Female: isMap ? (countMap.get(7) ?? 0) : (countMap[7] ?? 0),
      grade5Male: isMap
        ? (countMap.get(targetGroupId11) ?? 0)
        : (countMap[targetGroupId11] ?? 0),
    }
  }

  #calcBiasInjections(
    grade1: number,
    grade2: number,
    grade5Female: number,
    grade5Male: number
  ) {
    const augustInjection = grade1 + grade5Female
    const novemberInjection = grade1 + grade2 + grade5Male + grade5Female

    const augustServiceRequired = Math.ceil(
      augustInjection / FACILITY_SERVICE_CAPACITY
    )
    const novemberServiceRequired = Math.ceil(
      novemberInjection / FACILITY_SERVICE_CAPACITY
    )

    return {
      augustInjection: augustInjection,
      novemberInjection: novemberInjection,
      augustServiceRequired,
      novemberServiceRequired,
      augustServiceDays:
        augustServiceRequired > 0
          ? Math.ceil(augustInjection / augustServiceRequired)
          : 0,
      novemberServiceDays:
        novemberServiceRequired > 0
          ? Math.ceil(novemberInjection / novemberServiceRequired)
          : 0,
    }
  }

  #getAllPreviousTargetGroupIds(targetGroupId: number): number[] {
    const idx = TARGET_GROUP_ORDER.indexOf(Math.floor(targetGroupId))
    if (idx <= 0) return []
    return TARGET_GROUP_ORDER.slice(0, idx)
  }

  #isGenderMatch(targetGroupId: number, gender: number): boolean {
    if (FEMALE_ONLY_TARGET_GROUPS.includes(targetGroupId))
      return gender === GENDER_FEMALE
    if (MALE_ONLY_TARGET_GROUPS.includes(targetGroupId))
      return gender === GENDER_MALE
    return true
  }

  #findMatchingTargetGroup(
    ageInDays: number,
    gender: number,
    targetGroups: Array<{ id: number; age_min: number; age_max: number }>
  ) {
    return targetGroups.find(
      (tg) =>
        ageInDays >= tg.age_min &&
        ageInDays <= tg.age_max &&
        this.#isGenderMatch(tg.id, gender)
    )
  }

  #isTargetInGroup(
    originalGroupId: number,
    currentGroupId: number,
    queryGroupId: number,
    gender: number
  ): boolean {
    if (
      FEMALE_ONLY_TARGET_GROUPS.includes(queryGroupId) &&
      gender !== GENDER_FEMALE
    )
      return false
    if (
      MALE_ONLY_TARGET_GROUPS.includes(queryGroupId) &&
      gender !== GENDER_MALE
    )
      return false

    const origIdx = TARGET_GROUP_ORDER.indexOf(originalGroupId)
    const currIdx = TARGET_GROUP_ORDER.indexOf(currentGroupId)
    const queryIdx = TARGET_GROUP_ORDER.indexOf(queryGroupId)

    return queryIdx > origIdx && queryIdx <= currIdx
  }

  #collectPreviousGroupIds(targetGroupIds: number[]): Set<number> {
    const allPrevGroupIds = new Set<number>()
    for (const tgId of targetGroupIds) {
      for (const prevId of this.#getAllPreviousTargetGroupIds(tgId)) {
        allPrevGroupIds.add(prevId)
      }
    }
    return allPrevGroupIds
  }

  async #fetchTargetsByPrevGroup(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    prevGroupIds: Set<number>
  ) {
    const targetsByPrevGroup = new Map<
      number,
      Array<{ date_of_birth: string | null; gender: number | null }>
    >()
    await Promise.all(
      Array.from(prevGroupIds).map(async (prevGroupId) => {
        const [villageTargets, entityTargets] = await Promise.all([
          this.targetsRepo.getTargetsWithDateOfBirthByLocation(
            c,
            subDistrictId,
            prevGroupId,
            microplanningId
          ),
          this.targetsRepo.getTargetsWithDateOfBirthByEntity(
            c,
            subDistrictId,
            prevGroupId,
            microplanningId
          ),
        ])
        targetsByPrevGroup.set(prevGroupId, [
          ...villageTargets,
          ...entityTargets,
        ])
      })
    )
    return targetsByPrevGroup
  }

  #processTargetForPromotion(
    today: Date,
    t: { date_of_birth: string | null; gender: number | null },
    prevGroupId: number,
    targetGroupIds: number[],
    allTargetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    promotedCounts: Map<number, number>
  ) {
    if (!t.date_of_birth || !t.gender) return
    const dob = doDecrypt(t.date_of_birth)
    const ageInDays = moment(today).diff(moment(dob), "days")
    if (ageInDays < 0) return

    const matched = this.#findMatchingTargetGroup(
      ageInDays,
      t.gender,
      allTargetGroups
    )
    if (!matched) return

    for (const queryGroupId of targetGroupIds) {
      if (
        this.#isTargetInGroup(prevGroupId, matched.id, queryGroupId, t.gender)
      ) {
        promotedCounts.set(
          queryGroupId,
          (promotedCounts.get(queryGroupId) ?? 0) + 1
        )
      }
    }
  }

  #countPromotedTargets(
    targetsByPrevGroup: Map<
      number,
      Array<{ date_of_birth: string | null; gender: number | null }>
    >,
    targetGroupIds: number[],
    allTargetGroups: Array<{ id: number; age_min: number; age_max: number }>,
    promotedCounts: Map<number, number>
  ) {
    const today = new Date()
    for (const [prevGroupId, targets] of targetsByPrevGroup) {
      for (const t of targets) {
        this.#processTargetForPromotion(
          today,
          t,
          prevGroupId,
          targetGroupIds,
          allTargetGroups,
          promotedCounts
        )
      }
    }
  }

  async #getPromotedCountsForGroups(
    c: Context,
    subDistrictId: number,
    targetGroupIds: number[],
    microplanningId: number
  ): Promise<Map<number, number>> {
    const allTargetGroups = await this.targetsRepo.getAllTargetGroups(c)
    const promotedCounts = new Map<number, number>()
    targetGroupIds.forEach((id) => promotedCounts.set(id, 0))

    const allPrevGroupIds = this.#collectPreviousGroupIds(targetGroupIds)
    const targetsByPrevGroup = await this.#fetchTargetsByPrevGroup(
      c,
      subDistrictId,
      microplanningId,
      allPrevGroupIds
    )
    this.#countPromotedTargets(
      targetsByPrevGroup,
      targetGroupIds,
      allTargetGroups,
      promotedCounts
    )

    return promotedCounts
  }

  async #checkVillageData(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    keyword?: string
  ): Promise<EntityListResponse> {
    const rawData = await this.nonBiasRepo.getVillagesBySubDistrict(
      c,
      subDistrictId,
      microplanningId,
      keyword
    )

    let dataCount = 0
    const entities = rawData.map((v) => {
      const hasData = v.microplanning_id !== null
      if (hasData) dataCount++

      return {
        id: v.village_id,
        name:
          c.var.t("targets.village_label") + " " + v.village_name.toUpperCase(),
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

  async #checkSchoolData(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    keyword?: string
  ): Promise<SchoolDataResponse> {
    const entityId = c.var.userEntity?.id
    if (!entityId)
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))

    const [outOfSchoolEstimation, rawData] = await Promise.all([
      this.biasRepo.getSchoolEstimationDetailsByMicroplanning(
        c,
        entityId,
        microplanningId
      ),
      this.biasRepo.getSchoolsBySubDistrict(
        c,
        subDistrictId,
        microplanningId,
        keyword
      ),
    ])

    const outOfSchoolHasData = outOfSchoolEstimation.length > 0

    const outOfSchoolEntities = [
      {
        id: entityId,
        name: c.var.t("target_estimation.children_not_in_school"),
        has_data: outOfSchoolHasData,
      },
    ]

    let dataCount = 0
    const entities = rawData.map((school) => {
      const hasData = school.microplanning_id !== null
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

  async #getInjectionDashboardNonBias(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<InjectionDashboardSummary> {
    const villages =
      await this.locationRepository.getLocationsByMicroplanningId(
        c,
        microplanningId,
        1
      )

    const villageIds = villages.map((v) => v.id!).filter((id) => id != null)
    const [batchCounts, promotedCounts, absoluteByVillage] = await Promise.all([
      this.locationRepository.getBatchTargetCountsByLocationIds(
        c,
        villageIds,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
      this.#getPromotedCountsForGroups(
        c,
        subDistrictId,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
      this.targetsRepo.getAbsoluteTargetsGroupedByEntity(
        c,
        microplanningId,
        VILLAGE_TARGET_GROUPS,
        "village"
      ),
    ])

    const countsMap = new Map(
      batchCounts.map((item) => [
        item.village_id,
        createCountRecord(item.counts),
      ])
    )

    // Build absolute counts map by village
    const absoluteByVillageMap = new Map<number, Record<number, number>>()
    for (const abs of absoluteByVillage) {
      if (!absoluteByVillageMap.has(abs.entity_id)) {
        absoluteByVillageMap.set(abs.entity_id, {})
      }
      const villageMap = absoluteByVillageMap.get(abs.entity_id)!
      villageMap[abs.target_group_id] = abs.qty
    }

    const villageDetails = villages.map((village) => {
      const map = countsMap.get(village.id) || {}
      const absoluteMap = absoluteByVillageMap.get(village.id) || {}

      // Combine regular targets with absolute targets per village
      const combined: Record<number, number> = {}
      for (const key in map) {
        combined[Number(key)] = map[Number(key)]
      }
      for (const key in absoluteMap) {
        combined[Number(key)] =
          (combined[Number(key)] ?? 0) + absoluteMap[Number(key)]
      }

      const { bbl, si, baduta, wus } = this.#extractVillageTargets(combined)
      const { yearlyBblBaduta, yearlyWus, monthly } =
        this.#calcYearlyInjections(bbl, si, baduta, wus)

      return {
        village_name: `${c.var.t("targets.village_label")} ${village.name?.toUpperCase()}`,
        annual_bbl_baduta: yearlyBblBaduta,
        annual_wus: yearlyWus,
        monthly,
      }
    })

    const promoted = this.#extractVillageTargets(promotedCounts)
    const { yearlyBblBaduta: promotedBblBaduta, yearlyWus: promotedWus } =
      this.#calcYearlyInjections(
        promoted.bbl,
        promoted.si,
        promoted.baduta,
        promoted.wus
      )

    const totalBblBaduta =
      villageDetails.reduce((sum, v) => sum + v.annual_bbl_baduta, 0) +
      promotedBblBaduta
    const totalYearlyWus =
      villageDetails.reduce((sum, v) => sum + v.annual_wus, 0) + promotedWus
    const totalMonthly = villageDetails.reduce((sum, v) => sum + v.monthly, 0)

    return {
      total_annual_injection: [
        {
          label: c.var.t("target_estimation.bbl_baduta"),
          type: "number",
          count: totalBblBaduta,
        },
        {
          label: c.var.t("target_estimation.wus"),
          type: "number",
          count: totalYearlyWus,
        },
      ],
      total_monthly_injection: [
        {
          label: c.var.t("target_estimation.monthly_injection"),
          type: "number",
          count: totalMonthly,
        },
      ],
      number_of_injection_by_village: {
        data: villageDetails.map((v) => ({
          label: v.village_name,
          data: [
            {
              label: c.var.t("target_estimation.annual_injection_bbl_baduta"),
              type: "number" as const,
              count: v.annual_bbl_baduta,
            },
            {
              label: c.var.t("target_estimation.annual_injection_wus"),
              type: "number" as const,
              count: v.annual_wus,
            },
            {
              label: c.var.t("target_estimation.monthly_injection"),
              type: "number" as const,
              count: v.monthly,
            },
          ],
        })),
      },
    }
  }

  async #getInjectionDashboardBias(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<InjectionDashboardSummary> {
    const schools = await this.entitySchoolRepo.getSchoolsByMicroplanningId(
      c,
      microplanningId,
      1
    )

    if (isEmpty(schools)) {
      throw new ValidationError(
        c.var.t("validator.not_exist", {
          field: c.var.t("targets.label.school"),
        })
      )
    }

    // Accumulate raw grade counts from all sources first, then calculate once
    let totalGrade1 = 0,
      totalGrade2 = 0,
      totalGrade5Female = 0,
      totalGrade5Male = 0

    const entityIds = schools.map((s) => s.id).filter((id) => id != null)
    const [
      batchCounts,
      promotedCounts,
      absoluteCounts,
      outOfSchoolCounts,
      absoluteBySchool,
    ] = await Promise.all([
      this.biasRepo.getBatchTargetCountsByEntityIds(
        c,
        entityIds,
        SCHOOL_TARGET_GROUPS,
        microplanningId
      ),
      this.#getPromotedCountsForGroups(
        c,
        subDistrictId,
        SCHOOL_TARGET_GROUPS,
        microplanningId
      ),
      this.targetsRepo.absoluteTargetGroupCounts(
        c,
        microplanningId,
        subDistrictId,
        SCHOOL_TARGET_GROUPS
      ),
      this.biasRepo.getOutOfSchoolTargetCounts(
        c,
        subDistrictId,
        SCHOOL_TARGET_GROUPS,
        microplanningId
      ),
      this.targetsRepo.getAbsoluteTargetsGroupedByEntity(
        c,
        microplanningId,
        SCHOOL_TARGET_GROUPS,
        "school"
      ),
    ])

    const countsMap = new Map(
      batchCounts.map((item) => [
        item.entity_id,
        createCountRecord(item.counts),
      ])
    )

    // Build absolute counts map by school
    const absoluteBySchoolMap = new Map<number, Record<number, number>>()
    for (const abs of absoluteBySchool) {
      if (!absoluteBySchoolMap.has(abs.entity_id)) {
        absoluteBySchoolMap.set(abs.entity_id, {})
      }
      const schoolMap = absoluteBySchoolMap.get(abs.entity_id)!
      schoolMap[abs.target_group_id] = abs.qty
    }

    const schoolDetails = schools.map((school) => {
      const countMap =
        countsMap.get(school.id) ?? ({} as Record<number, number>)
      const absoluteMap = absoluteBySchoolMap.get(school.id) || {}

      // Combine regular targets with absolute targets per school
      const combined: Record<number, number> = {}
      for (const key in countMap) {
        combined[Number(key)] = countMap[Number(key)]
      }
      for (const key in absoluteMap) {
        combined[Number(key)] =
          (combined[Number(key)] ?? 0) + absoluteMap[Number(key)]
      }

      const gradeCounts = this.#extractSchoolGrades(combined)

      totalGrade1 += gradeCounts.grade1
      totalGrade2 += gradeCounts.grade2
      totalGrade5Female += gradeCounts.grade5Female
      totalGrade5Male += gradeCounts.grade5Male

      const biasCalc = this.#calcBiasInjections(
        gradeCounts.grade1,
        gradeCounts.grade2,
        gradeCounts.grade5Female,
        gradeCounts.grade5Male
      )

      return {
        school_name: school.name,
        aug_injection: biasCalc.augustInjection,
        nov_injection: biasCalc.novemberInjection,
      }
    })

    const promotedGrades = this.#extractSchoolGrades(promotedCounts)
    totalGrade1 += promotedGrades.grade1
    totalGrade2 += promotedGrades.grade2
    totalGrade5Female += promotedGrades.grade5Female
    totalGrade5Male += promotedGrades.grade5Male

    // Out-of-school regular counts
    const outOfSchoolGradeCounts = this.#extractSchoolGrades(
      createCountRecord(outOfSchoolCounts)
    )
    totalGrade1 += outOfSchoolGradeCounts.grade1
    totalGrade2 += outOfSchoolGradeCounts.grade2
    totalGrade5Female += outOfSchoolGradeCounts.grade5Female
    totalGrade5Male += outOfSchoolGradeCounts.grade5Male

    const absoluteMap = new Map(
      absoluteCounts.map((a) => [a.id, Number(a.qty ?? 0)])
    )

    // Out-of-school absolute (decimal IDs: 4.1, 5.1, 7.1, 13.1)
    const outOfSchoolAbsoluteGrades = this.#extractSchoolGrades(
      new Map<number, number>([
        [4, absoluteMap.get(4.1) ?? 0],
        [5, absoluteMap.get(5.1) ?? 0],
        [7, absoluteMap.get(7.1) ?? 0],
        [10, absoluteMap.get(13.1) ?? 0],
      ])
    )
    totalGrade1 += outOfSchoolAbsoluteGrades.grade1
    totalGrade2 += outOfSchoolAbsoluteGrades.grade2
    totalGrade5Female += outOfSchoolAbsoluteGrades.grade5Female
    totalGrade5Male += outOfSchoolAbsoluteGrades.grade5Male

    const outOfSchoolSummary = this.#getOutOfSchoolInjectionSummary(
      c,
      outOfSchoolGradeCounts,
      outOfSchoolAbsoluteGrades
    )

    // Calculate total by summing school injections + out-of-school to ensure consistency
    const totalAugustInjection =
      schoolDetails.reduce((sum, s) => sum + s.aug_injection, 0) +
      outOfSchoolSummary.data[0].count
    const totalNovemberInjection =
      schoolDetails.reduce((sum, s) => sum + s.nov_injection, 0) +
      outOfSchoolSummary.data[1].count

    return {
      number_of_injection: [
        {
          label: c.var.t("target_estimation.august"),
          type: "number",
          count: totalAugustInjection,
        },
        {
          label: c.var.t("target_estimation.november"),
          type: "number",
          count: totalNovemberInjection,
        },
      ],
      number_of_injection_by_school: {
        data_out_of_school: [outOfSchoolSummary],
        data: schoolDetails.map((v) => ({
          label: v.school_name ?? "",
          data: [
            {
              label: c.var.t("target_estimation.august"),
              type: "number",
              count: v.aug_injection,
            },
            {
              label: c.var.t("target_estimation.november"),
              type: "number",
              count: v.nov_injection,
            },
          ],
        })),
      },
    }
  }

  #getOutOfSchoolInjectionSummary(
    c: Context,
    gradeCounts: {
      grade1: number
      grade2: number
      grade5Female: number
      grade5Male: number
    },
    absoluteGrades: {
      grade1: number
      grade2: number
      grade5Female: number
      grade5Male: number
    }
  ) {
    const biasCalc = this.#calcBiasInjections(
      gradeCounts.grade1 + absoluteGrades.grade1,
      gradeCounts.grade2 + absoluteGrades.grade2,
      gradeCounts.grade5Female + absoluteGrades.grade5Female,
      gradeCounts.grade5Male + absoluteGrades.grade5Male
    )

    return {
      label: c.var.t("target_estimation.children_not_in_school"),
      data: [
        {
          label: c.var.t("target_estimation.august"),
          type: "number" as const,
          count: biasCalc.augustInjection,
        },
        {
          label: c.var.t("target_estimation.november"),
          type: "number" as const,
          count: biasCalc.novemberInjection,
        },
      ],
    }
  }

  async #getTargetSummaryNonBias(
    c: Context,
    param: GetDetailCalculateDTO
  ): Promise<TargetSummaryResponse> {
    const entityId = c.var.userEntity?.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!

    const [counts, location, savedEstimation] = await Promise.all([
      this.nonBiasRepo.getTargetCountsByVillageId(
        c,
        param.id,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
      this.nonBiasRepo.getLocationName(c, param.id),
      this.nonBiasRepo.getVillageEstimationDetailsByMicroplanning(
        c,
        param.id,
        microplanningId
      ),
    ])

    if (!location) {
      throw new ValidationError(c.var.t("target_estimation.village_not_exist"))
    }

    const countMap = createCountMap(counts)
    const { bbl, si, baduta, wus } = this.#extractVillageTargets(countMap)

    const buildImmunizationService = () => {
      if (!savedEstimation) {
        return [
          {
            key: "service_percentage_by_type",
            label: c.var.t("target_estimation.service_percentage_by_type"),
            services: [
              {
                key: "outreach_service",
                label: c.var.t("target_estimation.outreach_service"),
                type: "percentage",
                count: null,
              },
              {
                key: "facility_based_service",
                label: c.var.t("target_estimation.facility_based_service"),
                type: "percentage",
                count: null,
              },
            ],
          },
          // {
          //   key: "required_monthly_service_points",
          //   label: c.var.t("target_estimation.required_monthly_service_points"),
          //   services: [
          //     {
          //       key: "outreach_service",
          //       label: c.var.t("target_estimation.outreach_service"),
          //       type: "number",
          //       count: null,
          //     },
          //     {
          //       key: "facility_based_service",
          //       label: c.var.t("target_estimation.facility_based_service"),
          //       type: "number",
          //       count: null,
          //     },
          //   ],
          // },
          {
            key: "available_service_points_days",
            label: c.var.t("target_estimation.available_service_points_days"),
            services: [
              {
                key: "outreach_service",
                label: c.var.t("target_estimation.outreach_service"),
                type: "number",
                count: null,
              },
              {
                key: "facility_based_service",
                label: c.var.t("target_estimation.facility_based_service"),
                type: "number",
                count: null,
              },
            ],
          },
          // {
          //   key: "immunization_service_solution",
          //   label: c.var.t(
          //     "target_estimation.option_immunization_service_solution"
          //   ),
          //   services: [
          //     {
          //       key: "outreach_service",
          //       label: null,
          //       count: null,
          //       sub_label: c.var.t("target_estimation.outreach_service"),
          //       sub_services: [
          //         {
          //           key: "required_additional_service_points",
          //           label: c.var.t(
          //             "target_estimation.required_additional_service_points"
          //           ),
          //           type: "number",
          //           count: null,
          //         },
          //         {
          //           key: "vaccinator_required_per_service_point",
          //           label: c.var.t(
          //             "target_estimation.vaccinator_required_per_service_point"
          //           ),
          //           type: "number",
          //           count: null,
          //         },
          //       ],
          //     },
          //     {
          //       key: "facility_based_service",
          //       label: null,
          //       count: null,
          //       sub_label: c.var.t("target_estimation.facility_based_service"),
          //       sub_services: [
          //         {
          //           key: "required_additional_days",
          //           label: c.var.t(
          //             "target_estimation.required_additional_days"
          //           ),
          //           type: "number",
          //           count: null,
          //         },
          //         {
          //           key: "vaccinator_required_per_days",
          //           label: c.var.t(
          //             "target_estimation.vaccinator_required_per_days"
          //           ),
          //           type: "number",
          //           count: null,
          //         },
          //       ],
          //     },
          //   ],
          // },
        ]
      }

      return [
        {
          key: "service_percentage_by_type",
          label: c.var.t("target_estimation.service_percentage_by_type"),
          services: [
            {
              key: "outreach_service",
              label: c.var.t("target_estimation.outreach_service"),
              type: "percentage",
              count: Number(savedEstimation.outreach_service_percentage || 0),
            },
            {
              key: "facility_based_service",
              label: c.var.t("target_estimation.facility_based_service"),
              type: "percentage",
              count: Number(savedEstimation.facility_service_percentage || 0),
            },
          ],
        },
        // {
        //   key: "required_monthly_service_points",
        //   label: c.var.t("target_estimation.required_monthly_service_points"),
        //   services: [
        //     {
        //       key: "outreach_service",
        //       label: c.var.t("target_estimation.outreach_service"),
        //       type: "number",
        //       count: savedEstimation.required_monthly_outreach_service ?? 0,
        //     },
        //     {
        //       key: "facility_based_service",
        //       label: c.var.t("target_estimation.facility_based_service"),
        //       type: "number",
        //       count: savedEstimation.required_monthly_facility_service ?? 0,
        //     },
        //   ],
        // },
        {
          key: "available_service_points_days",
          label: c.var.t("target_estimation.available_service_points_days"),
          services: [
            {
              key: "outreach_service",
              label: c.var.t("target_estimation.outreach_service"),
              type: "number",
              count: savedEstimation.available_outreach_service ?? 0,
            },
            {
              key: "facility_based_service",
              label: c.var.t("target_estimation.facility_based_service"),
              type: "number",
              count: savedEstimation.available_facillity_service ?? 0,
            },
          ],
        },
        // {
        //   key: "immunization_service_solution",
        //   label: c.var.t(
        //     "target_estimation.option_immunization_service_solution"
        //   ),
        //   services: [
        //     {
        //       key: "outreach_service",
        //       label: null,
        //       count: null,
        //       sub_label: c.var.t("target_estimation.outreach_service"),
        //       sub_services: [
        //         {
        //           key: "required_additional_service_points",
        //           label: c.var.t(
        //             "target_estimation.required_additional_service_points"
        //           ),
        //           type: "number",
        //           count: savedEstimation.additional_outreach_service ?? 0,
        //         },
        //         {
        //           key: "vaccinator_required_per_service_point",
        //           label: c.var.t(
        //             "target_estimation.vaccinator_required_per_service_point"
        //           ),
        //           type: "number",
        //           count:
        //             savedEstimation.additional_outreach_vaccinator_service ?? 0,
        //         },
        //       ],
        //     },
        //     {
        //       key: "facility_based_service",
        //       label: null,
        //       count: null,
        //       sub_label: c.var.t("target_estimation.facility_based_service"),
        //       sub_services: [
        //         {
        //           key: "required_additional_days",
        //           label: c.var.t("target_estimation.required_additional_days"),
        //           type: "number",
        //           count: savedEstimation.additional_facility_service ?? 0,
        //         },
        //         {
        //           key: "vaccinator_required_per_days",
        //           label: c.var.t(
        //             "target_estimation.vaccinator_required_per_days"
        //           ),
        //           type: "number",
        //           count:
        //             savedEstimation.additional_facility_vaccinator_service ?? 0,
        //         },
        //       ],
        //     },
        //   ],
        // },
      ]
    }

    const buildCommunityHealthWorker = () => {
      if (!savedEstimation) {
        return [
          {
            key: "ideal_needs",
            label: c.var.t("target_estimation.ideal_needs"),
            count: null,
          },
          {
            key: "available_community_health_worker",
            label: c.var.t(
              "target_estimation.available_community_health_worker"
            ),
            count: null,
          },
          {
            key: "gap_community_health_worker",
            label: c.var.t("target_estimation.gap_community_health_worker"),
            count: null,
          },
        ]
      }

      return [
        {
          key: "ideal_needs",
          label: c.var.t("target_estimation.ideal_needs"),
          type: "number",
          count: savedEstimation.health_worker_ideal_needs ?? 0,
        },
        {
          key: "available_community_health_worker",
          label: c.var.t("target_estimation.available_community_health_worker"),
          type: "number",
          count: savedEstimation.available_worker ?? 0,
        },
        {
          key: "gap_community_health_worker",
          label: c.var.t("target_estimation.gap_community_health_worker"),
          type: "number",
          count: savedEstimation.gap_health_worker ?? 0,
        },
      ]
    }

    const { yearlyBblBaduta, yearlyWus, monthly } = this.#calcYearlyInjections(
      bbl,
      si,
      baduta,
      wus
    )

    return {
      entity_id: param.id,
      name: location?.name
        ? `${c.var.t("targets.village_label")} ${location.name}`
        : null,
      immunization_service: buildImmunizationService(),
      community_health_worker: buildCommunityHealthWorker(),
      number_of_target: [
        { label: c.var.t("targets.target_group.1"), count: bbl },
        { label: c.var.t("targets.target_group.2"), count: si },
        { label: c.var.t("targets.target_group.3"), count: baduta },
        { label: c.var.t("targets.target_group.9"), count: wus },
      ],
      number_of_injection: [
        {
          label: c.var.t("target_estimation.annual"),
          count: yearlyBblBaduta + yearlyWus,
          targets: [
            {
              label: c.var.t("target_estimation.bbl_baduta"),
              type: "number",
              count: yearlyBblBaduta,
            },
            {
              label: c.var.t("target_estimation.wus"),
              type: "number",
              count: yearlyWus,
            },
          ],
        },
        {
          label: c.var.t("target_estimation.monthly"),
          count: monthly,
        },
      ],
    }
  }

  async #getTargetSummaryBias(
    c: Context,
    param: GetDetailCalculateDTO
  ): Promise<TargetSummaryResponse> {
    const {
      sub_district_id,
      name: entityName,
      id: entityId,
    } = c.var.userEntity ?? {}
    if (!entityId)
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))

    const microplanningId = c.var.microplanningId!

    const isOutOfSchool = param.id === entityId

    const [counts, schoolName, savedEstimation, absoluteCounts] =
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
              param.id,
              SCHOOL_TARGET_GROUPS,
              microplanningId
            ),
        isOutOfSchool
          ? Promise.resolve({ name: entityName ?? "Out of School" })
          : this.biasRepo.getSchoolName(c, param.id),
        this.biasRepo.getSchoolEstimationDetailsByMicroplanning(
          c,
          param.id,
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
              param.id,
              SCHOOL_TARGET_GROUPS,
              "school"
            ),
      ])

    if (!schoolName)
      throw new ValidationError(c.var.t("target_estimation.school_not_exist"))

    const absoluteMap: Record<number, number> = {}
    for (const abs of absoluteCounts) {
      absoluteMap[abs.target_group_id] =
        (absoluteMap[abs.target_group_id] ?? 0) + abs.count
    }

    const mergedMap: Record<number, number> = { ...absoluteMap }
    for (const row of counts) {
      const tgId = row.target_group_id!
      mergedMap[tgId] = (mergedMap[tgId] ?? 0) + Number(row.count)
    }

    const formattedCounts = Object.entries(mergedMap).map(([tgId, count]) => ({
      target_group_id: Number(tgId),
      count,
    }))

    const countMap = createCountMap(formattedCounts)
    const gradeCounts = this.#extractSchoolGrades(countMap)

    const augustSaved = savedEstimation.find(
      (d) => d.schedule_month === "August"
    )
    const novemberSaved = savedEstimation.find(
      (d) => d.schedule_month === "November"
    )

    const calculations = this.#calculateBiasInjections(formattedCounts, {
      august_immunization_service: 0,
      november_immunization_service: 0,
    })

    const buildServices = (
      saved: typeof augustSaved,
      calc: typeof calculations,
      isAugust: boolean
    ) => {
      if (saved) {
        return [
          {
            key: "service_points_required",
            label: c.var.t("target_estimation.service_points_required"),
            type: "number",
            count: saved.required_service ?? 0,
          },
          {
            key: "service_days_required",
            label: c.var.t("target_estimation.service_days_required"),
            type: "number",
            count: saved.required_service_days ?? 0,
          },
          {
            key: "vaccinators_carrying_out_bias",
            label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
            type: "number",
            count: saved.available_vaccinator ?? 0,
          },
        ]
      }
      const serviceDays = isAugust
        ? calc.augustServiceDays
        : calc.novemberServiceDays
      return [
        {
          key: "service_points_required",
          label: c.var.t("target_estimation.service_points_required"),
          type: "number",
          count: isAugust ? calc.augustSessions : calc.novemberSessions,
        },
        {
          key: "service_days_required",
          label: c.var.t("target_estimation.service_days_required"),
          type: "number",
          count: isNaN(serviceDays) ? 0 : serviceDays,
        },
        {
          key: "vaccinators_carrying_out_bias",
          label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
          type: "number",
          count: null,
        },
      ]
    }

    const augustServices = buildServices(augustSaved, calculations, true)
    const novemberServices = buildServices(novemberSaved, calculations, false)

    return {
      entity_id: isOutOfSchool ? entityId : param.id,
      name: schoolName?.name ?? null,
      immunization_service: [
        {
          key: "immunization_service_august",
          label: c.var.t("target_estimation.immunization_service_august"),
          services: augustServices,
        },
        {
          key: "immunization_service_november",
          label: c.var.t("target_estimation.immunization_service_november"),
          services: novemberServices,
        },
      ],
      number_of_target: [
        {
          label: c.var.t("targets.school_target.4"),
          type: "number",
          count: gradeCounts.grade1,
        },
        {
          label: c.var.t("targets.school_target.5"),
          type: "number",
          count: gradeCounts.grade2,
        },
        {
          label: c.var.t("targets.school_target.7"),
          targets: [
            {
              label: c.var.t("bias_immunization_logistics.td_male_female"),
              type: "number",
              count: gradeCounts.grade5Female + gradeCounts.grade5Male,
            },
            {
              label: c.var.t("bias_immunization_logistics.hpv_female"),
              type: "number",
              count: gradeCounts.grade5Female,
            },
          ],
        },
      ],
      number_of_injection: [
        {
          label: c.var.t("target_estimation.august"),
          type: "number",
          count: this.#getMonthlyInjection(countMap, true),
        },
        {
          label: c.var.t("target_estimation.november"),
          type: "number",
          count: this.#getMonthlyInjection(countMap, false),
        },
      ],
    }
  }

  async #getOutOfSchoolServiceSummary(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ) {
    const entityId = c.var.userEntity?.id

    const [counts, absoluteCounts] = await Promise.all([
      this.biasRepo.getOutOfSchoolTargetCounts(
        c,
        subDistrictId,
        SCHOOL_TARGET_GROUPS,
        microplanningId
      ),
      this.targetsRepo.absoluteTargetGroupCounts(
        c,
        microplanningId,
        subDistrictId,
        SCHOOL_TARGET_GROUPS
      ),
    ])

    const countMap = createCountRecord(counts)
    const gradeCounts = this.#extractSchoolGrades(countMap)

    const absoluteMap = new Map(
      absoluteCounts.map((a) => [a.id, Number(a.qty ?? 0)])
    )
    const absoluteGrades = this.#extractSchoolGrades(
      new Map<number, number>([
        [4, absoluteMap.get(4.1) ?? 0],
        [5, absoluteMap.get(5.1) ?? 0],
        [7, absoluteMap.get(7.1) ?? 0],
        [10, absoluteMap.get(13.1) ?? 0],
      ])
    )

    const biasCalc = this.#calcBiasInjections(
      gradeCounts.grade1 + absoluteGrades.grade1,
      gradeCounts.grade2 + absoluteGrades.grade2,
      gradeCounts.grade5Female + absoluteGrades.grade5Female,
      gradeCounts.grade5Male + absoluteGrades.grade5Male
    )

    let augustVaccinator = 0
    let novemberVaccinator = 0

    if (entityId) {
      const details =
        await this.biasRepo.getSchoolEstimationDetailsByMicroplanning(
          c,
          entityId,
          microplanningId
        )

      for (const detail of details) {
        if (detail.schedule_month === "August") {
          augustVaccinator += Number(detail.available_vaccinator ?? 0)
        } else if (detail.schedule_month === "November") {
          novemberVaccinator += Number(detail.available_vaccinator ?? 0)
        }
      }
    }

    const augustServiceDays = augustVaccinator
      ? Math.ceil(biasCalc.augustServiceRequired / augustVaccinator)
      : 0
    const novemberServiceDays = novemberVaccinator
      ? Math.ceil(biasCalc.novemberServiceRequired / novemberVaccinator)
      : 0

    return {
      august_service_points: biasCalc.augustServiceRequired,
      august_service_days: augustServiceDays,
      august_vaccinator: augustVaccinator,
      november_service_points: biasCalc.novemberServiceRequired,
      november_service_days: novemberServiceDays,
      november_vaccinator: novemberVaccinator,
    }
  }

  async #getNonBiasDashboard(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<ImmunizationServiceSummary> {
    const villageData = await this.nonBiasRepo.getImmunizationServiceDashboard(
      c,
      subDistrictId,
      microplanningId
    )

    // Fetch target counts to calculate injection-based service points
    const villageIds = villageData
      .map((v) => v.village_id!)
      .filter((id) => id != null)

    const [batchCounts, absoluteCounts] = await Promise.all([
      this.locationRepository.getBatchTargetCountsByLocationIds(
        c,
        villageIds,
        VILLAGE_TARGET_GROUPS,
        microplanningId
      ),
      this.targetsRepo.getAbsoluteTargetsGroup(c, {
        microplanningId,
        targetGroupIds: VILLAGE_TARGET_GROUPS,
        subDistrictId,
      }),
    ])

    const countsMap = new Map(
      batchCounts.map((item) => [
        item.village_id,
        createCountRecord(item.counts),
      ])
    )
    const countsMapAbsolute = new Map<number, Record<number, number>>()
    absoluteCounts.forEach((item) => {
      const villageId = Number(item.village_id)
      if (!countsMapAbsolute.has(villageId)) {
        countsMapAbsolute.set(villageId, {})
      }
      countsMapAbsolute.get(villageId)![item.target_group_id] = Number(item.qty)
    })

    let totalMonthlyOutreach = 0,
      totalMonthlyFacility = 0
    let totalAvailableOutreach = 0,
      totalAvailableFacility = 0
    let totalAdditionalOutreach = 0,
      totalAdditionalFacility = 0
    let totalVaccinatorOutreach = 0,
      totalVaccinatorFacility = 0

    const villages = villageData.map((village) => {
      const hasData = village.outreach_service_percentage !== null
      const outreachPercentage = Number(
        village.outreach_service_percentage ?? 0
      )
      const facilityPercentage = Number(
        village.facility_service_percentage ?? 0
      )

      // Calculate monthly injection from target counts
      const targetMap = {
        ...countsMap.get(village.village_id),
        ...countsMapAbsolute.get(village.village_id),
      }
      const { bbl, si, baduta, wus } = this.#extractVillageTargets(targetMap)
      const { monthly } = this.#calcYearlyInjections(bbl, si, baduta, wus)

      const monthlyOutreach = Math.ceil(
        (outreachPercentage / PERCENTAGE_100) *
          (monthly / OUTREACH_SERVICE_CAPACITY)
      )
      const monthlyFacility = Math.ceil(
        (facilityPercentage / PERCENTAGE_100) *
          (monthly / FACILITY_SERVICE_CAPACITY) +
          (hasData ? 1 : 0)
      )

      const availableOutreach = village.available_outreach_service ?? 0
      const availableFacility = village.available_facillity_service ?? 0
      const additionalOutreach = monthlyOutreach - availableOutreach
      const additionalFacility = monthlyFacility - availableFacility
      const vaccinatorOutreach =
        availableOutreach > 0
          ? Math.ceil(monthlyOutreach / availableOutreach)
          : 0
      const vaccinatorFacility =
        availableFacility > 0
          ? Math.ceil(monthlyFacility / availableFacility)
          : 0

      totalMonthlyOutreach += monthlyOutreach
      totalMonthlyFacility += monthlyFacility
      totalAvailableOutreach += availableOutreach
      totalAvailableFacility += availableFacility
      totalAdditionalOutreach += additionalOutreach
      totalAdditionalFacility += additionalFacility
      totalVaccinatorOutreach += vaccinatorOutreach
      totalVaccinatorFacility += vaccinatorFacility

      return {
        id: village.village_id,
        name: c.var.t("targets.village_label") + " " + village.village_name,
        service_percentage_by_type: [
          {
            label: c.var.t("target_estimation.outreach_service"),
            type: "percentage",
            count: outreachPercentage,
          },
          {
            label: c.var.t("target_estimation.facility_based_service"),
            type: "percentage",
            count: facilityPercentage,
          },
        ],
        required_monthly_service_points: [
          {
            label: c.var.t("target_estimation.outreach_service"),
            type: "number",
            count: monthlyOutreach,
          },
          {
            label: c.var.t("target_estimation.facility_based_service"),
            type: "number",
            count: monthlyFacility,
          },
        ],
        available_service_points_days: [
          {
            label: c.var.t("target_estimation.outreach_service"),
            type: "number",
            count: availableOutreach,
          },
          {
            label: c.var.t("target_estimation.facility_based_service"),
            type: "number",
            count: availableFacility,
          },
        ],
        option_of_immunization_service_solution: [
          {
            sub_label: c.var.t("target_estimation.outreach_service"),
            items: [
              {
                label: c.var.t(
                  "target_estimation.required_additional_service_points"
                ),
                type: "number",
                count: additionalOutreach,
                is_negatif: true,
              },
              {
                label: c.var.t(
                  "target_estimation.vaccinator_required_per_service_point"
                ),
                type: "number",
                count: vaccinatorOutreach,
                is_negatif: true,
              },
            ],
          },
          {
            sub_label: c.var.t("target_estimation.facility_based_service"),
            items: [
              {
                label: c.var.t("target_estimation.required_additional_days"),
                type: "number",
                count: additionalFacility,
                is_negatif: true,
              },
              {
                label: c.var.t(
                  "target_estimation.vaccinator_required_per_days"
                ),
                type: "number",
                count: vaccinatorFacility,
                is_negatif: true,
              },
            ],
          },
        ],
      }
    })

    return {
      aggregate_of_all_villages: c.var.t(
        "target_estimation.aggregate_villages"
      ),
      required_monthly_service_points: [
        {
          label: c.var.t("target_estimation.outreach_service"),
          type: "number",
          count: totalMonthlyOutreach,
        },
        {
          label: c.var.t("target_estimation.facility_based_service"),
          type: "number",
          count: totalMonthlyFacility,
        },
      ],
      available_service_points_days: [
        {
          label: c.var.t("target_estimation.outreach_service"),
          type: "number",
          count: totalAvailableOutreach,
        },
        {
          label: c.var.t("target_estimation.facility_based_service"),
          type: "number",
          count: totalAvailableFacility,
        },
      ],
      option_of_immunization_service_solution: [
        {
          sub_label: c.var.t("target_estimation.outreach_service"),
          items: [
            {
              label: c.var.t(
                "target_estimation.required_additional_service_points"
              ),
              type: "number",
              count: totalAdditionalOutreach,
              is_negatif: true,
            },
            {
              label: c.var.t(
                "target_estimation.vaccinator_required_per_service_point"
              ),
              type: "number",
              count: totalVaccinatorOutreach,
              is_negatif: true,
            },
          ],
        },
        {
          sub_label: c.var.t("target_estimation.facility_based_service"),
          items: [
            {
              label: c.var.t("target_estimation.required_additional_days"),
              type: "number",
              count: totalAdditionalFacility,
              is_negatif: true,
            },
            {
              label: c.var.t("target_estimation.vaccinator_required_per_days"),
              type: "number",
              count: totalVaccinatorFacility,
              is_negatif: true,
            },
          ],
        },
      ],
      immunization_service_by_village: {
        data: villages,
      },
    }
  }

  async #getBiasDashboard(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<ImmunizationServiceBiasSummary> {
    const schoolData = await this.biasRepo.getImmunizationServiceDashboard(
      c,
      subDistrictId,
      microplanningId
    )

    let totalAugustServicePoints = 0,
      totalAugustServiceDays = 0,
      totalAugustVaccinators = 0
    let totalNovemberServicePoints = 0,
      totalNovemberServiceDays = 0,
      totalNovemberVaccinators = 0

    const entityIds = schoolData
      .map((s) => s.entity_id!)
      .filter((id) => id != null)
    const [batchCounts, absoluteBySchool] = await Promise.all([
      this.biasRepo.getBatchTargetCountsByEntityIds(
        c,
        entityIds,
        SCHOOL_TARGET_GROUPS,
        microplanningId
      ),
      this.targetsRepo.getAbsoluteTargetsGroupedByEntity(
        c,
        microplanningId,
        SCHOOL_TARGET_GROUPS,
        "school"
      ),
    ])

    const countsMap = new Map(
      batchCounts.map((item) => [
        item.entity_id,
        createCountRecord(item.counts),
      ])
    )

    const absoluteBySchoolMap = new Map<number, Record<number, number>>()
    for (const abs of absoluteBySchool) {
      if (!absoluteBySchoolMap.has(abs.entity_id)) {
        absoluteBySchoolMap.set(abs.entity_id, {})
      }
      absoluteBySchoolMap.get(abs.entity_id)![abs.target_group_id] = abs.qty
    }

    const schools = schoolData.map((school) => {
      const countMap =
        countsMap.get(school.entity_id) ?? ({} as Record<number, number>)
      const absoluteMap = absoluteBySchoolMap.get(school.entity_id) ?? {}

      const combined: Record<number, number> = {}
      for (const key in countMap) {
        combined[Number(key)] = countMap[Number(key)]
      }
      for (const key in absoluteMap) {
        combined[Number(key)] =
          (combined[Number(key)] ?? 0) + absoluteMap[Number(key)]
      }

      const gradeCounts = this.#extractSchoolGrades(combined)
      const biasCalc = this.#calcBiasInjections(
        gradeCounts.grade1,
        gradeCounts.grade2,
        gradeCounts.grade5Female,
        gradeCounts.grade5Male
      )

      const augustServicePoints = biasCalc.augustServiceRequired
      const augustServiceDays = Math.ceil(
        Number(school.august_vaccinator)
          ? augustServicePoints / Number(school.august_vaccinator)
          : 0
      )
      const novemberServicePoints = biasCalc.novemberServiceRequired
      const novemberServiceDays = Math.ceil(
        Number(school.november_vaccinator)
          ? novemberServicePoints / Number(school.november_vaccinator)
          : 0
      )

      const augustVaccinators = Number(school.august_vaccinator ?? 0)
      const novemberVaccinators = Number(school.november_vaccinator ?? 0)

      totalAugustServicePoints += augustServicePoints
      totalAugustServiceDays += augustServiceDays
      totalAugustVaccinators += augustVaccinators
      totalNovemberServicePoints += novemberServicePoints
      totalNovemberServiceDays += novemberServiceDays
      totalNovemberVaccinators += novemberVaccinators

      return {
        id: school.entity_id,
        name: school.entity_name ?? "",
        immunization_service_on_august: [
          {
            label: c.var.t("target_estimation.service_points_required"),
            type: "number",
            count: augustServicePoints,
          },
          {
            label: c.var.t("target_estimation.service_days_required"),
            type: "number",
            count: augustServiceDays,
          },
          {
            label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
            type: "number",
            count: augustVaccinators,
          },
        ],
        immunization_service_on_november: [
          {
            label: c.var.t("target_estimation.service_points_required"),
            type: "number",
            count: novemberServicePoints,
          },
          {
            label: c.var.t("target_estimation.service_days_required"),
            type: "number",
            count: novemberServiceDays,
          },
          {
            label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
            type: "number",
            count: novemberVaccinators,
          },
        ],
      }
    })

    const outOfSchoolData = await this.#getOutOfSchoolServiceSummary(
      c,
      subDistrictId,
      microplanningId
    )

    return {
      aggregate_of_all_schools: c.var.t("target_estimation.aggregate_schools"),
      immunization_service_on_august: [
        {
          label: c.var.t("target_estimation.service_points_required"),
          type: "number",
          count:
            totalAugustServicePoints + outOfSchoolData.august_service_points,
        },
        {
          label: c.var.t("target_estimation.service_days_required"),
          type: "number",
          count: totalAugustServiceDays + outOfSchoolData.august_service_days,
        },
        {
          label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
          type: "number",
          count: totalAugustVaccinators + outOfSchoolData.august_vaccinator,
        },
      ],
      immunization_service_on_november: [
        {
          label: c.var.t("target_estimation.service_points_required"),
          type: "number",
          count:
            totalNovemberServicePoints +
            outOfSchoolData.november_service_points,
        },
        {
          label: c.var.t("target_estimation.service_days_required"),
          type: "number",
          count:
            totalNovemberServiceDays + outOfSchoolData.november_service_days,
        },
        {
          label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
          type: "number",
          count: totalNovemberVaccinators + outOfSchoolData.november_vaccinator,
        },
      ],
      immunization_service_summary_by_school: {
        data_out_of_school: [
          {
            id: 0,
            name: c.var.t("target_estimation.children_not_in_school"),
            immunization_service_on_august: [
              {
                label: c.var.t("target_estimation.service_points_required"),
                type: "number",
                count: outOfSchoolData.august_service_points,
              },
              {
                label: c.var.t("target_estimation.service_days_required"),
                type: "number",
                count: outOfSchoolData.august_service_days,
              },
              {
                label: c.var.t(
                  "target_estimation.vaccinators_carrying_out_bias"
                ),
                type: "number",
                count: outOfSchoolData.august_vaccinator,
              },
            ],
            immunization_service_on_november: [
              {
                label: c.var.t("target_estimation.service_points_required"),
                type: "number",
                count: outOfSchoolData.november_service_points,
              },
              {
                label: c.var.t("target_estimation.service_days_required"),
                type: "number",
                count: outOfSchoolData.november_service_days,
              },
              {
                label: c.var.t(
                  "target_estimation.vaccinators_carrying_out_bias"
                ),
                type: "number",
                count: outOfSchoolData.november_vaccinator,
              },
            ],
          },
        ],
        data: schools,
      },
    }
  }

  async getTargetSummaryById(
    c: Context,
    query: GetDetailCalculateDTO
  ): Promise<TargetSummaryResponse> {
    if (query.category === "non-bias") {
      return this.#getTargetSummaryNonBias(c, query)
    }
    return this.#getTargetSummaryBias(c, query)
  }

  async calculateBiasDetail(
    c: Context,
    data: CalculateBiasDetailDTO
  ): Promise<TargetSummaryResponse> {
    const {
      sub_district_id,
      name: entityName,
      id: entityId,
    } = c.var.userEntity ?? {}
    if (!entityId)
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))

    const microplanningId = c.var.microplanningId!

    const isOutOfSchool = data.entity_id === entityId

    const [counts, schoolName, absoluteCounts] = await Promise.all([
      isOutOfSchool
        ? this.biasRepo.getOutOfSchoolTargetCounts(
            c,
            Number(sub_district_id),
            SCHOOL_TARGET_GROUPS,
            microplanningId
          )
        : this.biasRepo.getTargetCountsByEntityId(
            c,
            data.entity_id,
            SCHOOL_TARGET_GROUPS,
            microplanningId
          ),
      isOutOfSchool
        ? Promise.resolve({ name: entityName ?? "Out of School" })
        : this.biasRepo.getSchoolName(c, data.entity_id),
      isOutOfSchool
        ? this.targetsRepo.getAbsoluteTargetsBySubDistrict(
            c,
            Number(sub_district_id),
            SCHOOL_TARGET_GROUPS,
            microplanningId
          )
        : this.targetsRepo.getAbsoluteTargetsByReffId(
            c,
            data.entity_id,
            SCHOOL_TARGET_GROUPS,
            "school"
          ),
    ])

    if (!schoolName)
      throw new ValidationError(c.var.t("target_estimation.school_not_exist"))

    const absoluteMap: Record<number, number> = {}
    for (const abs of absoluteCounts) {
      absoluteMap[abs.target_group_id] =
        (absoluteMap[abs.target_group_id] ?? 0) + abs.count
    }

    const mergedMap: Record<number, number> = { ...absoluteMap }
    for (const row of counts) {
      const tgId = row.target_group_id!
      mergedMap[tgId] = (mergedMap[tgId] ?? 0) + Number(row.count)
    }

    const formattedCounts = Object.entries(mergedMap).map(([tgId, count]) => ({
      target_group_id: Number(tgId),
      count,
    }))

    const countMap = createCountMap(formattedCounts)
    const gradeCounts = this.#extractSchoolGrades(countMap)

    const calculations = this.#calculateBiasInjections(formattedCounts, {
      august_immunization_service: data.august_vaccinator,
      november_immunization_service: data.november_vaccinator,
    })

    const buildServices = (isAugust: boolean) => [
      {
        key: "service_points_required",
        label: c.var.t("target_estimation.service_points_required"),
        type: "number",
        count: isAugust
          ? calculations.augustSessions
          : calculations.novemberSessions,
      },
      {
        key: "service_days_required",
        label: c.var.t("target_estimation.service_days_required"),
        type: "number",
        count: (() => {
          const days = isAugust
            ? calculations.augustServiceDays
            : calculations.novemberServiceDays
          return isNaN(days) ? 0 : days
        })(),
      },
      {
        key: "vaccinators_carrying_out_bias",
        label: c.var.t("target_estimation.vaccinators_carrying_out_bias"),
        type: "number",
        count: isAugust ? data.august_vaccinator : data.november_vaccinator,
      },
    ]

    return {
      entity_id: isOutOfSchool ? entityId : data.entity_id,
      name: schoolName?.name ?? null,
      immunization_service: [
        {
          key: "immunization_service_august",
          label: c.var.t("target_estimation.immunization_service_august"),
          services: buildServices(true),
        },
        {
          key: "immunization_service_november",
          label: c.var.t("target_estimation.immunization_service_november"),
          services: buildServices(false),
        },
      ],
      number_of_target: [
        {
          label: c.var.t("targets.school_target.4"),
          type: "number",
          count: gradeCounts.grade1,
        },
        {
          label: c.var.t("targets.school_target.5"),
          type: "number",
          count: gradeCounts.grade2,
        },
        {
          label: c.var.t("targets.school_target.7"),
          targets: [
            {
              label: c.var.t("bias_immunization_logistics.td_male_female"),
              type: "number",
              count: gradeCounts.grade5Female + gradeCounts.grade5Male,
            },
            {
              label: c.var.t("bias_immunization_logistics.hpv_female"),
              type: "number",
              count: gradeCounts.grade5Female,
            },
          ],
        },
      ],
      number_of_injection: [
        {
          label: c.var.t("target_estimation.august"),
          type: "number",
          count: this.#getMonthlyInjection(countMap, true),
        },
        {
          label: c.var.t("target_estimation.november"),
          type: "number",
          count: this.#getMonthlyInjection(countMap, false),
        },
      ],
    }
  }

  async calculateTargetEstimation(
    c: Context,
    param: CalculateTargetEstimationPathRequestDTO,
    data: CalculateTargetEstimationRequestDTO
  ) {
    const { id } = param
    const targetIds = VILLAGE_TARGET_GROUPS

    const location = await this.locationRepository.findByID(c, id)
    if (!location) {
      throw new ValidationError(c.var.t("target_estimation.id_not_exist"))
    }

    const [counts, absoluteCounts] = await Promise.all([
      this.locationRepository.getTargetCountsByLocationId(c, id, targetIds),
      this.targetsRepo.getAbsoluteTargetsByReffId(c, id, targetIds, "village"),
    ])

    // Build absolute map: target_group_id -> count
    const absoluteMap: Record<number, number> = {}
    for (const abs of absoluteCounts) {
      absoluteMap[abs.target_group_id] =
        (absoluteMap[abs.target_group_id] ?? 0) + abs.count
    }

    // Combine: add absolute values to raw counts per target group
    const combinedCounts = counts.map((c) => ({
      target_group_id: c.target_group_id,
      count: c.count + (absoluteMap[c.target_group_id] ?? 0),
    }))

    const countMap = createCountMap(combinedCounts)
    const { bbl, si, baduta, wus } = this.#extractVillageTargets(countMap)

    const calc = this.#calculateInjections(combinedCounts, data)

    return {
      entity_id: id,
      name: location?.name
        ? `${c.var.t("targets.village_label")} ${location.name}`
        : null,
      immunization_service: [
        {
          key: "service_percentage_by_type",
          label: c.var.t("target_estimation.service_percentage_by_type"),
          services: [
            {
              key: "outreach_service",
              label: c.var.t("target_estimation.outreach_service"),
              type: "percentage",
              count: data.outreach_service_percentage,
            },
            {
              key: "facility_based_service",
              label: c.var.t("target_estimation.facility_based_service"),
              type: "percentage",
              count: data.facility_based_service_percentage,
            },
          ],
        },
        // {
        //   key: "required_monthly_service_points",
        //   label: c.var.t("target_estimation.required_monthly_service_points"),
        //   services: [
        //     {
        //       key: "outreach_service",
        //       label: c.var.t("target_estimation.outreach_service"),
        //       type: "number",
        //       count: Math.ceil(calc.outreaceServiceNeededEveryMonth),
        //     },
        //     {
        //       key: "facility_based_service",
        //       label: c.var.t("target_estimation.facility_based_service"),
        //       type: "number",
        //       count: Math.ceil(calc.facilityBasedServiceNeededEveryMonth),
        //     },
        //   ],
        // },
        {
          key: "available_service_points_days",
          label: c.var.t("target_estimation.available_service_points_days"),
          services: [
            {
              key: "outreach_service",
              label: c.var.t("target_estimation.outreach_service"),
              type: "number",
              count: data.outreach_service_available_number,
            },
            {
              key: "facility_based_service",
              label: c.var.t("target_estimation.facility_based_service"),
              type: "number",
              count: data.facility_based_service_available_number,
            },
          ],
        },
        // {
        //   key: "option_immunization_service_solution",
        //   label: c.var.t(
        //     "target_estimation.option_immunization_service_solution"
        //   ),
        //   services: [
        //     {
        //       key: "outreach_service",
        //       label: null,
        //       count: null,
        //       sub_label: c.var.t("target_estimation.outreach_service"),
        //       sub_services: [
        //         {
        //           key: "required_additional_service_points",
        //           label: c.var.t(
        //             "target_estimation.required_additional_service_points"
        //           ),
        //           type: "number",
        //           count: Math.ceil(calc.optionalOutreachAdditionalService),
        //         },
        //         {
        //           key: "vaccinator_required_per_service_point",
        //           label: c.var.t(
        //             "target_estimation.vaccinator_required_per_service_point"
        //           ),
        //           type: "number",
        //           count: Math.ceil(calc.optionalOutreachAdditionalVaccinator),
        //         },
        //       ],
        //     },
        //     {
        //       key: "facility_based_service",
        //       label: null,
        //       count: null,
        //       sub_label: c.var.t("target_estimation.facility_based_service"),
        //       sub_services: [
        //         {
        //           key: "required_additional_days",
        //           label: c.var.t("target_estimation.required_additional_days"),
        //           type: "number",
        //           count: Math.ceil(calc.optionalFacilityBasedAdditionalService),
        //         },
        //         {
        //           key: "vaccinator_required_per_days",
        //           label: c.var.t(
        //             "target_estimation.vaccinator_required_per_days"
        //           ),
        //           type: "number",
        //           count: Math.ceil(
        //             calc.optionalFacilityBasedAdditionalVaccinator
        //           ),
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
      community_health_worker: [
        {
          key: "ideal_needs",
          label: c.var.t("target_estimation.ideal_needs"),
          count: calc.idealNeededWorker,
        },
        {
          key: "available_community_health_worker",
          label: c.var.t("target_estimation.available_community_health_worker"),
          count: null,
        },
        {
          key: "gap_community_health_worker",
          label: c.var.t("target_estimation.gap_community_health_worker"),
          count: null,
        },
      ],
      number_of_target: [
        { label: c.var.t("targets.target_group.1"), count: bbl },
        { label: c.var.t("targets.target_group.2"), count: si },
        { label: c.var.t("targets.target_group.3"), count: baduta },
        { label: c.var.t("targets.target_group.9"), count: wus },
      ],
      number_of_injection: [
        {
          label: c.var.t("target_estimation.annual"),
          count: calc.injectionPerYearInfantBaduta + calc.injectionPerYearWUS,
          targets: [
            {
              label: c.var.t("target_estimation.bbl_baduta"),
              type: "number",
              count: calc.injectionPerYearInfantBaduta,
            },
            {
              label: c.var.t("target_estimation.wus"),
              type: "number",
              count: calc.injectionPerYearWUS,
            },
          ],
        },
        {
          label: c.var.t("target_estimation.monthly"),
          count: calc.injectionPerMonth,
        },
      ],
    }
  }

  #normalizeServicePercentages(
    outreach: number,
    facility: number,
    availableOutreach: number,
    availableFacility: number
  ): { outreach: number; facility: number } {
    const total = outreach + facility
    if (total <= 100) return { outreach, facility }

    const totalAvailable = availableOutreach + availableFacility
    if (totalAvailable === 0) return { outreach, facility }

    const outreachPercentage = Math.ceil(
      (availableOutreach / totalAvailable) * 100
    )
    const facilityPercentage = Math.floor(
      (availableFacility / totalAvailable) * 100
    )

    return { outreach: outreachPercentage, facility: facilityPercentage }
  }

  async saveEstimation(
    c: Context,
    data: SaveEstimationRequest,
    entityId: number
  ) {
    const microplanningId = c.var.microplanningId!

    const existing = await this.nonBiasRepo.findByMicroplanningAndVillage(
      c,
      microplanningId,
      data.village_id
    )
    if (existing) {
      return {
        message: c.var.t("target_estimation.estimation_already_exists"),
        id: existing.microplanning_id,
      }
    }

    const normalizedPercentages = this.#normalizeServicePercentages(
      data.service_percentage_outreach,
      data.service_percentage_facility,
      data.available_service_outreach,
      data.available_service_facility
    )

    const villageDetail = await this.nonBiasRepo.saveVillageDetail(c, {
      microplanning_id: microplanningId,
      village_id: data.village_id,
      outreach_service_percentage: normalizedPercentages.outreach,
      facility_service_percentage: normalizedPercentages.facility,
      required_monthly_outreach_service: data.required_monthly_outreach,
      required_monthly_facility_service: data.required_monthly_facility,
      available_outreach_service: data.available_service_outreach,
      available_facillity_service: data.available_service_facility,
      additional_outreach_service: data.required_additional_outreach,
      additional_facility_service: data.required_additional_facility,
      health_worker_ideal_needs: data.ideal_needs,
      available_worker: data.available_worker,
      gap_health_worker: data.gap_worker,
    })

    return {
      message: c.var.t("target_estimation.estimation_saved_successfully"),
      id: microplanningId,
      village_detail_id: Number(villageDetail.insertId),
    }
  }

  async saveEstimationBias(
    c: Context,
    data: SaveEstimationBiasRequest,
    entityId: number
  ) {
    const microplanningId = c.var.microplanningId!

    const existing = await this.biasRepo.findByMicroplanningAndSchool(
      c,
      microplanningId,
      data.school_id
    )
    if (existing && existing.length > 0) {
      return {
        message: c.var.t("target_estimation.bias_estimation_already_exists"),
        id: microplanningId,
      }
    }

    const augustDetail = await this.biasRepo.saveSchoolDetail(c, {
      microplanning_id: microplanningId,
      school_id: data.school_id,
      required_service: data.august_service_point,
      required_service_days: data.august_service_days,
      available_vaccinator: data.august_vaccinator,
      schedule_month: "August",
    })

    const novemberDetail = await this.biasRepo.saveSchoolDetail(c, {
      microplanning_id: microplanningId,
      school_id: data.school_id,
      required_service: data.november_service_point,
      required_service_days: data.november_service_days,
      available_vaccinator: data.november_vaccinator,
      schedule_month: "November",
    })

    return {
      message: c.var.t("target_estimation.bias_estimation_saved_successfully"),
      id: microplanningId,
      august_detail_id: Number(augustDetail.insertId),
      november_detail_id: Number(novemberDetail.insertId),
    }
  }

  async updateEstimation(
    c: Context,
    params: VillageIdParam,
    data: UpdateEstimationRequest,
    entityId: number
  ) {
    const microplanningId = c.var.microplanningId!

    const existing = await this.nonBiasRepo.findByMicroplanningAndVillage(
      c,
      microplanningId,
      params.village_id
    )

    if (!existing) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("target_estimation_non_bias.label.village_id"),
        })
      )
    }

    const normalizedPercentages = this.#normalizeServicePercentages(
      data.service_percentage_outreach,
      data.service_percentage_facility,
      data.available_service_outreach,
      data.available_service_facility
    )

    await this.nonBiasRepo.updateVillageDetail(c, existing.id, {
      outreach_service_percentage: normalizedPercentages.outreach,
      facility_service_percentage: normalizedPercentages.facility,
      required_monthly_outreach_service: data.required_monthly_outreach,
      required_monthly_facility_service: data.required_monthly_facility,
      available_outreach_service: data.available_service_outreach,
      available_facillity_service: data.available_service_facility,
      additional_outreach_service: data.required_additional_outreach,
      additional_facility_service: data.required_additional_facility,
      health_worker_ideal_needs: data.ideal_needs,
      available_worker: data.available_worker,
      gap_health_worker: data.gap_worker,
    })

    return {
      message: c.var.t("target_estimation.estimation_updated_successfully"),
      id: microplanningId,
      village_detail_id: existing.id,
    }
  }

  async updateEstimationBias(
    c: Context,
    params: SchoolIdParam,
    data: UpdateEstimationBiasRequest,
    entityId: number
  ) {
    const microplanningId = c.var.microplanningId!

    const existingDetails = await this.biasRepo.findByMicroplanningAndSchool(
      c,
      microplanningId,
      params.school_id
    )

    if (!existingDetails || existingDetails.length === 0) {
      throw new NotFoundError(
        c.var.t("validator.not_exist", {
          field: c.var.t("target_estimation_bias.label.school_id"),
        })
      )
    }

    const augustRecord = existingDetails.find(
      (d) => d.schedule_month === "August"
    )
    const novemberRecord = existingDetails.find(
      (d) => d.schedule_month === "November"
    )

    const updateResults: Array<{ month: string; detail_id: number }> = []

    if (augustRecord) {
      await this.biasRepo.updateSchoolDetail(c, augustRecord.id, {
        required_service: data.august_service_point,
        required_service_days: data.august_service_days,
        available_vaccinator: data.august_vaccinator,
      })
      updateResults.push({
        month: c.var.t("bias_immunization_logistics.august"),
        detail_id: augustRecord.id,
      })
    }

    if (novemberRecord) {
      await this.biasRepo.updateSchoolDetail(c, novemberRecord.id, {
        required_service: data.november_service_point,
        required_service_days: data.november_service_days,
        available_vaccinator: data.november_vaccinator,
      })
      updateResults.push({ month: "November", detail_id: novemberRecord.id })
    }

    return {
      message: c.var.t(
        "target_estimation.bias_estimation_updated_successfully"
      ),
      id: microplanningId,
      updated_details: updateResults,
    }
  }

  async getImmunizationServiceDashboard(
    c: Context,
    param: GlobalCategoryRequestDTO,
    subDistrictId: number,
    entityId: number
  ) {
    const microplanningId = c.var.microplanningId!

    if (param.category === "bias") {
      return this.#getBiasDashboard(c, subDistrictId, microplanningId)
    }
    return this.#getNonBiasDashboard(c, subDistrictId, microplanningId)
  }

  async getCommunityHealthWorkerSummary(
    c: Context,
    subDistrictId: number
  ): Promise<CommunityHealthWorkerSummary> {
    const rawData = await this.nonBiasRepo.getWorkerDataBySubDistrict(c)

    let sumIdeal = 0,
      sumAvailable = 0,
      sumGap = 0

    const villages = rawData.map((v) => {
      const ideal = v.health_worker_ideal_needs ?? 0
      const available = v.available_worker ?? 0
      const gap = v.gap_health_worker ?? 0

      sumIdeal += ideal
      sumAvailable += available
      sumGap += gap

      return {
        village_id: v.village_id,
        village_name:
          c.var.t("targets.village_label") + " " + v.village_name.toUpperCase(),
        data: [
          {
            label: c.var.t("target_estimation.ideal_needs"),
            type: "number",
            count: ideal,
          },
          {
            label: c.var.t(
              "target_estimation.available_community_health_worker"
            ),
            type: "number",
            count: available,
          },
          {
            label: c.var.t("target_estimation.gap_community_health_worker"),
            type: "number",
            count: gap,
            is_negatif: true,
          },
        ],
      }
    })

    return {
      aggregate_of_all_villages: c.var.t(
        "target_estimation.aggregate_villages"
      ),
      summary: [
        {
          label: c.var.t("target_estimation.ideal_needs"),
          type: "number",
          count: sumIdeal,
        },
        {
          label: c.var.t("target_estimation.available_community_health_worker"),
          type: "number",
          count: sumAvailable,
        },
        {
          label: c.var.t("target_estimation.gap_community_health_worker"),
          type: "number",
          count: sumGap,
          is_negatif: true,
        },
      ],
      community_health_worker_by_village: villages,
    }
  }

  async getDataChecker(
    c: Context,
    category: string,
    subDistrictId: number,
    entityId: number,
    keyword?: string
  ): Promise<EntityListResponse | SchoolDataResponse> {
    const microplanningId = c.var.microplanningId!

    if (category === "bias") {
      return this.#checkSchoolData(c, subDistrictId, microplanningId, keyword)
    }
    return this.#checkVillageData(c, subDistrictId, microplanningId, keyword)
  }

  async getInjectionDashboard(
    c: Context,
    category: string,
    subDistrictId: number
  ): Promise<InjectionDashboardSummary> {
    const entityId = c.var.userEntity.id
    if (!entityId) {
      throw new ValidationError(c.var.t("target_estimation.entity_not_found"))
    }

    const microplanningId = c.var.microplanningId!
    if (category === "bias") {
      return this.#getInjectionDashboardBias(c, subDistrictId, microplanningId)
    }
    return this.#getInjectionDashboardNonBias(c, subDistrictId, microplanningId)
  }
}
