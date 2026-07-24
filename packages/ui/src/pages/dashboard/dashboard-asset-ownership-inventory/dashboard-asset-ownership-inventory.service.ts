import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  GetAssetInventorySummaryResponse,
  GetAssetInventoryTableResponse,
} from './dashboard-asset-ownership-inventory.type'

export type GetAssetDashboardParams = {
  page?: number
  paginate?: number
  type_ids?: number[]
  entity_type_ids?: number[]
  manufacture_ids?: number[]
  province_ids?: number[]
  regency_ids?: number[]
  entity_ids?: number[]
  entity_tag_ids?: number[]
  model_ids?: number[]
  is_deleted?: boolean[]
  power_available_ids?: number[]
  ownership_status_ids?: number[]
  prod_years?: number[]
  vendor_ids?: number[]
  communication_provider_ids?: number[]
  asset_capacity_ids?: number[]
  budget_years?: number[]
  working_status_ids?: number[]
}

export async function getAssetSummary(params: GetAssetDashboardParams) {
  const response = await axios.get<GetAssetInventorySummaryResponse>(
    '/warehouse-report/asset-inventory/overview',
    {
      params,
    }
  )
  return response?.data
}

export async function getAssetTable(params: GetAssetDashboardParams) {
  const response = await axios.get<GetAssetInventoryTableResponse>(
    '/warehouse-report/asset-inventory/table',
    {
      params,
    }
  )

  return response?.data
}

export async function exportAsset(params: GetAssetDashboardParams) {
  const response = await axios.get('/warehouse-report/asset-inventory/export', {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
