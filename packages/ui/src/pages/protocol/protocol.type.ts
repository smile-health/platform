import { OptionType } from '#components/react-select'
import { ActivityData } from '#types/activity'
import { CommonType, TCommonFilter, TCommonResponseList } from '#types/common'
import { TMaterial } from '#types/material'

export type ListProtocolParams = TCommonFilter & {
  keyword?: string
  status?: number
}

export type ListProtocolResponse = TCommonResponseList & {
  data: DetailProtocolResponse[]
}

export type DetailProtocolResponse = {
  id: number
  name: string
  is_kipi: number
  is_medical_history: number
  program_id: number
  status: number
  created_by: string
  updated_by: string
  deleted_by: string
  created_at: string
  updated_at: string
  deleted_at: string
}

export type ProtocolTableProps = CommonType & {
  size: number
  page: number
  setLink: (url: string) => string
  onChangeStatus: (protocol: DetailProtocolResponse) => void
}

export type MaterialActivityTableProps = CommonType & {
  size: number
  page: number
  onDelete: (activityMaterial: ActivityMaterial) => void
}

export type ExportProtocolsParams = {
  keyword?: string
}

export type UpdateStatusProtocolResponse = {
  status: boolean
  message: string
  result: DetailProtocolResponse
}

export type ModalImportErrors = { [key: string]: string[] }

export type ListActivityMaterialParams = TCommonFilter & {
  keyword?: string
}

export type GetActivitesParams = TCommonFilter

export type GetProgramActivitiesResponse = TCommonResponseList & {
  data: ActivityData[]
  statusCode: number
}

export type GetMaterialsParams = TCommonFilter & {
  activity_id: string
  material_level_id?: string | number
}

export type GetProgramMaterialsResponse = TCommonResponseList & {
  data: TMaterial[]
  statusCode: number
}

export type RelationActivityMaterial = {
  activity: OptionType | null
  material: OptionType | null
}

export type TRelationForm = {
  relations: RelationActivityMaterial[]
}

export type ActivityMaterial = {
  id: number
  protocol_id: number
  protocol_name: string
  material_id: number
  material_name: string
  activity_id: number
  activity_name: string
  updated_at: string
  created_at: string
  updated_by_firstname: string | null
  updated_by_lastname: string | null
}

export type ListActivityMaterial = TCommonResponseList & {
  protocol_id: number
  protocol_name: string
  data: ActivityMaterial[]
  statusCode: number
}
