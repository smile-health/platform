import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  GetColdStorageParams,
  GetColdStorageResponse,
  GetExcursionParams,
  GetExcursionResponse,
} from '../dashboard-temperature-monitoring.types'

const BASE_URL = '/warehouse-report/asset-monitoring-device'

async function getColdStorage(
  params: GetColdStorageParams
): Promise<GetColdStorageResponse> {
  const response = await axios.get<GetColdStorageResponse>(
    `${BASE_URL}/coldstorage`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

async function getExcursion(
  params: GetExcursionParams
): Promise<GetExcursionResponse> {
  const response = await axios.get<GetExcursionResponse>(
    `${BASE_URL}/excursion`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

async function exportXls(params: GetColdStorageParams) {
  const response = await axios.get(`${BASE_URL}/export`, {
    params,
    cleanParams: true,
    responseType: 'blob',
  })

  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'temperature-monitoring-dashboard.xlsx'
  )

  return response?.data
}

export const temperatureMonitoringDashboardService = {
  getColdStorage,
  getExcursion,
  exportXls,
}
