import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  PayloadCancelTransactionDiscard as CreateCancelTransactionDiscardBody,
  CreateCancelTransactionDiscardResponse,
  ListTransactionDiscardParams,
  ListTransactionDiscardResponse,
} from './transaction-cancel-discard.type'

export const listTransactionDiscard = async (
  params: ListTransactionDiscardParams
): Promise<ListTransactionDiscardResponse> => {
  const res = await axios.get('/main/transactions/discard', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListTransactionDiscardResponse>(res)
}

export const createCancelTransactionDiscard = async (
  data: CreateCancelTransactionDiscardBody
): Promise<CreateCancelTransactionDiscardResponse> => {
  const response = await axios.post(
    '/main/transactions/cancelation-discard',
    data
  )

  return response.data
}
