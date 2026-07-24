import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

import {
  GetNeedsAggregateDetailsResponse,
  GetNeedsAggregateListResponse,
  GetNeedsAggregatePreviewResponse,
  NeedsAggregateTableParams,
  UpdateNeedsAggregateStatusBody,
  UpdateNeedsAggregateStatusResponse,
} from '../libs/needs-aggregate.types'

const baseUrl = 'main/'

/**
 * GET /bmhp-approval/needs-aggregate
 * Fetch the needs aggregate list and screening summary.
 * Province ID is automatically extracted from the user's token session.
 */
export const getNeedsAggregateList = async (
  params: NeedsAggregateTableParams
): Promise<GetNeedsAggregateListResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/needs-aggregate`, {
    params: {
      program_plan_id: params.program_plan_id,
      page: params.page,
      paginate: params.item_per_page,
    },
    cleanParams: true,
  })
  return handleAxiosResponse<GetNeedsAggregateListResponse>(response)
}

/**
 * GET /bmhp-approval/needs-aggregate/{city_id}/details
 * Fetch the detailed breakdown of targets and target adjustments for a specific city.
 */
export const getNeedsAggregateDetails = async (
  cityId: number,
  programPlanId: number
): Promise<GetNeedsAggregateDetailsResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/needs-aggregate/${cityId}/details`,
    {
      params: { program_plan_id: programPlanId },
      cleanParams: true,
    }
  )
  return handleAxiosResponse<GetNeedsAggregateDetailsResponse>(response)
}

/**
 * PUT /bmhp-approval/needs-aggregate/{city_id}/status
 * Update the review status of a city's needs aggregate (pending | approved | rejected).
 */
export const updateNeedsAggregateStatus = async (
  cityId: number,
  body: UpdateNeedsAggregateStatusBody
): Promise<UpdateNeedsAggregateStatusResponse> => {
  const response = await axios.put(
    `${baseUrl}bmhp-approval/needs-aggregate/${cityId}/status`,
    body,
    { cleanBody: true }
  )
  return handleAxiosResponse<UpdateNeedsAggregateStatusResponse>(response)
}

/**
 * GET /bmhp-approval/needs-aggregate/xls
 * Export needs aggregate as Excel file.
 */
export const exportNeedsAggregateXls = async (
  params: NeedsAggregateTableParams
): Promise<void> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/needs-aggregate/xls`,
    {
      responseType: 'json',
      cleanParams: true,
      params: {
        program_plan_id: params.program_plan_id,
      },
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)
}

/**
 * GET /bmhp-approval/needs-aggregate/preview
 * Fetch preview data for all cities without pagination.
 */
export const getNeedsAggregatePreview = async (
  programPlanId: number
): Promise<GetNeedsAggregatePreviewResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/needs-aggregate/preview`,
    {
      params: { program_plan_id: programPlanId },
      cleanParams: true,
    }
  )
  return handleAxiosResponse<GetNeedsAggregatePreviewResponse>(response)
}
