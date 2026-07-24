import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { getReactSelectValue } from '#utils/react-select'

import {
  CreateAssetTypeBody,
  DetailAssetTypeResponse,
  ExportAssetTypeParams,
  ListAssetTypeHumidityThresholdsResponse,
  ListAssetTypeParams,
  ListAssetTypeResponse,
  ListAssetTypeTemperatureThresholdsParams,
  ListAssetTypeTemperatureThresholdsResponse,
} from './asset-type.type'

const MAIN_SERVICE = SERVICE_API.MAIN
const CORE_SERVICE = SERVICE_API.CORE

type ImportAssetTypeParams = {
  type_download_template: number
}

export async function getAssetTypeHumidityTresholds(
  params: ListAssetTypeTemperatureThresholdsParams
): Promise<ListAssetTypeHumidityThresholdsResponse> {
  const urlLink = `${CORE_SERVICE}/humidity-thresholds`
  const response = await axios.get(urlLink, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAssetTypeHumidityThresholdsResponse>(response)
}

export async function getAssetTypeTemperatureTresholds(
  params: ListAssetTypeTemperatureThresholdsParams
): Promise<ListAssetTypeTemperatureThresholdsResponse> {
  const urlLink = `${CORE_SERVICE}/temperature-thresholds`
  const response = await axios.get(urlLink, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAssetTypeTemperatureThresholdsResponse>(
    response
  )
}

export async function getCoreAssetType(
  params: ListAssetTypeParams,
  isGlobal?: boolean
): Promise<ListAssetTypeResponse> {
  const urlLink = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-types`
  const response = await axios.get(urlLink, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAssetTypeResponse>(response)
}

export async function importAssetType(
  input: FormData,
  params: ImportAssetTypeParams
) {
  const response = await axios.post('/core/asset-types/xls', input, {
    params,
    cleanParams: true,
  })
  return response?.data
}

export async function exportAssetType(
  params: ExportAssetTypeParams,
  isGlobal?: boolean
) {
  const response = await axios.get(
    `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-types/xls`,
    {
      responseType: 'blob',
      params: {
        keyword: params?.keyword,
        program_ids: getReactSelectValue(params?.program_ids),
      },
      cleanParams: true,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateAssetType(params: ImportAssetTypeParams) {
  const response = await axios.get(`${CORE_SERVICE}/asset-types/xls-template`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })
  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function createAssetType(data: CreateAssetTypeBody) {
  const urlLink = `${CORE_SERVICE}/asset-types`
  const response = await axios.post(urlLink, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getAssetType(
  id: string | number,
  isGlobal?: boolean
): Promise<DetailAssetTypeResponse> {
  const apiUrl = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/asset-types/${id}`
  const response = await axios.get(apiUrl, { redirect: true })
  return response?.data
}

export async function deleteAssetType(id?: string | number) {
  const response = await axios.delete(`${CORE_SERVICE}/asset-type/${id}`)

  return response?.data
}

export async function updateAssetType(
  id: string | number,
  data: CreateAssetTypeBody
) {
  const apiUrl = `${CORE_SERVICE}/asset-types/${id}`
  const response = await axios.put(apiUrl, data)
  return response?.data
}

export async function updateStatusAssetTypeInProgram(
  id: string,
  status: number
) {
  const response = await axios.put(`${MAIN_SERVICE}/asset-types/${id}/status`, {
    status,
  })
  return response?.data
}
