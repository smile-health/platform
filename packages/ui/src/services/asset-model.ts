import { OptionType } from '#components/react-select'
import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList, TInfoUserCreated } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

type ListAssetModelParams = {
  page: number
  paginate: number
  keyword?: string
  material_id?: string
  asset_type?: number
  manufacture_id?: number
  only_logger?: number
  status?: number
}

export type TListAssetModelResponse = TCommonResponseList & {
  data: TListAssetModel[]
  statusCode: number
}

export type TCapacity = {
  id?: number | null
  asset_model_id?: number | null
  net_capacity?: number | null
  gross_capacity?: number | null
  min_temperature: number | null
  max_temperature: number | null
  min_humidity?: number | null
  max_humidity?: number | null
  category?: number | null
  is_active?: number | null
}

export type TListAssetModel = {
  id: number
  name: string | null
  asset_type_id: number | null
  created_by: number | null
  updated_by: number | null
  asset_type_name: string | null
  asset_type_min_temperature: number | null
  asset_type_max_temperature: number | null
  manufacture_id: number | null
  manufacture_name: string | null
  net_capacity: number | null
  gross_capacity: number | null
  created_at: string | null
  updated_at: string | null
  capacities: TCapacity[]
  user_created_by: TInfoUserCreated
  user_updated_by: TInfoUserCreated
}

export async function listAssetModel(
  params: ListAssetModelParams
): Promise<TListAssetModelResponse> {
  const apiUrl = `${SERVICE_API.CORE}/asset-models`
  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<TListAssetModelResponse>(response)
}

export async function loadAssetModel(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    status: number
    material_id?: string
    asset_type?: number
    manufacture_id?: number
    only_logger?: number
    isGlobal?: boolean
    need_more?: boolean
    another_option?: OptionType[]
    is_cce?: 1 | 0
  }
) {
  let params: ListAssetModelParams = {
    ...additional,
    page: additional.page,
    status: additional.status,
    paginate: 10,
    keyword,
  }

  const apiUrl = `${additional?.isGlobal ? SERVICE_API.CORE : SERVICE_API.MAIN}/asset-models`
  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<TListAssetModelResponse>(response)

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

  let options = result?.data?.map((item) => ({
    ...(additional.need_more ? item : {}),
    label: item?.name,
    value: item?.id,
    data: item,
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

export async function loadAssetModelWithData(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    status?: number
    material_id?: string
    asset_type_ids?: number
    manufacture_id?: number
    only_logger?: number
    another_option?: OptionType[]
    temperature_thresholds?: number[]
    is_cce?: 1 | 0
  }
) {
  const { another_option, temperature_thresholds, ...rest } = additional
  const params: ListAssetModelParams = {
    ...rest,
    page: rest.page,
    status: rest.status,
    paginate: 10,
    keyword,
  }

  const result = await listAssetModel(params)

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

  let options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
    data: item,
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
