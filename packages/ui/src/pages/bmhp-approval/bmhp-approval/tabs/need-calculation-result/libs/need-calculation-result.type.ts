// ── Need Calculation API types ─────────────────────────────────────────────────

export interface TMaterialItem {
  material_id: number
  material_name: string
  material_variant: string
  unit: string
  type: string
  total_needed: number
}

export interface TScreeningSummary {
  total_materials: number
  total_items: number
}

export interface TNeedCalculationResultScreening {
  material_id: number
  material_name: string
  materials: TMaterialItem[]
  summary: TScreeningSummary
  examination_id: number
  examination_name: string
}

export interface TNeedCalculationResultItem {
  puskesmas_id: number
  puskesmas_name: string
  sub_district_name: string
  screenings: TNeedCalculationResultScreening[]
  /** injected client-side */
  si_no?: number
}

export type NeedCalculationResultResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: TNeedCalculationResultItem[]
}

export type NeedCalculationResultParams = {
  program_plan_id?: number
  regency_id?: number
  entity_id?: number
  material_id?: number
  page?: number
  paginate?: number
}
