import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import {
  CreateTransactionTransferStockBody,
  ListProgramsParams,
  ListProgramsResponse,
  ListStockTransferParams,
  ListStockTransferResponse,
  listTransferStockActivitiesParams,
  listTransferStockActivitiesReponse,
} from './transaction-transfer-stock.type'

export async function listPrograms(
  params: ListProgramsParams
): Promise<ListProgramsResponse> {
  const response = await axios.get(
    `${SERVICE_API.MAIN}/transfer-stock/programs`,
    {
      params,
    }
  )

  return response?.data
}

export async function listStockTransfer(
  params: ListStockTransferParams
): Promise<ListStockTransferResponse> {
  const response = await axios.get(`${SERVICE_API.MAIN}/transfer-stock/stocks`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockTransferResponse>(response)
}

export async function listTransferStockActivities(
  params: listTransferStockActivitiesParams
): Promise<listTransferStockActivitiesReponse> {
  const response = await axios.get(
    `${SERVICE_API.MAIN}/transfer-stock/activities`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function createTransferStock(data: CreateTransactionTransferStockBody) {
  const response = await axios.post(
    `${SERVICE_API.MAIN}/transactions/transfer-stock`,
    data
  )

  return response?.data
}
