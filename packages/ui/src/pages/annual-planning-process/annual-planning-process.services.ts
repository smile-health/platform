import axios from "#lib/axios";
import { SERVICE_API } from "#constants/api";
import { getMaterials, GetMaterialsParams } from '#services/material'
import { handleAxiosResponse } from "#utils/api";
import {
  CreateAnnualPlanningProcessBody,
  CreateAnnualPlanningProcessDistrictIPBody,
  CreateAnnualPlanningProcessPopulationBody,
  CreateAnnualPlanningProcessResultBody,
  DataCentralPopulation,
  GetDataDetailMonthlyCalculationResultResponse,
  GetDetailAnnualPlanningProcessDistrictIPResponse,
  GetDetailAnnualPlanningProcessPopulationTargetResponse,
  GetDetailAnnualPlanningProcessResponse,
  GetProgramPlanResponse,
  ListAnnualPlanningProcessDistrictResponse,
  ListAnnualPlanningProcessParams,
  ListAnnualPlanningProcessProvinceResponse,
  ListCalculationResultParams,
  ListDataCalculationResultResponse,
  ListGroupTargetParams,
  ListGroupTargetResponse,
  ListMaterialIPResponse,
  UpdateAnnualPlanningProcessDistrictIPBody,
  UpdateStatusAnnualPlanningProcessPopulationBody,
  UpdateAnnualPlanningProcessResultBody,
  UpdateAnnualPlanningProcessPopulationBody,
  UpdateStatusAnnualPlanningProcessDistrictIPBody,
  UpdateAnnualPlanningProcessBody,
  ActivateMinMaxProvinceAnnualPlanningProcessBody,
  ActivateMinMaxDistrictAnnualPlanningProcessBody,
  GetDataDetailMonthlyCalculationResultParams,
} from "./annual-planning-process.types";
import { Pagination } from "#types/common";
import { parseDownload } from "#utils/download";

type Params = {
  page: string | number
  paginate: string | number
  keyword?: string
  is_final?: boolean
}

const { MAIN } = SERVICE_API

export async function getProgramPlan(params: Params): Promise<GetProgramPlanResponse> {
  const response = await axios.get(`${MAIN}/annual-planning/program-plans`, { params })

  return handleAxiosResponse<GetProgramPlanResponse>(response)
}

export async function loadProgramPlan(
  keyword: string,
  _: unknown,
  additional: {
    page: number,
    key_value: 'year' | 'id'
  }
) {
  const result = await getProgramPlan({
    paginate: 10,
    ...(keyword && { keyword }),
    page: additional.page,
    is_final: true,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page,
      },
    }
  }

  const options = result?.data.map((item) => ({
    label: item?.year,
    value: item[additional.key_value],
    id: item.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional?.page + 1,
      key_value: additional.key_value,
    },
  }
}

export async function createAnnualPlanningProcess(data: CreateAnnualPlanningProcessBody) {
  const response = await axios.post(`${MAIN}/annual-planning/annual-needs`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateAnnualPlanningProcess(id: number, data: UpdateAnnualPlanningProcessBody) {
  const response = await axios.put(`${MAIN}/annual-planning/annual-needs/${id}`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getDetailAnnualPlanningProcess(id: number) {
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs/${id}`)

  return handleAxiosResponse<GetDetailAnnualPlanningProcessResponse>(response)
}

export async function getDetailAnnualPlanningProcessPopulationTarget(id: number) {
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs/${id}/population`)

  return handleAxiosResponse<GetDetailAnnualPlanningProcessPopulationTargetResponse>(response)
}

export async function createAnnualPlanningProcessPopulation(data: CreateAnnualPlanningProcessPopulationBody) {
  const response = await axios.post(`${MAIN}/annual-planning/annual-needs/population`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateAnnualPlanningProcessPopulation(id: number, data: UpdateAnnualPlanningProcessPopulationBody) {
  const response = await axios.put(`${MAIN}/annual-planning/annual-needs/${id}/population`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateStatusAnnualPlanningProcessPopulation(id: number, data: UpdateStatusAnnualPlanningProcessPopulationBody[]) {
  const response = await axios.put(`${MAIN}/annual-planning/annual-needs/${id}/population-status`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function createAnnualPlanningProcessDistrictIP(data: CreateAnnualPlanningProcessDistrictIPBody) {
  const response = await axios.post(`${MAIN}/annual-planning/annual-needs/ip`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateAnnualPlanningProcessDistrictIP(id: number, data: UpdateAnnualPlanningProcessDistrictIPBody) {
  const response = await axios.put(`${MAIN}/annual-planning/annual-needs/${id}/ip`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateStatusAnnualPlanningProcessDistrictIP(id: number, data: UpdateStatusAnnualPlanningProcessDistrictIPBody) {
  const response = await axios.put(`${MAIN}/annual-planning/annual-needs/${id}/ip-status`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getDetailAnnualPlanningProcessDistrictIP(id: number) {
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs/${id}/ip`)

  return handleAxiosResponse<GetDetailAnnualPlanningProcessDistrictIPResponse>(response)
}

export async function createAnnualPlanningProcessResult(data: CreateAnnualPlanningProcessResultBody) {
  const response = await axios.post(`${MAIN}/annual-planning/annual-needs/result`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateAnnualPlanningProcessResult(data: UpdateAnnualPlanningProcessResultBody) {
  const response = await axios.put(`${MAIN}/annual-planning/annual-needs/result`, data)

  return response?.data
}

export async function activateMinMaxProvinceAnnualPlanningProcess(data: ActivateMinMaxProvinceAnnualPlanningProcessBody) {
  const response = await axios.post(`${MAIN}/annual-planning/annual-needs/activate-min-max/province`, data, { cleanBody: true })

  return response?.data
}

export async function activateMinMaxDistrictAnnualPlanningProcess(data: ActivateMinMaxDistrictAnnualPlanningProcessBody) {
  const response = await axios.post(`${MAIN}/annual-planning/annual-needs/activate-min-max/regency`, data, { cleanBody: true })

  return response?.data
}

export async function listAnnualPlanningProcessProvince(params?: ListAnnualPlanningProcessParams) {
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAnnualPlanningProcessProvinceResponse>(response)
}

export async function listAnnualPlanningProcessDistrict(entityId: string | number) {
  const response = await axios.get(`${MAIN}/annual-planning/entity/${entityId}/annual-needs`, {
    cleanParams: true,
  })

  return handleAxiosResponse<ListAnnualPlanningProcessDistrictResponse>(response)
}

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional?: {
    page: number | undefined
    material_level_id: string | number
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
    material_subtype: item?.material_subtype.id
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

export async function listCalculationResult(annualNeedId: string | number, params?: ListCalculationResultParams) {
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs/${annualNeedId}/result`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListDataCalculationResultResponse>(response)
}

export async function getDataDetailMonthlyCalculationResult(id: string | number, params?: GetDataDetailMonthlyCalculationResultParams) {
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs/${id}/result/monthly-distribution`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetDataDetailMonthlyCalculationResultResponse>(response.data)
}

export async function listGroupTarget(programPlanId: string | number, params?: ListGroupTargetParams) {
  const response = await axios.get(`${MAIN}/annual-planning/program-plans/${programPlanId}/group-targets`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListGroupTargetResponse>(response)
}

export async function getCentralPopulation(programPlanId: string | number, regencyId: string | number) {
  const response = await axios.get(`${MAIN}/annual-planning/program-plans/${programPlanId}/annual-needs/population`, {
    params: {
      regencyId,
    },
    cleanParams: true,
  })

  return handleAxiosResponse<DataCentralPopulation>(response)
}

export async function listMaterialIP(programPlanId: string | number, params?: Pagination) {
  const response = await axios.get(`${MAIN}/annual-planning/program-plans/${programPlanId}/national-ip`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListMaterialIPResponse>(response)
}

export async function exportAnnualPlanningResult(
  annualNeedId: string | number,
  params?: ListCalculationResultParams
) {
  // TODO: possibility to change endpoint (BE not ready yet)
  const response = await axios.get(`${MAIN}/annual-planning/annual-needs/${annualNeedId}/result/xls`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'Calculated_Results.xlsx'
  )

  return response?.data
}
