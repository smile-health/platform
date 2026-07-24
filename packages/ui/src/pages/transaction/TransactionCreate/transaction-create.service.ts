import { SERVICE_API } from '#constants/api'
import { STATUS } from '#constants/common'
import axios from '#lib/axios'
import {
  GetEntityCustomersResponse,
  ListEntitiesParams,
} from '#services/entity'
import { TEntities, TEntityCustomer } from '#types/entity'
import { handleAxiosResponse } from '#utils/api'

import {
  CreateTransactionDiscardBody,
  CreateTransactionDiscardResponse,
  ListEntitiesResponse,
  listEntityActivitiesParams,
  listEntityActivitiesReponse,
  ListStockDetailStockParams,
  ListStockDetailStockResponse,
  ListStockParams,
  ListStockResponse,
  ListTransactionTypeParams,
  ListTransactionTypeResponse,
  ParamsEntityCustomer,
  TransactionType,
} from './transaction-create.type'
import { setDisabledMaterialActivityIsNotAvailable, setDisabledMaterialStockZero } from './transaction-create.util'

const MAIN_SERVICE = SERVICE_API.MAIN

export async function loadEntity(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    isSuperAdmin?: boolean
    defaultOptions: {
      value: number
      label: string
    }
  }
) {
  let params: ListEntitiesParams = {
    page: additional.page,
    paginate: 10,
    is_vendor: STATUS.ACTIVE,
    keyword,
  }
  if (!additional.isSuperAdmin) {
    return {
      options: [additional.defaultOptions],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }
  const fetchEntityList = await axios.get(`${MAIN_SERVICE}/entities`, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListEntitiesResponse>(fetchEntityList)

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

  const options = result?.data?.map((item: TEntities) => ({
    label: item?.name,
    value: item?.id,
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

export async function loadTransactionType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: ListTransactionTypeParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchTransactionTypeList = await axios.get(
    `${MAIN_SERVICE}/transactions/type`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListTransactionTypeResponse>(
    fetchTransactionTypeList
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

  const options = result?.data?.map((item: TransactionType) => ({
    label: item?.title,
    value: item?.id,
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

export async function listEntityActivities({
  id,
  params,
}: listEntityActivitiesParams): Promise<listEntityActivitiesReponse> {
  const response = await axios.get(
    `${MAIN_SERVICE}/entities/${id}/activities`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function listStockConsumptions(
  params: ListStockParams
): Promise<ListStockResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/stock-consumptions`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function listStock(
  params: ListStockParams
): Promise<ListStockResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/stocks/entities`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function listStockDetailStock(
  params: ListStockDetailStockParams
): Promise<ListStockDetailStockResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/stocks/details`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockDetailStockResponse>(response)
}

export async function createTransactionDiscard(
  data: CreateTransactionDiscardBody
): Promise<CreateTransactionDiscardResponse> {
  const response = await axios.post(
    `${MAIN_SERVICE}/transactions/discard-stock`,
    data
  )

  return response.data
}

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    type: string
    activity_id: number
    entity_id: number
    material_ids: number[]
    is_addremove?: number
  }
) {
  let params: ListStockParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    material_level_id: 3,
    activity_id: additional.activity_id,
    entity_id: additional.entity_id,
    is_addremove: additional.is_addremove,
  }

  const response = await listStock(params)

  if (response?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = response?.data
    ?.filter((x) => !additional.material_ids.includes(x.material?.id as number))
    .map((item) => ({
      label: item?.material?.name,
      value: item?.material?.id,
      stock: item,
      isDisabled: setDisabledMaterialStockZero(Number(additional.type), item?.aggregate?.total_available_qty ?? 0) ||
        setDisabledMaterialActivityIsNotAvailable(Number(additional.type), item),
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

export async function loadCustomer(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    entity_id: number
    activity_id: number
  }
) {
  if (!additional.activity_id || !additional.entity_id) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  let params: ParamsEntityCustomer = {
    page: additional.page,
    paginate: 10,
    keyword,
    is_consumption: 1,
    activity_id: additional.activity_id,
  }

  const fetchEntityCustomerList = await axios.get(
    `${MAIN_SERVICE}/entities/${additional.entity_id}/customers`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<GetEntityCustomersResponse>(
    fetchEntityCustomerList
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

  const options = result?.data?.map((item: TEntityCustomer) => ({
    label: item?.name,
    value: item?.id,
    is_open_vial: item?.is_open_vial,
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
