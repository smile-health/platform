import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64, parseDownload } from '#utils/download'

import {
  NeedCalculationResultParams,
  NeedCalculationResultResponse,
} from '../libs/need-calculation-result.type'

const baseUrl = 'main/'

/**
 * GET /bmhp-approval/material-needs
 */
export const getMaterialNeeds = async (
  params: NeedCalculationResultParams
): Promise<NeedCalculationResultResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/material-needs`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<NeedCalculationResultResponse>(response)
}

/**
 * GET /bmhp-approval/material-needs/xls
 */
export const exportMaterialNeeds = async (
  params: Pick<
    NeedCalculationResultParams,
    'program_plan_id' | 'regency_id' | 'entity_id' | 'material_id'
  >
): Promise<void> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/material-needs/xls`,
    {
      params,
      cleanParams: true,
      responseType: 'json',
    }
  )
  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)
  return response?.data
}

/**
 * GET /bmhp-approval/material-needs/template
 */
export const downloadTemplateMaterialNeeds = async (
  programPlanId: number
): Promise<boolean> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/material-needs/template`,
    {
      params: { program_plan_id: programPlanId },
      responseType: 'blob',
    }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return true
}

type EntityListResponse = {
  statusCode: number
  data: Array<{ id: number; name: string }>
}

type ListMaterialNeedsEntitiesParams = {
  page?: number
  paginate?: number
  keyword?: string
  regency_ids?: string | number
  entity_tag_ids?: string | number
}

async function listMaterialNeedsEntities(
  params: ListMaterialNeedsEntitiesParams
): Promise<EntityListResponse> {
  const response = await axios.get(`${baseUrl}bmhp-approval/entities`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<EntityListResponse>(response)
}

export async function loadMaterialNeedsEntities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    regency_ids?: string | number
    entity_tag_ids?: string | number
  }
) {
  const result = await listMaterialNeedsEntities({
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

  const options =
    result?.data?.map((item) => ({
      label: item?.name,
      value: item?.id,
    })) ?? []

  return {
    options,
    hasMore: options.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

/**
 * POST /bmhp-approval/material-needs/import
 */
export const importMaterialNeeds = async (
  programPlanId: number,
  data: FormData
): Promise<void> => {
  const result = await axios.post(
    `${baseUrl}bmhp-approval/material-needs/import`,
    data,
    { params: { program_plan_id: programPlanId } }
  )
  return result?.data
}
