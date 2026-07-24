import { OptionType } from '#components/react-select'
import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { getReactSelectValue } from '#utils/react-select'

import {
  CreateBudgetSourceBody,
  DetailBudgetSourceResponse,
  ExportBudgetSourceParams,
  ListBudgetSourceParams,
  ListBudgetSourceResponse,
} from './budget-source.type'

const MAIN_SERVICE = SERVICE_API.MAIN
const CORE_SERVICE = SERVICE_API.CORE

export async function getCoreBudgetSource(
  params: ListBudgetSourceParams,
  isGlobal?: boolean
): Promise<ListBudgetSourceResponse> {
  const urlLink = `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/budget-sources`
  const response = await axios.get(urlLink, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListBudgetSourceResponse>(response)
}

export async function exportBudgetSource(
  params: ExportBudgetSourceParams,
  isGlobal?: boolean
) {
  const response = await axios.get(
    `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/budget-sources/xls`,
    {
      responseType: 'blob',
      params: {
        keyword: params?.keyword,
        program_ids: getReactSelectValue(params?.program_ids),
      },
      cleanParams: true,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function createBudgetSource(data: CreateBudgetSourceBody) {
  const response = await axios.post(`${CORE_SERVICE}/budget-sources`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getBudgetSource(
  id: string | number,
  isGlobal?: boolean
): Promise<DetailBudgetSourceResponse> {
  const response = await axios.get(
    `${isGlobal ? CORE_SERVICE : MAIN_SERVICE}/budget-sources/${id}`,
    { redirect: true }
  )
  return response?.data
}

export async function deleteBudgetSource(id?: string | number) {
  const response = await axios.delete(`${CORE_SERVICE}/budget-sources/${id}`)

  return response?.data
}

export async function updateBudgetSource(
  id: string | number,
  data: CreateBudgetSourceBody
) {
  const response = await axios.put(`${CORE_SERVICE}/budget-sources/${id}`, data)
  return response?.data
}

export async function updateStatusBudgetSourceInProgram(
  id: string,
  status: number
) {
  const response = await axios.put(
    `${MAIN_SERVICE}/budget-sources/${id}/status`,
    {
      status,
    }
  )
  return response?.data
}

export async function loadBudgetSource(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    another_option?: OptionType[]
  }
) {
  let params: ListBudgetSourceParams = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }
  const isGlobal = true

  const result = await getCoreBudgetSource(params, isGlobal)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  let options = result?.data?.map((item: DetailBudgetSourceResponse) => ({
    label: item.name,
    value: item.id,
  }))

  return {
    options:
      additional.another_option && additional.page === 1
        ? [...additional.another_option, ...options]
        : options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
