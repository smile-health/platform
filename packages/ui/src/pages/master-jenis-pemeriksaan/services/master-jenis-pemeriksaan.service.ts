import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  MasterJenisPemeriksaan,
  MasterJenisPemeriksaanFilterQuery,
  MasterJenisPemeriksaanListResponse,
} from '../types/master-jenis-pemeriksaan.types'

const BaseEndpoint = 'main'

const BASE_URL = BaseEndpoint + '/bmhp-examinations/types'

export async function listMasterJenisPemeriksaan(
  params: MasterJenisPemeriksaanFilterQuery
) {
  const response = await axios.get<MasterJenisPemeriksaanListResponse>(
    BASE_URL,
    {
      params,
      cleanParams: true,
    }
  )
  return handleAxiosResponse(response)
}

export async function detailMasterJenisPemeriksaan(id: number) {
  const response = await axios.get<MasterJenisPemeriksaan>(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}

export async function createMasterJenisPemeriksaan(data: {
  name: string
  description: string
}) {
  const response = await axios.post(BASE_URL, data, {
    cleanBody: true,
  })
  return handleAxiosResponse(response)
}

export async function updateMasterJenisPemeriksaan(
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

export async function deleteMasterJenisPemeriksaan(id: number) {
  const response = await axios.delete(`${BASE_URL}/${id}`)
  return handleAxiosResponse(response)
}
