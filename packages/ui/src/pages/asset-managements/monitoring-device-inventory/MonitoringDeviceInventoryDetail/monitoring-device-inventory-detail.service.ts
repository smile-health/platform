import axios from '#lib/axios'

import { MonitoringDeviceInventoryDetail } from './monitoring-device-inventory.type'

export type GetMonitoringDeviceInventoryDetailResponse =
  MonitoringDeviceInventoryDetail

export async function getMonitoringDeviceInventoryDetail(
  id: string | number
): Promise<GetMonitoringDeviceInventoryDetailResponse> {
  const response = await axios.get(`/core/asset-monitoring-devices/${id}`, {
    redirect: true,
  })
  return response.data
}

export async function deleteMonitoringDeviceInventory(id: string | number) {
  const response = await axios.delete(`/core/asset-monitoring-devices/${id}`)
  return response?.data
}

export type UpdateMonitoringDeviceInventoryStatusRequest = {
  status: 1 | 0
}

export async function updateMonitoringDeviceInventoryStatus(
  id: string | number,
  data: UpdateMonitoringDeviceInventoryStatusRequest
) {
  const response = await axios.put(
    `/core/asset-monitoring-devices/${id}/status`,
    data
  )
  return response?.data
}
