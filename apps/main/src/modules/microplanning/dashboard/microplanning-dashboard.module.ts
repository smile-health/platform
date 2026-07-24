import { LOCATION } from "@/common/constants/location.js"
import { FileResponse } from "@smile/lib/types/file.js"
import { Context } from "hono"
import moment from "moment"
import { LocationRepository } from "../location/location.repository.js"
import { MpConfigRepository } from "../mp-config/mp-config.repository.js"
import { TargetsRepository } from "../targets/targets.repository.js"
import { doDecrypt } from "../../transaction/utils/transaction.encryption.js"
import {
  LEVEL_MAP,
  LocationType,
  PATIENT_LOCATION_COLUMNS,
  TARGET_LOCATION_COLUMNS,
} from "./microplanning-dashboard.constants.js"
import { MicroplanningDashboardExport } from "./microplanning-dashboard.excel.js"
import {
  calculateTotal,
  groupByAgeGroup,
  initializeAgeGroups,
  sumAgeGroupData,
} from "./microplanning-dashboard.helper.js"
import {
  AgeGroupData,
  BatchByMaterialIdParams,
  ColumnGroup,
  DashboardResponse,
  LocationTypeParams,
  RegionDetail,
  TargetConsumptionQueries,
  TotalTargetData,
  TotalTargetResponse,
  VaccineInfo,
} from "./microplanning-dashboard.schema.js"

type locationType = "province" | "city" | "district" | "village"

export class MicroplanningDashboardModule {
  constructor(
    private readonly locationRepo: LocationRepository,
    private readonly targetsRepo: TargetsRepository,
    private readonly mpConfigRepo: MpConfigRepository
  ) {}

  async getTargetVsConsumption(
    c: Context,
    params: LocationTypeParams,
    queries: TargetConsumptionQueries
  ): Promise<DashboardResponse> {
    const level = LEVEL_MAP[params.type] ?? LOCATION.PROVINCE
    const locations = await this.fetchLocations(c, level, queries)

    const locationIds = locations
      .map((loc) => loc.id)
      .filter((id): id is number => id !== null && id !== undefined)

    const [targets, consumptions] = await Promise.all([
      this.targetsRepo.getTargetsByAgeGroup(
        c,
        locationIds,
        params.type as locationType,
        queries.gender,
        queries.start_date,
        queries.end_date
      ),
      this.targetsRepo.getConsumptionsByAgeGroup(
        c,
        locationIds,
        params.type as locationType,
        queries.gender,
        queries.start_date,
        queries.end_date
      ),
    ])

    const targetsByLocation = this.groupDataByLocation(targets, params.type)
    const consumptionsByLocation = this.groupDataByLocation(
      consumptions,
      params.type
    )

    const regions = locations.map((location) =>
      this.buildRegionDetail(
        location,
        targetsByLocation.get(location.id ?? 0) || [],
        consumptionsByLocation.get(location.id ?? 0) || []
      )
    )
    const aggregate = this.calculateAggregate(regions)

    return {
      summary: this.buildSummary(
        aggregate,
        queries.start_date,
        queries.end_date
      ),
      data: regions,
      aggregate,
    }
  }

  private async fetchLocations(
    c: Context,
    level: number,
    queries: TargetConsumptionQueries
  ) {
    const hasFilters =
      queries.province_ids.length > 0 ||
      queries.city_ids.length > 0 ||
      queries.district_ids.length > 0 ||
      queries.village_ids.length > 0

    if (!hasFilters) {
      return this.locationRepo.getLocations(c, level)
    }

    const allLocations = await this.locationRepo.getLocations(c, level)

    return allLocations.filter((location) => {
      const matchesCurrentLevel = this.checkCurrentLevelMatch(
        location,
        level,
        queries
      )
      const matchesParentHierarchy = this.checkParentHierarchyMatch(
        location,
        level,
        queries
      )
      return matchesCurrentLevel && matchesParentHierarchy
    })
  }

  private checkCurrentLevelMatch(
    location: any,
    level: number,
    queries: TargetConsumptionQueries
  ): boolean {
    if (!location.id) return false

    if (level === LOCATION.VILLAGE && queries.village_ids.length > 0) {
      return queries.village_ids.includes(location.id)
    }
    if (level === LOCATION.SUBDISTRICT && queries.district_ids.length > 0) {
      return queries.district_ids.includes(location.id)
    }
    if (level === LOCATION.REGENCY && queries.city_ids.length > 0) {
      return queries.city_ids.includes(location.id)
    }
    if (level === LOCATION.PROVINCE && queries.province_ids.length > 0) {
      return queries.province_ids.includes(location.id)
    }

    return true
  }

  private checkParentHierarchyMatch(
    location: any,
    level: number,
    queries: TargetConsumptionQueries
  ): boolean {
    if (queries.province_ids.length > 0 && level === LOCATION.REGENCY) {
      return queries.province_ids.includes(location.parent_id ?? 0)
    }
    if (queries.city_ids.length > 0 && level === LOCATION.SUBDISTRICT) {
      return queries.city_ids.includes(location.parent_id ?? 0)
    }
    if (queries.district_ids.length > 0 && level === LOCATION.VILLAGE) {
      return queries.district_ids.includes(location.parent_id ?? 0)
    }

    return true
  }

  private groupDataByLocation(
    data: Array<{
      [key: string]: any
      date_of_birth?: string | null
      birth_date?: string | null
    }>,
    locationType: string
  ): Map<number, Array<{ date_of_birth: string }>> {
    const grouped = new Map<number, Array<{ date_of_birth: string }>>()
    const targetColumn = TARGET_LOCATION_COLUMNS[locationType as LocationType]
    const patientColumn = PATIENT_LOCATION_COLUMNS[locationType as LocationType]

    data.forEach((item) => {
      const locationId = Number(item[targetColumn] || item[patientColumn])
      const birthDate =
        (item.date_of_birth ? doDecrypt(item.date_of_birth) : null) ??
        (item.birth_date ? doDecrypt(item.birth_date) : null) ??
        ""

      if (!birthDate || !locationId) return

      if (!grouped.has(locationId)) {
        grouped.set(locationId, [])
      }

      grouped.get(locationId)!.push({ date_of_birth: birthDate })
    })

    return grouped
  }

  private buildRegionDetail(
    location: any,
    targets: Array<{ date_of_birth: string }>,
    consumptions: Array<{ date_of_birth: string }>
  ): RegionDetail {
    const targetData = groupByAgeGroup(targets)
    const consumptionData = groupByAgeGroup(consumptions)

    return {
      region: location.name || "Unknown",
      total_target: calculateTotal(targetData),
      total_consumption: calculateTotal(consumptionData),
      details: {
        target: targetData,
        consumption: consumptionData,
      },
    }
  }

  private calculateAggregate(regions: RegionDetail[]) {
    const aggregate = {
      region: "all",
      total_target: 0,
      total_consumption: 0,
      details: {
        target: initializeAgeGroups(),
        consumption: initializeAgeGroups(),
      },
    }

    regions.forEach((region) => {
      aggregate.total_target += region.total_target
      aggregate.total_consumption += region.total_consumption
      sumAgeGroupData(aggregate.details.target, region.details.target)
      sumAgeGroupData(aggregate.details.consumption, region.details.consumption)
    })

    return aggregate
  }

  private buildSummary(
    aggregate: ReturnType<typeof this.calculateAggregate>,
    start_date: string,
    end_date: string
  ) {
    return {
      total_target: aggregate.total_target,
      total_consumption: aggregate.total_consumption,
      start_date: start_date,
      end_date: end_date,
    }
  }

  async getMaterialTargetVsConsumption(
    c: Context,
    params: LocationTypeParams,
    queries: TargetConsumptionQueries
  ): Promise<DashboardResponse> {
    const startYear = new Date(queries.start_date).getFullYear()
    const endYear = new Date(queries.end_date).getFullYear()
    const years = Array.from(
      { length: endYear - startYear + 2 },
      (_, i) => startYear + i
    )
    const mpProgramConfigIds =
      await this.mpConfigRepo.getActiveProgramConfigIdsForYears(c, years)

    const level = LEVEL_MAP[params.type] ?? LOCATION.PROVINCE
    const locations = await this.fetchLocations(c, level, queries)

    const locationIds = locations
      .map((loc) => loc.id)
      .filter((id): id is number => id !== null && id !== undefined)

    const [materialTarget, materialProvinceCoverage] = await Promise.all([
      this.targetsRepo.getMaterialAbsoluteTargetFromConfig(
        c,
        mpProgramConfigIds
      ),
      this.targetsRepo.getMaterialTargetProvinceCoverage(c, mpProgramConfigIds),
    ])

    const [materialTargetsWithDose, targets, consumptions, absoluteTargets] =
      await Promise.all([
        this.targetsRepo.getImmunizationMaterialTargetsWithDoseFromConfig(c),
        this.targetsRepo.getMaterialTargetsByIdealDateFromConfig(
          c,
          locationIds,
          params.type as locationType,
          queries,
          mpProgramConfigIds
        ),
        this.targetsRepo.getMaterialConsumptionsFromConfig(
          c,
          locationIds,
          params.type as locationType,
          queries,
          mpProgramConfigIds
        ),
        params.type === "village"
          ? this.targetsRepo.getAbsoluteTargetsForVillage(
              c,
              locationIds,
              queries
            )
          : this.targetsRepo.getAbsoluteTargets(
              c,
              locationIds,
              params.type as locationType,
              queries
            ),
      ])

    const materialCoverageMap = new Map<number, Set<number>>()
    materialTarget.forEach((mt) => {
      if (!materialCoverageMap.has(Number(mt.material_target_id))) {
        materialCoverageMap.set(Number(mt.material_target_id), new Set())
      }
    })
    materialProvinceCoverage.forEach((cov) => {
      const set = materialCoverageMap.get(Number(cov.material_target_id))
      if (set) set.add(Number(cov.province_id))
    })

    const absoluteTargetsWithMaterial = absoluteTargets.flatMap((at) => {
      const atProvinceId = (at as any).entity_province_id
        ? Number((at as any).entity_province_id)
        : null
      const targetGroupId = Number(at.material_target_id)
      const atGroupTitle: string = (at as any).material_name ?? ""

      const isApplicable = (mt: (typeof materialTarget)[0]): boolean => {
        const exactMatch = Number(mt.target_group_id) === targetGroupId
        const configTitle: string = (mt as any).target_group_title ?? ""
        const nameMatch =
          !exactMatch &&
          configTitle.length > 0 &&
          atGroupTitle.length > 0 &&
          (atGroupTitle.includes(configTitle) ||
            configTitle
              .split(/\s+/)
              .filter(Boolean)
              .every((w) => atGroupTitle.includes(w)))
        if (!exactMatch && !nameMatch) return false
        if (atProvinceId === null) return true
        const coverage = materialCoverageMap.get(Number(mt.material_target_id))
        if (!coverage || coverage.size === 0) return true // national
        return coverage.has(atProvinceId)
      }

      const seenDoseKeys = new Set<string>()
      const applicable = materialTarget.filter((mt) => {
        if (!isApplicable(mt)) return false
        const doseKey = `${mt.material_id}-${mt.start_ideal_days}`
        if (seenDoseKeys.has(doseKey)) return false
        seenDoseKeys.add(doseKey)
        return true
      })
      if (applicable.length === 0) return []
      return applicable.map((mt) => ({
        ...at,
        material_target_id: mt.material_target_id,
        material_name: mt.material_name,
      }))
    })

    const mtIdToFormattedName = new Map<number, string>()
    const formattedNameSet = new Set<string>()
    materialTargetsWithDose.forEach((mt) => {
      mtIdToFormattedName.set(mt.mt_id, mt.formatted_name)
      formattedNameSet.add(mt.formatted_name)
    })
    const allFormattedNames = Array.from(formattedNameSet)

    const targetsByLocation = this.groupDataByMaterialTargetId(
      targets,
      mtIdToFormattedName,
      "target"
    )
    const consumptionsByLocation = this.groupDataByMaterialTargetId(
      consumptions,
      mtIdToFormattedName,
      "consumption"
    )
    const absoluteTargetsByLocation = this.groupDataByMaterialTargetId(
      absoluteTargetsWithMaterial,
      mtIdToFormattedName,
      "absoluteTarget"
    )

    const regions = locations.map((location) =>
      this.buildMaterialDoseRegion(
        location,
        targetsByLocation.get(location.id ?? 0) || new Map(),
        consumptionsByLocation.get(location.id ?? 0) || new Map(),
        absoluteTargetsByLocation.get(location.id ?? 0) || new Map(),
        allFormattedNames
      )
    )
    const aggregate = this.calculateMaterialAggregate(regions)

    // Apply pagination
    const page = Number(queries.page) || 1
    const paginate = queries.paginate
      ? Number(queries.paginate)
      : regions.length
    const totalItem = regions.length
    const totalPage = Math.ceil(totalItem / paginate)
    const startIndex = (page - 1) * paginate
    const endIndex = startIndex + paginate
    const paginatedRegions = regions.slice(startIndex, endIndex)

    return {
      summary: this.buildSummary(
        aggregate,
        queries.start_date,
        queries.end_date
      ),
      page,
      item_per_page: paginate,
      total_item: totalItem,
      total_page: totalPage,
      data: paginatedRegions,
      aggregate,
    }
  }

  private groupDataByMaterialTargetId(
    data: Array<{ [key: string]: any }>,
    mtIdToFormattedName: Map<number, string>,
    type: "target" | "consumption" | "absoluteTarget"
  ): Map<number, Map<string, number>> {
    const grouped = new Map<number, Map<string, number>>()
    let locationColumn = "residential_province_id"
    if (type === "target") {
      locationColumn = "residence_province_id"
    } else if (type === "absoluteTarget") {
      locationColumn = "province_id"
    }

    data.forEach((item) => {
      const locationId =
        Number(item[locationColumn]) ||
        Number(item.residence_province_id) ||
        Number(item.residence_regency_id) ||
        Number(item.residence_subdistrict_id) ||
        Number(item.residence_village_id) ||
        Number(item.residential_province_id) ||
        Number(item.residential_regency_id) ||
        Number(item.residential_subdistrict_id) ||
        Number(item.residential_village_id) ||
        Number(item.province_id) ||
        Number(item.regency_id) ||
        Number(item.subdistrict_id) ||
        Number(item.village_id)

      const materialTargetId = Number(item.material_target_id)
      const total = Number(item.total) || 0
      const formattedName = mtIdToFormattedName.get(materialTargetId)

      if (!locationId || !formattedName) return

      if (!grouped.has(locationId)) {
        grouped.set(locationId, new Map())
      }

      const materialMap = grouped.get(locationId)!
      const currentTotal = materialMap.get(formattedName) ?? 0
      materialMap.set(formattedName, currentTotal + total)
    })

    return grouped
  }

  private buildMaterialDoseRegion(
    location: any,
    targets: Map<string, number>,
    consumptions: Map<string, number>,
    absoluteTargets: Map<string, number>,
    allFormattedNames: string[]
  ): RegionDetail {
    const targetData: AgeGroupData = {}
    const consumptionData: AgeGroupData = {}
    const absoluteTargetData: AgeGroupData = {}

    allFormattedNames.forEach((formattedName) => {
      targetData[formattedName] =
        (targets.get(formattedName) ?? 0) +
        (absoluteTargets.get(formattedName) ?? 0)
      consumptionData[formattedName] = consumptions.get(formattedName) ?? 0
    })

    return {
      region: location.name || "Unknown",
      total_target:
        Object.values(targetData).reduce((sum, val) => sum + val, 0) +
        Object.values(absoluteTargetData).reduce((sum, val) => sum + val, 0),
      total_consumption: Object.values(consumptionData).reduce(
        (sum, val) => sum + val,
        0
      ),
      details: {
        target: targetData,
        consumption: consumptionData,
      },
    }
  }

  private groupMaterialDataByLocation(
    data: Array<{
      [key: string]: any
    }>,
    locationType: string
  ): Map<number, Map<string, Array<{ date_of_birth: string }>>> {
    const grouped = new Map<
      number,
      Map<string, Array<{ date_of_birth: string }>>
    >()
    const targetColumn = TARGET_LOCATION_COLUMNS[locationType as LocationType]
    const patientColumn = PATIENT_LOCATION_COLUMNS[locationType as LocationType]

    data.forEach((item) => {
      const locationId = Number(item[targetColumn] || item[patientColumn])
      const materialName = item.material_name
      const birthDate =
        (item.date_of_birth ? doDecrypt(item.date_of_birth) : null) ??
        (item.birth_date ? doDecrypt(item.birth_date) : null) ??
        ""

      if (!birthDate || !locationId || !materialName) return

      if (!grouped.has(locationId)) {
        grouped.set(locationId, new Map())
      }

      const materialMap = grouped.get(locationId)!
      if (!materialMap.has(materialName)) {
        materialMap.set(materialName, [])
      }

      materialMap.get(materialName)!.push({ date_of_birth: birthDate })
    })

    return grouped
  }

  private groupMaterialDataByLocationId(
    data: Array<{ [key: string]: any }>
  ): Map<number, Map<string, number>> {
    const grouped = new Map<number, Map<string, number>>()

    data.forEach((item) => {
      const locationId = Number(item.location_id)
      const materialName = item.material_name
      const total = Number(item.total) || 0

      if (!locationId || !materialName) return

      if (!grouped.has(locationId)) {
        grouped.set(locationId, new Map())
      }

      const materialMap = grouped.get(locationId)!
      const currentTotal = materialMap.get(materialName) ?? 0
      materialMap.set(materialName, currentTotal + total)
    })

    return grouped
  }

  private buildDetailMaterialRegion(
    location: any,
    targets: Map<string, number>,
    consumptions: Map<string, Array<{ date_of_birth: string }>>,
    allMaterialNames: Set<string>
  ): RegionDetail {
    const targetData: AgeGroupData = {}
    const consumptionData: AgeGroupData = {}

    allMaterialNames.forEach((materialName) => {
      targetData[materialName] = targets.get(materialName) ?? 0
      consumptionData[materialName] = 0
    })

    consumptions.forEach((consumptionList, materialName) => {
      const consumptionByAge = groupByAgeGroup(consumptionList)
      consumptionData[materialName] = calculateTotal(consumptionByAge)
    })

    return {
      region: location.name || "Unknown",
      total_target: Object.values(targetData).reduce(
        (sum, val) => sum + val,
        0
      ),
      total_consumption: Object.values(consumptionData).reduce(
        (sum, val) => sum + val,
        0
      ),
      details: {
        target: targetData,
        consumption: consumptionData,
      },
    }
  }

  private buildMaterialRegionDetail(
    location: any,
    targets: Map<string, Array<{ date_of_birth: string }>>,
    consumptions: Map<string, Array<{ date_of_birth: string }>>,
    allMaterialNames: Set<string>
  ): RegionDetail {
    const targetData: AgeGroupData = {}
    const consumptionData: AgeGroupData = {}

    allMaterialNames.forEach((materialName) => {
      targetData[materialName] = 0
      consumptionData[materialName] = 0
    })

    targets.forEach((targetList, materialName) => {
      const targetByAge = groupByAgeGroup(targetList)
      targetData[materialName] = calculateTotal(targetByAge)
    })

    consumptions.forEach((consumptionList, materialName) => {
      const consumptionByAge = groupByAgeGroup(consumptionList)
      consumptionData[materialName] = calculateTotal(consumptionByAge)
    })

    return {
      region: location.name || "Unknown",
      total_target: Object.values(targetData).reduce(
        (sum, val) => sum + val,
        0
      ),
      total_consumption: Object.values(consumptionData).reduce(
        (sum, val) => sum + val,
        0
      ),
      details: {
        target: targetData,
        consumption: consumptionData,
      },
    }
  }

  private calculateMaterialAggregate(regions: RegionDetail[]) {
    const aggregate = {
      region: "all",
      total_target: 0,
      total_consumption: 0,
      details: {
        target: {} as AgeGroupData,
        consumption: {} as AgeGroupData,
      },
    }

    regions.forEach((region) => {
      aggregate.total_target += region.total_target
      aggregate.total_consumption += region.total_consumption

      Object.keys(region.details.target).forEach((materialName) => {
        aggregate.details.target[materialName] =
          (aggregate.details.target[materialName] ?? 0) +
          (region.details.target[materialName] ?? 0)
      })

      Object.keys(region.details.consumption).forEach((materialName) => {
        aggregate.details.consumption[materialName] =
          (aggregate.details.consumption[materialName] ?? 0) +
          (region.details.consumption[materialName] ?? 0)
      })
    })

    return aggregate
  }

  async getTotalTarget(
    c: Context,
    params: LocationTypeParams,
    queries: TargetConsumptionQueries
  ): Promise<TotalTargetResponse> {
    const startYear = new Date(queries.start_date).getFullYear()
    const endYear = new Date(queries.end_date).getFullYear()
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    )
    const mpProgramConfigIds =
      await this.mpConfigRepo.getActiveProgramConfigIdsForYears(c, years)

    const [materialTargets, materialTarget, materialProvinceCoverage] =
      await Promise.all([
        this.targetsRepo.getImmunizationMaterialTargetsFromConfig(
          c,
          mpProgramConfigIds
        ),
        this.targetsRepo.getMaterialAbsoluteTargetFromConfig(
          c,
          mpProgramConfigIds
        ),
        this.targetsRepo.getMaterialTargetProvinceCoverage(
          c,
          mpProgramConfigIds
        ),
      ])

    const columns = this.buildColumns(materialTargets)

    const level = LEVEL_MAP[params.type] ?? LOCATION.PROVINCE
    const locations = await this.fetchLocations(c, level, queries)

    const locationIds = locations
      .map((loc) => loc.id)
      .filter((id): id is number => id !== null && id !== undefined)

    const [immunizationData, absoluteTargets] = await Promise.all([
      this.targetsRepo.getMaterialTargetsByIdealDateFromConfig(
        c,
        locationIds,
        params.type as locationType,
        queries,
        mpProgramConfigIds
      ),
      params.type === "village"
        ? this.targetsRepo.getAbsoluteTargetsForVillage(c, locationIds, queries)
        : this.targetsRepo.getAbsoluteTargets(
            c,
            locationIds,
            params.type as locationType,
            queries
          ),
    ])

    const materialCoverageMap = new Map<number, Set<number>>()
    materialTarget.forEach((mt) => {
      if (!materialCoverageMap.has(Number(mt.material_target_id))) {
        materialCoverageMap.set(Number(mt.material_target_id), new Set())
      }
    })
    materialProvinceCoverage.forEach((cov) => {
      const set = materialCoverageMap.get(Number(cov.material_target_id))
      if (set) set.add(Number(cov.province_id))
    })

    const absoluteTargetsWithMaterial = absoluteTargets.flatMap((at) => {
      const atProvinceId = (at as any).entity_province_id
        ? Number((at as any).entity_province_id)
        : null
      const targetGroupId = Number(at.material_target_id)
      const atGroupTitle: string = (at as any).material_name ?? ""

      const isApplicable = (mt: (typeof materialTarget)[0]): boolean => {
        const exactMatch = Number(mt.target_group_id) === targetGroupId
        const configTitle: string = (mt as any).target_group_title ?? ""
        const nameMatch =
          !exactMatch &&
          configTitle.length > 0 &&
          atGroupTitle.length > 0 &&
          (atGroupTitle.includes(configTitle) ||
            configTitle
              .split(/\s+/)
              .filter(Boolean)
              .every((w) => atGroupTitle.includes(w)))
        if (!exactMatch && !nameMatch) return false
        if (atProvinceId === null) return true
        const coverage = materialCoverageMap.get(Number(mt.material_target_id))
        if (!coverage || coverage.size === 0) return true // national
        return coverage.has(atProvinceId)
      }

      const seenDoseKeys = new Set<string>()
      const applicable = materialTarget.filter((mt) => {
        if (!isApplicable(mt)) return false
        const doseKey = `${mt.material_id}-${mt.start_ideal_days}`
        if (seenDoseKeys.has(doseKey)) return false
        seenDoseKeys.add(doseKey)
        return true
      })
      if (applicable.length === 0) return []
      return applicable.map((mt) => ({
        ...at,
        material_target_id: mt.material_target_id,
        material_name: mt.material_name,
      }))
    })

    const data = this.buildTotalTargetData(
      locations,
      immunizationData as any,
      columns,
      params.type,
      materialTargets,
      absoluteTargetsWithMaterial
    )

    // Apply pagination
    const page = Number(queries.page) || 1
    const paginate = queries.paginate ? Number(queries.paginate) : data.length
    const totalItem = data.length
    const totalPage = Math.ceil(totalItem / paginate)
    const startIndex = (page - 1) * paginate
    const endIndex = startIndex + paginate
    const paginatedData = data.slice(startIndex, endIndex)

    return {
      columns,
      page,
      item_per_page: paginate,
      total_item: totalItem,
      total_page: totalPage,
      data: paginatedData,
    }
  }

  private buildColumns(
    materialTargets: Array<{
      mt_id: number
      material_id: number
      material_name: string
      start_ideal_days: number | null
      end_ideal_days: number | null
      parent_id: number | null
      category: "bias" | "non_bias"
    }>
  ): ColumnGroup[] {
    const groupMap = new Map<string, VaccineInfo[]>()
    const materialCountMap = new Map<string, number>()
    const seenDoseKeys = new Set<string>()

    materialTargets.forEach((target) => {
      const doseKey = `${target.material_id}-${target.start_ideal_days}`
      if (seenDoseKeys.has(doseKey)) return
      seenDoseKeys.add(doseKey)

      let displayName = target.material_name
      let key = this.toSnakeCase(target.material_name)
      let sequence = 0

      const baseName = this.extractBaseName(target.material_name)

      if (baseName) {
        const baseKey = baseName.toLowerCase()
        const currentCount = (materialCountMap.get(baseKey) ?? 0) + 1
        materialCountMap.set(baseKey, currentCount)
        sequence = currentCount

        displayName = `${baseName} ${currentCount}`
        key = this.toSnakeCase(`${baseName}_${currentCount}`)
      }

      const groupKey = this.getTargetGroupKey(target, sequence)

      if (groupKey === "BIAS") {
        const materialNameLower = (
          baseName ?? target.material_name
        ).toLowerCase()
        if (materialNameLower.includes("hpv")) {
          displayName = "HPV"
          key = "hpv"
        } else if (
          materialNameLower.includes("mr") ||
          materialNameLower.includes("campak")
        ) {
          displayName = "MR 3"
          key = "mr_3"
        }
      }

      if (this.isJE((baseName ?? target.material_name).toLowerCase())) {
        displayName = "JE"
        key = "je"
      }

      let ageGroup = this.getAgeGroupLabel(
        baseName ?? target.material_name,
        baseName,
        sequence,
        target.start_ideal_days,
        target.end_ideal_days
      )

      if (groupKey === "BIAS") {
        ageGroup = this.getBIASAgeGroupLabel(
          baseName ?? target.material_name,
          sequence,
          ageGroup
        )
      }

      const vaccine: VaccineInfo = {
        name: displayName,
        ageGroup,
        key,
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(vaccine)
    })

    const columns: ColumnGroup[] = []
    const groupOrder = [
      "Bayi Baru Lahir",
      "Bayi Baru Lahir/Surviving Infant",
      "Surviving Infant",
      "Baduta",
      "BIAS",
    ]

    groupOrder.forEach((group) => {
      const vaccines = groupMap.get(group)
      if (vaccines && vaccines.length > 0) {
        columns.push({ group, vaccines })
      }
    })

    return columns
  }

  private extractBaseName(materialName: string): string | null {
    const nameLower = materialName.toLowerCase()

    if (this.isPolio(nameLower)) return "Polio"
    if (this.isDPTHBHib(nameLower)) return "DPT-HB-Hib"
    if (this.isRotavirus(nameLower)) return "Rotavirus"
    if (nameLower.includes("pcv")) return "PCV"
    if (nameLower.includes("ipv")) return "IPV"
    if (this.isMR(nameLower)) return "MR"
    if (this.isJE(nameLower)) return "JE"
    if (this.isTd(nameLower)) return "Td"
    if (this.isDT(nameLower)) return "DT"
    if (nameLower.includes("hpv")) return "HPV"

    return null
  }

  private isPolio(nameLower: string): boolean {
    return nameLower.includes("polio") || nameLower.includes("opv")
  }

  private isDPTHBHib(nameLower: string): boolean {
    return nameLower.includes("dpt") && nameLower.includes("hib")
  }

  private isRotavirus(nameLower: string): boolean {
    return nameLower.includes("rotavirus") || nameLower.includes("rotavac")
  }

  private isMR(nameLower: string): boolean {
    if (nameLower.includes("campak")) return true
    if (nameLower.includes("dmr")) return false
    return nameLower.includes("mr")
  }

  private isJE(nameLower: string): boolean {
    if (nameLower.includes("inject")) return false
    return nameLower.includes("je")
  }

  private isTd(nameLower: string): boolean {
    if (nameLower.includes("dpt")) return false
    return nameLower.includes("td")
  }

  private isDT(nameLower: string): boolean {
    if (nameLower.includes("dpt")) return false
    if (nameLower.includes("dta")) return false
    return nameLower.includes("dt")
  }

  private getBIASAgeGroupLabel(
    materialName: string,
    sequence: number,
    defaultLabel: string
  ): string {
    const nameLower = materialName.toLowerCase()

    if (nameLower.includes("campak") || nameLower.includes("mr")) {
      return "Usia 7 tahun (Kelas 1)"
    }

    if (nameLower.includes("dt") && !nameLower.includes("dpt")) {
      return "Usia 7 tahun (Kelas 1)"
    }

    if (
      nameLower.includes("td") &&
      !nameLower.includes("dpt") &&
      sequence === 1
    ) {
      return "Usia 8 tahun (Kelas 2)"
    }

    if (
      nameLower.includes("td") &&
      !nameLower.includes("dpt") &&
      sequence === 2
    ) {
      return "Usia 11 tahun (Kelas 5)"
    }

    if (
      nameLower.includes("td") &&
      !nameLower.includes("dpt") &&
      sequence === 3
    ) {
      return ""
    }

    if (nameLower.includes("hpv")) {
      return "Usia 11 tahun (Kelas 5)"
    }

    return defaultLabel
  }

  private getTargetGroupKey(
    target: {
      material_name: string
      start_ideal_days: number | null
      end_ideal_days: number | null
      category: "bias" | "non_bias"
    },
    sequence: number
  ): string {
    const startDays = target.start_ideal_days ?? 0
    const materialName = target.material_name.toLowerCase()

    if (
      materialName.includes("hepatitis") ||
      materialName.includes("hep b") ||
      materialName.includes("heksavalen")
    ) {
      return "Bayi Baru Lahir"
    }

    if (
      materialName.includes("bcg") ||
      (materialName.includes("polio") && startDays <= 30)
    ) {
      return "Bayi Baru Lahir/Surviving Infant"
    }

    if (target.category === "bias") {
      return "BIAS"
    }

    if (materialName.includes("pcv") && sequence === 3) {
      return "Baduta"
    }
    if (
      materialName.includes("dpt") &&
      materialName.includes("hib") &&
      sequence === 4
    ) {
      return "Baduta"
    }
    if (
      (materialName.includes("mr") || materialName.includes("campak")) &&
      sequence === 2
    ) {
      return "Baduta"
    }

    if (startDays > 30 && startDays < 365 * 2) {
      return "Surviving Infant"
    }

    if (startDays >= 365 * 2) {
      return "Surviving Infant"
    }

    return "Surviving Infant"
  }

  private getAgeGroupLabel(
    materialName: string,
    parentName: string | null,
    sequence: number,
    startIdealDays: number | null,
    endIdealDays: number | null
  ): string {
    const startMonths = Math.floor((startIdealDays ?? 0) / 30)

    const isPolio1 =
      (parentName &&
        parentName.toLowerCase().includes("polio") &&
        sequence === 1) ||
      (materialName.toLowerCase().includes("polio") && sequence === 1)

    if (isPolio1) {
      return "0-1 month old"
    }

    if (startIdealDays === null || startIdealDays === 0) {
      return "< 24 hours"
    }

    if (startMonths > 0 && startMonths < 12) {
      return `${startMonths} month${startMonths > 1 ? "s" : ""} old`
    }

    const startYears = Math.floor((startIdealDays ?? 0) / 365)
    if (startYears >= 7) {
      return `${startYears} years old`
    }

    if (startMonths >= 12) {
      return `${startMonths} months old`
    }

    return ""
  }

  private toSnakeCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[\s()-]/g, "_")
      .replace(/[^\w]/g, "")
      .replace(/_+/g, "_")
  }

  private buildTotalTargetData(
    locations: any[],
    immunizationData: any[],
    columns: ColumnGroup[],
    locationType: string,
    materialTargets: Array<{
      mt_id: number
      material_id: number
      material_name: string
      start_ideal_days: number | null
      end_ideal_days: number | null
      parent_id: number | null
      parent_name?: string | null
      category: "bias" | "non_bias"
    }>,
    absoluteTargetsWithMaterial: any[] = []
  ): TotalTargetData[] {
    const idealColumnMap = {
      province: "residence_province_id",
      city: "residence_regency_id",
      district: "residence_subdistrict_id",
      village: "residence_village_id",
    }
    const absoluteColumnMap = {
      province: "province_id",
      city: "regency_id",
      district: "subdistrict_id",
      village: "village_id",
    }

    const mtIdToKeyMap = this.buildMtIdToKeyMap(materialTargets, columns)

    const idealColumn =
      idealColumnMap[locationType as keyof typeof idealColumnMap]
    const absoluteColumn =
      absoluteColumnMap[locationType as keyof typeof absoluteColumnMap]

    const idealDataByLocation = this.groupImmunizationCountsByLocation(
      immunizationData,
      idealColumn,
      mtIdToKeyMap
    )
    const absoluteDataByLocation = this.groupImmunizationCountsByLocation(
      absoluteTargetsWithMaterial,
      absoluteColumn,
      mtIdToKeyMap
    )

    // Merge absolute targets into ideal-date data (sum values per key per location)
    for (const [locationId, materialMap] of absoluteDataByLocation) {
      if (!idealDataByLocation.has(locationId)) {
        idealDataByLocation.set(locationId, new Map())
      }
      const existing = idealDataByLocation.get(locationId)!
      for (const [key, value] of materialMap) {
        existing.set(key, (existing.get(key) ?? 0) + value)
      }
    }

    return locations.map((location) =>
      this.buildLocationRow(location, idealDataByLocation, columns)
    )
  }

  private buildMtIdToKeyMap(
    materialTargets: Array<{
      mt_id: number
      material_id: number
      material_name: string
      start_ideal_days: number | null
      end_ideal_days: number | null
      parent_id: number | null
      parent_name?: string | null
      category: "bias" | "non_bias"
    }>,
    columns: ColumnGroup[]
  ): Map<number, string> {
    const mtIdToKeyMap = new Map<number, string>()
    const materialCountMap = new Map<string, number>()
    const doseKeyToKey = new Map<string, string>()

    materialTargets.forEach((target) => {
      const doseKey = `${target.material_id}-${target.start_ideal_days}`

      if (doseKeyToKey.has(doseKey)) {
        mtIdToKeyMap.set(target.mt_id, doseKeyToKey.get(doseKey)!)
        return
      }

      const baseName = this.extractBaseName(target.material_name)

      let key: string
      let sequence = 0

      if (baseName) {
        const baseKey = baseName.toLowerCase()
        const currentCount = (materialCountMap.get(baseKey) ?? 0) + 1
        materialCountMap.set(baseKey, currentCount)
        sequence = currentCount

        key = this.toSnakeCase(`${baseName}_${currentCount}`)
      } else {
        key = this.toSnakeCase(target.material_name)
      }

      const groupKey = this.getTargetGroupKey(target, sequence)

      if (groupKey === "BIAS") {
        const materialNameLower = (
          baseName ?? target.material_name
        ).toLowerCase()
        if (materialNameLower.includes("hpv")) {
          key = "hpv"
        } else if (
          materialNameLower.includes("mr") ||
          materialNameLower.includes("campak")
        ) {
          key = "mr_3"
        }
      }

      doseKeyToKey.set(doseKey, key)
      mtIdToKeyMap.set(target.mt_id, key)
    })

    return mtIdToKeyMap
  }

  private groupImmunizationCountsByLocation(
    immunizationData: any[],
    patientColumn: string,
    mtIdToKeyMap: Map<number, string>
  ): Map<number, Map<string, number>> {
    const grouped = new Map<number, Map<string, number>>()

    for (const item of immunizationData) {
      const locationId = Number(item[patientColumn])
      const materialTargetId = Number(item.material_target_id)
      const count = Number(item.total)
      const vaccineKey = mtIdToKeyMap.get(materialTargetId)

      if (!vaccineKey) {
        continue
      }

      if (!grouped.has(locationId)) {
        grouped.set(locationId, new Map())
      }

      const materialMap = grouped.get(locationId)!
      materialMap.set(vaccineKey, (materialMap.get(vaccineKey) ?? 0) + count)
    }

    return grouped
  }

  private buildLocationRow(
    location: any,
    dataByLocation: Map<number, Map<string, number>>,
    columns: ColumnGroup[]
  ): TotalTargetData {
    const row: TotalTargetData = { region: location.name || "Unknown" }
    const locationData = dataByLocation.get(location.id) || new Map()

    for (const group of columns) {
      for (const vaccine of group.vaccines) {
        row[vaccine.key] = locationData.get(vaccine.key) || 0
      }
    }

    return row
  }

  async exportMaterialTargetVsConsumption(
    c: Context,
    params: LocationTypeParams,
    queries: TargetConsumptionQueries
  ): Promise<FileResponse> {
    const response = await this.getMaterialTargetVsConsumption(
      c,
      params,
      queries
    )
    const timezone = c.req.header("Timezone")

    const excelTemplate = new MicroplanningDashboardExport()
    const title = "Target vs Consumption Material"
    excelTemplate.setTitle(title)
    excelTemplate.setTimezone(timezone)

    await excelTemplate.initSheet(title)

    const firstRegion = response.data.at(0)
    const vaccineKeys = firstRegion?.details
      ? Object.keys(firstRegion.details.target)
      : []

    const vaccineGroups = this.groupVaccineKeysByBaseName(vaccineKeys)

    const columns = [
      { header: "Region", width: 25 },
      { header: "Target vs Consumption", width: 25 },
      ...vaccineKeys.map((key) => ({
        header: key,
        width: 20,
      })),
    ]

    excelTemplate.setColumns(columns, "A3")

    const rows: Record<string, string | number>[] = []

    for (const region of response.data) {
      const targetRow: Record<string, string | number> = {
        region: region.region,
        target_vs_consumption: "Target",
      }
      vaccineKeys.forEach((key) => {
        targetRow[key] = region.details.target[key] ?? 0
      })
      rows.push(targetRow)

      const consumptionRow: Record<string, string | number> = {
        region: "",
        target_vs_consumption: "Consumption",
      }
      vaccineKeys.forEach((key) => {
        consumptionRow[key] = region.details.consumption[key] ?? 0
      })
      rows.push(consumptionRow)
    }

    await excelTemplate.addRows(title, rows, 4, "A")

    excelTemplate.mergeCells(title, "A1", "A3", true)
    await excelTemplate.updateCellValue(title, "A1", "Region")

    excelTemplate.mergeCells(title, "B1", "B3", true)
    await excelTemplate.updateCellValue(title, "B1", "Target vs Consumption")

    if (vaccineKeys.length > 0) {
      const startVaccineCol = this.getColumnLetter(2) // Column C
      const endVaccineCol = this.getColumnLetter(2 + vaccineKeys.length - 1)
      excelTemplate.mergeCells(
        title,
        `${startVaccineCol}1`,
        `${endVaccineCol}1`,
        true
      )
      await excelTemplate.updateCellValue(
        title,
        `${startVaccineCol}1`,
        "Vaccine"
      )
    }

    let colIndex = 2
    for (const group of vaccineGroups) {
      const startCol = this.getColumnLetter(colIndex)
      const endCol = this.getColumnLetter(colIndex + group.count - 1)
      if (group.count > 1) {
        excelTemplate.mergeCells(title, `${startCol}2`, `${endCol}2`, true)
      }
      await excelTemplate.updateCellValue(title, `${startCol}2`, group.name)
      colIndex += group.count
    }

    let currentRow = 4
    for (const _ of response.data) {
      const startRow = currentRow
      const endRow = currentRow + 1
      excelTemplate.mergeCells(title, `A${startRow}`, `A${endRow}`, true)
      currentRow += 2
    }

    await excelTemplate.setRowFontBold(title, 1)
    await excelTemplate.setRowFontBold(title, 2)
    await excelTemplate.setRowFontBold(title, 3)

    await excelTemplate.setRowAlignment(title, 1, "center", "middle")
    await excelTemplate.setRowAlignment(title, 2, "center", "middle")
    await excelTemplate.setRowAlignment(title, 3, "center", "middle")

    return await excelTemplate.generate()
  }

  private groupVaccineKeysByBaseName(
    vaccineKeys: string[]
  ): Array<{ name: string; count: number }> {
    const groups: Array<{ name: string; count: number }> = []
    let currentGroup: { name: string; count: number } | null = null

    for (const key of vaccineKeys) {
      const baseName = this.extractVaccineBaseName(key)

      if (currentGroup && currentGroup.name === baseName) {
        currentGroup.count++
      } else {
        if (currentGroup) {
          groups.push(currentGroup)
        }
        currentGroup = { name: baseName, count: 1 }
      }
    }

    if (currentGroup) {
      groups.push(currentGroup)
    }

    return groups
  }

  private extractVaccineBaseName(key: string): string {
    const withoutNumber = key.replace(/_\d+$/, "")
    return withoutNumber
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  private getColumnLetter(index: number): string {
    let letter = ""
    let temp = index
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter
      temp = Math.floor(temp / 26) - 1
    }
    return letter
  }

  async getBatchByMaterialId(c: Context, queries: BatchByMaterialIdParams) {
    const materialIds = queries.material_id

    const batches = await this.targetsRepo.getBatchByMaterialId(c, materialIds)

    return batches.map((batch) => ({
      id: batch.id,
      name: batch.expired_date
        ? `${batch.code} - ${moment(batch.expired_date).format("DD-MMM-YYYY")}`
        : batch.code,
    }))
  }
}
