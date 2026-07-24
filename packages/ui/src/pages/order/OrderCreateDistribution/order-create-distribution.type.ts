import { OptionType } from '#components/react-select'

export type TOrderFormValues = TOrderFormInputValues & {
  order_items: TOrderFormItemsValues[]
}

export type TOrderFormInputValues = {
  vendor: OptionType | null
  customer: OptionType | null
  activity: OptionType | null
  required_date: string | null
  order_comment: string
}

export type TOrderFormItemsValues = TFormatDetailBatch & {
  material: {
    id?: number
    name?: string
    is_managed_in_batch?: number
    is_temperature_sensitive?: number
    companions?: {
      id: number
      name: string
    }[]
  }
  total_qty?: number
  total_available_qty?: number
  min?: number
  max?: number
}

export type TFormatBatch = TOrderFormItemsDetailBatchValues &
  Pick<TOrderFormItemsDetailValues, 'activity'>

export type TFormatDetailBatch = {
  batch?: TFormatBatch[]
  otherBatch?: {
    label: string
    value: TFormatBatch[]
  }[]
}

export type TOrderFormItemsDetailValues = {
  activity?: {
    id?: number
    name?: string
  }
  total_qty?: number
  total_available_qty?: number
  min?: number
  max?: number
  batch?: Array<TOrderFormItemsDetailBatchValues>
}

export type TOrderFormItemsDetailBatchValues = {
  id: number
  qty?: number
  available_qty?: number
  allocated_qty?: number
  min?: number
  max?: number
  code: string
  expired_date: string
  production_date: string
  ordered_qty?: number | null
  order_stock_status: OptionType | null
  pieces_per_unit?: number
  manufacturer: {
    id: number
    name: string
  }
}

export type TOrderItem = {
  material_id: number
  stocks: TOrderStock[]
}

export type TOrderStock = {
  stock_id: number
  activity_id: number
  allocated_qty: number
  order_stock_status_id: number | null
}

export type TDrawerQuantity = {
  open: boolean
  index: number
  data: TOrderFormItemsValues | null
}
