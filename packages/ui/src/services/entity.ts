import { OptionType } from '#components/react-select'
import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  TEntityForm as CreateEntityBody,
  TDetailEntity as DetailEntityResponse,
  TDetailActivityDate,
  TDetailEntityCustomer,
  TEntities,
  TEntityCustomer,
  TEntityVendor,
  TMaterialEntity,
  TPayloadMaterialEntity,
  TSubmitActivityImplementationTime,
  TUpdateMaterialEntity,
} from '../types/entity'

type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

export type GetEntityTagResponse = TCommonResponseList & {
  data: Array<{ id: number; title: string }>
}

export type GetEntityTypeResponse = TCommonResponseList & {
  data: Array<{ id: number; name: string }>
}

export type GetEntityVendorsResponse = TCommonResponseList & {
  data: TEntityVendor[]
  statusCode: number
}

export type GetEntityCustomersResponse = TCommonResponseList & {
  data: TEntityCustomer[]
  statusCode: number
}

export type TSelectCustomerOptions = TCommonResponseList & {
  data: { name: string; id: number }[]
} & {
  statusCode: number
}

type ListEntityUsersResponse = TCommonResponseList & {
  data: Array<{
    username: string
    full_name: string
    role: string
    phone_number: string
  }>
}

export type GetMaterialEntityResponse = TCommonResponseList & {
  data: TMaterialEntity[]
}

export type ListEntitiesParams = {
  page: string | number
  paginate: string | number
  keyword?: string
  type_ids?: string | number
  entity_tag_ids?: string | number
  province_ids?: string
  regency_ids?: string
  sub_district_ids?: string
  village_ids?: string
  beneficiaries_ids?: string
  program_ids?: string
  is_vendor?: number
  lang?: string
  is_asset?: number
  province_id?: string
  regency_id?: string
  sub_district_id?: string
  id_satu_sehat?: string
  integration_client_id?: number
}

const core_base_url = '/core/entities'
const main_base_url = '/main/entities'

export async function listEntities(
  params: ListEntitiesParams
): Promise<ListEntitiesResponse> {
  const response = await axios.get(main_base_url, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListEntitiesResponse>(response)
}

export async function detailEntity(id: string): Promise<DetailEntityResponse> {
  const response = await axios.get(`${main_base_url}/${id}`, {
    redirect: true,
  })

  return response?.data
}

export async function getEntityVendor(
  id: string,
  params?: ParamsEntityCustomer
): Promise<GetEntityVendorsResponse> {
  const response = await axios.get(`${main_base_url}/${id}/vendors`, {
    params,
    cleanParams: true,
  })

  return response?.data
}

type ParamsEntityCustomer = {
  is_vendor?: number
  is_consumption?: number
  keyword?: string
  page?: number
  paginate?: number
}
export async function getEntityCustomer(
  id: string,
  params?: ParamsEntityCustomer
): Promise<GetEntityCustomersResponse> {
  const response = await axios.get(`${main_base_url}/${id}/customers`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetEntityCustomersResponse>(response)
}

export type TCustomerForm = {
  customer: OptionType
  activity: OptionType[]
}

export type TPayloadEntityCustomerInput = {
  is_consumption: number
  customers: TCustomerForm[] | []
}
export async function createEntityCustomer(
  id: string,
  rawData: TPayloadEntityCustomerInput
): Promise<TDetailEntityCustomer> {
  const data = {
    entity_id: Number(id),
    is_consumption: rawData?.is_consumption?.toString(),
    add: rawData?.customers?.map((item) => ({
      entity_id_relation: Number(item.customer?.value),
      activity_ids: item.activity.map((activity) => Number(activity?.value)),
    })),
  }
  const response = await axios.post(`${main_base_url}/customers`, data)

  return response?.data
}
export async function updateEntityCustomer(
  id: string,
  rawData: TPayloadEntityCustomerInput
): Promise<TDetailEntityCustomer> {
  const data =
    rawData?.customers.length > 0
      ? {
        entity_id_relation: Number(rawData?.customers[0]?.customer?.value),
        activity_ids: rawData?.customers[0]?.activity?.map((item) =>
          Number(item?.value)
        ),
        entity_id: Number(id),
      }
      : null
  const response = await axios.put(`${main_base_url}/customers`, data)

  return response?.data
}

type ParamsEntityUser = TCommonFilter & { keyword?: string }
export async function listEntityUser(
  id: string,
  params?: ParamsEntityUser
): Promise<ListEntityUsersResponse> {
  const response = await axios.get(`${main_base_url}/${id}/users`, {
    params,
  })

  return handleAxiosResponse<ListEntityUsersResponse>(response)
}

export async function createEntity(
  data: CreateEntityBody
): Promise<DetailEntityResponse> {
  const response = await axios.post(`${core_base_url}`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateEntity(
  id: string,
  data: CreateEntityBody | TSubmitActivityImplementationTime
): Promise<DetailEntityResponse> {
  const response = await axios.put(`${core_base_url}/${id}`, data)

  return response?.data
}

export async function updateStatusEntity(
  id: string,
  data: { status: string }
): Promise<DetailEntityResponse> {
  const response = await axios.put(`${main_base_url}/${id}/status`, data)

  return response?.data
}

export async function updateStatusEntityVendor(
  id: string,
  data: { status: string; is_relocation: string }
): Promise<DetailEntityResponse> {
  const response = await axios.put(
    `${main_base_url}/${id}/status/vendors`,
    data
  )

  return response?.data
}

export async function downloadEntityTemplate() {
  const response = await axios.get(`${main_base_url}/xls-template`, {
    responseType: 'blob',
  })
  parseDownload(response?.data, response?.headers?.filename ?? 'entity.xlsx')

  return response?.data
}

export async function downloadEntityGlobalTemplate() {
  const response = await axios.get(`${core_base_url}/xls-template`, {
    responseType: 'blob',
  })
  parseDownload(response?.data, response?.headers?.filename ?? 'entity.xlsx')

  return response?.data
}

export async function downloadCustomerTemplate(id: string) {
  const response = await axios.get(
    `${main_base_url}/${id}/customers/xls-template`,
    {
      responseType: 'blob',
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

type ParamsExportEntities = Omit<ListEntitiesParams, 'page' | 'paginate'>
export async function exportEntities(params?: ParamsExportEntities) {
  const response = await axios.get(`${main_base_url}/xls`, {
    params,
    cleanParams: true,
  })

  return response?.data
}

export async function exportGlobalEntities(params?: ParamsExportEntities) {
  const response = await axios.get(`${core_base_url}/xls`, {
    params,
    cleanParams: true,
  })

  return response?.data
}

export async function exportEntityCustomer(
  id: string,
  params: ParamsEntityCustomer
) {
  const response = await axios.get(`${main_base_url}/${id}/customers/xls`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'entity-customer.xlsx'
  )

  return response?.data
}

export async function importEntities(data: FormData) {
  const response = await axios.post(`${core_base_url}/xls`, data)

  return response?.data
}

export async function importMainEntities(data: FormData) {
  const response = await axios.post(`${main_base_url}/xls`, data)

  return response?.data
}

export async function importEntityCustomer(id: string, data: FormData) {
  const response = await axios.post(
    `${main_base_url}/${id}/customers/xls`,
    data
  )

  return response?.data
}

export async function getEntityTag(
  params: ListEntitiesParams
): Promise<GetEntityTagResponse> {
  const response = await axios.get('/main/entity-tags', {
    params,
    cleanParams: true,
    headers: {
      'Accept-Language': params?.lang,
    },
  })

  return handleAxiosResponse<GetEntityTagResponse>(response)
}

export async function getGlobalEntityTag(
  params: ListEntitiesParams
): Promise<GetEntityTagResponse> {
  const response = await axios.get('/core/entity-tags', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetEntityTagResponse>(response)
}

type ParamsEntityType = TCommonFilter & { keyword?: string }
export async function getEntityType(
  params: ParamsEntityType
): Promise<GetEntityTypeResponse> {
  const response = await axios.get('/main/entity-types', { params })

  return handleAxiosResponse<GetEntityTypeResponse>(response)
}

export async function getGlobalEntityType(
  params: ParamsEntityType
): Promise<GetEntityTypeResponse> {
  const response = await axios.get('/core/entity-types', { params })

  return handleAxiosResponse<GetEntityTypeResponse>(response)
}

export type ParamsMaterialEntity = {
  page: string | number
  paginate: string | number
  keyword?: string
  activity_id?: string
}
export async function getMaterialEntity(
  entityId: string,
  params: ParamsMaterialEntity
): Promise<GetMaterialEntityResponse> {
  const response = await axios.get(`${main_base_url}/${entityId}/materials`, {
    params,
    cleanParams: true,
  })

  return response?.data
}

export async function v2AddMaterialEntity(
  entityId: string,
  rawData: TUpdateMaterialEntity
): Promise<GetMaterialEntityResponse> {
  const data = {
    ...rawData,
    activity_id: (rawData.activity_id as { value: number })?.value,
    material_id: (rawData.material_id as { value: number })?.value,
    id: Number(entityId),
    entity_id: Number(entityId),
    min: Number(rawData.min),
    max: Number(rawData.max),
    consumption_rate: Number(rawData.consumption_rate),
    retailer_price: Number(rawData.retailer_price),
    tax: Number(rawData.tax),
  }

  const response = await axios.post(
    `${main_base_url}/${entityId}/materials`,
    data
  )

  return response?.data
}

export async function v2UpdateMaterialEntity(
  entityId: string,
  rawData: TUpdateMaterialEntity
): Promise<GetMaterialEntityResponse> {
  const data = {
    ...rawData,
    activity_id: (rawData.activity_id as { value: number })?.value,
    min: Number(rawData.min),
    max: Number(rawData.max),
    consumption_rate: Number(rawData.consumption_rate),
    retailer_price: Number(rawData.retailer_price),
    tax: Number(rawData.tax),
  }

  const response = await axios.put(
    `${main_base_url}/${entityId}/materials`,
    data
  )

  return response?.data
}

export async function v2DeleteMaterialEntity(
  id: number | string,
  entityMasterMaterialActivitiesId: number
): Promise<any> {
  const response = await axios.delete(
    `${main_base_url}/${id}/materials/${entityMasterMaterialActivitiesId}`
  )

  return response?.data
}

export async function deleteMaterialEntity(
  id: string | number
): Promise<{ message: string }> {
  const response = await axios.delete(`/main/v2/material-entity/${id}`)

  return response?.data
}

export async function createMaterialEntity(
  data: TPayloadMaterialEntity
): Promise<TMaterialEntity> {
  const response = await axios.post(`/main/v2/material-entity`, data)

  return response?.data
}

export async function updateMaterialEntity(
  id: string,
  data: TPayloadMaterialEntity
): Promise<TMaterialEntity> {
  const response = await axios.put(`/main/v2/material-entity/${id}`, data)

  return response?.data
}

export async function listCoreEntities(
  params: ListEntitiesParams
): Promise<ListEntitiesResponse> {
  const response = await axios.get(core_base_url, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListEntitiesResponse>(response)
}

export async function detailCoreEntity(
  id: string
): Promise<DetailEntityResponse> {
  const response = await axios.get(`${core_base_url}/${id}`, { redirect: true })

  return response?.data
}

export async function loadEntities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_vendor?: number
    type_ids?: number
    province_ids?: string
    regency_ids?: string
    sub_district_ids?: string
    is_asset?: number
    province_id?: string
    regency_id?: string
    sub_district_id?: string
    another_option?: OptionType[]
    integration_client_id?: number
    isGlobal?: boolean,
    entity_tag_ids?: string | number
  }
) {
  const apiUrl = `${additional?.isGlobal ? '/core' : '/main'}/entities`
  const response = await axios.get(apiUrl, {
    params: {
      paginate: 10,
      keyword,
      ...additional,
    },
    cleanParams: true,
  })
  const result = handleAxiosResponse<ListEntitiesResponse>(response)

  if (result?.statusCode === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  let options: Array<{
    label: string
    value: string | number
    province_id?: string
    regency_id?: string
  }> = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
    province_id: item?.province_id,
    regency_id: item?.regency_id,
  }))

  return {
    options: additional.another_option
      ? [...additional.another_option, ...options]
      : options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadCoreEntities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_vendor?: number
    type_ids?: number
    province_ids?: string
    regency_ids?: string
    sub_district_ids?: string
    another_option?: OptionType[]
    is_asset?: number
    entity_tag_ids?: string | number
  }
) {
  const result = await listCoreEntities({
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
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
    programs: item?.programs,
    beneficiaries: item?.beneficiaries,
    integration_client_id: item?.integration_client_id,
  }))

  return {
    options: additional?.another_option
      ? [...(additional?.another_option ?? []), ...options]
      : options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function getListRelationCustomers(
  id: string,
  params?: {
    keyword?: string
    page: number
    paginate: number
    is_consumption: number
  }
): Promise<TSelectCustomerOptions> {
  const response = await axios.get(
    `${main_base_url}/${id}/customers/list-relation-customers`,
    { params, cleanParams: true }
  )

  return response?.data
}

export async function loadEntityCustomerOptions(
  keyword: string,
  _: any,
  additional: {
    page: number
    paginate: number
    is_consumption: number
    id: string
    keyword?: string
    is_for_create?: boolean
  }
) {
  const { id: entity_id, is_for_create = true, ...restParams } = additional

  const result = is_for_create
    ? await getListRelationCustomers(entity_id, {
      ...restParams,
      keyword,
    })
    : await getEntityCustomer(entity_id, {
      ...restParams,
      keyword,
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
      page: additional.page + 1,
    },
  }
}

export async function deleteEntityCustomers(
  id: string,
  customer_ids: number[]
): Promise<{ message: string }> {
  const response = await axios.delete(`${main_base_url}/customers`, {
    data: {
      entity_ids_relation: customer_ids,
      entity_id: Number(id),
    },
  })

  return response?.data
}

export async function listEntityActivitiesDate(
  id: string | number,
  params?: {
    is_ongoing?: number
    is_ordered_purchase?: number
    is_ordered_sales?: number
  }
): Promise<TDetailActivityDate[]> {
  const response = await axios.get(`${main_base_url}/${id}/activities`, {
    params,
  })

  return response?.data
}

export async function updateActivityImplementationTime(
  id: string,
  rawData: CreateEntityBody | TSubmitActivityImplementationTime
): Promise<DetailEntityResponse> {
  const data = { ...rawData, entity_id: Number(id) }
  const response = await axios.post(
    `${main_base_url}/activities/submit-time`,
    data
  )

  return response?.data
}

export async function loadEntityTags(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    isGlobal: boolean
    lang?: string
  }
) {
  let result

  if (additional.isGlobal) {
    result = await getGlobalEntityTag({
      paginate: 10,
      keyword,
      ...additional,
    })
  } else {
    result = await getEntityTag({
      paginate: 10,
      keyword,
      ...additional,
    })
  }

  if (result?.data.length === 0)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.map((item) => ({
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

export async function loadEntityCustomer(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    id: string
    is_consumption: number
    is_vendor?: number
    activity_id?: number
  }
) {
  const { id, ...restParams } = additional
  const result = await getEntityCustomer(id, {
    paginate: 10,
    keyword,
    ...restParams,
  })

  if (result?.statusCode === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
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

export async function loadEntityTypes(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    isGlobal: boolean
    lang?: string
  }
) {
  let result

  if (additional.isGlobal) {
    result = await getGlobalEntityType({
      paginate: 10,
      keyword,
      ...additional,
    })
  } else {
    result = await getEntityType({
      paginate: 10,
      keyword,
      ...additional,
    })
  }

  if (result?.data.length === 0)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
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
      page: additional.page + 1,
    },
  }
}
