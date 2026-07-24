import { TCommonResponseList } from './common'

export type PatientBulk = {
  file: string
  status: boolean
  notes: {
    [key: string]: string[]
  } | null
  created_at: string
  user_created_by: {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}

export type ListPatientBulkResponse = TCommonResponseList & {
  data: PatientBulk[]
  statusCode: number
}

export type ListPatientBulkParams = {
  page: string | number
  paginate: string | number
  start_date?: string
  end_date?: string
}
