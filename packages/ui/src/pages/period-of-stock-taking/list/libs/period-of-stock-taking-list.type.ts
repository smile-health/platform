import { TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

export interface TPeriodOfStockTaking {
  data: TPeriodOfStockTakingData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
  [property: string]: any
}

export interface TPeriodOfStockTakingData {
  created_at?: string
  end_date?: string
  id?: number
  month_period?: number
  name?: string
  start_date?: string
  status: number
  updated_at?: string
  user_created_by?: TUserCreatedBy
  user_updated_by?: TUserUpdatedBy
  year_period?: number | string
  si_no?: number
  cutoff_date?: string
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
  t: TFunction<['common', 'periodOfStockTaking']>
  locale: string
}

// Transaction List
export type ListPeriodOfStockTakingResponse = TCommonResponseList & {
  data: Array<TPeriodOfStockTakingData>
}

// Transaction Params
export type ListPeriodOfStockTakingParams = {
  page?: number
  paginate?: number
  date_range?: {
    start: string
    end: string
  }
  status?: number
}
