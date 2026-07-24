import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { TAddRTMDRelationPayload } from '../../asset-managements/asset-managements.types'
import { ListAssetVendorResponse } from '../../asset-vendor/asset-vendor.type'
import {
  ListAssetElectricityParams,
  ListAssetInventorySupportParams,
} from '../detail/libs/asset-inventory-detail.types'
import { AssetInventoryFormSubmitData } from '../form/libs/asset-inventory-form.type'
import { processParams } from '../list/libs/asset-inventory-list.common'
import {
  ListAssetParams,
  TAssetInventory,
  TListAssetResponse,
  TListSupportDataResponse,
  TSupportData,
} from '../list/libs/asset-inventory-list.types'

const SERVICE = SERVICE_API.CORE

export type TListAssetElectricitiesResponse = TCommonResponseList & {
  data: TSupportData[]
  statusCode: number
}

export const listAsset = async (
  params: ListAssetParams,
  isInventory: boolean = false
) => {
  const processedParams: Record<string, ListAssetParams> & {
    is_stock_opname?: number
  } = processParams({
    params,
    isExport: false,
  })

  if (isInventory) {
    processedParams['is_stock_opname'] = 1
  }
  const apiUrl = `${SERVICE}/asset-inventories`
  const fetchAssetList = await axios.get(apiUrl, {
    params: processedParams,
    cleanParams: true,
  })
  const result = handleAxiosResponse<TListAssetResponse>(fetchAssetList)
  return result
}

export const exportAsset = async (
  params: Omit<ListAssetParams, 'page' | 'paginate'>,
  isInventory: boolean = false
) => {
  const processedParams: Record<string, ListAssetParams> & {
    is_stock_opname?: number
  } = processParams({ params, isExport: true })
  if (isInventory) {
    processedParams['is_stock_opname'] = 1
  }
  const responseExportTransaction = await axios.get(
    `${SERVICE}/asset-inventories/xls`,
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

export const exportAssetInventory = async (
  params: Omit<ListAssetParams, 'page' | 'paginate'>
) => {
  const response = await axios.get(`/core/asset-inventories/xls/async`, {
    responseType: 'arraybuffer',
    params: processParams({ params, isExport: true }),
  })
  return response?.data
}

export const detailAsset = async (id: number) => {
  const apiUrl = `${SERVICE}/asset-inventories/${id}`
  const fetchDetailAsset = await axios.get(apiUrl, {
    cleanParams: true,
  })
  const result = handleAxiosResponse<TAssetInventory>(fetchDetailAsset)

  return result
}

export const updateAssetActivation = async (status: number, id: number) => {
  const result = await axios.put(`${SERVICE}/asset-inventories/${id}/status`, {
    status,
  })

  return result?.data
}

export const deleteAssetInventory = async (
  id: number,
  data: {
    reason: string
  }
) => {
  const result = await axios.delete(`${SERVICE}/asset-inventories/${id}`, {
    data,
  })
  return result?.data
}

export const listAssetVendor = async (
  params: ListAssetInventorySupportParams
) => {
  const apiUrl = `${SERVICE}/asset-vendors`
  const fetchAssetVendor = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListAssetVendorResponse>(fetchAssetVendor)

  return result
}

export async function loadVendor(
  keyword: string,
  _: unknown,
  additional: {
    status: number
    page: number
    asset_vendor_type_ids?: number[]
    exclude_asset_vendor_type_ids?: number[]
    isGlobal?: boolean
    is_provider?: number
    is_vendor?: number
    entity_tag_id?: number
  }
) {
  const apiUrl = `${additional?.isGlobal ? SERVICE_API.CORE : SERVICE_API.MAIN}/asset-vendors`
  const response = await axios.get(apiUrl, {
    params: {
      keyword,
      page: additional.page,
      paginate: 10,
      status: additional.status,
      is_provider: additional.is_provider,
      asset_vendor_type_ids: additional.asset_vendor_type_ids?.join(','),
      exclude_asset_vendor_type_ids:
        additional.exclude_asset_vendor_type_ids?.join(','),
      is_vendor: additional.is_vendor,
      entity_tag_id: additional.entity_tag_id,
    },
    cleanParams: true,
  })
  const result = handleAxiosResponse<ListAssetVendorResponse>(response)

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

  const options = result?.data?.map((item) => ({
    label: item?.name,
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

export const listAssetElectricity = async (
  params: ListAssetElectricityParams
) => {
  const apiUrl = `${SERVICE}/asset-electricities`
  const fetchAssetElectricity = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TListAssetElectricitiesResponse>(
    fetchAssetElectricity
  )

  return result
}

export const loadAssetElectricity = async (
  keyword: string,
  _: unknown,
  additional: { page: number }
) => {
  let params: ListAssetElectricityParams = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await listAssetElectricity(params)

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

  const options = result?.data?.map((item) => ({
    label: item?.name,
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

export const createAssetInventory = async (
  data: AssetInventoryFormSubmitData
) => {
  const result = await axios.post(`${SERVICE}/asset-inventories`, data, {
    cleanParams: true,
  })

  return result?.data
}

export const updateAssetInventory = async (
  id: number,
  data: AssetInventoryFormSubmitData
) => {
  const result = await axios.put(`${SERVICE}/asset-inventories/${id}`, data, {
    cleanParams: true,
  })

  return result?.data
}

export const listMaintainerSchedule = async (
  params: ListAssetInventorySupportParams
) => {
  const apiUrl = `${SERVICE}/asset-maintenance-schedules`
  const fetchMaintainerSchedule = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TListSupportDataResponse>(
    fetchMaintainerSchedule
  )

  return result
}

export const loadMaintainerSchedule = async (
  keyword: string,
  _: unknown,
  additional: { page: number }
) => {
  let params: ListAssetElectricityParams = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await listMaintainerSchedule(params)

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

  const options = result?.data?.map((item) => ({
    label: item?.name,
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

export const listCalibrationSchedule = async (
  params: ListAssetInventorySupportParams
) => {
  const apiUrl = `${SERVICE}/asset-calibration-schedules`
  const fetchMaintainerSchedule = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TListSupportDataResponse>(
    fetchMaintainerSchedule
  )

  return result
}

export const loadCalibrationSchedule = async (
  keyword: string,
  _: unknown,
  additional: { page: number }
) => {
  let params: ListAssetElectricityParams = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await listCalibrationSchedule(params)

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

  const options = result?.data?.map((item) => ({
    label: item?.name,
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

export const upsertLoggerRelation = async (
  id: number,
  data: TAddRTMDRelationPayload
) => {
  const result = await axios.put(
    `${SERVICE}/asset-inventories/${id}/rtmds`,
    data,
    {
      cleanParams: true,
    }
  )

  return result?.data
}
