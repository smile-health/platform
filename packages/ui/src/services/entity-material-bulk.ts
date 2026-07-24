import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { EntityMaterialBulk } from '../types/entity-material-bulk'

type ListEntitiesMaterialBulkResponse = TCommonResponseList & {
  data: EntityMaterialBulk[]
  statusCode: number
}

type ListEntitiesMaterialBulkParams = {
  page: string | number
  paginate: string | number
  start_date?: string
  end_date?: string
}

export async function listEntitiesMaterialBulk(
  params: ListEntitiesMaterialBulkParams
): Promise<ListEntitiesMaterialBulkResponse> {
  const response = await axios.get('/main/entities-materials-bulk', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListEntitiesMaterialBulkResponse>(response)
}

export async function importEntitiesMaterialBulk(data: FormData) {
  const response = await axios.post('/main/entities-materials-bulk/xls', data)

  return response?.data
}

export type TemplateEntityMaterialBulkParams = {
  entity_name?: string
  entity_type_id?: string
  entity_tag_id?: string
  province_id?: string
  regency_id?: string
  sub_district_id?: string
  village_id?: string
  material_name?: string
  material_type_ids?: string
  activity_id?: string
  material_level?: string
  is_vendor?: number
}
export async function templateEntityMaterialBulk(
  params: TemplateEntityMaterialBulkParams
) {
  const response = await axios.get('/main/entities-materials-bulk/template', {
    responseType: 'blob',
    params,
    cleanParams: true,
  })
  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'Entity-Material-template.xlsx'
  )

  return response?.data
}
