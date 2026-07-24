import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { TColdStorageCapacityDetailResponse } from './cold-storage-capacity-detail.type'

const SERVICE = SERVICE_API

export const getColdStorageCapacityDetail = async (
  id: string,
  params: { program_id?: string }
) => {
  const apiUrl = `${SERVICE.CORE}/coldstorage/${id}`
  const response = await axios.get(apiUrl, { params })

  return handleAxiosResponse<TColdStorageCapacityDetailResponse>(response)
}

export const exportColdStorageCapacityDetail = async (
  id: string,
  params?: { program_id?: string }
) => {
  const response = await axios.get(`${SERVICE.CORE}/coldstorage/${id}/export`, {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}
