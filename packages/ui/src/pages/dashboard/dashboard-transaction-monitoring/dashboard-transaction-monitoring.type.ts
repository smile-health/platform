import { TCommonResponseList } from '#types/common'

export type TMaterialChart = {
  material: {
    id: number
    name: string
    unit: string
  }
  value: number
}

export type GetMaterialChart = {
  date: string
  list: TMaterialChart[]
}

export type TEntityComplete = {
  entity: {
    id: number
    name: string
  }
  province: {
    id: number
    name: string
  }
  regency: {
    id: number
    name: string
  }
  transaction_type: {
    id: number
    name: string
  }
  material: {
    id: number
    name: string
    unit: string
    parent: string
  }
  vendor: {
    id: number
    name: string
  }
  customer: {
    id: number
    name: string
  }
  batch: {
    id: number
    code: string
    expDate: string
    manufacture: {
      id: number
      name: string
    }
  }
  value: number
  created_at: string
}

export type GetEntityCompleteResponse = TCommonResponseList & {
  data: TEntityComplete[]
}

export type TTransactionReason = {
  transaction_reason: {
    id: number
    name: string
  }
  value: number
}

export type GetTransactionReasonResponse = {
  date: string
  list: TTransactionReason[]
}

export type DashboardTransactionMonitoringChartResponse = {
  last_updated: string
  chart: {
    by_entity_tag: TTransactionMonitoringChart
    by_month: TTransactionMonitoringChart
  }
}

export type TTransactionMonitoringChart = {
  categories: TTransactionMonitoringChartCategory[]
  dataset: TTransactionMonitoringChartDataset[]
}

export type TTransactionMonitoringChartDataset = {
  label: string
  color: string
  data: number[]
  dotted_line: boolean
}

export type TTransactionMonitoringChartCategory = {
  label: string
  day: number
  month: number
  year: number
  week_number: number
}

export type DashboardTransactionMonitoringBigNumberReponse = {
  date: string
  data: number
}
