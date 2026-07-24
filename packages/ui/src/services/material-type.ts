import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { TMaterial } from '#types/material'
import { handleAxiosResponse } from '#utils/api'
import { removeEmptyObject } from '#utils/object'

export type GetMaterialTypesParams = TCommonFilter & {
  page?: string | number
  paginate?: string | number
  keyword?: string
}

export type MaterialTypeResponse = {
  id: number
  name: string
}

export type GetMaterialTypesResponse = TCommonResponseList & {
  data: TMaterial[]
  statusCode: number
}

export async function getMaterialTypes(
  params: GetMaterialTypesParams
): Promise<GetMaterialTypesResponse> {
  const response = await axios.get('/core/material-types', {
    params,
  })

  return handleAxiosResponse<GetMaterialTypesResponse>(response)
}

export async function loadMaterialType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: GetMaterialTypesParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await getMaterialTypes(removeEmptyObject(params))

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
    },
  }
}
