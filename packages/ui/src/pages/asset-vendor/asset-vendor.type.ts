import { OptionType } from '#components/react-select'
import {
  CommonType,
  Pagination,
  TCommonFilter,
  TCommonResponseList,
  TInfoUserCreated,
} from '#types/common'
import { TProgram } from '#types/program'
import { TFunction } from 'i18next'

export const AssetVendorTypeEnum = {
  COMMUNICATION_PROVIDER: Number(
    process.env.ASSET_VENDOR_TYPE_COMMUNICATION_PROVIDER
  ),
} as const

export type ListAssetVendorTypeParams = TCommonFilter & Pagination

export type AssetVendorType = {
  id: number
  name: string
}

export type ListAssetVendorTypeResponse = TCommonResponseList & {
  data: AssetVendorType[]
}

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

export type DetailAssetVendorResponse = {
  id: number
  name: string
  description: string
  asset_vendor_type: {
    id: number
    name: string
  }
  status?: {
    id: number
    name: string
  }
  created_by: number
  updated_by: number
  deleted_by: any
  deleted_at: any
  created_at: string
  updated_at: string
  user_created_by: TInfoUserCreated
  user_updated_by: TInfoUserCreated
  programs: TProgram[]
}

export type ListAssetVendorParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
  program_ids?: number[]
  asset_vendor_type_ids?: number[]
}

export type ListAssetVendorResponse = TCommonResponseList & {
  data: DetailAssetVendorResponse[]
  statusCode?: number
}

export type ExportAssetVendorParams = {
  keyword?: string
  sort_by?: string
  sort_type?: string
  asset_vendor_type_ids?: number[]
}

export type CreateAssetVendorBody = {
  name?: string
  description?: string | null
  asset_vendor_type_id?: OptionType | null
}

export type CreateAssetVendorPayload = {
  name?: string
  description?: string | null
  asset_vendor_type_id?: number | null
}

export type AssetVendorTableProps = CommonType & {
  size: number
  page: number
}

export type AssetVendorFormProps = {
  defaultValues?: CreateAssetVendorBody
  isGlobal?: boolean
}

export type AssetVendorDetailWorkspaceProps = {
  data?: DetailAssetVendorResponse
  isLoading?: boolean
  t: TFunction<['common', 'assetVendor']>
}

export type ParamData = {
  id: string
  status: number
}

export type AssetVendorDetailInfoProps = CommonType & {
  data?: DetailAssetVendorResponse
  isLoading?: boolean
  onUpdateStatus: (data: ParamData) => void
  isLoadingUpdateStatus?: boolean
}
