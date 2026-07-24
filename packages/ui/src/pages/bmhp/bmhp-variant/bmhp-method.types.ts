export interface VariantItem {
  material_id?: number
  name: string
  test_qty: number
  unit_id: number
}

export interface CreateBmhpVariantBody {
  material_id: number
  is_variant: number
  variants: VariantItem[]
  program_plan_id: number
}

export interface UpdateBmhpVariantBody extends CreateBmhpVariantBody {
  id: string
}

export interface BmhpVariantFormResponse {
  message: string
}
