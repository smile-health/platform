import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { removeEmptyObject } from '#utils/object'

import {
  ParameterCategoryResponse,
  CreateParameterCategoryBody,
  ListParameterCategoriesParams,
  ListParameterCategoriesResponse,
  UpdateParameterCategoryBody,
} from './parameter-category.type'

const BASE_URL = SERVICE_API.MAIN

export async function listParameterCategories(
  rawParams: ListParameterCategoriesParams
): Promise<ListParameterCategoriesResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${BASE_URL}/parameter-categories`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<ListParameterCategoriesResponse>(response)
}

export async function getParameterCategory(
  id: string | number
): Promise<ParameterCategoryResponse> {
  const response = await axios.get(`${BASE_URL}/parameter-categories/${id}`, {
  })
  return response?.data
}

export async function createParameterCategory(
  data: CreateParameterCategoryBody
) {
  const response = await axios.post(`${BASE_URL}/parameter-categories`, data, {
  })
  return response?.data
}

export async function updateParameterCategory(
  id: string | number,
  data: UpdateParameterCategoryBody
) {
  const response = await axios.put(
    `${BASE_URL}/parameter-categories/${id}`,
    data,
    {
    }
  )
  return response?.data
}

export async function deleteParameterCategory(id: string | number) {
  const response = await axios.delete(`${BASE_URL}/parameter-categories/${id}`, {
  })
  return response?.data
}

export async function updateParameterCategoryStatus(
  id: string | number,
  status: 0 | 1
) {
  const response = await axios.patch(
    `${BASE_URL}/parameter-categories/${id}/status`,
    { status }
  )
  return response?.data
}

export async function listAnalysisParameterOptions(): Promise<{ data: { id: number; name: string; unit_name: string }[] }> {
  const response = await axios.get(`${BASE_URL}/analysis-parameters`, {
    params: { paginate: 100 },
    cleanParams: true,

  })
  return response?.data
}

export async function listTestMethodOptions(): Promise<{ data: { id: number; name: string; quality_standard: string }[] }> {
  const response = await axios.get(`${BASE_URL}/test-methods`, {
    params: { paginate: 100 },
    cleanParams: true,

  })
  return response?.data
}

// export async function listAnalysisParameterOptions(): Promise<{ data: { id: number; name: string }[] }> {
//   const response = await axios.get(`${BASE_URL}/analysis-parameters`, {
//     params: { paginate: 100 },
//     cleanParams: true,
//     headers: {
//       'ngrok-skip-browser-warning': 'true',
//     },
//   })
//   return response?.data
// }

// export async function listTestMethodOptions(): Promise<{ data: { id: number; name: string }[] }> {
//   const response = await axios.get(`${BASE_URL}/test-methods`, {
//     params: { paginate: 100 },
//     cleanParams: true,
//     headers: {
//       'ngrok-skip-browser-warning': 'true',
//     },
//   })
//   return response?.data
// }
