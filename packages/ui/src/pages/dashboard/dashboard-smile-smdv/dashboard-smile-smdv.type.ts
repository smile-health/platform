import { TCommonFilter, TCommonResponseList } from '#types/common'

export type SmileVsSmdvSummaryParams = TCommonFilter & {
  from?: string
  to?: string
  reverse?: number
  province_ids?: number[]
  regency_ids?: number[]
  entity_tag_ids?: number[]
  entity_ids?: number[]
  activity_id?: number[]
  material_ids?: number[]
  material_biofarma_name?: string
  order_status_id?: number
}

export type TDefaultType = {
  id: number
  name: string
}

export type TSmileVsSmdvCommonResponse = {
  deviation_percentage?: number
  deviation_qty?: number
  smile_qty?: number
  smdv_qty?: number
  row?: number
}

export type TSmileVsSmdvMaterial = TSmileVsSmdvCommonResponse & {
  material: TDefaultType
  material_name: string
}

export type TSmileVsSmdvEntity = TSmileVsSmdvCommonResponse & {
  entity: TDefaultType
  entity_name: string
}

export type SmileVsSmdvSummaryResponse = {
  deviation_qty?: number
  smile_qty?: number
  smdv_qty?: number
}

export type SmileVsSmdvEntityResponse = TCommonResponseList & {
  data: TSmileVsSmdvEntity[]
}

export type SmileVsSmdvMaterialResponse = TCommonResponseList & {
  data: TSmileVsSmdvMaterial[]
}
