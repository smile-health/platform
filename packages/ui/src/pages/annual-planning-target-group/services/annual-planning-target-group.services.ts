import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  processPayloadForProgram,
  processPayloadGlobal,
} from '../form/libs/annual-planning-target-group-form.common'
import {
  AnnualPlanningTargetGroupFormData,
  AnnualPlanningTargetGroupProgramFormData,
} from '../form/libs/annual-planning-target-group-form.type'
import { processParams } from '../list/libs/annual-planning-target-group-list.common'
import {
  ListAnnualPlanningTargetGroupParams,
  ListAnnualPlanningTargetGroupResponse,
  TAnnualPlanningTargetGroupData,
} from '../list/libs/annual-planning-target-group-list.type'

export const listAnnualPlanningTargetGroup = async (
  params: ListAnnualPlanningTargetGroupParams & {
    programPlanId?: number | null
  },
  isGlobal: boolean = false
) => {
  const processedParams = processParams({
    params,
    isExport: false,
  }) as ListAnnualPlanningTargetGroupParams & {
    programPlanId?: number | null
  }
  const { programPlanId, ...restParams } = processedParams
  const url = isGlobal
    ? '/core/annual-planning/group-targets'
    : `/main/annual-planning/program-plans/${programPlanId}/group-targets`

  const fetchAnnualPlanningTargetGroupList = await axios.get(url, {
    params: restParams,
    cleanParams: true,
  })

  const resultData =
    fetchAnnualPlanningTargetGroupList?.data?.data?.map(
      (item: TAnnualPlanningTargetGroupData, index: number) => ({
        ...item,
        si_no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...fetchAnnualPlanningTargetGroupList,
    data: {
      ...fetchAnnualPlanningTargetGroupList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListAnnualPlanningTargetGroupResponse>(result)
}

export const exportAnnualPlanningTargetGroups = async (
  params: Omit<ListAnnualPlanningTargetGroupParams, 'page' | 'paginate'>,
  isGlobal: boolean = false
) => {
  const processedParams = processParams({
    params,
    isExport: true,
  }) as ListAnnualPlanningTargetGroupParams & {
    programPlanId?: number
  }
  const { programPlanId } = processedParams
  const url = isGlobal
    ? '/core/annual-planning/group-targets/export'
    : `/main/annual-planning/program-plans/${programPlanId}/group-targets/export`
  const responseExportAnnualPlanningTargetGroup = await axios.get(url, {
    params: processedParams,
    cleanParams: true,
    responseType: 'blob',
  })

  parseDownload(
    responseExportAnnualPlanningTargetGroup?.data,
    responseExportAnnualPlanningTargetGroup?.headers?.filename
  )

  return responseExportAnnualPlanningTargetGroup?.data
}

export const downloadTemplateAnnualPlanningTargetGroups = async () => {
  const responseExportAnnualPlanningTargetGroup = await axios.get(
    '/core/annual-planning/group-targets/template',
    {
      responseType: 'blob',
    }
  )

  parseDownload(
    responseExportAnnualPlanningTargetGroup?.data,
    responseExportAnnualPlanningTargetGroup?.headers?.filename
  )

  return responseExportAnnualPlanningTargetGroup?.data
}

export const importAnnualPlanningTargetGroup = async (data: FormData) => {
  const result = await axios.post(
    '/core/annual-planning/group-targets/import',
    data
  )
  return result?.data
}

export const detailAnnualPlanningTargetGroup = async (id: number) => {
  const response = await axios.get(`/main/annual-planning/group-targets/${id}`)
  return response?.data as TAnnualPlanningTargetGroupData
}

export const createAnnualPlanningTargetGroup = async (
  rawData:
    | AnnualPlanningTargetGroupFormData
    | AnnualPlanningTargetGroupProgramFormData,
  isGlobal: boolean,
  programPlanId: number | null
) => {
  const data = isGlobal
    ? processPayloadGlobal(rawData as AnnualPlanningTargetGroupFormData)
    : processPayloadForProgram(
        rawData as AnnualPlanningTargetGroupProgramFormData
      )
  const url = isGlobal
    ? '/core/annual-planning/group-targets'
    : `/main/annual-planning/program-plans/${programPlanId}/group-targets`
  const response = await axios.post(url, data, {
    cleanBody: true,
  })
  return response?.data as TAnnualPlanningTargetGroupData
}

export const updateAnnualPlanningTargetGroup = async (
  rawData: AnnualPlanningTargetGroupFormData,
  id: number
) => {
  const data = processPayloadGlobal(rawData)
  const response = await axios.put(
    `/core/annual-planning/group-targets/${id}`,
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data as TAnnualPlanningTargetGroupData
}

export const changeStatusAnnualPlanningTargetGroup = async (
  id: number,
  status: number
) => {
  const response = await axios.put(
    `/core/annual-planning/group-targets/${id}`,
    {
      is_active: Boolean(status),
    },
    {
      cleanBody: true,
    }
  )
  return response?.data as TAnnualPlanningTargetGroupData
}

export const deleteAnnualPlanningTargetGroup = async (
  id: number,
  groupId: number
) => {
  const response = await axios.delete(
    `/main/annual-planning/program-plans/${id}/group-targets/${groupId}`
  )
  return response?.data as TAnnualPlanningTargetGroupData
}

async function getTargetGroupOptions(
  programPlanId: number,
  year: number,
  params: { page?: number; paginate?: number; keyword?: string }
) {
  const response = await axios.get(
    `/main/annual-planning/program-plans/program/${programPlanId}/year/${year}`,
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<
    TCommonResponseList & {
      data: { id: number; title: string }[]
      statusCode?: number
    }
  >(response)
}

export const loadTargetGroupOptions = async (
  keyword: string,
  _: unknown,
  additional: {
    page: number
    plan_id: number
    year: number
    exclude_ids?: number[]
  }
) => {
  const { plan_id, year, exclude_ids, ...rest_additional } = additional
  const result = await getTargetGroupOptions(plan_id, year, {
    ...rest_additional,
    keyword,
  })
  if (result.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
    }
  }

  const filteredData = exclude_ids
    ? result.data.filter((item) => !exclude_ids.includes(item.id))
    : result.data
  return {
    options: filteredData.map((item) => ({
      label: item.title,
      value: item.id,
    })),
    hasMore: result.data.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
