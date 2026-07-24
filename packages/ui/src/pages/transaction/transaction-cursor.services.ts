import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { ITransactionCursorPaginationParams, TransactionCountTotalDataParams, TransactionCursorPaginatedResponse } from '#types/cursor-pagination'
import { TTransactionData } from '#types/transaction'
import { isObject } from '#utils/object'
import { TSingleOptions } from '#types/common'


const processParams = ({
  params
}: {
  params:ITransactionCursorPaginationParams | TransactionCountTotalDataParams 
}) =>
  Object.fromEntries(
    Object.entries(params).flatMap(([key, value]): [string, any][] => {

      if (key === 'material_level_id') {
        return [[key, null]]
      }

      if (key === 'date_range') {
        const { start, end } = (value as { start: string; end: string }) || {}
        return [
          ['start_date', start],
          ['end_date', end],
        ]
      }

      if (key === 'entity_id') {
        const fallback = isObject(params?.entity_user_id)
          ? params?.entity_user_id?.value
          : (value as TSingleOptions)?.value
        return [['entity_id', fallback]]
      }

      if (key === 'entity_user_id') {
        return []
      }

      if (isObject(value)) {
        return [[key, (value as TSingleOptions)?.value]]
      }

      return [[key, value]]
    })
  )

export const listTransactionsCursor = async (params: ITransactionCursorPaginationParams) => {
  const processedParams = processParams({ params })
  
  const fetchTransactionList = await axios.get('/main/transactions/cursor', {
    params: processedParams,
    cleanParams: true,
  })

  // Add serial numbers to the data
  const resultData = fetchTransactionList?.data?.data?.map(
    (item: TTransactionData, index: number) => ({
      ...item,
      si_no: index + 1,
    })
  ) ?? []

  const result = {
    ...fetchTransactionList,
    data: {
      ...fetchTransactionList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<TransactionCursorPaginatedResponse>(result)
}

export const exportTransactionsCursor = async (
  params: Omit<ITransactionCursorPaginationParams, 'limit' | 'cursor'>
) => {
  const processedParams = processParams({ params: params as ITransactionCursorPaginationParams })
  
  const responseExportTransaction = await axios.get('/main/transactions/cursor/xls', {
    params: processedParams,
    cleanParams: true,
  })

  return responseExportTransaction?.data
}

export const countTotalTransactionsData = async (params: TransactionCountTotalDataParams) => {
  const processedParams = processParams({ params })
  
  const fetchTransactionList = await axios.get('/main/transactions/count', {
    params: processedParams,
    cleanParams: true,
  })

  return fetchTransactionList
}