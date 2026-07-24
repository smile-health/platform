import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

type ListBatchResponse = TCommonResponseList & {
  data: Array<{ id: number; code: string }>
  statusCode: number
}

const MAIN_SERVICE = SERVICE_API.MAIN

type ListBatchParams = {
  page: number
  paginate: number
  keyword?: string
  material_ids?: string
  material_level_id?: string
}

export async function listBatch(
  params: ListBatchParams
): Promise<ListBatchResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/batches`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListBatchResponse>(response)
}

export async function loadBatch(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    material_ids: string
    material_level_id: string
  }
) {
  let params: ListBatchParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    material_ids: additional.material_ids,
    material_level_id: additional.material_level_id,
  }

  const result = await listBatch(params)

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
    label: item?.code,
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
