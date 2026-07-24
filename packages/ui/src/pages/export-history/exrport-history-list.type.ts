import { TCommonFilter, TCommonResponseList } from '#types/common'

export type GetExportHistoryParams = {
  program_id?: number
  start_date?: string
  end_date?: string
  keyword?: string
}

export type ListExportHistoryParams = TCommonFilter & GetExportHistoryParams

export type TDataExportHistory = {
  id: number
  original_filename: string
  filename: string
  status: string
  status_label: string
  download_url: string
  expires_at: string
  created_at: string
  updated_at: string
  program: {
    id: number
    name: string
  }
  user_created_by: {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}

export type ListExportHistoryResponse = TCommonResponseList & {
  data: Array<TDataExportHistory>
}
