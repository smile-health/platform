import { TCommonObject, TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

export interface TBmhpPlanningYearStatus {
  master_pemeriksaan: boolean
  jenis_pemeriksaan: boolean
  method: boolean
  parameter: boolean
  variant: boolean
  material: boolean
}

export interface TBmhpPlanningYear {
  id: number
  year: number
  is_final: boolean
  status?: TBmhpPlanningYearStatus | null
  approach?: {
    id: number
    name: string
  }
  program_id?: number
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  user_created_by?: TUserCreatedBy | null
  user_updated_by?: TUserUpdatedBy | null
  si_no?: number
}

export interface TUserCreatedBy {
  firstname: string
  fullname?: string
  id: number
  lastname?: string | null
  username: string
}

export interface TUserUpdatedBy {
  firstname: string
  fullname?: string
  id: number
  lastname?: string | null
  username: string
}

export type TMainColumn = {
  t: TFunction<['common', 'bmhpPlanning']>
  locale: string
}

// List Response
export type ListBmhpPlanningYearsResponse = TCommonResponseList & {
  data: Array<TBmhpPlanningYear>
}

// List Params
export type ListBmhpPlanningYearsParams = {
  page?: number
  paginate?: number
  year?: number | null
  keyword?: string
  sort_by?: string
  sort_type?: string
}

// Create Form
export type BmhpPlanningYearCreateForm = {
  year: number
}
