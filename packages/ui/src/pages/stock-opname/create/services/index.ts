import { STATUS } from '#constants/common'
import axios from '#lib/axios'
import { ListManufacturersParams, ListManufacturersResponse } from '#services/manufacturer'
import { ListStockParams, ListStockResponse } from '#services/stock'
import { TManufacturer } from '#types/manufacturer'
import { handleAxiosResponse } from '#utils/api'
import dayjs from 'dayjs'

import {
  CreateStockOpnameBody,
  ListColdStoragesResponse,
  ListPeriodeResponse,
} from '../types'

const baseURL = process.env.API_URL
const baseURLAlt = process.env.API_URL_ALT

const defaultResponse = {
  statusCode: 204,
  list: [],
  total: 0,
  page: '0',
  perPage: '0',
}

export async function loadPeriode(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    status?: number
    cut_off_time: string
    locale: string
  }
) {
  const params = {
    keyword,
    page: additional.page,
    status: additional.status,
    paginate: 10,
  }

  const response = await axios.get<ListPeriodeResponse>(
    '/main/stock-opname-periods',
    {
      params,
      cleanParams: true,
    }
  )

  if (response?.status === 204 || params.page > response.data.total_page)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = response?.data?.data?.map((item) => ({
    label: `${item?.name} ${item?.cutoff_date ?  `( ${additional.cut_off_time}: ${dayjs(item?.cutoff_date.replace('Z', '')).locale(additional.locale).format('DD MMM YYYY HH:mm').toUpperCase()})` : ''}`,
    value: item?.id,
    month_period: item.month_period,
    year_period: item.year_period,
    start_period: item.start_date,
    end_period: item.end_date,
  }))

  return {
    options,
    hasMore: response?.data?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function listStock(
  params: ListStockParams
): Promise<ListStockResponse> {
  const response = await axios.get('/main/stocks/entities/sort', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function listColdStorages(params: {
  entity_id: number
}): Promise<ListColdStoragesResponse> {
  const response = await axios.get('/coldstorages', {
    params,
    cleanParams: true,
    baseURL: baseURLAlt,
  })

  return handleAxiosResponse<ListColdStoragesResponse>(
    response,
    defaultResponse
  )
}

export async function loadStock(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    period_id: number
    entity_id: number
    material_ids: number[]
    with_details?: number
    material_level_id?: string
  }
) {
  let params: ListStockParams = {
    page: additional.page,
    paginate: 100,
    keyword,
    with_details: 1,
    period_id: additional.period_id,
    entity_id: additional.entity_id,
    ...additional.material_level_id && {
      material_level_id: additional.material_level_id,
    },
  }

  const response = await listStock(params)

  const options = response?.data
    ?.filter((x) => (x.material?.id && !additional.material_ids.includes(x.material?.id)))
    .map((item) => ({
      label: item?.material?.name,
      value: item?.material?.id,
      stock: item,
    }))

  return {
    options,
    hasMore: response?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadManufacturer(
  keyword: string,
  _: unknown,
  additional: {
    material_id: number
    page: number
  }
) {
  let params: ListManufacturersParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    status: STATUS.ACTIVE,
    material_id: additional.material_id,
  }

  const fetchTransactionManufacturer = await axios.get(
    `/main/manufactures`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListManufacturersResponse>(
    fetchTransactionManufacturer
  )

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

  const options = result?.data?.map((item: TManufacturer) => ({
    label: item.name,
    value: item.id,
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

export async function createStockOpname(data: CreateStockOpnameBody) {
  const response = await axios.post('/main/stock-opnames', data, {
    cleanBody: true,
  })

  return response
}

export async function updateStockOpname(data: CreateStockOpnameBody) {
  const response = await axios.put('/main/stock-opnames', data, {
    cleanBody: true,
  })

  return response
}
