import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  MasterParameter,
  MasterParameterFilterQuery,
  MasterParameterListResponse,
} from '../types/master-parameter.types'

const BaseEndpoint = 'main'

const BASE_URL = BaseEndpoint + '/bmhp-parameters'

export async function listMasterParameter(params: MasterParameterFilterQuery) {
  const response = await axios.get<MasterParameterListResponse>(BASE_URL, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse(response)
}

export async function detailMasterParameter(id: number) {
  const response = await axios.get<MasterParameter>(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}

export async function createMasterParameter(data: {
  name: string
  unit?: string | null
  description: string
}) {
  const response = await axios.post(BASE_URL, data, {
    cleanBody: true,
  })
  return handleAxiosResponse(response)
}

export async function updateMasterParameter(
  id: number,
  data: {
    name: string
    unit?: string | null
    description: string
  }
) {
  const response = await axios.put(`${BASE_URL}/${id}`, data, {
    cleanBody: true,
  })
  return handleAxiosResponse(response)
}

export async function deleteMasterParameter(id: number) {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}
