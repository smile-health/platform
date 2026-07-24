import { TCommonResponseList } from '#types/common'

export type AssetInventorySummaryData = {
  id: number | null
  title: string | null
  details: {
    id: number | null
    title: string | null
    total: number | null
    color: string | null
  }[]
  total: number | null
}

export type AssetInventoryTableData = {
  id: number | null
  title: string | null
  total: number | null
  details: {
    id: number | null
    title: string | null
    total: number | null
  }[]
}

export type GetAssetInventorySummaryResponse = TCommonResponseList & {
  data: Array<AssetInventorySummaryData>
}
export type GetAssetInventoryTableResponse = TCommonResponseList & {
  data: Array<AssetInventoryTableData>
}
