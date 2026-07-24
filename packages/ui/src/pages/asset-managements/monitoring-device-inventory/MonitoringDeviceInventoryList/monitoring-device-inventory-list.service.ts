import { OptionType } from '#components/react-select'
import axios from '#lib/axios'
import { Pagination, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { MonitoringDeviceInventoryListItem } from './monitoring-device-inventory-list.type'

export type GetMonitoringDeviceInventoryListRequest = Pagination & {
  asset_model_ids?: string
  asset_type_ids?: string
  city_id?: string
  device_status_id?: string
  entity_tag_ids?: string
  health_center_id?: string
  keyword?: string
  manufacture_ids?: string
  province_id?: string
  status?: string
  working_status_id?: string
  entity_id?: number
  logger_ids?: number[]
  sort_by?: string
  sort_type?: string
  is_device_related?: number
}

export type GetMonitoringDeviceInventoryListResponse = TCommonResponseList<
  MonitoringDeviceInventoryListItem[]
>

export async function getMonitoringDeviceInventoryList(
  params: GetMonitoringDeviceInventoryListRequest
) {
  const response = await axios.get('/core/asset-monitoring-devices', {
    params,
  })
  return handleAxiosResponse<GetMonitoringDeviceInventoryListResponse>(response)
}

export async function exportMonitoringDeviceInventoryList(
  params: GetMonitoringDeviceInventoryListRequest
) {
  const response = await axios.get('/core/asset-monitoring-devices/xls', {
    responseType: 'arraybuffer',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export const exportMonitoringDeviceInventory = async (
  params: GetMonitoringDeviceInventoryListRequest
) => {
  const response = await axios.get(`/core/asset-monitoring-devices/xls/async`, {
    responseType: 'arraybuffer',
    params,
  })
  return response?.data
}

export async function importMonitoringDeviceInventoryList(data: FormData) {
  const response = await axios.post('/core/asset-monitoring-devices/xls', data)

  return response?.data
}

export type OperationalStatusItem = {
  id: number
  name: string
}

export type GetOperationalStatusListResponse = {
  data: OperationalStatusItem[]
}
export async function getOperationalStatusList(
  isGlobal: boolean = false
): Promise<GetOperationalStatusListResponse> {
  const apiUrl = `${isGlobal ? '/core' : '/main'}/asset-monitoring-devices/rtmd-statuses`
  const response = await axios.get(apiUrl)
  return response?.data
}

export async function loadOperationalStatus(
  keyword: string,
  _: unknown,
  additional?: { page: number; isGlobal?: boolean }
) {
  const result = await getOperationalStatusList(additional?.isGlobal ?? false)

  const filteredData = keyword
    ? result.data?.filter((item) =>
        item?.name?.toLowerCase()?.includes(keyword.toLowerCase())
      )
    : result.data

  const options: OptionType[] =
    filteredData?.map((item) => ({
      label: item?.name,
      value: item?.id,
    })) || []

  return {
    options,
    hasMore: false,
    additional: { page: 1, isGlobal: additional?.isGlobal ?? false },
  }
}

export async function loadMonitoringDeviceInventory(
  keyword: string,
  _: unknown,
  additional: GetMonitoringDeviceInventoryListRequest
) {
  const result = await getMonitoringDeviceInventoryList({
    ...additional,
    ...(additional?.logger_ids?.length && {
      logger_ids: undefined,
    }),
    keyword,
  })

  const options: OptionType[] =
    result.data?.map((item) => {
      const serialNumber = item?.serial_number ?? ''
      const assetModelName = item?.asset_model?.name
        ? `-${item.asset_model.name}`
        : ''
      const manufacturerName = item?.manufacturer?.name
        ? ` (${item.manufacturer.name})`
        : ''

      return {
        label: `${serialNumber}${assetModelName}${manufacturerName}`,
        value: item?.id,
      }
    }) || []

  return {
    options: options?.filter(
      (item) => !additional?.logger_ids?.includes(item.value)
    ),
    hasMore: (result?.data?.length ?? 0) > 0,
    additional: {
      ...additional,
      page: additional?.page + 1,
    },
  }
}
