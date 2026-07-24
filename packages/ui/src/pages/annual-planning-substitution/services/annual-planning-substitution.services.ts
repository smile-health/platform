import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { processPayload } from '../form/libs/annual-planning-substitution-form.common'
import { AnnualPlanningSubstitutionFormData } from '../form/libs/annual-planning-substitution-form.type'
import { processParams } from '../list/libs/annual-planning-substitution-list.common'
import {
  ListAnnualPlanningSubstitutionParams,
  ListAnnualPlanningSubstitutionResponse,
  TAnnualPlanningSubstitutionData,
} from '../list/libs/annual-planning-substitution-list.type'

export const listAnnualPlanningSubstitution = async (
  programPlanId: number,
  params: ListAnnualPlanningSubstitutionParams
) => {
  const processedParams = processParams({
    params,
    isExport: false,
  }) as ListAnnualPlanningSubstitutionParams

  const fetchAnnualPlanningSubstitutionList = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions`,
    {
      params: processedParams,
      cleanParams: true,
    }
  )

  const resultData =
    fetchAnnualPlanningSubstitutionList?.data?.data?.map(
      (item: TAnnualPlanningSubstitutionData, index: number) => ({
        ...item,
        si_no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...fetchAnnualPlanningSubstitutionList,
    data: {
      ...fetchAnnualPlanningSubstitutionList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListAnnualPlanningSubstitutionResponse>(result)
}

export const exportAnnualPlanningSubstitutions = async (
  programPlanId: number,
  params: Omit<ListAnnualPlanningSubstitutionParams, 'page' | 'paginate'>
) => {
  const processedParams = processParams({
    params,
    isExport: true,
  }) as ListAnnualPlanningSubstitutionParams & {
    programPlanId?: number
  }
  const responseExportAnnualPlanningSubstitution = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions/export`,
    {
      params: processedParams,
      cleanParams: true,
      responseType: 'blob',
    }
  )

  parseDownload(
    responseExportAnnualPlanningSubstitution?.data,
    responseExportAnnualPlanningSubstitution?.headers?.filename
  )

  return responseExportAnnualPlanningSubstitution?.data
}

export const downloadTemplateAnnualPlanningSubstitutions = async (
  programPlanId: number
) => {
  const responseExportAnnualPlanningSubstitution = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions/template`,
    {
      responseType: 'blob',
    }
  )

  parseDownload(
    responseExportAnnualPlanningSubstitution?.data,
    responseExportAnnualPlanningSubstitution?.headers?.filename
  )

  return responseExportAnnualPlanningSubstitution?.data
}

export const importAnnualPlanningSubstitution = async (
  programPlanId: number,
  data: FormData
) => {
  const result = await axios.post(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions/import`,
    data
  )
  return result?.data
}

export const detailAnnualPlanningSubstitution = async (
  programPlanId: number,
  substitutionId: number
) => {
  const response = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions/detail/${substitutionId}`
  )
  return response?.data as TAnnualPlanningSubstitutionData
}

export const createAnnualPlanningSubstitution = async (
  programPlanId: number,
  rawData: AnnualPlanningSubstitutionFormData
) => {
  const data = processPayload(rawData)
  const response = await axios.post(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions`,
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data as TAnnualPlanningSubstitutionData
}

export const editAnnualPlanningSubstitution = async (
  programPlanId: number,
  substitutionId: number,
  rawData: AnnualPlanningSubstitutionFormData
) => {
  const data = processPayload(rawData)
  const response = await axios.put(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions/${substitutionId}`,
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data as TAnnualPlanningSubstitutionData
}

export const deleteAnnualPlanningSubstitution = async (
  programPlanId: number,
  substitutionId: number
) => {
  const response = await axios.delete(
    `/main/annual-planning/program-plans/${programPlanId}/material-substitutions/${substitutionId}`
  )
  return response?.data as TAnnualPlanningSubstitutionData
}

async function getPlannedMaterialOptions(
  programPlanId: number,
  params: { page?: number; paginate?: number; keyword?: string }
) {
  const response = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/planned-materials`,
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<
    TCommonResponseList & {
      data: { id: number; name: string; material_subtype_id: number }[]
      statusCode?: number
    }
  >(response)
}

export const loadPlannedMaterialOptions = async (
  keyword: string,
  _: unknown,
  additional: {
    page: number
    plan_id: number
    exclude_ids?: string | null
    subtype_id?: number | null
    is_planned_only?: number
    is_for_filter?: boolean
  }
) => {
  const { plan_id, ...rest_additional } = additional
  const result = await getPlannedMaterialOptions(plan_id, {
    ...rest_additional,
    keyword,
  })
  if (result.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
    }
  }
  return {
    options: result.data.map((item) => ({
      label: item.name,
      value: item.id,
      subtype_id: item.material_subtype_id,
    })),
    hasMore: result.data.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
