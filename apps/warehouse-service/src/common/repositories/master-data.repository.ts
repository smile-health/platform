import pluralize from "pluralize"
import { execQuery } from "../infrastructure/database/index.js"

export type MasterDataType =
  | "asset_type"
  | "asset_electricity"
  | "asset_classification"
  | "asset_model"
  | "asset_vendor"
  | "manufacture"
  | "asset_working_status"
  | "entity"
  | "entity_tag"
  | "location"
  | "material"
  | "material_type"
  | "ws_activity"
  | "ws_order_status"
  | "ws_materials"
export interface MasterData {
  id: number
  name: string
}

const TABLE_WITHOUT_DELETED_AT = ["raw_locations"]

export class MasterDataRepository {
  constructor() {}

  async fetchDataByIds(
    dataType: MasterDataType,
    ids?: number[] | null,
    label = "name"
  ) {
    if (!ids) return []

    ids = ids.filter((id) => id != null)
    if (ids.length === 0) return []

    const tablename = `raw_${pluralize.plural(dataType)}`
    const where = TABLE_WITHOUT_DELETED_AT.includes(tablename)
      ? "1=1"
      : `deleted_at IS NULL`

    return await execQuery<MasterData[]>(
      `SELECT id, ${label} as name FROM ${tablename} FINAL WHERE ${where} and id IN {ids:Array(Int64)}`,
      { ids }
    )
  }

  async fetchAllData(dataType: MasterDataType) {
    const tablename = `raw_${pluralize.plural(dataType)}`
    return await execQuery<MasterData[]>(
      `SELECT id, name FROM ${tablename} FINAL WHERE deleted_at IS NULL`
    )
  }
}
