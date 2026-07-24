import { TCommonFilter, TCommonResponseList } from '#types/common'

export type ParameterCategoryOption = {
  id: number
  name: string
}

export type AnalysisParameterResponse = {
  id: number
  name: string
  unit: string | null
  unit_id: number | null
  unit_name: string | null
  result_data_type: string | null
  created_at: string
  updated_at: string
}

export type ListAnalysisParametersResponse = TCommonResponseList & {
  data: AnalysisParameterResponse[]
  statusCode?: number
}

export type ListAnalysisParametersParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
}

export type CreateAnalysisParameterBody = {
  name: string
  unit_id: number | null
  result_data_type: string | null
}

export type UpdateAnalysisParameterBody = {
  name?: string
  unit_id?: number | null
  result_data_type?: string | null
}

export type AnalysisParameterFormValues = {
  name: string
  unit_id: number | null
  custom_unit_name: string
}

export type AnalysisParameterFormProps = {
  defaultValues?: AnalysisParameterResponse
  isEdit?: boolean
  isDetail?: boolean
}

export type AnalysisParameterTableProps = {
  data?: AnalysisParameterResponse[]
  isLoading?: boolean
  size: number
  page: number
}
