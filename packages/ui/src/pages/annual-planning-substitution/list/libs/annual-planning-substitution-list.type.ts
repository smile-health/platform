import { OptionType } from '#components/react-select'
import { TCommonObject, TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

export interface TAnnualPlanningSubstitution {
  data: TAnnualPlanningSubstitutionData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export interface TAnnualPlanningSubstitutionData {
  created_at?: string
  end_date?: string
  id?: number
  material: TCommonObject
  substitution_materials: Array<TCommonObject> | null
  si_no?: number
  updated_at?: string
  user_created_by?: TUserCreatedBy
  user_updated_by?: TUserUpdatedBy
}

export interface TUserCreatedBy {
  firstname: string
  id: number
  lastname?: string | null
  username: string
}

export interface TUserUpdatedBy {
  firstname: string
  id: number
  lastname?: string | null
  username: string
}

export type TMainColumn = {
  t: TFunction<['common', 'annualPlanningSubstitution']>
  locale: string
}

// Transaction List
export type ListAnnualPlanningSubstitutionResponse = TCommonResponseList & {
  data: Array<TAnnualPlanningSubstitutionData>
}

// Transaction Params
export type ListAnnualPlanningSubstitutionParams = {
  page?: number
  paginate?: number
  material_id?: OptionType
}
