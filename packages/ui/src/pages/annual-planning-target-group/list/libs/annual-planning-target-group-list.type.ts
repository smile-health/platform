import { TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

export interface TAnnualPlanningTargetGroup {
  data: TAnnualPlanningTargetGroupData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export interface TAnnualPlanningTargetGroupAge {
  year: number
  month: number
  day: number
}

export interface TAnnualPlanningTargetGroupData {
  created_at?: string
  end_date?: string
  id?: number
  title?: string
  name?: string
  is_active: boolean
  from_age: TAnnualPlanningTargetGroupAge
  to_age: TAnnualPlanningTargetGroupAge
  si_no?: number
  updated_at?: string
  user_created_by?: TUserCreatedBy
  user_updated_by?: TUserUpdatedBy
  opened_for?: 'edit' | 'activation'
  program_ids?: number[]
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
  t: TFunction<['common', 'annualPlanningTargetGroup']>
  locale: string
}

// Transaction List
export type ListAnnualPlanningTargetGroupResponse = TCommonResponseList & {
  data: Array<TAnnualPlanningTargetGroupData>
}

// Transaction Params
export type ListAnnualPlanningTargetGroupParams = {
  page?: number
  paginate?: number
  date_range?: {
    start: string
    end: string
  }
  status?: number
}
