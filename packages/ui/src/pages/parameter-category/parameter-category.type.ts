import { TCommonFilter, TCommonResponseList } from '#types/common'

export type FieldItem = {
  id?: number
  key: string
  type_data: string
  label: string
  hint: string | null
  mandatory: number
  options?: string | null
}

export type ParameterCategoryDetailResponse = {
  id?: number
  env_analysis_parameter_id: number
  parameter_name?: string
  unit_id?: number | null
  unit_name?: string | null
  test_methods: Array<{
    id: number
    name: string
    quality_standard?: string | null
  }>
}

export type ParameterCategoryResponse = {
  id: number
  name: string
  status?: 0 | 1
  analysis_parameters?: ParameterCategoryDetailResponse[]
  fields?: FieldItem[]
  created_at: string
  updated_at: string
}

export type ListParameterCategoriesResponse = TCommonResponseList & {
  data: ParameterCategoryResponse[]
  statusCode?: number
}

export type ListParameterCategoriesParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
}

export type CreateParameterCategoryBody = {
  name: string
  analysis_parameters: {
    env_analysis_parameter_id: number
    env_test_method_ids: number[]
  }[]
  fields?: {
    key: string
    type_data: string
    label: string
    hint: string | null
    mandatory: number
  }[]
}

export type UpdateParameterCategoryBody = {
  name?: string
  analysis_parameters: {
    id?: number
    env_analysis_parameter_id: number
    env_test_method_ids: number[]
    _delete?: boolean
  }[]
  fields?: {
    key: string
    type_data: string
    label: string
    hint: string | null
    mandatory: number
  }[]
}

export type ParameterCategoryFormValues = {
  name: string
  analysis_parameters: {
    id?: number
    env_analysis_parameter_id: number
    env_test_method_ids: number[]
    _delete?: boolean
  }[]
  fields: FieldItem[]
}

export type ParameterCategoryFormProps = {
  defaultValues?: ParameterCategoryResponse
  isEdit?: boolean
  isDetail?: boolean
}

export type ParameterCategoryTableProps = {
  data?: ParameterCategoryResponse[]
  isLoading?: boolean
  size: number
  page: number
}
