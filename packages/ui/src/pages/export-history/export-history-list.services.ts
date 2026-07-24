import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  ListExportHistoryParams,
  ListExportHistoryResponse,
} from './exrport-history-list.type'

export async function getListExportHistory(
  params: ListExportHistoryParams
): Promise<ListExportHistoryResponse> {
  const response = await axios.get(`${SERVICE_API.CORE}/export-histories`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListExportHistoryResponse>(response)
}

export async function downloadFileExportHistory(filename: string, originalFileName: string) {
  const response = await axios.get(
    `${SERVICE_API.CORE}/export-histories/${originalFileName}/download`,
    {
      responseType: 'blob',
    }
  )

  parseDownload(response?.data, filename)

  return response?.data
}
