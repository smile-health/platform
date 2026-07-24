import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { processParams } from '../list/libs/period-of-stock-taking-list.common'
import {
  ListPeriodOfStockTakingParams,
  ListPeriodOfStockTakingResponse,
  TPeriodOfStockTakingData,
} from '../list/libs/period-of-stock-taking-list.type'

export const listPeriodOfStockTaking = async (
  params: ListPeriodOfStockTakingParams
) => {
  const processedParams = processParams({ params, isExport: false })
  const fetchPeriodOfStockTakingList = await axios.get(
    '/main/stock-opname-periods',
    {
      params: processedParams,
      cleanParams: true,
    }
  )

  const resultData =
    fetchPeriodOfStockTakingList?.data?.data?.map(
      (item: TPeriodOfStockTakingData, index: number) => ({
        ...item,
        si_no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...fetchPeriodOfStockTakingList,
    data: {
      ...fetchPeriodOfStockTakingList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListPeriodOfStockTakingResponse>(result)
}

export const loadPeriodStockTaking = async (
  keyword: string,
  _: unknown,
  additional: {
    page: number
    lang?: string
  }
) => {
  const params: ListPeriodOfStockTakingParams = {
    page: additional.page,
    paginate: 10,
  }

  const result = await listPeriodOfStockTaking(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
      },
    }
  }

  const options =
    result?.data?.map((item) => ({
      label: item?.name,
      value: item?.id,
    })) || []

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
    },
  }
}

export const exportPeriodOfStockTakings = async (
  params: Omit<ListPeriodOfStockTakingParams, 'page' | 'paginate'>
) => {
  const processedParams = processParams({ params, isExport: true })
  const responseExportPeriodOfStockTaking = await axios.get(
    '/main/stock-opname-periods/xls',
    {
      params: processedParams,
      cleanParams: true,
      responseType: 'blob',
    }
  )

  parseDownload(
    responseExportPeriodOfStockTaking?.data,
    responseExportPeriodOfStockTaking?.headers?.filename
  )

  return responseExportPeriodOfStockTaking?.data
}

export const detailPeriodOfStockTaking = async (id: number) => {
  const response = await axios.get(`/main/stock-opname-periods/${id}`)
  return response?.data as TPeriodOfStockTakingData
}

export const createPeriodOfStockTaking = async (
  data: TPeriodOfStockTakingData
) => {
  const response = await axios.post('/main/stock-opname-periods', data, {
    cleanBody: true,
  })
  return response?.data as TPeriodOfStockTakingData
}

export const updatePeriodOfStockTaking = async (
  id: number,
  data: TPeriodOfStockTakingData
) => {
  const response = await axios.put(`/main/stock-opname-periods/${id}`, data, {
    cleanBody: true,
  })
  return response?.data as TPeriodOfStockTakingData
}

export const changeStatusPeriodOfStockTaking = async (
  id: number,
  status: number
) => {
  const response = await axios.put(
    `/main/stock-opname-periods/${id}/status`,
    {
      status,
    },
    {
      cleanBody: true,
    }
  )
  return response?.data as TPeriodOfStockTakingData
}
