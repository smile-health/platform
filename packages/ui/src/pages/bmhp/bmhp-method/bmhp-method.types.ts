export interface CreateBmhpMethodBody {
  name: string
  description: string
  program_plan_id: number
}

export interface UpdateBmhpMethodBody extends CreateBmhpMethodBody {
  id: string
}

export interface BmhpMethodFormResponse {
  message: string
}
