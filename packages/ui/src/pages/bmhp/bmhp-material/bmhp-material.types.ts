export interface CreateBmhpMaterialBody {
  name: string
  description: string
  is_active: boolean
  material_details: {
    material_id: number
    material_level_id: number
    qty: number
  }[]
  program_plan_id: number
}

export interface UpdateBmhpMaterialBody extends CreateBmhpMaterialBody {
  id: string
}

export interface BmhpMaterialFormResponse {
  message: string
}
