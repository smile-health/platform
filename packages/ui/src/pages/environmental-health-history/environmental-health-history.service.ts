import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { removeEmptyObject } from '#utils/object'

import {
  EnvironmentalHealthHistoryDetail,
  EnvironmentalHealthHistoryExportResponse,
  EnvironmentalHealthHistoryListParams,
  EnvironmentalHealthHistoryListResponse,
} from './environmental-health-history.type'

const BASE_URL = SERVICE_API.MAIN

export async function listEnvironmentalHealthHistory(
  rawParams: EnvironmentalHealthHistoryListParams
): Promise<EnvironmentalHealthHistoryListResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${BASE_URL}/environmental-health-history`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<EnvironmentalHealthHistoryListResponse>(response)
}

export async function getEnvironmentalHealthHistoryDetail(
  id: string | number
): Promise<EnvironmentalHealthHistoryDetail> {
  const response = await axios.get(
    `${BASE_URL}/environmental-health-history/${id}`
  )
  return handleAxiosResponse<EnvironmentalHealthHistoryDetail>(response)
}

export async function exportEnvironmentalHealthHistoryExcel(
  rawParams: EnvironmentalHealthHistoryListParams
): Promise<EnvironmentalHealthHistoryExportResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(
    `${BASE_URL}/environmental-health-history/export/xls`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function exportEnvironmentalHealthHistoryPdf(
  id: string | number
): Promise<EnvironmentalHealthHistoryExportResponse> {
  const response = await axios.get(
    `${BASE_URL}/environmental-health-history/export/pdf/${id}`
  )
  return response?.data
}
