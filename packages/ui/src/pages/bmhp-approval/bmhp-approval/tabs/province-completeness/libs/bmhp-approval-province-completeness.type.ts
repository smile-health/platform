// ── Province Table Types ────────────────────────────────────────────────────────

export type ProvinceStatusType = 'complete' | 'incomplete' | 'not_submitted'

export interface TProvinceItem {
  id: number
  city_id: number
  city_name: string
  status: ProvinceStatusType
  total_health_care: number
  completed_health_care: number
  updated_at?: string
  user_updated_by?: {
    id: number
    name: string
  }
  /** injected client-side */
  si_no?: number
}

export type ProvinceMonitoringStatusType = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface TProvinceMonitoringItem {
  entity_id: number
  entity_name: string
  approval_period_id: number
  status: ProvinceMonitoringStatusType
  current_step: number
  submitted_at?: string
  total_puskesmas: number
  completion_percentage: number
  /** injected client-side */
  si_no?: number
}

export type ProvinceTableResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TProvinceItem[]
}

export type ProvinceTableParams = {
  page?: number
  item_per_page?: number
  year?: number
  province_id?: number
}

// ── Completeness Monitoring Table Types ─────────────────────────────────────────

export type CompletenessScreeningStatus = 'complete' | 'incomplete'

export interface TCompletenessScreening {
  examination_id: number
  examination_name: string
  status: CompletenessScreeningStatus
}

export interface TCompletenessProgress {
  completed: number
  total: number
}

export interface TCompletenessItem {
  puskesmas_id: number
  puskesmas_name: string
  sub_district_name: string | null
  screenings: TCompletenessScreening[]
  progress: TCompletenessProgress
  /** injected client-side */
  si_no?: number
}

export type CompletenessMonitoringResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TCompletenessItem[]
}

export type CompletenessMonitoringParams = {
  page?: number
  item_per_page?: number
  year: number
  city_id: number
  examination_id?: number
}

/** A single unique examination column derived from all rows */
export interface TExaminationColumn {
  examination_id: number
  examination_name: string
}

// ── Detail Data Types ───────────────────────────────────────────────────────────

export type TBmhpApprovalProvinceDetail = {
  id: number
  year: number
}
