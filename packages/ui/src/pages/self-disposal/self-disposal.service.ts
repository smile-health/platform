import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { ListEntitiesParams } from '#services/entity'
import { getMaterials, GetMaterialsParams } from '#services/material'
import { TEntities } from '#types/entity'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  ListEntitiesResponse,
  ListSelfDisposalParams,
  ListSelfDisposalResponse,
  ListStockParams,
  ListStockResponse,
} from './self-disposal.type'

const MAIN_SERVICE = SERVICE_API.MAIN

export async function loadEntity(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    isSuperAdmin?: boolean
    is_vendor?: number
    defaultOptions: {
      value: number
      label: string
    }
  }
) {
  let params: ListEntitiesParams = {
    page: additional.page,
    paginate: 10,
    is_vendor: additional.is_vendor,
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

export async function loadMethod() {
  // /disposal/methods
  const result = await axios.get(`${MAIN_SERVICE}/disposal/methods`, {
    params: {
      page: 1,
      paginate: 100,
    },
    cleanParams: true,
  })

  const options = result.data.data.map((item: any) => ({
    label: item?.title,
    value: item?.id,
  })) as Array<{
    value: any
    label: string
  }>

  return options
}

export async function loadMethodV2(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {

  let params = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await axios.get(`${MAIN_SERVICE}/disposal/methods`, {
    params,
    cleanParams: true,
  })

  const options = result.data.data.map((item: any) => ({
    label: item?.title,
    value: item?.id,
  })) as Array<{
    value: any
    label: string
  }>

  if (result?.status === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  return {
    options,
    hasMore: false,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadActivity(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    id: number
  }
) {
  let params = {
    page: additional.page,
    paginate: 10,
    keyword,
    is_ongoing: 1,
  }

  const result = await axios.get(
    `${MAIN_SERVICE}/entities/${additional.id}/activities`,
    {
      params,
      cleanParams: true,
    }
  )

  if (result?.status === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  // @ts-ignore
  const options = result.data.map((item: TEntities) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    hasMore: false,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function listStock(
  params: ListStockParams
): Promise<ListStockResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/disposal/stocks/detail`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function listSelfDisposal(
  params: ListSelfDisposalParams
): Promise<ListSelfDisposalResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/disposal/self-disposal`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListSelfDisposalResponse>(response)
}

export async function exportSelfDisposal(
  params: ListSelfDisposalParams
): Promise<ListSelfDisposalResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/disposal/self-disposal/xls`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export type CreateSelfDisposalPayload = {
  disposal_method_id: number | undefined
  activity_id: number | undefined
  entity_id: number | undefined
  report_number: string | undefined
  comment: string
  disposal_items: Array<{
    disposal_stock_id: number
    transaction_reason_id: number
    disposal_discard_qty: number
    disposal_received_qty: number
  }> | undefined
}

export async function createSelfDisposal(
  data: CreateSelfDisposalPayload
) {
  const response = await axios.post(`${MAIN_SERVICE}/disposal/self-disposal`, data)

  return response?.data
}

export async function loadReason(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    transaction_type_id: number
  }
) {
  let params = {
    ...additional,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await axios.get(
    '/main/transactions/reason',
    {
      params,
      cleanParams: true,
    }
  )

  if (result?.status === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.data?.map((item: { title: string; id: number }) => ({
    label: item?.title as string,
    value: item?.id as number,
  }))

  return {
    options,
    hasMore: result?.data?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional?: {
    page: number | undefined
    material_level_id: string
  }
) {
  let params: GetMaterialsParams = {
    ...additional,
    page: additional?.page ?? 1,
    paginate: 10,
    keyword,
    material_level_id: additional?.material_level_id,
  }

  const result = await getMaterials(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page ? additional?.page + 1 : 1,
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
      page: additional?.page ? additional?.page + 1 : 1,
      material_level_id: params.material_level_id,
    },
  }
}