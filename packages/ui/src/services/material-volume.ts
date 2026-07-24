import { OptionType } from '#components/react-select'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { parseDownload } from '#utils/download'

import {
  MaterialVolumeData,
  MaterialVolumeDetail,
} from '../types/material-volume'
import { GetMaterialsResponse } from '../types/volume-materials'

export type MaterialVolumeType = MaterialVolumeData

export type GetMaterialVolumesParams = {
  keyword?: string
  page: number
  paginate?: number
  material_ids?: number
  manufacture_ids?: number
  material_type_ids?: number
  sort_by?:
    | 'material_name'
    | 'manufacture_name'
    | 'type_material_name'
    | 'updated_at'
  sort_type?: 'asc' | 'desc'
}

export type ExportMaterialVolumesParams = {
  material_ids?: number
  manufacture_ids?: number
  material_type_ids?: number
}

export type GetMaterialVolumesResponse = TCommonResponseList & {
  data: MaterialVolumeData[]
}

export type CreateBoxDimensionInput = {
  box_length?: number | null
  box_width?: number | null
  box_height?: number | null
}

export type CreateMaterialVolumeInput = CreateBoxDimensionInput & {
  material_id:
    | (OptionType & { consumption_per_distribution_unit?: number })
    | null
  manufacture_id: OptionType | null
  consumption_unit_per_distribution_unit?: number | null
  unit_per_box?: number | null
}

export type CreateMaterialVolumePayload = CreateBoxDimensionInput & {
  material_id?: number | null
  manufacture_id?: number | null
  consumption_unit_per_distribution_unit?: number | null
  unit_per_box?: number | null
}

type Params = {
  page: string | number
  paginate: string | number
  status?: string | number
  isVaccine?: string | number
  keyword?: string
}

export async function getMaterialVolume(
  id: string | number
): Promise<MaterialVolumeDetail> {
  const response = await axios.get(`/core/material-volumes/${id}`)
  return response?.data
}

export async function getMaterialVolumes(
  params: GetMaterialVolumesParams
): Promise<GetMaterialVolumesResponse> {
  const response = await axios.get('/core/material-volumes', {
    params,
    cleanParams: true,
  })
  return response?.data
}

export async function exportMaterialVolume(
  params: ExportMaterialVolumesParams
) {
  const response = await axios.get('/core/material-volumes/xls', {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTempalateMaterialVolume() {
  const response = await axios.get('/core/material-volumes/xls-template', {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'master_material_volume.xlsx')

  return response?.data
}

export async function getMaterials(
  params: Params
): Promise<GetMaterialsResponse> {
  const response = await axios.get('/v2/materials', { params })

  return response?.data
}

export async function importMaterialVolume(data: FormData) {
  const response = await axios.post('/core/material-volumes/xls', data)

  return response?.data
}

export async function createMaterialVolume(data: CreateMaterialVolumePayload) {
  const response = await axios.post('/core/material-volumes', data)

  return response?.data
}

export async function updateMaterialVolume(
  id: string | number,
  data: CreateMaterialVolumePayload
) {
  const response = await axios.put(`/core/material-volumes/${id}`, data)

  return response?.data
}

export async function deleteMaterialVolume(id: string | number) {
  const response = await axios.delete(`/core/material-volume/${id}`)

  return response?.data
}
