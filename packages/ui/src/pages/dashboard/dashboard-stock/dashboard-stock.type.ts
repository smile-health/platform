import { TCommonResponseList } from '#types/common'

export type TMaterialEntity = {
  row: number
  unit: string
  province: {
    id: number
    name: string
  }
  regency: {
    id: number
    name: string
  }
  entity: {
    id: number
    name: string
  }
  material: {
    id: number
    name: string
    unit: string
  }
  total_stock_available: number
  stock_min: number
  stock_max: number
}

export type TStockEntity = {
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
  entityTag: {
    id: number
    name: string
  }
  activity: {
    id: number
    name: string
  }
  material: {
    id: number
    name: string
  }
  batches: {
    code: string
    date: string
  }
  kfaLevel: {
    label: string
  }
  value: number
}

export type GetMaterialEntityResponse = TCommonResponseList & {
  data: Array<TMaterialEntity>
}
export type GetStockEntityResponse = TCommonResponseList & {
  data: Array<TStockEntity>
}
