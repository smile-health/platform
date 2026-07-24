import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  CreateModelAssetBody,
  DetailModelAssetResponse,
  ExportModelAssetParams,
  ListModelAssetParams,
  ListModelAssetResponse,
} from './asset-model.type'

const MAIN_SERVICE = SERVICE_API.MAIN
const CORE_SERVICE = SERVICE_API.CORE

export async function getCoreModelAsset(
  params: ListModelAssetParams,
  isGlobal?: boolean
): Promise<ListModelAssetResponse> {
  const urlLink = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-models`
  const response = await axios.get(urlLink, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListModelAssetResponse>(response)
}

export async function importModelAsset(
  input: FormData,
  params: { type: number }
) {
  const response = await axios.post('/core/asset-models/xls', input, {
    params,
  })
  return response?.data
}

export async function exportModelAsset(
  params: ExportModelAssetParams,
  isGlobal?: boolean
) {
  const response = await axios.get(
    `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-models/xls`,
    {
      responseType: 'blob',
      params,
      cleanParams: true,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateAssetModel(params: { type: number }) {
  const response = await axios.get(
    `${CORE_SERVICE}/asset-models/xls-template`,
    {
      params,
      cleanParams: true,
      responseType: 'blob',
    }
  )
  parseDownload(
    response?.data,
    response?.headers?.filename || 'master_asset_model.xlsx'
  )

  return response?.data
}

export async function createModelAsset(data: CreateModelAssetBody) {
  const apiUrl = `${CORE_SERVICE}/asset-models`
  const response = await axios.post(apiUrl, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getModelAsset(
  id: string | number,
  isGlobal?: boolean
): Promise<DetailModelAssetResponse> {
  const apiUrl = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-models/${id}`
  const response = await axios.get(apiUrl, { redirect: true })
  return response?.data
}

export async function deleteModelAsset(id?: string | number) {
  const response = await axios.delete(`${CORE_SERVICE}/asset-models/${id}`)

  return response?.data
}

export async function updateModelAsset(
  id: string | number,
  data: CreateModelAssetBody
) {
  const apiUrl = `${CORE_SERVICE}/asset-models/${id}`
  const response = await axios.put(apiUrl, data)
  return response?.data
}

export async function updateStatusModelAsset(
  id: string,
  status: number,
  isGlobal?: boolean
) {
  const response = await axios.put(
    `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-models/${id}/status`,
    {
      status,
    }
  )
  return response?.data
}
