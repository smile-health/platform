import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'

import { TProgram } from '../types/program'

const BASE_URL = process.env.API_CORE_URL

export type ListProgramsResponse = TCommonResponseList & {
  data: Array<TProgram & { created_at: string; updated_at: string }>
}

type ListProgramsParams = {
  page: string | number
  paginate: string | number
  keyword?: string
  is_hierarchy_enabled?: number
  is_beneficiaries?: boolean
  is_user_program?: number
}
export async function listPrograms(
  params: ListProgramsParams
): Promise<ListProgramsResponse> {
  const response = await axios.get('/programs', {
    baseURL: BASE_URL,
    params,
  })

  return response?.data
}
