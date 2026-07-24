import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  CreateAssetVendorPayload,
  DetailAssetVendorResponse,
  ExportAssetVendorParams,
  ListAssetVendorParams,
  ListAssetVendorResponse,
  ListAssetVendorTypeParams,
  ListAssetVendorTypeResponse,
} from './asset-vendor.type'

const MAIN_SERVICE = SERVICE_API.MAIN
const CORE_SERVICE = SERVICE_API.CORE
export async function getCoreAssetVendor(
  params: ListAssetVendorParams,
  isGlobal?: boolean
): Promise<ListAssetVendorResponse> {
  const urlLink = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-vendors`
  const response = await axios.get(urlLink, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAssetVendorResponse>(response)
}

export async function importAssetVendor(input: FormData) {
  const response = await axios.post('/core/asset-vendors/xls', input)
  return response?.data
}

export async function exportAssetVendor(
  params: ExportAssetVendorParams,
  isGlobal?: boolean
) {
  const response = await axios.get(
    `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-vendors/xls`,
    {
      responseType: 'blob',
      params,
      cleanParams: true,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateAssetVendor() {
  const response = await axios.get(
    `${CORE_SERVICE}/asset-vendors/xls-template`,
    {
      responseType: 'blob',
    }
  )
  parseDownload(response?.data, 'master_asset_vendors.xlsx')

  return response?.data
}

export async function createAssetVendor(data: CreateAssetVendorPayload) {
  const urlLink = `${CORE_SERVICE}/asset-vendors`
  const response = await axios.post(urlLink, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getAssetVendor(
  id: string | number,
  isGlobal?: boolean
): Promise<DetailAssetVendorResponse> {
  const urlLink = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-vendors/${id}`
  const response = await axios.get(urlLink, { redirect: true })
  return response?.data
}

export async function deleteAssetVendor(id?: string | number) {
  const response = await axios.delete(`${CORE_SERVICE}/asset-vendor/${id}`)

  return response?.data
}

export async function updateAssetVendor(
  id: string | number,
  data: CreateAssetVendorPayload
) {
  const urlLink = `${CORE_SERVICE}/asset-vendors/${id}`
  const response = await axios.put(urlLink, data)
  return response?.data
}

export async function updateStatusAssetVendor(
  id: string,
  status: number,
  isGlobal?: boolean
) {
  const urlLink = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-vendors/${id}/status`
  const response = await axios.put(urlLink, {
    status,
  })
  return response?.data
}

export async function loadAssetVendorType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: ListAssetVendorTypeParams = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }
  const apiUrl = `${SERVICE_API.CORE}/asset-vendor-types`
  const fetchAssetVendorTypes = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListAssetVendorTypeResponse>(
    fetchAssetVendorTypes
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

  let options = result?.data?.map((item) => ({
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
