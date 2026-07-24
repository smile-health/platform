import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  GetReconciliationParams,
  ListReconciliationParams,
  ListReconciliationResponse,
  TReconciliationData,
} from './reconciliation-list.type'

export async function getListReconciliation(
  params: ListReconciliationParams
): Promise<ListReconciliationResponse> {
  const response = await axios.get(`${SERVICE_API.MAIN}/reconciliation`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListReconciliationResponse>(response)
}

export async function getDetailReconciliation(
  id: number
): Promise<TReconciliationData> {
  const response = await axios.get(`${SERVICE_API.MAIN}/reconciliation/${id}`)
  return handleAxiosResponse<TReconciliationData>(response)
}

export async function exportReconciliation(params: GetReconciliationParams) {
  const response = await axios.get(`${SERVICE_API.MAIN}/reconciliation/xls`, {
    params,
    cleanParams: true,
  })

  return response?.data
}
