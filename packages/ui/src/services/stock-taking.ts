import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import dayjs from 'dayjs'

export type ListStockTakingPeriodsParams = TCommonFilter & {
  keyword?: string
  start_date: string
  end_date: string
  status?: number
}

export type ListStockTakingPeriodsResponse = TCommonResponseList & {
  data: TStockTakingPeriodsItem[]
}

export type TStockTakingPeriodsItem = {
  id?: number
  name?: string
  created_at?: string
  end_date?: string
  month_period?: number
  start_date?: string
  status: number
  updated_at?: string
  user_created_by?: TUserCreatedBy
  user_updated_by?: TUserCreatedBy
  year_period?: number | string
  si_no?: number
}

export type TUserCreatedBy = {
  id: number
  username: string
  firstname: string
  lastname?: string
  fullname: string
}

export async function listStockTakingPeriods(
  params: ListStockTakingPeriodsParams
) {
  const response = await axios.get('/main/stock-opname-periods', { params })

  return handleAxiosResponse<ListStockTakingPeriodsResponse>(response)
}

export async function loadStockTakingPeriods(
  keyword: string,
  _: unknown,
  additional: Omit<ListStockTakingPeriodsParams, 'paginate'>
) {
  const result = await listStockTakingPeriods({
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
        page: additional?.page,
      },
    }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: {
      id: item?.id,
      start: dayjs(item?.start_date).format('YYYY-MM-DD'),
      end: dayjs(item?.end_date).format('YYYY-MM-DD'),
    },
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
