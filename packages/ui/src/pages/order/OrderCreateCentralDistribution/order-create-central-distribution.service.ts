import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

import {
  DetailBudgetSourceResponse,
  TContractNumber,
  TEntityMaterial,
  TOrderItem,
} from './order-create-central-distribution.type'

export type ListContractNumbersParams = TCommonFilter & {
  keyword?: string
  is_available?: number
  commitment_id?: string
}

export type ListContractNumbersResponse = TCommonResponseList & {
  data: TContractNumber[]
}

export type ListEntityMaterialsParams = TCommonFilter & {
  keyword?: string
  activity_id?: string
}

export type ListEntityMaterialsResponse = TCommonResponseList & {
  data: TEntityMaterial[]
}

export type ListBudgetSourceParams = TCommonFilter & {
  keyword?: string
  status?: number
}

export type ListBudgetSourceResponse = TCommonResponseList & {
  data: DetailBudgetSourceResponse[]
  statusCode?: number
}

export type CreateOrderCentralDistributionBody = {
  vendor_id: number
  activity_id: number
  customer_id: number
  delivery_type_id: number
  required_date: string | null
  do_number: string
  po_number: string
  order_comment: string
  order_items: TOrderItem[]
}

type CreateOrderCentralDistributionResponse = {
  id: number
}

export async function listContractNumbers(params: ListContractNumbersParams) {
  const response = await axios.get('/main/contracts', { params })

  return handleAxiosResponse<ListContractNumbersResponse>(response)
}

export async function listEntityMaterials(
  id: string,
  params: ListEntityMaterialsParams
) {
  const response = await axios.get(`/main/entities/${id}/materials`, {
    params,
  })

  return handleAxiosResponse<ListEntityMaterialsResponse>(response)
}

export async function listBudgetSource(params: ListBudgetSourceParams) {
  const response = await axios.get('/main/budget-sources', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListBudgetSourceResponse>(response)
}

export async function createOrderCentralDistribution(
  data: CreateOrderCentralDistributionBody
) {
  const response = await axios.post<CreateOrderCentralDistributionResponse>(
    '/main/orders/central-distribution',
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data
}

export async function loadContractNumbers(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    po_number?: string
    label?: string
    is_available?: number
    commitment_id?: string
  }
) {
  const result = await listContractNumbers({
    keyword,
    commitment_id: additional?.commitment_id,
    is_available: additional?.is_available,
    page: additional?.page,
    paginate: 10,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page,
      },
    }
  }
  const createOption = [
    {
      label: additional?.label as string,
      value: additional?.po_number as string,
    },
  ]

  const options = result?.data?.map((item) => ({
    label: item?.contract_number,
    value: item?.id,
  }))

  return {
    options:
      additional?.po_number && additional.page === 1
        ? [...createOption, ...options]
        : options,
    hasMore: Boolean(result?.data?.length),
    additional: {
      page: additional?.page + 1,
    },
  }
}

export async function loadEntityMaterials(
  keyword: string,
  _: unknown,
  additional: {
    id: string
    page: number
    activity_id?: string
    material_ids: number[]
  }
) {
  const { id, material_ids, ...restParams } = additional
  const params = {
    ...restParams,
    keyword,
    paginate: 10,
  }

  const response = await listEntityMaterials(id, params)

  if (response?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page,
      },
    }
  }

  const options = response?.data
    ?.filter((x) => !additional.material_ids.includes(x?.material_id))
    .map((item) => ({
      label: item?.name,
      value: item,
    }))

  return {
    options,
    hasMore: Boolean(response?.data?.length),
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadBudgetSource(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    status?: number
  }
) {
  const result = await listBudgetSource({
    keyword,
    page: additional?.page,
    status: additional?.status,
    paginate: 10,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page,
        status: additional?.status,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: Boolean(result?.data?.length),
    additional: {
      page: additional?.page + 1,
    },
  }
}
