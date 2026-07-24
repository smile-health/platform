import axios from '#lib/axios'
import { Pagination, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

import { StorageTemperatureMonitoringModel } from './storage-temperature-monitoring-list.model'

export type StorageTemperatureMonitoringSortField =
  | 'serial_number'
  | 'asset_type_name'
  | 'working_status_name'

export type GetStorageTemperatureMonitoringRequest = Pagination & {
  asset_model_ids?: string
  asset_type_ids?: string
  regency_id?: string
  entity_tag_ids?: string
  health_center_id?: string
  is_device_related?: string
  keyword?: string
  manufacture_ids?: string
  province_id?: string
  working_status_id?: string
  sort_by?: string
  sort_type?: 'asc' | 'desc'
  is_warehouse?: number
  is_cce?: number
}

type GetStorageTemperatureMonitoringResponse =
  TCommonResponseList<StorageTemperatureMonitoringModel>

export async function getStorageTemperatureMonitoringList(
  params: GetStorageTemperatureMonitoringRequest
): Promise<GetStorageTemperatureMonitoringResponse> {
  const response = await axios.get(`/core/asset-monitoring-temperature`, {
    params,
  })
  return handleAxiosResponse(response)
}

export async function exportStorageTemperatureMonitoring(
  params: GetStorageTemperatureMonitoringRequest
) {
  const response = await axios.get(
    `/core/asset-monitoring-temperature/xls/async`,
    {
      responseType: 'arraybuffer',
      params,
    }
  )

  return response?.data
}
