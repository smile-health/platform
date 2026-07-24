import { OptionType } from '#components/react-select'

export type TicketingSystemCreateFormValues = {
  entity?: OptionType | null
  has_order?: number | null
  order_id?: OptionType | null
  do_number?: string | null
  arrived_date?: string | null
  selected_materials: TicketingSystemCreateSelectedMaterial[]
  accept_terms: boolean
  comment?: string | null
}

export type TicketingSystemCreateSelectedMaterial = {
  material: {
    id: number
    name: string
    is_batch: boolean
  } | null
  custom_material?: {
    name?: string | null
    is_batch?: boolean
  } | null
  items: TicketingSystemCreateSelectedMaterialQtyItem[]
}

export type TicketingSystemCreateSelectedMaterialQtyItem = {
  batch_code?: string | null
  expired_date?: string | null
  production_date?: string | null
  qty?: number | null
  reason?:
    | (OptionType & {
        child: OptionType[]
      })
    | null
  child_reason?: OptionType | null
}
