import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import { BmhpPlanningPopulationRepository } from "./bmhp-planning-population.repository.js"
import { PopulateCalculateQuery } from "./bmhp-planning-population.schema.js"

type TargetGroup = {
  id: number
  name: string
  population_number: number
}

type EntityRawData = {
  entity_id: number
  entity_name: string
  parent_id: string | null
  regency_id: string | null
  province_name: string
  regency_name: string | null
  target_groups: Map<number, TargetGroup>
  updated_at: Date | null
  updated_user_id: number | null
  updated_user_username: string | null
  updated_user_firstname: string | null
  updated_user_lastname: string | null
}

type DinkesInfo = {
  entity_id: number
  entity_name: string
  regency_id: string | null
}

type UserUpdateInfo = {
  updated_at: Date | null
  updated_user_id: number | null
  updated_user_username: string | null
  updated_user_firstname: string | null
  updated_user_lastname: string | null
}

type EntityDataItem = {
  entity_id: number
  entity_name: string
  parent_id: string | null
  regency_id: string | null
  province_name: string
  regency_name: string | null
  target_group_id: number
  target_group_name: string
  total_test_count: number
  updated_at: Date | null
  updated_user_id: number | null
  updated_user_username: string | null
  updated_user_firstname: string | null
  updated_user_lastname: string | null
}

type DinkesEntityItem = {
  entity_id: number
  entity_name: string | null
  regency_id: string | null
}

type ProvinceDataItem = {
  target_group_id: number
  target_group_name: string
  total_test_count: number
  updated_at: Date | null
  updated_user_id: number | null
  updated_user_username: string | null
  updated_user_firstname: string | null
  updated_user_lastname: string | null
}

type ResponseEntry = {
  entity: {
    id?: number
    name?: string
    province: string | null
    regency?: string | null
  }
  population: Array<{
    id: number
    name: string
    population_number: number
  }>
  user_updated_at?: Date
  user_updated_by?: {
    id: number
    username: string | null
    firstname: string | null
    lastname: string | null
    fullname: string
  }
}

export class BmhpPlanningPopulationModule {
  constructor(private readonly repository: BmhpPlanningPopulationRepository) {}

  private buildEntityRawData(
    entityData: EntityDataItem[]
  ): Map<number, EntityRawData> {
    const entityRawData = new Map<number, EntityRawData>()

    for (const item of entityData) {
      if (!entityRawData.has(item.entity_id)) {
        entityRawData.set(item.entity_id, {
          entity_id: item.entity_id,
          entity_name: item.entity_name,
          parent_id: item.parent_id,
          regency_id: item.regency_id,
          province_name: item.province_name,
          regency_name: item.regency_name,
          target_groups: new Map(),
          updated_at: item.updated_at,
          updated_user_id: item.updated_user_id,
          updated_user_username: item.updated_user_username,
          updated_user_firstname: item.updated_user_firstname,
          updated_user_lastname: item.updated_user_lastname,
        })
      }

      const entity = entityRawData.get(item.entity_id)!
      this.aggregateTargetGroup(entity, item)
      this.updateUserInfo(entity, item)
    }

    return entityRawData
  }

  private aggregateTargetGroup(
    entity: EntityRawData,
    item: EntityDataItem
  ): void {
    const existingTG = entity.target_groups.get(item.target_group_id)
    if (existingTG) {
      existingTG.population_number += Number(item.total_test_count)
    } else {
      entity.target_groups.set(item.target_group_id, {
        id: item.target_group_id,
        name: item.target_group_name,
        population_number: Number(item.total_test_count),
      })
    }
  }

  private updateUserInfo(entity: EntityRawData, item: EntityDataItem): void {
    if (
      entity.updated_at === null ||
      (item.updated_at && item.updated_at > entity.updated_at)
    ) {
      entity.updated_at = item.updated_at
      entity.updated_user_id = item.updated_user_id
      entity.updated_user_username = item.updated_user_username
      entity.updated_user_firstname = item.updated_user_firstname
      entity.updated_user_lastname = item.updated_user_lastname
    }
  }

  private groupEntitiesByRegency(
    entityRawData: Map<number, EntityRawData>
  ): Map<string, { entities: EntityRawData[] }> {
    const regencyGroups = new Map<string, { entities: EntityRawData[] }>()

    for (const entity of entityRawData.values()) {
      const regencyKey = entity.regency_id ?? "null"

      if (!regencyGroups.has(regencyKey)) {
        regencyGroups.set(regencyKey, { entities: [] })
      }

      regencyGroups.get(regencyKey)!.entities.push(entity)
    }

    return regencyGroups
  }

  private buildDinkesMap(
    dinkesEntities: DinkesEntityItem[]
  ): Map<string, DinkesInfo> {
    const dinkesMap = new Map<string, DinkesInfo>()

    for (const dinkes of dinkesEntities) {
      const regencyKey = dinkes.regency_id || "null"
      if (!dinkesMap.has(regencyKey) && dinkes.entity_name) {
        dinkesMap.set(regencyKey, {
          entity_id: dinkes.entity_id,
          entity_name: dinkes.entity_name,
          regency_id: dinkes.regency_id,
        })
      }
    }

    return dinkesMap
  }

  private findRepresentativeEntity(
    regencyGroup: { entities: EntityRawData[] },
    dinkesFromMap: DinkesInfo | undefined
  ): EntityRawData {
    if (dinkesFromMap) {
      return this.createDinkesRepresentative(
        dinkesFromMap,
        regencyGroup.entities[0]!
      )
    }

    const dinkesEntity = this.findDinkesInEntities(regencyGroup.entities)
    const selectedEntity = dinkesEntity || regencyGroup.entities[0]!

    return this.createRepresentativeFromEntity(selectedEntity)
  }

  private createDinkesRepresentative(
    dinkes: DinkesInfo,
    sampleEntity: EntityRawData
  ): EntityRawData {
    return {
      entity_id: dinkes.entity_id,
      entity_name: dinkes.entity_name,
      regency_id: dinkes.regency_id,
      province_name: sampleEntity.province_name,
      regency_name: sampleEntity.regency_name,
      target_groups: new Map(),
      updated_at: null,
      updated_user_id: null,
      updated_user_username: null,
      updated_user_firstname: null,
      updated_user_lastname: null,
      parent_id: null,
    }
  }

  private createRepresentativeFromEntity(entity: EntityRawData): EntityRawData {
    return {
      entity_id: entity.entity_id,
      entity_name: entity.entity_name,
      regency_id: entity.regency_id,
      province_name: entity.province_name,
      regency_name: entity.regency_name,
      target_groups: new Map(),
      updated_at: null,
      updated_user_id: null,
      updated_user_username: null,
      updated_user_firstname: null,
      updated_user_lastname: null,
      parent_id: entity.parent_id,
    }
  }

  private findDinkesInEntities(
    entities: EntityRawData[]
  ): EntityRawData | undefined {
    return entities.find((e) => {
      const upperName = e.entity_name.toUpperCase()
      return (
        upperName.includes("DINKES") ||
        upperName.includes("DINAS KESEHATAN") ||
        upperName.includes("DINAS KES") ||
        upperName.includes("DIKES") ||
        upperName.startsWith("DKK") ||
        upperName.startsWith("DINKES")
      )
    })
  }

  private aggregateRegencyData(
    representative: EntityRawData,
    entities: EntityRawData[]
  ): EntityRawData {
    for (const entity of entities) {
      this.mergeTargetGroups(representative, entity.target_groups)
      this.updateLatestUserInfo(representative, entity)
    }
    return representative
  }

  private mergeTargetGroups(
    target: EntityRawData,
    sourceGroups: Map<number, TargetGroup>
  ): void {
    for (const [tgId, tg] of sourceGroups) {
      const existingTG = target.target_groups.get(tgId)
      if (existingTG) {
        existingTG.population_number += tg.population_number
      } else {
        target.target_groups.set(tgId, { ...tg })
      }
    }
  }

  private updateLatestUserInfo(
    target: EntityRawData,
    source: EntityRawData
  ): void {
    if (
      target.updated_at === null ||
      (source.updated_at && source.updated_at > target.updated_at)
    ) {
      target.updated_at = source.updated_at
      target.updated_user_id = source.updated_user_id
      target.updated_user_username = source.updated_user_username
      target.updated_user_firstname = source.updated_user_firstname
      target.updated_user_lastname = source.updated_user_lastname
    }
  }

  private buildProvinceEntry(
    provinceData: ProvinceDataItem[],
    provinceName: string | null
  ): ResponseEntry {
    const latestUpdate = this.findLatestUpdate(provinceData)

    const provinceEntry: ResponseEntry = {
      entity: { province: provinceName },
      population: provinceData.map((item) => ({
        id: item.target_group_id,
        name: item.target_group_name,
        population_number: Number(item.total_test_count),
      })),
    }

    if (latestUpdate.updated_at && latestUpdate.updated_user_id) {
      provinceEntry.user_updated_at = latestUpdate.updated_at
      provinceEntry.user_updated_by = this.formatUserInfo(latestUpdate)
    }

    return provinceEntry
  }

  private findLatestUpdate(items: ProvinceDataItem[]): UserUpdateInfo {
    const latestUpdate: UserUpdateInfo = {
      updated_at: null,
      updated_user_id: null,
      updated_user_username: null,
      updated_user_firstname: null,
      updated_user_lastname: null,
    }

    for (const item of items) {
      if (
        item.updated_at &&
        (!latestUpdate.updated_at || item.updated_at > latestUpdate.updated_at)
      ) {
        latestUpdate.updated_at = item.updated_at
        latestUpdate.updated_user_id = item.updated_user_id
        latestUpdate.updated_user_username = item.updated_user_username
        latestUpdate.updated_user_firstname = item.updated_user_firstname
        latestUpdate.updated_user_lastname = item.updated_user_lastname
      }
    }

    return latestUpdate
  }

  private formatUserInfo(userInfo: UserUpdateInfo) {
    return {
      id: userInfo.updated_user_id!,
      username: userInfo.updated_user_username,
      firstname: userInfo.updated_user_firstname,
      lastname: userInfo.updated_user_lastname,
      fullname:
        `${userInfo.updated_user_firstname ?? ""} ${userInfo.updated_user_lastname ?? ""}`.trim(),
    }
  }

  private buildEntityEntry(group: EntityRawData): ResponseEntry {
    const entityData: ResponseEntry = {
      entity: {
        id: group.entity_id,
        name: group.entity_name,
        province: group.province_name,
        regency: group.regency_name,
      },
      population: Array.from(group.target_groups.values()).sort(
        (a, b) => a.id - b.id
      ),
    }

    if (group.updated_at && group.updated_user_id) {
      entityData.user_updated_at = group.updated_at
      entityData.user_updated_by = this.formatUserInfo(group)
    }

    return entityData
  }

  async getPopulateCalculate(c: Context, query: PopulateCalculateQuery) {
    const result = await this.repository.getPopulateCalculate(c, query)

    if (!result.year_plan) {
      return { year_plan: null, data: [] }
    }

    // Step 1: Build entity raw data from repository results
    const entityRawData = this.buildEntityRawData(result.entity_data)

    // Step 2: Group entities by regency
    const regencyGroups = this.groupEntitiesByRegency(entityRawData)

    // Step 3: Create dinkes map for representative selection
    const dinkesMap = this.buildDinkesMap(result.dinkes_entities)

    // Step 4: Aggregate data per regency with Dinkes as representative
    const finalRegencyData = this.aggregateRegencyGroups(
      regencyGroups,
      dinkesMap
    )

    // Step 5: Build final response
    const allData: ResponseEntry[] = []

    if (result.province_data.length > 0) {
      allData.push(
        this.buildProvinceEntry(result.province_data, result.province_name)
      )
    }

    for (const group of finalRegencyData.values()) {
      allData.push(this.buildEntityEntry(group))
    }

    // Apply pagination
    const offset = (query.page - 1) * query.paginate
    const paginatedData = allData.slice(offset, offset + query.paginate)

    return new PaginatedResponse(
      { page: query.page, paginate: query.paginate },
      paginatedData.map((item) => ({
        ...item,
        year_plan: String(result.year_plan),
      })),
      allData.length
    )
  }

  private aggregateRegencyGroups(
    regencyGroups: Map<string, { entities: EntityRawData[] }>,
    dinkesMap: Map<string, DinkesInfo>
  ): Map<string, EntityRawData> {
    const finalRegencyData = new Map<string, EntityRawData>()

    for (const [regencyKey, regencyGroup] of regencyGroups) {
      if (regencyGroup.entities.length === 0) {
        continue
      }

      const dinkesFromMap = dinkesMap.get(regencyKey)
      const representative = this.findRepresentativeEntity(
        regencyGroup,
        dinkesFromMap
      )
      const aggregatedData = this.aggregateRegencyData(
        representative,
        regencyGroup.entities
      )

      finalRegencyData.set(regencyKey, aggregatedData)
    }

    return finalRegencyData
  }
}
