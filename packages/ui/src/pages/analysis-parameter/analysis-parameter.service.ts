import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { removeEmptyObject } from '#utils/object'

import {
  AnalysisParameterResponse,
  CreateAnalysisParameterBody,
  ListAnalysisParametersParams,
  ListAnalysisParametersResponse,
  UpdateAnalysisParameterBody,
} from './analysis-parameter.type'

const BASE_URL = SERVICE_API.MAIN

export async function listAnalysisParameters(
  rawParams: ListAnalysisParametersParams
): Promise<ListAnalysisParametersResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${BASE_URL}/analysis-parameters`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<ListAnalysisParametersResponse>(response)
}

export async function getAnalysisParameter(
  id: string | number
): Promise<AnalysisParameterResponse> {
  const response = await axios.get(`${BASE_URL}/analysis-parameters/${id}`, {})
  return response?.data
}

export async function createAnalysisParameter(
  data: CreateAnalysisParameterBody
) {
  const response = await axios.post(`${BASE_URL}/analysis-parameters`, data, {})
  return response?.data
}

export async function updateAnalysisParameter(
  id: string | number,
  data: UpdateAnalysisParameterBody
) {
  const response = await axios.put(
    `${BASE_URL}/analysis-parameters/${id}`,
    data,
    {}
  )
  return response?.data
}

export async function deleteAnalysisParameter(id: string | number) {
  const response = await axios.delete(
    `${BASE_URL}/analysis-parameters/${id}`,
    {}
  )
  return response?.data
}

export async function listParameterCategoryOptions(): Promise<{
  data: { id: number; name: string }[]
}> {
  const response = await axios.get(`${BASE_URL}/parameter-categories`, {
    params: { paginate: 100 },
    cleanParams: true,
  })
  return response?.data
}

export async function listUnits(): Promise<{
  data: { id: number; name: string }[]
}> {
  const response = await axios.get(`${BASE_URL}/environmental-health/units`)
  return response?.data
}

export async function createUnit(data: {
  name: string
}): Promise<{ success: boolean; message: string; data: { id: number } }> {
  const response = await axios.post(
    `${BASE_URL}/environmental-health/units`,
    data
  )
  return response?.data
}
