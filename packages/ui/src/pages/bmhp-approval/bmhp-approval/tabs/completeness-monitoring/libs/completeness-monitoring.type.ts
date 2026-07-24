// ── Completeness Monitoring API types ─────────────────────────────────────────

export type CompletenessScreeningStatus =
  | 'completed'
  | 'not_submitted'
  | 'not_applicable'

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
  program_plan_id: number
  regency_id?: number
  entity_ids?: string
  examination_ids?: string
  not_submitted?: 0 | 1
}

/** A single unique examination column derived from all rows */
export interface TExaminationColumn {
  examination_id: number
  examination_name: string
}
