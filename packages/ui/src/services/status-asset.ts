import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

const SERVICE = SERVICE_API.PLATFORM

type ListStatusAssetParams = {
  page: number
  paginate: number
  keyword?: string
  material_id?: string
}

export type TStatusAsset = {
  id: number
  name: string
}

export type TListStatusAssetResponse = TCommonResponseList & {
  data: TStatusAsset[]
  statusCode: number
}

export async function listStatusAsset(
  params: ListStatusAssetParams
): Promise<TListStatusAssetResponse> {
  const apiUrl = `${SERVICE_API.CORE}/asset-working-statuses`
  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<TListStatusAssetResponse>(response)
}

export async function loadStatusAsset(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    material_id: string
  }
) {
  let params: ListStatusAssetParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    material_id: additional.material_id,
  }

  const result = await listStatusAsset(params)

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
