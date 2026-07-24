import { OptionType } from '#components/react-select'
import { TCommonResponseList } from '#types/common'

export type TLPLPOFilter = {
  province?: OptionType
  regency?: OptionType
  subdistrict?: OptionType
  activity?: OptionType
  entity?: OptionType
  date?: {
    start?: string
    end?: string
  }
}

export type LPLPOParams = {
  page?: number
  paginate?: number
  province_id?: string
  regency_id?: string
  sub_district_id?: string
  activity_id?: string
  entity_id?: string
  start_date?: string
  end_date?: string
}
export type BudgetSource = {
  apbd_1?: null
  apbd_2?: null
  apbn?: null
  dak?: null
  other?: null
}

export type ItemLPLPO = {
  budget_source: BudgetSource
  closing_qty: number
  entity_name: string
  id: number
  information: null
  issues_qty: number
  kfa_code: string
  name: string
  number: number
  opening_qty: number
  ordered_qty: number
  province_name: string
  received_qty: number
  regency_name: null
  sub_district_name: null
  unit: string
}

export type LPLPOResponse = TCommonResponseList & {
  data : Array<ItemLPLPO>
  statusCode?: number
}
