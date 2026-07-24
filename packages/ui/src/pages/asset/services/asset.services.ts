import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { processParamsLoggerActivity } from '../detail/libs/asset-detail-common'
import { TFilterLoggerActivity } from '../detail/libs/asset-detail.types'
import {
  overrrideResponse,
  processParams,
} from '../list/libs/asset-list.common'
import {
  ListAssetParams,
  TAncientResponse,
  TAssetData,
} from '../list/libs/asset-list.types'

const SERVICE = SERVICE_API.PLATFORM
export const listAsset = async (params: ListAssetParams) => {
  const processedParams = processParams({ params, isExport: false })
  const fetchAssetList = await axios.get(`${SERVICE}/fallback/assets`, {
    params: processedParams,
    cleanParams: true,
  })

  const resultData =
    fetchAssetList?.data?.list?.map((item: TAssetData, index: number) => ({
      ...item,
      si_no: index + 1 + (params.page - 1) * params.paginate,
    })) ?? []

  const processedResult = {
    ...fetchAssetList,
    data: {
      ...fetchAssetList?.data,
      list: resultData,
    },
  }

  const result = handleAxiosResponse<TAncientResponse>(processedResult)

  return overrrideResponse(result)
}

export const exportAsset = async (
  params: Omit<ListAssetParams, 'page' | 'paginate'>
) => {
  const processedParams = processParams({ params, isExport: true })
  const responseExportTransaction = await axios.get(
    `${SERVICE}/fallback/assets/xls`,
    {
      params: processedParams,
      cleanParams: true,
      responseType: 'blob',
    }
  )

  parseDownload(
    responseExportTransaction?.data,
    responseExportTransaction?.headers?.filename
  )

  return responseExportTransaction?.data
}

export const detailAsset = async (id: number) => {
  const result = await axios.get(`${SERVICE}/fallback/assets/${id}`, {
    cleanParams: true,
  })

  return result?.data?.data as TAssetData
}

export const detailAssetChild = async (id: number) => {
  const result = await axios.get(`${SERVICE}/fallback/assets/${id}/childs`, {
    cleanParams: true,
  })

  return result?.data?.data as TAssetData[]
}

export const updateStatusAsset = async (
  working_status_id: number,
  id: number
) => {
  const result = await axios.put(
    `${SERVICE}/fallback/assets/${id}/working-status-id`,
    {
      working_status_id,
    }
  )

  return result?.data
}

export const listHistory = async (rawParams: TFilterLoggerActivity) => {
  const params = processParamsLoggerActivity({
    params: rawParams,
  })
  const fetchListHistory = await axios.get(`${SERVICE}/fallback/histories`, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TAncientResponse>(fetchListHistory)

  return overrrideResponse(result)
}

export const chartHistory = async (rawParams: TFilterLoggerActivity) => {
  const params = processParamsLoggerActivity({
    params: rawParams,
  })
  const result = await axios.get(`${SERVICE}/fallback/histories/chart`, {
    params,
    cleanParams: true,
  })

  return result?.data?.data
}
