// ─── GET /bmhp-approval/procurement-recapitulation ───────────────────────────

export interface ProcurementRecapitulationParams {
  program_plan_id: number
  regency_id?: number
  remaining_stock_date?: string
  page?: number
  paginate?: number
}

export interface ProcurementRecapitulationItem {
  id: number
  material_id: number
  variant_id: number | null
  name: string
  unit: string
  total_needs: number
  remaining_stock: number
  procurement_proposal: number
  proposal_buffer: number
}

export interface GetProcurementRecapitulationResponse {
  data: ProcurementRecapitulationItem[]
  total_item?: number
  total_page?: number
  list_pagination?: number[]
}

// ─── POST /bmhp-approval/procurement-recapitulation ──────────────────────────

export interface SaveRemainingStockItem {
  material_id: number
  variant_id?: number | null
  remaining_stock: number
}

export interface SaveRemainingStockPayload {
  program_plan_id: number
  items: SaveRemainingStockItem[]
}

export interface SaveRemainingStockResponse {
  data: {
    updated: number
  }
}
