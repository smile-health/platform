export interface CreateBmhpTargetGroupBody {
  code: string
  name: string
  age_range: string
  description: string
  is_active: boolean
}

export interface UpdateBmhpTargetGroupBody extends CreateBmhpTargetGroupBody {
  id: string
}

export interface BmhpTargetGroupFormResponse {
  message: string
}
