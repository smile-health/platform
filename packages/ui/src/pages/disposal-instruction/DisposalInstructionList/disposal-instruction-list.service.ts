import axios from '#lib/axios'
import { Pagination, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  DisposalInstructionListItem,
  DisposalInstructionTypeListItem,
} from './disposal-instruction-list.type'

export type GetDisposalInstructionListRequest = Pagination & {
  activity_id?: number
  bast_no?: string
  city_id?: string
  entity_id?: string
  province_id?: string
  entity_tag_id?: string
  from_date?: string
  instruction_type?: number
  to_date?: string
}

export type GetDisposalInstructionListResponse = TCommonResponseList<
  DisposalInstructionListItem[]
>

export async function getDisposalInstructionList(
  params: GetDisposalInstructionListRequest
) {
  const response = await axios.get('/main/disposal/instructions', { params })
  return handleAxiosResponse<GetDisposalInstructionListResponse>(response)
}

export async function exportDisposalInstructionList(
  params: GetDisposalInstructionListRequest
) {
  const response = await axios.get('/main/disposal/instructions/xls', {
    responseType: 'arraybuffer',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

type GetDisposalInstructionTypeListRequest = Pagination & {
  keyword?: string
}
type GetDisposalInstructionTypeListResponse = TCommonResponseList<
  DisposalInstructionTypeListItem[]
>

export async function getDisposalInstructionTypeList(
  params: GetDisposalInstructionTypeListRequest
) {
  const response = await axios.get('/main/disposal/instructions/types', {
    params,
  })
  return handleAxiosResponse<GetDisposalInstructionTypeListResponse>(response)
}

export async function loadDisposalInstructionTypeOptions(
  keyword: string,
  _: any,
  additional: GetDisposalInstructionTypeListRequest
) {
  const result = await getDisposalInstructionTypeList({
    ...additional,
    keyword,
    paginate: 10,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: Boolean(result?.data?.length),
    additional: {
      ...additional,
      page: additional?.page + 1,
    },
  }
}
