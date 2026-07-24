// ── User ref ──────────────────────────────────────────────────────────────────

export interface TMinistryUserRef {
  id: number
  username: string
  firstname: string
  lastname: string
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface TBmhpApprovalMinistrySummary {
  total_provinces: number | null
  submitted: number | null
  not_submitted: number | null
  percentage_solution: number | null
  daily_submissions?: number | null
}

// ── Row item ──────────────────────────────────────────────────────────────────

export interface TBmhpApprovalMinistryItem {
  no: number
  program_plan_id: number
  province_id: number
  province_name: string
  status: number
  submitted_at: string | null
  user_created_by: TMinistryUserRef | null
  user_updated_by: TMinistryUserRef | null
  si_no?: number
}

// ── Response ──────────────────────────────────────────────────────────────────

export interface ListBmhpApprovalMinistryResponse {
  summary: TBmhpApprovalMinistrySummary
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TBmhpApprovalMinistryItem[]
}

// ── Params ────────────────────────────────────────────────────────────────────

export interface ListBmhpApprovalMinistryParams {
  program_plan_id?: number | null
  province_id?: number | null
  status?: number | string | null
  page?: number
  paginate?: number
}

// ── Ministry Recapitulation Detail ─────────────────────────────────────────────

export interface TBmhpMinistryRecapitulationItem {
  id: number
  material_id: number
  variant_id: number | null
  name: string
  unit: string
  total_kebutuhan: number
  sisa_stok: number
  usulan_pengadaan: number
  proposal_buffer: number
  hasil_desk: number
}

export interface BmhpMinistryRecapitulationResponse {
  data: TBmhpMinistryRecapitulationItem[]
  total_item: number
  total_page: number
  list_pagination: number[]
}

export interface BmhpMinistryRecapitulationParams {
  program_plan_id?: number | null
  entity_id?: number | string | null
}

// ── Ministry Recapitulation Detail ────────────────────────────────────────────────
export interface MinistryRecapitulationDetailParams {
  entity_id?: number | string | null
  province_id?: number | string | null
  program_plan_id?: number | null
}

export interface MinistryRecapitulationDetailData {
  province_name: string
  regency_name: string
  year: number
  remaining_stock_date: string | null
}

export interface GetMinistryRecapitulationDetailResponse {
  status: boolean
  message: string
  data: MinistryRecapitulationDetailData
}

// ── Save Desk Result ─────────────────────────────────────────────────────────────

export interface SaveDeskResultItemPayload {
  material_id: number
  variant_id: number | null
  desk_result: number
}

export interface SaveDeskResultPayload {
  program_plan_id: number
  entity_id: number
  items: SaveDeskResultItemPayload[]
}

// ── Save Desk Result Record ──────────────────────────────────────────────────────

export interface SaveDeskResultRecordPayload {
  program_plan_id: number
  entity_id: number
  status_desk: number
  ba_file_url?: string | null
  signature_link?: string | null
  desk_date?: string
  desk_by?: number | null
}
