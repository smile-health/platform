import axios from '#lib/axios'

import { Request } from './monitoring-device-inventory-form.type'

export async function createMonitoringDeviceInventory(data: Request) {
  const response = await axios.post('/core/asset-monitoring-devices', data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateMonitoringDeviceInventory(
  id: string | number,
  data: Request
) {
  const response = await axios.put(
    `/core/asset-monitoring-devices/${id}`,
    data,
    {
      cleanBody: true,
    }
  )

  return response?.data
}
