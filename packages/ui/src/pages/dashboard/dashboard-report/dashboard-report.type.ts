import { OptionType } from '#components/react-select'

export type TDashboardReportFilter = {
  period: 'monthly' | 'annual'
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

export type DashboardReportParams = {
  period: 'monthly' | 'annual'
  province_id?: string
  regency_id?: string
  subdistrict_id?: string
  activity_id?: string
  entity_id?: string
  from?: string
  to?: string
}

export type DashboardReportResponse = {
  period: 'monthly' | 'annual'
  province_name: string
  regency_name: string
  entity_name: string
  data: TItem[]
  last_updated: string
}

export type TItem = {
  id: number
  number: number | string
  name: string
  opening_qty: number
  received_qty: number
  ordered_qty: number
  issues_qty: number
  discard_qty: number
  closing_qty: number
  vaccine_ip: string
  scope_total: string
}
