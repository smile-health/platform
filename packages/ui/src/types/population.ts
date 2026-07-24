import { TCommonResponseList } from './common'

export type YearPopulation = {
  id: number
  year: number
  status: number
  updated_at: string
  user_updated_by: {
    id: number
    username: string
    fullname: string
  }
}

export type ListYearPopulationResponse = TCommonResponseList & {
  data: YearPopulation[]
  statusCode: number
}

export type ListYearPopulationParams = {
  page: string | number
  paginate: string | number
  keyword?: string
}

export type DetailPopulationResponse = {
  data: DetailPopulation[]
  year_plan: string
}

export type DetailPopulation = {
  entity: Entity
  population: Population[]
  user_updated_at: string
  user_updated_by: {
    id: number
    username: string
    fullname: string
  }
}

export type Entity = {
  id?: number
  name?: string
  province: string
  regency?: string
}

export type Population = {
  id: number
  name: string
  population_number: number
}

export type TargetGroup = {
  id: number
  name: string
  value: number
}

export type DetailPopulationParams = {
  province_id: number
}
