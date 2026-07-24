import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import { processParams } from '../libs/stock-opname-list.common'
import {
  ListStockOpnameParams,
  ListStockOpnameResponse,
  TStockOpnameData,
} from '../libs/stock-opname-list.types'

export const listStockOpname = async (params: ListStockOpnameParams) => {
  const processedParams = processParams({ params, isExport: false })
  const fetchStockOpnameList = await axios.get(`main/stock-opnames`, {
    params: processedParams,
    cleanParams: true,
  })

  const resultData =
    fetchStockOpnameList?.data?.data?.map(
      (item: TStockOpnameData, index: number) => ({
        ...item,
        si_no: index + 1 + (params.page - 1) * params.paginate,
      })
    ) ?? []

  const result = {
    ...fetchStockOpnameList,
    data: {
      ...fetchStockOpnameList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListStockOpnameResponse>(result)
}

export const exportStockOpname = async (
  params: Omit<ListStockOpnameParams, 'page' | 'paginate'>
) => {
  const processedParams = processParams({ params, isExport: true })
  const responseExportTransaction = await axios.get(`main/stock-opnames/xls`, {
    params: processedParams,
    cleanParams: true,
  })

  return responseExportTransaction?.data
}
