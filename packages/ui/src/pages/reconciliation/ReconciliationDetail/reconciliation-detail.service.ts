import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'

export type DetailReconciliationResponse = {
  id: number
  material_id: number
  entity_id: number
  activity_id: number
  start_date: string
  end_date: string
  deleted_at: any
  created_by: number
  updated_by: any
  deleted_by: any
  created_at: string
  updated_at: string
  entity: Entity
  material: Material
  activity: Activity
  user_created_by: UserCreatedBy
  user_updated_by: any
  reconciliation_items: ReconciliationItem[]
}

export type Entity = {
  id: number
  name: string
}

export type Material = {
  id: number
  name: string
  code: string
}

export type Activity = {
  id: number
  name: string
}

export type UserCreatedBy = {
  id: number
  username: string
  email: string
  firstname: string
  lastname: any
}

export type ReconciliationItem = {
  id: number
  reconciliation_id: number
  stock_category: number
  smile_qty: number
  real_qty: number
  stock_category_label: string
  reasons: Reason[]
  actions: Action[]
}

export type Reason = {
  id: number
  title: string
}

export type Action = {
  id: number
  title: string
}

export async function getDetail({
  id,
}: {
  id: string
}): Promise<DetailReconciliationResponse> {
  const response = await axios.get(
    `${SERVICE_API.PLATFORM}/v2/stock/reconciliation/${id}`
  )

  return response?.data
}
