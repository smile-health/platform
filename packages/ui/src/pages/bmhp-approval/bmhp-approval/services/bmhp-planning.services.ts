import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

import {
  BmhpPlanningYearCreateForm,
  ListBmhpApprovalParams,
  ListBmhpApprovalResponse,
  ListBmhpPlanningYearsParams,
  ListBmhpPlanningYearsResponse,
  ListBmhpProvinceApprovalParams,
  ListBmhpProvinceApprovalResponse,
  TBmhpApprovalItem,
  TBmhpPlanningYear,
  TBmhpProvinceApprovalItem,
} from '../list/libs/bmhp-approval-list.type'

const baseUrl = 'main/'

/**
 * All requests to the Program Plan API use this programId
 * to override the default x-program-id header.
 */
const DEFAULT_APPROACH_ID = 4

/**
 * Fetch list of BMHP planning years from Program Plan API
 */
export const listBmhpPlanningYears = async (
  params: ListBmhpPlanningYearsParams
) => {
  const { paginate, ...restParams } = params
  const fetchYearList = await axios.get(
    `${baseUrl}annual-planning/program-plans`,
    {
      params: {
        ...restParams,
        item_per_page: paginate,
      },
      cleanParams: true,
    }
  )

  const resultData =
    fetchYearList?.data?.data?.map(
      (item: TBmhpPlanningYear, index: number) => ({
        ...item,
        si_no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...fetchYearList,
    data: {
      ...fetchYearList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListBmhpPlanningYearsResponse>(result)
}

/**
 * Get year detail by ID from Program Plan API
 */
export const detailBmhpPlanningYear = async (
  id: number
): Promise<TBmhpPlanningYear> => {
  const fetchYearDetail = await axios.get(
    `${baseUrl}annual-planning/program-plans/${id}`
  )

  return fetchYearDetail?.data
}

/**
 * Create a new year via Program Plan API
 * Uses approach_id = 1 (VACCINATION) and status defaults to draft on backend
 */
export const createBmhpPlanningYear = async (
  data: BmhpPlanningYearCreateForm
) => {
  const response = await axios.post(
    `${baseUrl}annual-planning/program-plans`,
    {
      year: String(data.year),
      approach_id: DEFAULT_APPROACH_ID,
    },
    {
      cleanBody: true,
    }
  )
  return response?.data as TBmhpPlanningYear
}

/**
 * Fetch all existing years (for disabling in dropdown)
 */
export const markFinalBmhpPlanning = async (id: number) => {
  const response = await axios.put(
    `${baseUrl}annual-planning/program-plans/${id}`,
    null,
    {}
  )
  return handleAxiosResponse<TBmhpPlanningYear>(response)
}

/**
 * Fetch all existing years (for disabling in dropdown)
 */
export const getExistingYears = async (): Promise<number[]> => {
  const response = await axios.get(`${baseUrl}annual-planning/program-plans`, {
    params: {
      page: 1,
      paginate: 50,
    },
    cleanParams: true,
  })

  const data = response?.data?.data ?? []
  return data.map((item: TBmhpPlanningYear) => item.year)
}

/**
 * Get BMHP Approval detail by ID
 * GET /main/bmhp-approval/{id}
 */
export const detailBmhpApproval = async (
  id: number
): Promise<TBmhpApprovalItem> => {
  // TODO:
  const response = await axios.get(`${baseUrl}bmhp-approval/review/${id}`)
  // return handleAxiosResponse<TBmhpApprovalItem>(response)
  return response?.data?.data
}

/**
 * Fetch BMHP Approval list
 * GET /main/bmhp-approval/
 */
export const listBmhpApprovals = async (
  params: ListBmhpApprovalParams
): Promise<ListBmhpApprovalResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListBmhpApprovalResponse>(response)
}

/**
 * Fetch Province BMHP Approval list
 * GET /bmhp-approval/province
 */
export const listProvinceApprovals = async (
  params: ListBmhpProvinceApprovalParams
): Promise<ListBmhpProvinceApprovalResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/province`, {
    params: {
      ...params,
      program_plan_id: params.program_plan_id
        ? Number(params.program_plan_id)
        : undefined,
    },
    cleanParams: true,
  })

  const resultData =
    response?.data?.data?.map(
      (item: TBmhpProvinceApprovalItem, index: number) => ({
        ...item,
        no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...response,
    data: {
      ...response?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListBmhpProvinceApprovalResponse>(result)
}

/**
 * Submit Province BMHP Approval to Ministry of Health
 * POST /bmhp-approval/province-submit
 */
export const submitProvinceToMOH = async (data: {
  program_plan_id: number
}) => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/province-submit`,
    data,
    {
      cleanBody: true,
    }
  )
  return handleAxiosResponse<{
    message: string
    province_approval_id: number
    updated_periods_count: number
  }>(response)
}

/**
 * Export Province BMHP Approval to Excel
 * GET /bmhp-approval/province/xls/:regency_id
 */
export const exportProvinceApprovals = async (params: {
  program_plan_id: number
  regency_id?: number
  keyword?: string
}): Promise<void> => {
  const { regency_id, ...queryParams } = params
  const response = await axios.get(
    `${baseUrl}bmhp-approval/province/xls` +
      (regency_id ? `/${regency_id}` : ''),
    {
      params: queryParams,
      cleanParams: true,
      responseType: 'json',
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)
}

/**
 * Update Province Approval Status
 * POST /bmhp-approval/province/:entity_id
 */
export const updateProvinceApprovalStatus = async (
  entity_id: number,
  program_plan_id: number,
  status: number
) => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/province/${entity_id}`,
    {
      program_plan_id,
      status,
    }
  )

  return response?.data
}

/**
 * Get Regency by ID for Province View
 * GET /bmhp-approval/province/get-regency/:id
 */
export const getRegencyById = async (id: number | string) => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/province/get-regency/${id}`
  )

  return response?.data
}

export interface UpsertSignaturePayload {
  signature_url: string
  name: string
  position?: string
  program?: string
}

export const upsertBmhpSignature = async (
  data: UpsertSignaturePayload
): Promise<any> => {
  const response = await axios.post(`${baseUrl}bmhp-approval/signature`, data)
  return handleAxiosResponse(response)
}

export interface GetSignatureResponse {
  status: boolean
  message: string
  data: {
    name: string
    position: string
    signature_url: string
    program: string | null
  } | null
}

export const getBmhpSignature = async (): Promise<GetSignatureResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/signature`)
  return handleAxiosResponse<GetSignatureResponse>(response)
}
