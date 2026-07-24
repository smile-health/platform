import { BOOLEAN } from '#constants/common'
import { TCommonObject, TSingleOptions } from '#types/common'
import { DetailStock } from '#types/stock'

import { CreateTransactionDetail } from '../transaction-create.type'

type TSubmitDetailMaterials = {
  material_id: number
  transaction_reason_id: number
  other_reason: string
  stock_id: number
  qty: number
  status_id: number | null
}

export type TDetailMaterials = {
  transaction_reason: TSingleOptions & {
    is_other: number
  }
  other_reason: string | null
  id: number
  is_temperature_sensitive: BOOLEAN
  consumption_unit_per_distribution_unit: number
} & DetailStock

export type CreateTransactionRemoveSubmit = {
  entity_id: number
  activity_id: number
  entity_activity_id: number
  materials: TSubmitDetailMaterials[]
}

export type CreateTransactionRemoveForm = {
  items: TDetailMaterials[]
  material_id: number
  material:
    | TSingleOptions
    | (TCommonObject & {
        is_temperature_sensitive: BOOLEAN.FALSE | BOOLEAN.TRUE
      })
    | null
} & CreateTransactionDetail
