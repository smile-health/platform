import { TCommonResponseList } from '#types/common'
import { TEntities } from '#types/entity'

export type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

export type FinishedVaccineValues = {
  reason: number
}
