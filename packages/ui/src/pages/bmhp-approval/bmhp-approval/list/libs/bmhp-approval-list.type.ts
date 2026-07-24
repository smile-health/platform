import { TCommonResponseList } from '#types/common'
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
  t: TFunction<['common', 'bmhpPlanning', 'bmhpApproval']>
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
  is_final?: boolean
}

// Create Form
export type BmhpPlanningYearCreateForm = {
  year: number
}

// ── Approval List (GET /main/bmhp-approval/) ──────────────────────────────────

export interface TBmhpApprovalItem {
  id: number
  year: number
  status: number
  approval_status?: number
  province?: string | null
  regency?: string | null
  program_id: number
  updated_at: string
  user_created_by: TUserCreatedBy | null
  user_updated_by: TUserUpdatedBy | null
  si_no?: number
}

export type ListBmhpApprovalResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TBmhpApprovalItem[]
  meta?: {
    submitted: number
    not_submitted: number
  }
}

export type ListBmhpApprovalParams = {
  page?: number
  item_per_page?: number
  program_plan_id?: number
  keyword?: string
}

// ── Province Approval List (GET /bmhp-approval/bmhp-approval-province) ────────

export interface TBmhpProvinceApprovalItem {
  no: number
  entity_id: number
  regency_name: string
  program_plan_id: number
  report_status: string
  review_status: string
  updated_at: string
  updated_by: string
  action: string
  approval_status: number
  approver_kemkes: number
  status_kemenkes?: number
}

export type ListBmhpProvinceApprovalResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TBmhpProvinceApprovalItem[]
  meta?: {
    submitted: number
    not_submitted: number
    reviewed: number
    submitted_to_ministry?: boolean
  }
}

export type ListBmhpProvinceApprovalParams = {
  program_plan_id: number
  province_id?: number
  regency_id?: number
  keyword?: string
  page?: number
  paginate?: number
}
