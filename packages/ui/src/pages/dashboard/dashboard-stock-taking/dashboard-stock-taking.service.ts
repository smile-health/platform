import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  ListComplianceResponse,
  ListComplianceSummaryResponse,
  ListMaterialResponse,
  ListResultResponse,
  ListResultSummaryResponse,
  TStockTakingDashboardPaginateParams,
  TStockTakingDashboardParams,
} from './dashboard-stock-taking.type'

export async function listCompliance(
  params: TStockTakingDashboardPaginateParams
) {
  const response = await axios.get<ListComplianceResponse>(
    '/warehouse-report/stock-opname/compliance',
    {
      params,
    }
  )
  return response?.data
}

export async function listComplianceSummary(
  params: TStockTakingDashboardParams
) {
  const response = await axios.get<ListComplianceSummaryResponse>(
    '/warehouse-report/stock-opname/compliance/summary',
    {
      params,
    }
  )
  return response?.data
}

export async function listResult(params: TStockTakingDashboardPaginateParams) {
  const response = await axios.get<ListResultResponse>(
    '/warehouse-report/stock-opname/result',
    {
      params,
    }
  )
  return response?.data
}

export async function listResultSummary(params: TStockTakingDashboardParams) {
  const response = await axios.get<ListResultSummaryResponse>(
    '/warehouse-report/stock-opname/result/summary',
    {
      params,
    }
  )
  return response?.data
}

export async function listMaterials(
  params: TStockTakingDashboardPaginateParams
) {
  const response = await axios.get<ListMaterialResponse>(
    '/warehouse-report/stock-opname/materials',
    {
      params,
    }
  )
  return response?.data
}

export async function exportStockTaking(
  params: TStockTakingDashboardParams,
  type: string
) {
  const response = await axios.get(
    `/warehouse-report/stock-opname/${type}/export`,
    {
      params,
    }
  )

  return response?.data
}
