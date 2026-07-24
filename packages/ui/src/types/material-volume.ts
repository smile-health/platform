import { CreateMaterialVolumeInput } from '#services/material-volume'

import { CommonType } from './common'

export type MaterialVolumeFormProps = CommonType & {
  defaultValues?: CreateMaterialVolumeInput
}

export type MaterialVolumeTableProps = CommonType & {
  size: number
  page: number
}

export type MaterialVolumeDetailInfoProps = {
  data?: MaterialVolumeDetail
  isLoading: boolean
}

export type MaterialVolumeDetail = {
  id: number
  material_id: number
  manufacture_id: number
  box_length: number
  box_width: number
  box_height: number
  created_at: string
  updated_at: string
  unit_per_box: number
  deleted_at: any
  created_by: number
  updated_by: number
  deleted_by: any
  material: TMasterMaterial
  manufacture: TManufacture
  user_created_by: TUserUpdatedBy
  user_updated_by: TUserUpdatedBy
}
export interface MaterialVolumeData {
  id: number
  box_length: number
  box_width: number
  box_height: number
  updated_at: string | null
  created_at: string | null
  created_by: number
  updated_by: number
  manufacture_name: string
  material_type_name: string
  material_name: string
  consumption_unit_per_distribution_unit: number
  user_created_by: TUserUpdatedBy
  user_updated_by: TUserUpdatedBy
}

export interface TMasterMaterial {
  id: number
  name: string
  unit: string
  consumption_unit_per_distribution_unit: number
  is_vaccine: number
}

export interface TManufacture {
  id: number
  name: string
  type: number
  is_asset: number
}

export interface TUserUpdatedBy {
  id: number
  username: string
  firstname: string
  lastname: any
}

export type TMaterialVolumeForm = {
  material_id: number
  manufacture_id: number
  box_length: number
  box_width: number
  box_height: number
  pieces_per_unit: number
  unit_per_box: number
}
