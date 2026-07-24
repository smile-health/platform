import { BOOLEAN } from '#constants/common'
import axios from '#lib/axios'
import { ActivityData } from '#types/activity'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

export type GetActivitiesParams = TCommonFilter & {
  keyword?: string
  lang?: string
  entity_id?: string
  is_ongoing?: number
  status?: number
  code?: string
  program_id?: number
}

export type GetActivitiesResponse = TCommonResponseList & {
  data: ActivityData[]
  statusCode?: number
  nextPage?: number
}

export type CreateActivityInput = {
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
}

export async function listActivities(
  params: GetActivitiesParams
): Promise<GetActivitiesResponse> {
  const programId = params?.program_id
  delete params.program_id

  const response = await axios.get('/main/activities', {
    params,
    cleanParams: true,
    programId,
    headers: {
      'Accept-Language': params.lang,
    },
  })
  return handleAxiosResponse<GetActivitiesResponse>(response)
}

export async function getFullActivities(): Promise<GetActivitiesResponse> {
  const response = await axios.get('/main/activities', {
    params: {
      page: 1,
      paginate: 100,
      active: BOOLEAN.TRUE,
    },
  })
  return handleAxiosResponse<GetActivitiesResponse>(response)
}

export async function loadActivityOptions(
  keyword: string,
  _: any,
  additional: Omit<GetActivitiesParams, 'paginate' | 'keyword'>
) {
  const result = await listActivities({
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
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional?.page + 1,
    },
  }
}

export async function loadActivitySelection(
  keyword: string,
  additional:
    | {
        page?: number
      }
    | undefined
) {
  const result = await listActivities({
    keyword,
    page: additional?.page as number,
    paginate: 10,
  })

  if (result?.statusCode === 204 || result?.data?.length === 0) {
    return {
      options: [],
      nextPage: null,
    }
  }

  return {
    options: result?.data,
    nextPage: (additional?.page as number) + 1,
  }
}
