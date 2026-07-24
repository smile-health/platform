import { BOOLEAN } from '#constants/common'
import axios from '#lib/axios'
import { getMaterials, getMaterialSubtypes } from '#services/material'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { removeEmptyObject } from '#utils/object'

import { ProgramPlanMaterialRatioResponse } from '../../program-plan/list/libs/program-plan-list.type'
import { processPayload } from '../form/libs/program-plan-material-ratio-form.common'
import { ProgramPlanMaterialRatioFormData } from '../form/libs/program-plan-material-ratio-form.type'
import {
  ListProgramPlanRatioParams,
  TProgramPlanRatioData,
} from '../list/libs/program-plan-ratio.list.type'

export const listProgramPlanMaterialRatio = async (
  params: ListProgramPlanRatioParams,
  programPlanId: number
) => {
  const url = `/main/annual-planning/program-plans/${programPlanId}/ratio`

  const fetchProgramPlanMaterialRatioList = await axios.get(url, {
    params,
    cleanParams: true,
  })

  const resultData =
    fetchProgramPlanMaterialRatioList?.data?.data?.map(
      (item: TProgramPlanRatioData, index: number) => ({
        ...item,
        si_no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...fetchProgramPlanMaterialRatioList,
    data: {
      ...fetchProgramPlanMaterialRatioList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<TProgramPlanRatioData>(result)
}

export const exportProgramPlanMaterialRatios = async (
  programPlanId: number,
  params: { material_id?: string } = {}
) => {
  const url = `/main/annual-planning/program-plans/${programPlanId}/material-ratio/export`
  const responseExportProgramPlanMaterialRatio = await axios.get(url, {
    params,
    cleanParams: true,
    responseType: 'blob',
  })

  parseDownload(
    responseExportProgramPlanMaterialRatio?.data,
    responseExportProgramPlanMaterialRatio?.headers?.filename
  )

  return responseExportProgramPlanMaterialRatio?.data
}

export const downloadTemplateProgramPlanMaterialRatios = async () => {
  const responseExportProgramPlanMaterialRatio = await axios.get(
    `/main/annual-planning/program-plans/material-ratio/template`,
    {
      responseType: 'blob',
    }
  )

  parseDownload(
    responseExportProgramPlanMaterialRatio?.data,
    responseExportProgramPlanMaterialRatio?.headers?.filename
  )

  return responseExportProgramPlanMaterialRatio?.data
}

export const importProgramPlanMaterialRatio = async (
  programPlanId: number,
  data: FormData
) => {
  const result = await axios.post(
    `/main/annual-planning/program-plans/${programPlanId}/material-ratio/import`,
    data
  )
  return result?.data
}

export const detailProgramPlanMaterialRatio = async (
  materialRatioId: number
) => {
  const response = await axios.get(
    `/main/annual-planning/program-plans/material-ratio/${materialRatioId}`
  )
  return response?.data
}

export const createProgramPlanMaterialRatio = async (
  programPlanId: number,
  rawData: ProgramPlanMaterialRatioFormData
) => {
  const data = processPayload({ ...rawData, program_plan_id: programPlanId })
  const response = await axios.post(
    `/main/annual-planning/program-plans/material-ratio`,
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data
}

export const updateProgramPlanMaterialRatio = async (
  programPlanId: number,
  materialRatioId: number,
  rawData: ProgramPlanMaterialRatioFormData
) => {
  const data = processPayload({ ...rawData, program_plan_id: programPlanId })
  const response = await axios.put(
    `/main/annual-planning/program-plans/material-ratio/${materialRatioId}`,
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data
}

export const deleteProgramPlanMaterialRatio = async (
  materialRatioId: number
) => {
  const response = await axios.delete(
    `/main/annual-planning/program-plans/material-ratio/${materialRatioId}`
  )
  return response?.data
}

export async function loadMaterialSubtype(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    exclude_ids?: number[] | null
  }
) {
  const params = {
    ...additional,
    paginate: 10,
    keyword,
  }

  const { exclude_ids, ...restAdditional } = params
  const result = await getMaterialSubtypes(restAdditional)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...restAdditional,
        page: restAdditional.page + 1,
      },
    }
  }

  const options = result?.data
    ?.map((item) => ({
      label: item?.name,
      value: item?.id,
    }))
    ?.filter((option) =>
      exclude_ids && exclude_ids?.length > 0
        ? !exclude_ids?.includes(Number(option?.value))
        : true
    )

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...restAdditional,
      page: restAdditional.page + 1,
    },
  }
}

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional?: {
    page: number
    program_id?: string | number
    material_level_id?: string | number | null
    with_kfa_code?: boolean
    material_subtype_ids?: string
    exclude_ids?: number[] | null
  }
) {
  const params = {
    ...additional,
    page: additional?.page ?? 1,
    paginate: 10,
    status: BOOLEAN.TRUE,
    keyword,
  }

  const fixedParams = removeEmptyObject(params)

  const { exclude_ids, ...restParams } = fixedParams

  const result = await getMaterials(restParams)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...restParams,
        page: restParams?.page + 1,
      },
    }
  }

  const options = result?.data
    ?.map((item) => ({
      label: restParams?.with_kfa_code
        ? `${item?.name} (${item?.code})`
        : item?.name,
      value: item?.id,
    }))
    ?.filter((option) =>
      exclude_ids && exclude_ids?.length > 0
        ? !exclude_ids?.includes(Number(option?.value))
        : true
    )

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...restParams,
      page: restParams?.page + 1,
    },
  }
}

export const getProgramPlanMaterialRatios = async (
  programPlanId: number,
  params?: { page?: number; paginate?: number; material_id?: string | number }
) => {
  const response = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/material-ratio`,
    {
      params,
      cleanParams: true,
    }
  )
  return handleAxiosResponse<ProgramPlanMaterialRatioResponse>(response)
}
