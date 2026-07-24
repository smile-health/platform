import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  DashboardAsikBaseParams,
  DashboardAsikChartResponse,
  DashboardAsikPaginatedParams,
  DashboardAsikPaginatedResponse,
} from './dashboard-asik.type'

export async function getDashboardAsikReview(params: DashboardAsikBaseParams) {
  const response = await axios.get<DashboardAsikChartResponse>(
    '/warehouse-report/asik/review',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getDashboardAsikDataTable(
  params: DashboardAsikPaginatedParams
) {
  const response = await axios.get<DashboardAsikPaginatedResponse>(
    '/warehouse-report/asik/table',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function exportDashboardAsik(params: DashboardAsikBaseParams) {
  const response = await axios.get('/warehouse-report/asik/export', {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
