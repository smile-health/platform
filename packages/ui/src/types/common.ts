export type CommonType = {
  isGlobal?: boolean
}

export type ErrorResponse<T = Record<string, any[]>> = {
  message: string
  errors?: T
}

export type Pagination = {
  page: number
  paginate: number
}

export type TCommonFilter = Pagination & {
  keyword?: string
}

export type TCommonResponseList<T = unknown> = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination?: number[]
  data?: T
}

export type SuccessResponse = {
  message: string
  success: boolean
}

export type TInfoUserCreated = {
  firstname: string
  id: number
  lastname?: string
  username: string
}

export type TSingleOptions = {
  label: string
  value: number | string
}

export type TMultipleOptions = {
  label: string
  value: number[] | string[]
}

export type TCommonObject = {
  id: number
  name: string
}

export type TCommonObjectTitle = {
  id: number
  title: string
}

export type TCurrency = 'IDR'

export type Nullable<T, K extends keyof T = keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null
}
