import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { ListEntitiesParams } from '#services/entity'
import { TEntities } from '#types/entity'
import { handleAxiosResponse } from '#utils/api'

import {
  ListEntitiesResponse,
  listEntityActivitiesParams,
  listEntityActivitiesReponse,
  ListStockExterminationParams,
  ListStockExterminationResponse,
} from '../types/DistributionDisposal'

export async function listStockExtermination(
  params: ListStockExterminationParams
) {
  const response = await axios.get(`${SERVICE_API.MAIN}/disposal/stocks/detail`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockExterminationResponse>(response)
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

export async function loadEntity(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_vendor?: number
    // isSuperAdmin?: boolean
    // defaultOptions?: {
    //   value: number
    //   label: string
    // }
  }
) {
  // if (!additional.isSuperAdmin) {
  //   return {
  //     options: [additional.defaultOptions],
  //     hasMore: false,
  //     additional: {
  //       ...additional,
  //       page: additional.page + 1,
  //     },
  //   }
  // }

  let params: ListEntitiesParams = {
    page: additional.page,
    is_vendor: additional.is_vendor,
    paginate: 10,
    keyword,
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

export async function loadVendor(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    id?: number
  }
) {
  let params: ListEntitiesParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  if (!additional.id) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const fetchVendorList = await axios.get(
    `${SERVICE_API.MAIN}/entities/${additional.id}/vendors`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<any>(fetchVendorList)

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
    code: item?.code,
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
