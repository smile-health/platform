import { OptionType } from '#components/react-select'
import { CommonType, TCommonFilter, TCommonResponseList } from '#types/common'
import { TUserCreatedBy, TUserUpdatedBy } from '#types/material'
import { TFunction } from 'i18next'

export interface Program {
  id: number
  key: string
  name: string
  budget_source_id: number
  budget_source_program_id: number
  config: Config
}

export interface Config {
  material: Material
  color: string
}

export interface Material {
  is_hierarchy_enabled: boolean
  is_batch_enabled: boolean
}

export type ListAssetTypeTemperatureThresholdsParams = TCommonFilter & {
  page?: number
  paginate?: number
  is_predefined?: number
}

export type ListAssetTypeParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
  program_ids?: number[]
  dashboard_filter?: string
}

export type TemperatureThresholds = {
  temperature_threshold_id: number
  min_temperature: number
  max_temperature: number
  asset_type_temperature_id?: number | null
}

export type HumidityThresholds = {
  humidity_threshold_id: number
  min_humidity: number
  max_humidity: number
}

export interface DetailAssetTypeResponse {
  id: number
  name: string
  description: string | null
  is_cce: number | null
  is_warehouse?: number | null
  is_cce_warehouse: number | null
  is_temperature_adjustable: number
  is_related_asset: number | null
  temperature_thresholds?: TemperatureThresholds[]
  humidity_thresholds?: HumidityThresholds[]
  created_at: string
  updated_at: string
  user_created_by: TUserCreatedBy
  user_updated_by: TUserUpdatedBy
  updated_by: TUserUpdatedBy
  created_by: TUserCreatedBy
}

export type ListAssetTypeResponse = TCommonResponseList & {
  data: DetailAssetTypeResponse[]
  statusCode?: number
}

export type AssetTypeTemperatureThresholds = {
  id: number
  min_temperature?: number | null
  max_temperature?: number | null
  is_predefined?: number | null
}

export type AssetTypeHumidityThresholds = {
  id: number
  min_humidity?: number | null
  max_humidity?: number | null
}

export type AssetTypeThresholds =
  | AssetTypeTemperatureThresholds
  | AssetTypeHumidityThresholds

export type ListAssetTypeHumidityThresholdsResponse = TCommonResponseList & {
  data: AssetTypeHumidityThresholds[]
  statusCode?: number
}

export type ListAssetTypeTemperatureThresholdsResponse = TCommonResponseList & {
  data: AssetTypeTemperatureThresholds[]
  statusCode?: number
}

export type ExportAssetTypeParams = {
  keyword?: string
  program_ids?: OptionType[]
}

export type CreateAssetTypeBody = {
  name?: string | null
  description?: string | null
  temperature_thresholds?: {
    id: number
  }[]
  humidity_thresholds?: {
    id: number
  }[]
  is_cce?: number | null
  is_cce_warehouse?: number | null
  is_temperature_adjustable?: number | null
  is_related_asset?: number | null
  is_warehouse?: number | null
}

export type AssetTypeTableProps = CommonType & {
  size: number
  page: number
}

export type AssetTypeFormProps = {
  defaultValues?: CreateAssetTypeBody
}

export type AssetTypeDetailWorkspaceProps = {
  data?: DetailAssetTypeResponse
  isLoading?: boolean
  t: TFunction<['common', 'assetType']>
}

export type ParamData = {
  id: string
  status: number
}

export type AssetTypeDetailInfoProps = CommonType & {
  data?: DetailAssetTypeResponse
  isLoading?: boolean
  onUpdateStatus: (data: ParamData) => void
  isLoadingUpdateStatus?: boolean
}
