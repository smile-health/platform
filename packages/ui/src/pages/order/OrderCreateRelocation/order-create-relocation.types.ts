import { OptionType } from "#components/react-select"

interface OrderItem {
  ordered_qty: number
  material_id: number
  order_reason_id: number
  recommended_stock: number
  other_reason?: string | null
}

export type createOrderRelocationBody = {
  customer_id: number
  vendor_id: string
  required_date: string | null
  activity_id: number
  order_comment: string | null
  order_items: OrderItem[]
}

type MaterialChildren = {
  kfa_type: number
  material_id?: number
  ordered_qty: number | null
  total_ordered_qty: number | null
  available_qty: number
  max: number
  min: number
  name?: string
}

type MappedMaterialData = {
  label?: string
  value: {
    material_companions: Array<{
      id: number
      name: string
    }> | null
    material_id?: number
    total_available_qty?: number
    total_qty?: number
    ordered_qty?: number | null
    min?: number
    max?: number
    order_reason_id?: OptionType | null
    other_reason?: string | null
    recommended_stock?: number
    consumption_unit_per_distribution_unit?: number
    children?: MaterialChildren[]
  }
}

export type OrderRelocationCreateForm = {
  order_items: MappedMaterialData[]
  customer_id: OptionType | null
  activity_id: OptionType | null
  vendor_id: OptionType | null
  required_date: string | null
  order_comment: string | null
}