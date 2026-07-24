import axios from '#lib/axios'
import { Pagination } from '#types/common'
import { TEntities } from '#types/entity'
import { handleAxiosResponse } from '#utils/api'

import { APIResponse } from './'

type GetEntityListRequest = Pagination & {
  keyword?: string
  province_id?: string
  regency_id?: string
  type?: number
  is_vendor?: number
}
type GetEntityListResponse = APIResponse<{
  list: TEntities[]
}>
async function getEntityList(params: GetEntityListRequest) {
  const response = await axios.get('/platform/fallback/entities', {
    params,
  })
  return handleAxiosResponse<GetEntityListResponse>(response)
}

export async function loadEntityOptions(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result = await getEntityList({
    keyword,
    page: additional.page,
    paginate: 10,
    is_vendor: 1,
  })

  if (result.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
      },
    }
  }

  const options = result?.list?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.list?.length > 0,
    additional: {
      page: additional.page + 1,
    },
  }
}

export async function loadPHCOptions(
  keyword: string,
  _: unknown,
  additional: {
    province_id?: string
    regency_id?: string
    page: number
  }
) {
  const result = await getEntityList({
    keyword,
    page: additional.page,
    paginate: 10,
    province_id: additional.province_id,
    regency_id: additional.regency_id,
    type: 3,
    is_vendor: 1,
  })

  if (result.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
        province_id: additional.province_id,
        regency_id: additional.regency_id,
      },
    }
  }

  const options = result?.list?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.list?.length > 0,
    additional: {
      page: additional.page + 1,
      province_id: additional.province_id,
      regency_id: additional.regency_id,
    },
  }
}
