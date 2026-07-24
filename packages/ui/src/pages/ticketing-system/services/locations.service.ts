import axios from '#lib/axios'
import { TCommonFilter } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

import { CommonResponse } from './common.service'

type GetProvinceListParams = TCommonFilter & {
  keyword?: string
}
type GetProvinceListResponse = CommonResponse & {
  list: { id: number; name: string }[]
}

async function getProvinceList(params: GetProvinceListParams) {
  const response = await axios.get('/platform/fallback/provinces', {
    params,
  })
  return handleAxiosResponse<GetProvinceListResponse>(response)
}

export async function loadProvinceOptions(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result = await getProvinceList({
    keyword,
    page: additional.page,
    paginate: 10,
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

type ListRegenciesParams = TCommonFilter & {
  keyword?: string
  province_id?: string
}
type ListRegenciesResponse = CommonResponse & {
  list: { id: number; name: string }[]
}

async function getRegencyList(params: ListRegenciesParams) {
  const response = await axios.get('/platform/fallback/regencies', {
    params,
  })
  return handleAxiosResponse<ListRegenciesResponse>(response)
}

export async function loadRegencyOptions(
  keyword: string,
  _: unknown,
  additional: {
    province_id: string
    page: number
  }
) {
  const result = await getRegencyList({
    keyword,
    page: additional.page,
    paginate: 10,
    province_id: additional.province_id,
  })

  if (result.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
        province_id: additional.province_id,
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
    },
  }
}
