import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { parseDownload } from '#utils/download'

import {
  StorageTemperatureMonitoringChartData,
  StorageTemperatureMonitoringDetail,
  StorageTemperatureMonitoringDetailHistory,
} from './storage-temperature-monitoring-detail.type'

export type GetStorageTemperatureMonitoringDetailResponse =
  StorageTemperatureMonitoringDetail

export type GetStorageTemperatureMonitoringDetailHistoryResponse =
  TCommonResponseList & {
    data: StorageTemperatureMonitoringDetailHistory[]
  }
export type GetStorageTemperatureMonitoringChartDataResponse =
  TCommonResponseList & {
    data: StorageTemperatureMonitoringChartData[]
  }

export type GetStorageTemperatureMonitoringDetailHistoryParams = {
  from_date?: string
  to_date?: string
  is_warehouse?: number
}

export async function getStorageTemperatureMonitoringDetail(
  id: string | number
): Promise<GetStorageTemperatureMonitoringDetailResponse> {
  const response = await axios.get(`/core/asset-monitoring-temperature/${id}`, {
    redirect: true,
  })
  return response.data
}

export async function deleteStorageTemperatureMonitoring(id: string | number) {
  const response = await axios.delete(
    `/core/asset-monitoring-temperature/${id}`
  )
  return response?.data
}

export type UpdateStorageTemperatureMonitoringStatusRequest = {
  working_status_id: number
}

export async function updateStorageTemperatureMonitoringStatus(
  id: string | number,
  data: UpdateStorageTemperatureMonitoringStatusRequest
) {
  const response = await axios.put(
    `/core/asset-monitoring-temperature/${id}/operational-status`,
    data
  )
  return response?.data
}

export async function getStorageTemperatureMonitoringHistoryDetail(
  id: number | null,
  params: GetStorageTemperatureMonitoringDetailHistoryParams
): Promise<GetStorageTemperatureMonitoringDetailHistoryResponse> {
  const response = await axios.get(
    `/core/asset-monitoring-temperature/${id}/history`,
    {
      params,
      cleanParams: true,
    }
  )
  return response.data
}

export type UpdateStorageTemperatureMonitoringThresholdRequest = {
  temperature_threshold_id: number
}

export async function getStorageTemperatureMonitoringChartData(
  id: number | null,
  params: GetStorageTemperatureMonitoringDetailHistoryParams
): Promise<GetStorageTemperatureMonitoringChartDataResponse> {
  const response = await axios.get(
    `/core/asset-monitoring-temperature/${id}/history-charts`,
    {
      params,
      cleanParams: true,
    }
  )

  return response.data
}

export async function updateStorageTemperatureMonitoringThreshold(
  id: string | number,
  data: UpdateStorageTemperatureMonitoringThresholdRequest
) {
  const response = await axios.put(
    `/core/asset-monitoring-temperature/${id}/temperature-range`,
    data
  )
  return response?.data
}

export async function exportStorageTemperatureMonitoringHistoryDetail(
  id: number | null,
  params: GetStorageTemperatureMonitoringDetailHistoryParams
) {
  const response = await axios.get(
    `/core/asset-monitoring-temperature/${id}/history/xls`,
    {
      params,
      cleanParams: true,
      responseType: 'blob',
    }
  )
  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
