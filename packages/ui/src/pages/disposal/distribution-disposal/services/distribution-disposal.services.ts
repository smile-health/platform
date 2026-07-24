import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  CreateDetailDistributionDisposalCommentBody,
  CreateDetailDistributionDisposalResponse,
  CreateDistributionDisposalPayload as CreateDistributionDisposalBody,
  ListDistributionDisposalParams,
  ListDistributionDisposalResponse,
  ListStockExterminationParams,
  ListStockExterminationResponse,
  TDistributionDisposal,
  TSubmitUpdateReceivedStock,
} from '../types/DistributionDisposal'
import { processParams, processReceivedData } from '../utils/util'

export async function listDistributionDisposal(
  rawParams: ListDistributionDisposalParams
) {
  const params = processParams({
    params: rawParams,
    isExport: false,
  })

  const response = await axios.get('/main/disposal/shipment', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListDistributionDisposalResponse>(response)
}

export async function exportDistributionDisposal(
  rawParams?: Omit<ListDistributionDisposalParams, 'page' | 'paginate'>
) {
  const params = processParams({
    params: rawParams ?? {},
    isExport: true,
  })
  const response = await axios.get('/main/disposal/shipment/xls', {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function detailDistributionDisposal(
  id: number
): Promise<TDistributionDisposal> {
  const response = await axios.get(`/main/disposal/shipment/${id}`, {
    cleanParams: true,
  })

  return response.data
}

export async function downloadDistributionDisposalMemo(id: number) {
  const response = await axios.get(`/main/disposal/shipment/${id}/download`, {
    responseType: 'blob',
  })
  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function createDistributionDisposalComment(
  id: number,
  data: CreateDetailDistributionDisposalCommentBody
): Promise<CreateDetailDistributionDisposalResponse> {
  const response = await axios.post(
    `/main/disposal/shipment/${id}/comment`,
    data,
    {
      cleanBody: true,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function cancelDistributionDisposal(
  id: number,
  data: { comment: string }
): Promise<CreateDetailDistributionDisposalResponse> {
  const response = await axios.put(
    `/main/disposal/shipment/${id}/cancel`,
    data,
    {}
  )

  return response?.data
}

export async function fulfillDistributionDisposal(
  id: number,
  rawData: TSubmitUpdateReceivedStock
): Promise<CreateDetailDistributionDisposalResponse> {
  const data = processReceivedData(rawData)
  const response = await axios.put(
    `/main/disposal/shipment/${id}/accept`,
    data,
    {
      cleanBody: true,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function listStockExtermination(
  params: ListStockExterminationParams
) {
  const response = await axios.get('/v2/stock-extermination', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockExterminationResponse>(response)
}

export async function createDistributionDisposal(
  data: CreateDistributionDisposalBody
): Promise<TDistributionDisposal> {
  const response = await axios.post(
    `${SERVICE_API.MAIN}/disposal/shipment`,
    data,
    {}
  )

  return response?.data
}
