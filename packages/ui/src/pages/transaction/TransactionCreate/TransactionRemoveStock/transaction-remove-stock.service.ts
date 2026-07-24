import axios from '#lib/axios'

import { submitTransactionRemoveStock } from './transaction-remove-stock.common'
import {
  CreateTransactionRemoveForm,
  CreateTransactionRemoveSubmit,
} from './transaction-remove-stock.type'

export async function createTransactionRemoveStock(
  data: CreateTransactionRemoveSubmit
) {
  const processedData = submitTransactionRemoveStock(
    data as CreateTransactionRemoveForm & CreateTransactionRemoveSubmit
  )
  const response = await axios.post(
    '/main/transactions/remove-stock',
    processedData
  )
  return response?.data
}
