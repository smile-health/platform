import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { Pagination, TCommonResponseList } from '#types/common'
import { TEntityActivity } from '#types/entity'
import { handleAxiosResponse } from '#utils/api'
import { AxiosResponse } from 'axios'

import { DisposalInstructionTypeListItem } from './disposal-instruction.type'

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
  _: unknown,
  additional: GetDisposalInstructionTypeListRequest
) {
  const result = await getDisposalInstructionTypeList({
    keyword,
    ...additional,
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
    options: options ?? [],
    hasMore: Boolean(result?.data?.length),
    additional: {
      ...additional,
      page: additional?.page + 1,
    },
  }
}

type GetEntityActivityListRequest = {
  is_ordered_purchase?: number
  entity_id?: number
  page?: number
  paginate?: number
  keyword?: string
}

type GetEntityActivityListResponse = AxiosResponse<TEntityActivity[]>

const getEntityActivityList = async (
  request: GetEntityActivityListRequest
): Promise<GetEntityActivityListResponse> => {
  const response = await axios.get(
    `${SERVICE_API.MAIN}/entities/${request?.entity_id}/activities`,
    { params: request }
  )
  return response
}

export async function loadEntityActivitysOptions(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_ordered_purchase?: number
    entity_id?: number
  }
) {
  const params = { keyword, ...additional }
  const response = await getEntityActivityList(params)

  if (response?.status === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = response?.data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options: options ?? [],
    hasMore: response?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
