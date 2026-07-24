export interface CreateBmhpParameterBody {
  name: string
  description: string
  program_plan_id: number
}

export interface UpdateBmhpParameterBody extends CreateBmhpParameterBody {
  id: string
}

export interface BmhpParameterFormResponse {
  message: string
}
