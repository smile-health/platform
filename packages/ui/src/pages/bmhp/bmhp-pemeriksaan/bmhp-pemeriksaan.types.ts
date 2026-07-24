export interface CreateBmhpPemeriksaanBody {
  name: string
  description: string
  is_active: boolean
  examination_type_id: number
  parameters: Array<{
    id: number
    sort_order: number
  }>
  method_ids: number[]
  materials: Array<{
    material_id: number
    target_group_ids: number[]
  }>
  program_plan_id: number
}

export interface UpdateBmhpPemeriksaanBody extends CreateBmhpPemeriksaanBody {
  id: string
}

export interface BmhpPemeriksaanFormResponse {
  message: string
}
