export interface CreateBmhpExaminationTypeBody {
  name: string
  description: string
  program_plan_id?: number
}

export interface UpdateBmhpExaminationTypeBody extends CreateBmhpExaminationTypeBody {
  id: string
}

export interface BmhpExaminationTypeFormResponse {
  message: string
}
