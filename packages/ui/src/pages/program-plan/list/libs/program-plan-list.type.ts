import { TCommonObject, TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

export interface TProgramPlan {
  data: TProgramPlanData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export interface TProgramPlanData {
  id: number
  is_active: boolean
  program_id?: number
  status: TProgramPlanDataStatus
  is_final: boolean
  approach: TCommonObject
  updated_at: string
  updated_by: number
  user_created_by: TUserCreatedBy
  user_updated_by: TUserUpdatedBy
  year: number
  si_no?: number
}

export interface TProgramPlanDataStatus {
  material_ratio: boolean
  needs_calculation: boolean
  population: boolean
  target_group: boolean
  material_substitution?: boolean
}

export interface TUserCreatedBy {
  firstname: string
  fullname: string
  id: number
  lastname?: string | null
  username: string
}

export interface TUserUpdatedBy {
  firstname: string
  fullname: string
  id: number
  lastname?: string | null
  username: string
}

export type TMainColumn = {
  t: TFunction<['common', 'programPlan']>
  locale: string
}

// Transaction List
export type ListProgramPlanResponse = TCommonResponseList & {
  data: Array<TProgramPlanData>
}

// Transaction Params
export type ListProgramPlanParams = {
  page?: number
  paginate?: number
  year?: {
    value: number | string
    label: string
  } | null
}

// Material Ratio types and service
export type ProgramPlanMaterialRatioUser = {
  id: number
  username: string
  fullname: string
}

export type ProgramPlanMaterialRatioItem = {
  id: number
  from_material: { id: number; name: string }
  from_subtype: { id: number; name: string }
  from_material_qty: number
  to_material: { id: number; name: string }
  to_subtype: { id: number; name: string }
  to_material_qty: number
  user_updated_at: string
  user_updated_by: ProgramPlanMaterialRatioUser
}

export type ProgramPlanMaterialRatioResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: ProgramPlanMaterialRatioItem[]
}
