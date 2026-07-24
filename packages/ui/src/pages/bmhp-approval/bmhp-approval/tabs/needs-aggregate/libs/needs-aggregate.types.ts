// ── Needs Aggregate Types ─────────────────────────────────────────────────────────

export type NeedsAggregateStatusType = 'pending' | 'approved' | 'rejected'

export interface TNeedsAggregateItem {
  id: number | null
  city_id: number
  city_name: string
  total_needs: number
  status: NeedsAggregateStatusType
  updated_at: string | null
  user_updated_by: {
    id: number
    name: string
  } | null
  /** injected client-side */
  si_no?: number
}

export interface NeedsAggregateTable {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TNeedsAggregateItem[]
}

export interface NeedsAggregateSummary {
  labels: string[]
  total: number[]
  unit: string[]
}

export type NeedsAggregateTableParams = {
  page?: number
  item_per_page?: number
  program_plan_id: number
}

// ── Get Needs Aggregate List Response ─────────────────────────────────────────────

export interface GetNeedsAggregateListResponse {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TNeedsAggregateItem[]
  summary: NeedsAggregateSummary
}

// ── Needs Aggregate Detail Types ──────────────────────────────────────────────────

export interface TNeedsAggregateDetailItem {
  examination_name: string
  target_group_name: string
  total_needs: string
  unit: string
  total_target: number | null
  total_adjustment: number | null
}

export interface GetNeedsAggregateDetailsResponse {
  data: TNeedsAggregateDetailItem[]
}

// ── Preview Types ─────────────────────────────────────────────────────────────────

export interface TNeedsAggregatePreviewItem {
  id: number
  name: string
  update_by: string | null
  update_at: string | null
  examination: {
    id: number
    name: string
    unit: string
    total_needs: number
  }[]
}

export interface GetNeedsAggregatePreviewResponse {
  data: TNeedsAggregatePreviewItem[]
}

// ── Update Status Types ───────────────────────────────────────────────────────────

export interface UpdateNeedsAggregateStatusBody {
  program_plan_id: number
  status: NeedsAggregateStatusType
}

export type UpdateNeedsAggregateStatusResponse = null
