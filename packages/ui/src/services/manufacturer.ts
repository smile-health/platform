import { OptionType } from '#components/react-select'
import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { TManufacturer } from '#types/manufacturer'
import { handleAxiosResponse } from '#utils/api'

//list
export type ListManufacturersParams = TCommonFilter & {
  keyword?: string
  status?: number
  type?: string
  material_id?: number
  program_ids?: string
}

export type ListManufacturersResponse = TCommonResponseList & {
  data: Array<TManufacturer>
  statusCode: number
}

export async function listManufacturers(
  params: ListManufacturersParams
): Promise<ListManufacturersResponse> {
  const response = await axios.get('/core/manufactures', {
    params,
  })
  return handleAxiosResponse<ListManufacturersResponse>(response)
}

export async function listPlatformManufacturers(
  params: ListManufacturersParams
): Promise<ListManufacturersResponse> {
  const response = await axios.get('/main/manufactures', {
    params,
  })
  return handleAxiosResponse<ListManufacturersResponse>(response)
}

export async function loadManufacturers(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    status?: number
    another_option?: OptionType[]
    asset_type_id?: number
    type?: string
  }
) {
  const result = await listManufacturers({
    paginate: 10,
    keyword,
    ...additional,
  })

  if (result?.statusCode === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.map((item) => ({
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

export async function loadPlatformManufacturers(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    status?: number
    material_id?: number
    type?: string
    asset_type_id?: number
    another_option?: OptionType[]
    isGlobal?: boolean
  }
) {
  const apiUrl = `${additional?.isGlobal ? '/core' : '/main'}/manufactures`
  const response = await axios.get(apiUrl, {
    params: {
      paginate: 10,
      keyword,
      ...additional,
    },
  })
  const result = handleAxiosResponse<ListManufacturersResponse>(response)

  if (result?.statusCode === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.map((item) => ({
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
