import { ActivityData } from "#types/activity"
import { TCommonFilter, TCommonResponseList } from "#types/common"

export type listActivitiesParams = TCommonFilter & {
  keyword?: string
  lang?: string
  entity_id?: string
  is_ongoing?: number
}

export type ListActivitiesResponse = TCommonResponseList & {
  data: ActivityData[]
  statusCode?: number
  nextPage?: number
}

export type ExportActivityProgramParams = {
  keyword?: string
}

export type CreateActivityProgramBody = {
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
}

export type UpdateStatusActivityProgramResponse = {
  status: boolean
  message: string
  result: ActivityData
}
