import axios from '#lib/axios'
import {
  ListReactionResponse,
  ListTransactionsParams,
  ListTransactionsResponse,
  ResponseDetailTransaction,
  TListStockQualities,
  TListTransactionsReasons,
  TListTransactionsTypes,
  TTransactionData,
  TTransactionTypeParams,
} from '#types/transaction'
import { handleAxiosResponse } from '#utils/api'
import { TOptions } from 'i18next'

import { TRANSACTION_TYPE } from './TransactionCreate/transaction-create.constant'
import { TransactionType } from './TransactionCreate/transaction-create.type'
import { processParams } from './TransactionList/helpers/transaction-list.common'
import { SideEffectFormValues } from './TransactionList/helpers/transaction-list.types'

export async function listTransactionTypes(params: TTransactionTypeParams) {
  const options: {
    params: TTransactionTypeParams
    cleanParams: boolean
  } = {
    params,
    cleanParams: true,
  }
  const fetchTransactionTypeList = await axios.get(
    '/main/transactions/type',
    options
  )

  return handleAxiosResponse<TListTransactionsTypes>(fetchTransactionTypeList)
}

export async function loadTransactionType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_enable?: number
    isTransferStockRestricted?: boolean
  }
) {
  const params: TTransactionTypeParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  if (additional.is_enable) {
    params.is_enable = additional.is_enable
  }

  const result = await listTransactionTypes(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
      },
    }
  }

  let options =
    result?.data?.map((item: TransactionType) => ({
      label: item?.title,
      value: item?.id,
    })) || []

  if (additional.isTransferStockRestricted) {
    options = options.filter((x) => x.value !== TRANSACTION_TYPE.TRANSFER_STOCK)
  }

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
      isTransferStockRestricted: additional.isTransferStockRestricted,
    },
  }
}

export async function loadReason(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    transaction_type_id?: number
  }
) {
  let params: TTransactionTypeParams = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchTransactionReasonList = await axios.get(
    '/main/transactions/reason',
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<TListTransactionsReasons>(
    fetchTransactionReasonList
  )

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item: TOptions) => ({
    label: item?.title as string,
    value: item?.id as number,
    is_other: item?.is_other as number,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadStatusVVM(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: TTransactionTypeParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchTransactionStatusVVM = await axios.get('/main/stock-qualities', {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TListTransactionsReasons>(
    fetchTransactionStatusVVM
  )

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item: TOptions) => ({
    label: item?.label as string,
    value: item?.id as number,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
    },
  }
}

export const listTransactions = async (params: ListTransactionsParams) => {
  const processedParams = processParams({ params, isExport: false })
  const fetchTransactionList = await axios.get('/main/transactions', {
    params: processedParams,
    cleanParams: true,
  })

  const resultData =
    fetchTransactionList?.data?.data?.map(
      (item: TTransactionData, index: number) => ({
        ...item,
        si_no: index + 1 + (params.page - 1) * params.paginate,
      })
    ) ?? []

  const result = {
    ...fetchTransactionList,
    data: {
      ...fetchTransactionList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListTransactionsResponse>(result)
}

export const getDetailTransaction = async (transactionId: number) => {
  const fetchDetailTransaction = await axios.get(
    `/main/transactions/${transactionId}`
  )

  return handleAxiosResponse<ResponseDetailTransaction>(fetchDetailTransaction)
}

export const exportTransactions = async (
  params: Omit<ListTransactionsParams, 'page' | 'paginate'>
) => {
  const processedParams = processParams({ params, isExport: true })
  const responseExportTransaction = await axios.get('/main/transactions/xls', {
    params: processedParams,
    cleanParams: true,
  })

  return responseExportTransaction?.data
}

export async function loadStockQualities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const res = await axios.get('/main/stock-qualities', {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TListStockQualities>(res)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item: TOptions) => ({
    label: item?.label,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export const listReactions = async () => {
  const fetchReactionList = await axios.get('/core/reactions', {
    params: {
      page: 1,
      paginate: 100,
    },
  })

  const result = {
    ...fetchReactionList,
    data: {
      ...fetchReactionList?.data,
      data: fetchReactionList.data?.data?.map((item: TOptions) => ({
        value: item?.id,
        label: item?.title,
      })),
    },
  }

  return handleAxiosResponse<ListReactionResponse>(result)
}

export const addSideEffect = async (
  consumptionId: number,
  form: SideEffectFormValues
) => {
  const payload = {
    reaction_id: form.reaction_type,
    other_reaction: form.other_reaction,
    actual_date: form.reaction_date,
  }
  const response = await axios.post(
    `/main/consumptions/${consumptionId}/kipi`,
    payload
  )

  return handleAxiosResponse(response)
}
