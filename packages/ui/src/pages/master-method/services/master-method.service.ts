import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  MasterMethod,
  MasterMethodFilterQuery,
  MasterMethodListResponse,
} from '../types/master-method.types'

const BaseEndpoint = 'main'

const BASE_URL = BaseEndpoint + '/bmhp-examination-methods'

export async function listMasterMethod(params: MasterMethodFilterQuery) {
  const response = await axios.get<MasterMethodListResponse>(BASE_URL, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse(response)
}

export async function detailMasterMethod(id: number) {
  const response = await axios.get<MasterMethod>(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}

export async function createMasterMethod(data: {
  name: string
  description: string
}) {
  const response = await axios.post(BASE_URL, data, {
    cleanBody: true,
  })
  return handleAxiosResponse(response)
}

export async function updateMasterMethod(
  id: number,
  data: {
    name: string
    description: string
  }
) {
  const response = await axios.put(`${BASE_URL}/${id}`, data, {
    cleanBody: true,
  })
  return handleAxiosResponse(response)
}

export async function deleteMasterMethod(id: number) {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}
