import { TCommonFilter, TCommonResponseList } from '#types/common'
import { TEntities } from '#types/entity'
import { TMaterial } from '#types/material'

type Activity = {
  id: number
  name: string
}

export type Item = {
  actual_qty: number
  id: number
  reconciliation_category: number
  reconciliation_category_label: string
  reconciliation_id: number
  recorded_qty: number
  reasons: Array<{
    id: number
    title: string
  }>
  actions: Array<{
    id: number
    title: string
  }>
}

type UserCreatedBy = {
  email: string
  firstname: string
  id: number
  lastname: string
  username: string
}

type UserUpdatedBy = {
  email: string
  firstname: string
  id: number
  lastname: string
  username: string
}

type MaterialParent = {
  id: number
  name: string
  code: string
}

export type TReconciliationData = {
  activity?: Activity
  activity_id?: number
  created_at?: string
  created_by?: number
  deleted_at?: null
  deleted_by?: number
  end_date?: string
  entity?: {
    id: number
    name: string
    entity: TEntities
  }
  entity_id?: number
  id?: number
  items?: Item[]
  material?: TMaterial
  material_parent?: MaterialParent
  material_id?: number
  start_date?: string
  updated_at?: string
  updated_by?: number
  user_created_by?: UserCreatedBy
  user_updated_by?: UserUpdatedBy
}

export type ListReconciliationResponse= TCommonResponseList & {
  data: Array<TReconciliationData>
}

export type GetReconciliationParams = {
  activity_id?: number
  material_type_id?: number
  start_date?: string
  end_date?: string
  created_from?: string
  created_to?: string
  entity_tag_id?: number
  province_id?: number
  regency_id?: number
  entity_id?: number
  material_id?: number
  parent_material_id?: number
}

export type ListReconciliationParams = TCommonFilter & GetReconciliationParams
