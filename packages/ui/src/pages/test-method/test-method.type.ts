import { TCommonFilter, TCommonResponseList } from '#types/common'

export type ValidationData = {
  result_format_type: 'number' | 'text'
  validation_type: 'range' | 'comparison' | 'options' | 'none'
  min_value: number | null
  max_value: number | null
  comparison_operator: '<' | '<=' | '>' | '>=' | '=' | '!=' | null
  comparison_value: number | null
  allow_decimal: boolean
  options: string[] | null
}

export type TestMethodResponse = {
  id: number
  name: string
  deskripsi?: string | null
  quality_standard?: string | null
  validation?: ValidationData | null
  created_at: string
  updated_at: string
}

export type ListTestMethodsResponse = TCommonResponseList & {
  data: TestMethodResponse[]
  statusCode?: number
}

export type ListTestMethodsParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
}

export type CreateTestMethodBody = {
  name: string
  deskripsi?: string | null
  quality_standard?: string | null
  validation?: Partial<ValidationData> | null
}

export type UpdateTestMethodBody = {
  name?: string
  deskripsi?: string | null
  quality_standard?: string | null
  validation?: Partial<ValidationData> | null
}

export type TestMethodFormValues = {
  name: string
  deskripsi: string
  quality_standard: string
  // For validation
  result_format_type?: 'number' | 'text' | ''
  validation_type?: 'range' | 'comparison' | 'options' | 'none' | ''
  min_value?: number | ''
  max_value?: number | ''
  operator?: string
  comparison_value?: number | ''
  allow_decimal?: boolean
  options?: string[]
}

export type TestMethodFormProps = {
  defaultValues?: TestMethodResponse
  isEdit?: boolean
  isDetail?: boolean
}

export type TestMethodTableProps = {
  data?: TestMethodResponse[]
  isLoading?: boolean
  size: number
  page: number
}
