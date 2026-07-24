import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { removeEmptyObject } from '#utils/object'

import {
  TestMethodResponse,
  CreateTestMethodBody,
  ListTestMethodsParams,
  ListTestMethodsResponse,
  UpdateTestMethodBody,
} from './test-method.type'

const BASE_URL = SERVICE_API.MAIN

export async function listTestMethods(
  rawParams: ListTestMethodsParams
): Promise<ListTestMethodsResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${BASE_URL}/test-methods`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<ListTestMethodsResponse>(response)
}

export async function getTestMethod(
  id: string | number
): Promise<TestMethodResponse> {
  const response = await axios.get(`${BASE_URL}/test-methods/${id}`, {
  })
  return response?.data
}

export async function createTestMethod(
  data: CreateTestMethodBody
) {
  const response = await axios.post(`${BASE_URL}/test-methods`, data, {

  })
  return response?.data
}

export async function updateTestMethod(
  id: string | number,
  data: UpdateTestMethodBody
) {
  const response = await axios.put(
    `${BASE_URL}/test-methods/${id}`,
    data,
    {
    }
  )
  return response?.data
}

export async function deleteTestMethod(id: string | number) {
  const response = await axios.delete(`${BASE_URL}/test-methods/${id}`, {
  })
  return response?.data
}
