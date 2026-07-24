import { OptionType } from '#components/react-select'
import { Pagination } from '#types/common'

export type TicketingSystemListParams = Pagination & {
  arrived_date?: {
    start: string
    end: string
  }
  do_number?: string
  order_id?: number
  province?: OptionType
  regency?: OptionType
  status?: OptionType
  entity_tag?: OptionType
}

export type TicketingSystemListItem = {
  arrived_date: string
  created_at: string
  do_number?: null | string
  name: string
  id: number
  order_id?: number | null
  status_id: number
  status: string
  updated_at: string
}
