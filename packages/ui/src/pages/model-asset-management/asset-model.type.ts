import { OptionType } from '#components/react-select'
import { CommonType, TCommonFilter, TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

import { DetailAssetTypeResponse } from '../asset-type/asset-type.type'
import { PQSDetail } from '../pqs/pqs.types'

export interface CreatedByUser {
  id: number
  username: string
  firstname: string
  lastname: any
}

export interface UpdatedByUser {
  id: number
  username: string
  firstname: string
  lastname: any
}

export interface AssetTypeManufacture {
  id: number
  asset_type_id: number
  asset_model_id: number
  manufacture_id: number
  created_at: string
  updated_at: string
  deleted_at: any
  coldchain_capacity_equipment_id: any
  asset_type: DetailAssetTypeResponse
  manufacture: Manufacture
  coldchain_capacity_equipment: any
  asset_type_name: string
  manufacture_name: string
  coldchain_capacity_equipment_code_pqs: any
}

export interface Manufacture {
  id: number
  name: string
  reference_id: string
  description: any
  contact_name: any
  phone_number: string
  email: any
  address: any
  village_id: any
  created_by: number
  updated_by: number
  deleted_by: any
  type: number
  created_at: string
  updated_at: string
  deleted_at: any
}

export type CapacityData = {
  id: number | null
  net_capacity: number | null
  gross_capacity: number | null
  asset_model_id?: number | null
  category?: number | null
  max_temperature?: number | null
  min_temperature?: number | null
  temperature_threshold_id?: number | null
}

export type CapacityDataPQS = {
  category: number
  net_capacity: number
}

export type DetailModelAssetResponse = {
  id: number
  is_related_asset: number | null
  pqs_code_id: number | null
  pqs_code: string | null
  asset_type_id: number | null
  manufacture_id: number | null
  created_at: string
  updated_at: string
  asset_model_name: string
  asset_type_name: string
  manufacture_name: string
  capacities: CapacityData[]
  net_capacities_who: CapacityDataPQS[]
  user_created_by?: CreatedByUser
  user_updated_by?: UpdatedByUser
  updated_by: UpdatedByUser
  created_by: CreatedByUser
  is_capacity: number | null
  name?: string
  is_warehouse?: number
  is_cce?: number
}

export type ListModelAssetParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
  program_ids?: number[]
  asset_type_ids?: number[] | number
  manufacture_ids?: number[]
}

export type ListModelAssetResponse = TCommonResponseList & {
  data: DetailModelAssetResponse[]
  statusCode?: number
}

export type ExportModelAssetParams = {
  keyword?: string
  program_ids?: string[]
  asset_type_ids?: string[]
  manufacture_ids?: string[]
}

export type TCapacity = {
  id_temperature_threshold?: number | null
  id?: number | null
  gross_capacity?: number | null
  net_capacity?: number | null
  field_name?: string
  category?: number | null
  is_disabled?: boolean
}

export type TAssetModelCapacity = {
  pqs_code_id?: { value: number; label: string; data?: PQSDetail } | null
  capacities?: TCapacity[]
}

export type CreateModelAssetBody = {
  name?: string
  is_capacity?: number | null
  manufacture_id?: OptionType | null
  asset_type_id?: {
    value: number
    label: string
    data?: DetailAssetTypeResponse
  } | null
  asset_model_capacity?: TAssetModelCapacity
  is_related_asset?: number | null
  asset_utilization?: {
    is_warehouse?: number
    is_cce?: number
    id?: string
  } | null
}

export type TCapacityPayload = {
  id_temperature_threshold?: number | null
  net_capacity: number | null
  gross_capacity: number | null
  id?: number | null
}

export type TAssetModelCapacityPayload = {
  pqs_code_id?: number | null
  capacities?: TCapacityPayload[]
}

export type CreateModelAssetPayload = {
  name?: string
  is_capacity?: number | null
  asset_type_id?: number | null
  manufacture_id?: number | null
  asset_model_capacity?: TAssetModelCapacityPayload | null
  temperatures_warehouse_capacities?: {
    id?: number | null
    temperature_threshold_id?: number | null
  }[]
}

export type ModelAssetTableProps = CommonType & {
  size: number
  page: number
}

export type ModelAssetFormProps = {
  data?: DetailModelAssetResponse
  defaultValues?: CreateModelAssetBody
}

export type ModelAssetDetailProgramProps = {
  data?: DetailModelAssetResponse
  isLoading?: boolean
  t: TFunction<['common', 'modelAsset']>
}

export type ParamData = {
  id: string
  status: number
}

export type ModelAssetDetailInfoProps = CommonType & {
  data?: DetailModelAssetResponse
  isLoading?: boolean
  onUpdateStatus: (data: ParamData) => void
  isLoadingUpdateStatus?: boolean
}
