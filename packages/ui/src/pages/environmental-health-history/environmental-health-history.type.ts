import { TCommonFilter, TCommonResponseList } from '#types/common'

export type EnvironmentalHealthHistoryTestResult = {

  id: number
  environmental_test_id: number
  analysis_parameter_id: number
  parameter_name: string
  test_methods_id: number
  test_methods_name: string
  result_value: string | null
  quality_standard: string | null
  unit: string | null
  is_custom: boolean
}

export type EnvironmentalHealthHistoryInventoryItem = {
  id: number
  model_name: string
  serial_number: string
}

export type EnvironmentalHealthHistoryParameterCategoryItem = {
  id: number
  label: string
  key: string
  value: unknown
}

export type EnvironmentalHealthHistoryExaminationEntity = {
  id: number
  name: string
  regency_id?: string | null
}

export type EnvironmentalHealthHistoryManagementAsset = {
  id: number
  model_name: string
  serial_number: string
  production_year: number | null
  working_status: string | null
  asset_type_name: string | null
}

export type EnvironmentalHealthHistoryItem = {
  id: number
  created_at: string
  entity_id: number
  entity_name: string
  entity_address: string | null
  parameter_category_id: number
  parameter_category_name: string
  sample_id: string | null
  received_date: string | null
  lab_result_status: string | null
  test_start_date: string | null
  test_end_date: string | null
  sample_collected_by: string | null
  location: string | null
  collection_date: string | null
  has_ikl: boolean
  ikl_test_date: string | null
  ikl_score: number | null
  is_qualified: boolean
  inventory_ids: unknown[]
  activity_id: number | null
  activity_name: string | null
  test_results: EnvironmentalHealthHistoryTestResult[]
}


export type EnvironmentalHealthHistoryListResponse = TCommonResponseList & {
  data: EnvironmentalHealthHistoryItem[]
  statusCode?: number
}

export type EnvironmentalHealthHistoryListParams = TCommonFilter & {
  keyword?: string
  entity_id?: number | string
  province_id?: number | string
  regency_id?: number | string
  health_center_id?: number | string
  start_date?: string
  end_date?: string
  status?: string
  parameter_category_id?: number | string
  sample_collected_by?: string
  has_ikl?: string
  sort_by?: string
  sort_type?: string
}

export type EnvironmentalHealthHistoryDetail = EnvironmentalHealthHistoryItem & {
  parameter_category_items: EnvironmentalHealthHistoryParameterCategoryItem[]
  examination_entity_id?: number | null
  examination_entity?: EnvironmentalHealthHistoryExaminationEntity | null
  management_asset?: EnvironmentalHealthHistoryManagementAsset | null
}

export type EnvironmentalHealthHistoryTableProps = {
  data?: EnvironmentalHealthHistoryItem[]
  isLoading?: boolean
  size: number
  page: number
}

export type EnvironmentalHealthHistoryExportResponse = {
  filename: string
  base64: string
  mimeType: string
}
