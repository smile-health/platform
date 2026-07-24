import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import { submitTransactionReturnFromFacility } from './transaction-return-from-facility.common'
import {
  CreateTransactionReturnFromFacilityForm,
  CreateTransactionReturnFromFacilitySubmit,
  ListTransactionConsumptionParams,
  ListTransactionConsumptionResponse,
} from './transaction-return-from-facility.type'

export const listTransactionConsumption = async (
  params: ListTransactionConsumptionParams
): Promise<ListTransactionConsumptionResponse> => {
  const res = await axios.get('/main/transactions/consumptions', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListTransactionConsumptionResponse>(res)
}

export async function createTransactionReturnFromFacility(
  data: CreateTransactionReturnFromFacilitySubmit
) {
  const processedData = submitTransactionReturnFromFacility(
    data as CreateTransactionReturnFromFacilityForm &
      CreateTransactionReturnFromFacilitySubmit
  )

  const response = await axios.post(
    '/main/transactions/return-of-health-facitilies',
    processedData,
    {
      cleanParams: true,
      cleanBody: true,
    }
  )
  return response?.data
}
