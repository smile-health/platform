import { CommonType, TCommonFilter, TCommonResponseList } from '#types/common'

export type DetailActivityResponse = {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_sequence: number
  created_by: string
  updated_by: number
  deleted_by: string
  is_patient_id: number
  is_final_distribution: number
  protocol: string
  created_at: string
  updated_at: string
  deleted_at: string
  status: number
  user_created_by: null | { id: number; name: string }
  user_updated_by: null | { id: number; name: string }
}

export type ListActivitiesParams = TCommonFilter & {
  keyword?: string
}

export type ExportActivitiesParams = {
  keyword?: string
}

export type ListActivitiesResponse = TCommonResponseList & {
  data: DetailActivityResponse[]
  statusCode?: number
}

export type CreateActivityBody = {
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_final_distribution?: number
  protocol: string
}

export type ActivityTableProps = CommonType & {
  size: number
  page: number
  setLink: (url: string) => string
}

export type ModalImportErrors = { [key: string]: string[] }

export type ActivityFormValues = {
  name: string
  is_ordered_sales: boolean
  is_ordered_purchase: boolean
  is_final_distribution?: boolean | null
  protocol: string
}

export type ActivityFormProps = {
  defaultValues?: DetailActivityResponse
  isEdit?: boolean
  pathBack?: string
}

export type UpdateStatusActivityResponse = {
  status: boolean
  message: string
  result: DetailActivityResponse
}
