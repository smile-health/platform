import { BOOLEAN, STATUS } from '#constants/common'
import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import {
  TMaterial,
  TMaterialBiofarmaList,
  TMaterialList,
} from '#types/material'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { removeEmptyObject } from '#utils/object'

export type GetMaterialBiofarmaParams = TCommonFilter & {
  page?: number
  paginate?: number
  sort_by_name?: string
  sort_by_program?: string
  sort_by_material_type?: string
  sort_by_material_level?: string
  sort_by_managed_in_batch?: string
}

export type GetMaterialsParams = TCommonFilter & {
  keyword?: string
  activity_id?: string | number
  program_ids?: string | number
  program_id?: string | number
  level_id?: string | number
  status?: string | number
  material_type_ids?: string | number
  material_level_id?: string | number | null
  type?: 'consumption' | 'distribution'
}

export type GetMaterialSubtypeParams = TCommonFilter & {
  keyword?: string
  material_type_id?: string | number | null
}

export type MaterialDetailProgramResponse = {
  addremove?: {
    entity_types?: {
      id: number
      name: string
    }[]
    roles?: number[]
  }
  bpom_code?: string
  code: string
  created_at: string
  created_by: number
  deleted_at: string
  deleted_by: string
  description: string
  global_id: number
  id: number
  is_addremove: number
  is_openvial: number
  is_stockcount: number
  material_type_ids: number
  kfa_code?: number | null
  kfa_level_id: number
  managed_in_batch: number
  is_managed_in_batch: number
  material_level: {
    id: number
    name: string
  }
  manufactures?: {
    id: number
    material_id: number
    name: string
  }[]
  mapping_master_material?: {
    asik_name: string
    code_biofarma: string
    code_bpom: string
    code_kfa_ingredients: string
    code_kfa_packaging: string
    code_kfa_product_template: string
    code_kfa_product_variant: string
    code_siha: null
    code_sitb: null
    created_at: string
    deleted_at: null
    id: number
    id_kfa: string
    id_material_smile: number
    name_kfa_ingredients: string
    name_kfa_packaging: string
    name_kfa_product_template: string
    name_kfa_product_variant: string
    name_material_smile: string
    name_siha: null
    name_sitb: null
    updated_at: string
  }
  material_activities?: MaterialActivity[]
  material_companion?: {
    id: number
    name: string
  }[]
  material_type?: {
    id: number
    name: string
  }
  material_subtype?: {
    id: number
    name: string
  }
  min_retail_price: number
  max_retail_price: number
  name: string
  need_sequence: number
  parent_id: null
  pieces_per_unit: number
  range_temperature_id: null
  status: number
  stockcount: {
    entity_types: number[]
    roles: number[]
  }
  temperature_max: number
  temperature_min: number
  temperature_sensitive: number
  unit: string
  unit_of_distribution: string
  unit_of_consumption: string
  updated_at: string
  updated_by: number
  hierarchy_code: string
  material_level_id: number
  min_temperature: number
  max_temperature: number
  is_temperature_sensitive: number
  is_open_vial: number
  consumption_unit_per_distribution_unit: number
  is_stock_opname_mandatory: number
  material_hierarchy: {
    id: number
    name: string
    materials: MaterialHierarchy[]
  }[]
}

export type MaterialActivity = {
  id: number
  is_ordered_purchase: 1 | 0
  is_ordered_sales: 1 | 0
  is_patient_needed: 1 | 0
  material_id: number
  is_patient: 1 | 0
  is_sequence: 1 | 0
  name: string
}

export type MaterialDetailGlobalResponse = {
  id: number
  name: string
  description: string
  material_level_id: number
  material_level: { id: number; name: string }
  code: string
  hierarchy_code: string
  unit_of_consumption_id: number
  unit_of_consumption?: { id: number; name: string }
  unit_of_distribution?: { id: number; name: string }
  unit_of_distribution_id: number
  consumption_unit_per_distribution_unit: number
  is_temperature_sensitive: number
  min_retail_price: number
  max_retail_price: number
  kfa_level_id: number
  min_temperature: number
  max_temperature: number
  material_type?: { id: number; name: string }
  material_type_id: number
  material_subtype?: { id: number; name: string }
  material_subtype_id: number | null
  is_managed_in_batch: number
  is_stock_opname_mandatory: number
  status: number
  created_by: number
  updated_by: number
  deleted_by: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  programs: [
    {
      id: number
      key: string
      name: string
      material_id: number
      config: {
        material: {
          is_hierarchy_enabled: boolean
          is_batch_enabled: boolean
        }
      }
    },
  ]
  user_created_by: {
    id: number
    username: string
    firstname: string
    lastname: string
  }
  user_updated_by: {
    id: number
    username: string
    firstname: string
    lastname: string
  }
}

export type TMaterialUnit = {
  id: number
  name: string
  type: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type TMaterialType = {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type GetMaterialTypesResponse = TCommonResponseList & {
  data: TMaterialType[]
  statusCode: number
}

export type GetMaterialUnitResponse = TCommonResponseList & {
  data: TMaterialUnit[]
  statusCode: number
}

export type GetProgramMaterialsResponse = TCommonResponseList & {
  data: TMaterial[]
  statusCode: number
}

export type GetGlobalMaterialsResponse = TCommonResponseList & {
  data: TMaterialList[]
  statusCode: number
}

export type GetGlobalMaterialBiofarmaResponse = TCommonResponseList & {
  data: TMaterialBiofarmaList[]
  statusCode: number
}

type GetResponse = TCommonResponseList & {
  data: Array<{ id: number; name: string }>
  statusCode: number
}

export type CreateMaterialInput = {
  name: string
  description: string
  material_level_id: number
  code: string
  hierarchy_code: string
  unit_of_consumption_id: number
  unit_of_distribution_id: number
  consumption_unit_per_distribution_unit: number
  min_temperature: number
  max_temperature: number
  is_temperature_sensitive: number
  min_retail_price: number
  max_retail_price: number
  material_type_id: number
  is_managed_in_batch: number
  is_stock_opname_mandatory: number
  program_ids: number[]
}

export type GetMaterialRelation = {
  id: number
  name: string
  material_level_id: number
  material_hierarchy: MaterialHierarchy[]
}

export type MaterialHierarchy = {
  id: number
  name: string
  materials: Material[]
  hierarchy_code?: string
}

export type Material = {
  id: number
  name: string
  material_level_id: number
  from_material_id: number
  to_material_id: number
  hierarchy_code?: string
}

export type GetMaterialLevelsParams = TCommonFilter & {
  enable_only?: 0 | 1
}

export type GetMaterialLevelsResponse = TCommonResponseList & {
  data: Array<{
    id: number
    name: string
    order: string
    created_at: string
    updated_at: string
    deleted_at: string
    enable: number
  }>
}

type Params = {
  keyword?: string
  material_id?: string | number
}

export async function getMaterialTypes(
  params: GetMaterialsParams
): Promise<GetMaterialTypesResponse> {
  const response = await axios.get('/core/material-types', {
    params,
  })

  return handleAxiosResponse<GetMaterialTypesResponse>(response)
}

export async function getMaterialSubtypes(
  params: GetMaterialSubtypeParams
): Promise<GetMaterialTypesResponse> {
  const response = await axios.get(
    '/core/annual-planning/program-plans/subtype',
    {
      params,
    }
  )

  return handleAxiosResponse<GetMaterialTypesResponse>(response)
}

export async function getMaterialRelations(
  id: number
): Promise<GetMaterialRelation> {
  const response = await axios.get(`/core/materials/${id}/relation`)

  return handleAxiosResponse<GetMaterialRelation>(response)
}

export async function getMaterialUnits(
  params: GetMaterialsParams
): Promise<GetMaterialUnitResponse> {
  const response = await axios.get('/core/material-units', {
    params,
  })

  return handleAxiosResponse<GetMaterialUnitResponse>(response)
}

export type GetMaterialDetailRelation = {
  id: number
  name: string
  material_level_id: number
  material_hierarchy: {
    id: number
    name: string
    materials: {
      id: number
      name: string
      hierarchy_code: string
      material_level_id: number
      from_material_id: number
      to_material_id: number
    }[]
  }[]
}

export async function getMaterialDetail(
  id: string | number,
  isGlobal: boolean = false
): Promise<MaterialDetailGlobalResponse | MaterialDetailProgramResponse> {
  const endpoint = isGlobal ? '/core/materials' : '/main/materials'
  const response = await axios.get(`${endpoint}/${id}`, {
    cleanParams: true,
  })
  return response?.data
}

export async function getMaterialDetailRelation(
  id: string | number
): Promise<GetMaterialDetailRelation> {
  const response = await axios.get(`/core/materials/${id}/relation`)
  return response?.data
}

export async function getMaterials(
  params: GetMaterialsParams
): Promise<GetProgramMaterialsResponse> {
  const response = await axios.get('/main/materials', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetProgramMaterialsResponse>(response)
}

export async function getCoreMaterials(
  params: GetMaterialsParams
): Promise<GetGlobalMaterialsResponse> {
  const response = await axios.get('/core/materials', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetGlobalMaterialsResponse>(response)
}

export async function getBatch(params: Params) {
  const response = await axios.get('/main/microplanning/dashboard/batch', {
    params,
  })

  return response
}

export async function deleteMaterial(id: string | number) {
  const response = await axios.delete(`/v2/material/${id}`)

  return response?.data
}

export async function exportMaterial(
  params: GetMaterialsParams,
  isGlobal?: boolean
) {
  const response = await axios.get(
    `${isGlobal ? 'core' : 'main'}/materials/xls`,
    {
      responseType: 'blob',
      params,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateMaterial(
  params: {
    material_level_id: number
    is_hierarchy?: number
  },
  isGlobal?: boolean
) {
  const response = await axios.get(
    `${isGlobal ? 'core' : 'main'}/materials/xls-template`,
    {
      responseType: 'blob',
      params,
    }
  )
  parseDownload(response?.data, response?.headers?.filename ?? 'material.xlsx')

  return response?.data
}

export async function importMaterial(data: FormData, isGlobal?: boolean) {
  const materialLevelRaw = data.get('material_level_id')

  const materialLevelId =
    materialLevelRaw && typeof materialLevelRaw !== 'object'
      ? encodeURIComponent(String(materialLevelRaw))
      : ''
  const file = data.get('file')

  const baseUrl = isGlobal ? 'core' : 'main'
  const queryString = isGlobal ? '' : '?material_level_id=' + materialLevelId
  const url = baseUrl + '/materials/xls' + queryString

  const formData = isGlobal ? data : new FormData()

  if (!isGlobal && file) {
    formData.append('file', file)
  }

  const response = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function createMaterial(
  data: CreateMaterialInput,
  isGlobal?: boolean
) {
  const response = await axios.post(
    `${isGlobal ? 'core' : 'main'}/materials`,
    data
  )

  return response?.data
}

export async function updateMaterial(
  data: CreateMaterialInput,
  id?: string | number,
  isGlobal?: boolean
) {
  const response = await axios.put(
    `${isGlobal ? 'core' : 'main'}/materials/${id}`,
    data
  )

  return response?.data
}

export async function updateMaterialStatus(
  id?: string | number,
  data?: { status: STATUS },
  isGlobal: boolean = false
) {
  const endpoint = isGlobal ? '/core/materials' : '/main/materials'
  const response = await axios.put(`${endpoint}/${id}/status`, data)
  return response?.data
}

export async function getMaterialLevels(params: GetMaterialLevelsParams) {
  const response = await axios.get('/core/material-levels', {
    params,
  })

  return handleAxiosResponse<GetMaterialLevelsResponse>(response)
}

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional?: {
    page: number | undefined
    program_id?: string | number
    material_type_ids?: string
    material_level_id?: string | number | null
    is_with_activities?: boolean
    is_with_consumption_per_distribution_unit?: boolean
    material_activities?: string
    activity_id?: string | number
    with_kfa_code?: boolean
    material_subtype_ids?: string
    withData?: boolean
    material_ids?: number[]
  }
) {
  const { material_ids, page, ...rest } = additional ?? {}
  const params = {
    ...rest,
    page: page ?? 1,
    paginate: 10,
    status: BOOLEAN.TRUE,
    keyword,
  }

  const fixedParams = removeEmptyObject(params)

  const result = additional?.program_id
    ? await getMaterials(fixedParams)
    : await getCoreMaterials(fixedParams)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...fixedParams,
        page: additional?.page ? additional?.page + 1 : 1,
        material_type_ids: additional?.material_type_ids,
      },
    }
  }

  if (material_ids?.length) {
    const filteredData = result?.data?.filter(
      (item) => !material_ids?.includes(item?.id)
    )
    return {
      options: filteredData?.map((item) => ({
        label: additional?.with_kfa_code
          ? `${item?.name} (${item?.code})`
          : item?.name,
        value: item?.id,
        ...(additional?.withData ? { data: item } : {}),
      })),
      hasMore: false,
      additional: {
        ...fixedParams,
        page: additional?.page ? additional?.page + 1 : 1,
        material_type_ids: additional?.material_type_ids,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: additional?.with_kfa_code
      ? `${item?.name} (${item?.code})`
      : item?.name,
    value: item?.id,
    ...(additional?.is_with_activities
      ? { material_activities: item?.material_activities }
      : {}),
    ...(additional?.is_with_consumption_per_distribution_unit
      ? {
          consumption_unit_per_distribution_unit:
            item?.consumption_unit_per_distribution_unit,
        }
      : {}),
    ...(additional?.withData ? { data: item } : {}),
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...fixedParams,
      page: additional?.page ? additional?.page + 1 : 1,
      material_type_ids: additional?.material_type_ids,
    },
  }
}

export async function loadMaterialType(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const params = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await getMaterialTypes(params)

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
    label: item?.name,
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

export async function loadMaterialSubtype(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    material_type_id?: string | number | null
  }
) {
  const params = {
    ...additional,
    paginate: 10,
    keyword,
  }

  const result = await getMaterialSubtypes(params)

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

export async function loadMaterialUnits(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    type?: 'consumption' | 'distribution'
  }
) {
  const params = {
    type: additional.type,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await getMaterialUnits(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
        type: additional.type,
      },
    }
  }

  const baseOptions = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  const options = keyword
    ? baseOptions.filter((option) =>
        option.label.toLowerCase().includes(keyword.toLowerCase())
      )
    : baseOptions

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
      type: additional.type,
    },
  }
}

export async function loadBatch(
  keyword: string,
  _: unknown,
  additional: {
    material_id: string | number
  }
) {
  const result = await getBatch({
    ...(keyword && { keyword }),
    ...additional,
  })

  const data = Array.isArray(result.data) ? result.data : []

  const options = data.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))

  return {
    options,
    additional: {
      material_id: additional?.material_id,
    },
  }
}

export async function getMaterialBiofarma(
  params: GetMaterialBiofarmaParams
): Promise<GetGlobalMaterialBiofarmaResponse> {
  const response = await axios.get(
    '/warehouse-report/biofarma/material/search',
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<GetGlobalMaterialBiofarmaResponse>(response)
}

export async function loadMaterialBiofarma(
  keyword: string,
  _: unknown,
  additional?: GetMaterialBiofarmaParams
) {
  const params = {
    ...additional,
    page: additional?.page ?? 1,
    paginate: 10,
    status: BOOLEAN.TRUE,
    keyword,
  }

  const fixedParams = removeEmptyObject(params)

  const result = await getMaterialBiofarma(fixedParams)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...fixedParams,
        page: additional?.page ? additional?.page + 1 : 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.name,
    value: item?.name,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...fixedParams,
      page: additional?.page ? additional?.page + 1 : 1,
    },
  }
}
