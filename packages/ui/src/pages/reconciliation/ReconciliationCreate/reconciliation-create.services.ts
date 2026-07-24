import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { ListEntitiesParams } from '#services/entity'
import { ListStockResponse } from '#services/stock'
import { TEntities } from '#types/entity'
import { handleAxiosResponse } from '#utils/api'

import {
  ListActionParams,
  ListActionResponse,
  ListEntitiesResponse,
  listEntityActivitiesParams,
  listEntityActivitiesReponse,
  ListReasonParams,
  ListReasonResponse,
  ListStockParams,
  ReconciliationGenerateParams,
  ReconciliationGenerateResponse,
  ReconciliationPayload,
} from './reconciliation-create.type'

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
    is_vendor: 1,
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
  const fetchEntityList = await axios.get(`${SERVICE_API.MAIN}/entities`, {
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

export async function listStock(
  params: ListStockParams
): Promise<ListStockResponse> {
  const response = await axios.get(`${SERVICE_API.MAIN}/stocks/entities`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function listEntityActivities({
  id,
  params,
}: listEntityActivitiesParams): Promise<listEntityActivitiesReponse> {
  const response = await axios.get(
    `${SERVICE_API.MAIN}/entities/${id}/activities`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getReconciliationGenerate(
  params: ReconciliationGenerateParams
) {
  const response = await axios.get(
    `${SERVICE_API.MAIN}/reconciliation/generate`,
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<ReconciliationGenerateResponse>(response)
}

export async function loadReasonReconciliation(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: ListReasonParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchReasonReconciliation = await axios.get(
    `${SERVICE_API.MAIN}/reconciliation/reasons`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListReasonResponse>(
    fetchReasonReconciliation
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

  const options = result?.data?.map((item) => ({
    label: item.title,
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

export async function loadActionReconciliation(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: ListActionParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchActionReconciliation = await axios.get(
    `${SERVICE_API.MAIN}/reconciliation/actions`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListActionResponse>(
    fetchActionReconciliation
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

  const options = result?.data?.map((item) => ({
    label: item.title,
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

export async function createReconciliation(data: ReconciliationPayload) {
  const response = await axios.post(
    `${SERVICE_API.MAIN}/reconciliation`,
    data,
    {
      cleanBody: true,
    }
  )

  return response?.data
}
