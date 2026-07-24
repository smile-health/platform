import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import { listMasterJenisPemeriksaan } from '../../master-jenis-pemeriksaan/services/master-jenis-pemeriksaan.service'
import { listMasterMethod } from '../../master-method/services/master-method.service'
import {
  MasterPemeriksaan,
  MasterPemeriksaanFilterQuery,
  MasterPemeriksaanListResponse,
} from '../types/master-pemeriksaan.types'

const BaseEndpoint = 'main'

const BASE_URL = BaseEndpoint + '/bmhp-examinations'

export async function listMasterPemeriksaan(
  params: MasterPemeriksaanFilterQuery
) {
  const response = await axios.get<MasterPemeriksaanListResponse>(BASE_URL, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse(response)
}

export async function detailMasterPemeriksaan(id: number) {
  const response = await axios.get<MasterPemeriksaan>(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}

export interface MasterPemeriksaanCreateData {
  name: string
  examination_type_id: number
  description?: string
  is_active?: boolean
  method_ids: number[]
  parameters: Array<{
    id: number
    sort_order: number
  }>
  materials: Array<{
    material_id: number
    target_group_ids: number[]
  }>
}

export async function createMasterPemeriksaan(
  data: MasterPemeriksaanCreateData
) {
  const response = await axios.post(BASE_URL, data, { cleanBody: true })
  return handleAxiosResponse(response)
}

export async function updateMasterPemeriksaan(
  id: number,
  data: {
    name: string
    description: string
    examination_type_id: number
  }
) {
  const response = await axios.put(`${BASE_URL}/${id}`, data, {
    cleanBody: true,
  })
  return handleAxiosResponse(response)
}

export async function deleteMasterPemeriksaan(id: number) {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}

export async function loadJenisPemeriksaanOptions() {
  const result = await listMasterJenisPemeriksaan({ paginate: 100 })
  return (result?.data ?? []).map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export async function loadMetodeOptions() {
  const result = await listMasterMethod({ paginate: 100 })
  return (result?.data ?? []).map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export async function loadSasaranOptions() {
  const response = await axios.get(BaseEndpoint + '/bmhp-target-groups', {
    params: { paginate: 100 },
  })
  return (response?.data?.data ?? []).map(
    (item: { id: number; name: string }) => ({
      value: item.id,
      label: item.name,
    })
  )
}

export async function loadParameterOptions() {
  const response = await axios.get(BaseEndpoint + '/bmhp-parameters', {
    params: { paginate: 100 },
  })
  return (response?.data?.data ?? []).map(
    (item: { id: number; name: string }) => ({
      value: item.id,
      label: item.name,
    })
  )
}
