import { OptionType } from '#components/react-select'
import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList, TInfoUserCreated } from '#types/common'
import { TProgram } from '#types/program'
import { handleAxiosResponse } from '#utils/api'

const SERVICE = SERVICE_API.CORE

type ListAssetTypeParams = {
  page: number
  paginate: number
  keyword?: string
  material_id?: string
  status?: number
  type_by?: string
  is_warehouse?: number
  is_cce?: number
}

export type TemperatureThreshold = {
  asset_type_temperature_id: number | null
  asset_type_id: number | null
  temperature_threshold_id: number | null
  min_temperature: number | null
  max_temperature: number | null
  is_active: number | null
  id?: number | null
}

export type HumidityThreshold = {
  asset_type_humidity_id: number | null
  asset_type_id: number | null
  humidity_threshold_id: number | null
  min_humidity: number | null
  max_humidity: number | null
}

export type AssetType = {
  id: number
  name: string
  description: string
  min_temperature: number
  max_temperature: number
  created_at: string
  is_warehouse: number
  updated_at: string
  status: Status
  programs: TProgram[]
  user_created_by: TInfoUserCreated
  user_updated_by: TInfoUserCreated
  temperature_thresholds: TemperatureThreshold[]
}

export interface Status {
  id: number
  name: string
}

type ListAssetTypeResponse = TCommonResponseList & {
  data: AssetType[]
  statusCode: number
}

export async function listAssetType(
  params: ListAssetTypeParams
): Promise<ListAssetTypeResponse> {
  const apiUrl = `${SERVICE}/asset-types`
  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAssetTypeResponse>(response)
}

export async function loadAssetType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    material_id?: string
    status?: number
    another_option?: OptionType[]
    is_warehouse?: number
    is_cce?: number
  }
) {
  const { another_option, ...rest } = additional
  let params: ListAssetTypeParams = {
    ...rest,
    page: rest.page,
    paginate: 10,
    status: rest.status,
    material_id: rest.material_id,
    keyword,
  }
  const apiUrl = `${SERVICE_API.CORE}/asset-types`
  const fetchAssetType = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListAssetTypeResponse>(fetchAssetType)

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

export async function loadAssetTypeWithData(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    temperature_thresholds?: number[]
    material_id?: string
    status?: number
    another_option?: OptionType[]
    is_warehouse?: number
    is_cce?: number
  }
) {
  const { another_option, temperature_thresholds, ...rest } = additional
  let params: ListAssetTypeParams = {
    page: rest.page,
    paginate: 10,
    status: rest.status,
    material_id: rest.material_id,
    is_warehouse: rest.is_warehouse,
    is_cce: rest.is_cce,
    keyword,
  }
  const apiUrl = `${SERVICE_API.CORE}/asset-types`
  const fetchAssetType = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListAssetTypeResponse>(fetchAssetType)

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

  const order = additional?.temperature_thresholds || []

  let options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
    data: {
      ...item,
      temperature_thresholds: item?.temperature_thresholds?.toSorted(
        (a, b) =>
          order.indexOf(a?.temperature_threshold_id ?? 0) -
          order.indexOf(b?.temperature_threshold_id ?? 0)
      ),
    },
  }))

  return {
    options:
      additional?.another_option && additional.page === 1
        ? [...(additional?.another_option ?? []), ...options]
        : options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
