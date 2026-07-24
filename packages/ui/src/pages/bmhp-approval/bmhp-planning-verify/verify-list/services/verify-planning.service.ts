import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  UpdateVerifyPlanningRequest,
  UpdateVerifyPlanningResponse,
  VerifyPlanningParams,
  VerifyPlanningResponse,
} from '../libs/verify-planning.type'

const baseUrl = 'main/'

/**
 * Fetch verify planning data for all entities in a regency
 * GET /bmhp-approval/verifications
 */
export const getVerifyPlanningData = async (
  params: VerifyPlanningParams
): Promise<VerifyPlanningResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/verifications`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<VerifyPlanningResponse>(response)
}

/**
 * Update verify planning data
 * PATCH /bmhp-approval/verifications
 *
 * Only send data that has changed to minimize payload size
 */
export const updateVerifyPlanningData = async (
  data: UpdateVerifyPlanningRequest
): Promise<UpdateVerifyPlanningResponse> => {
  const response = await axios.patch(
    `${baseUrl}bmhp-approval/verifications`,
    data,
    {
      cleanBody: true,
    }
  )

  return handleAxiosResponse<UpdateVerifyPlanningResponse>(response)
}

/**
 * Export Excel
 * GET /bmhp-approval/verifications/export
 *
 * This endpoint returns a file, so we need to parse the response as a download
 */
export const exportVerifyPlanningData = async (
  params: VerifyPlanningParams
): Promise<{ blob: Blob; filename: string }> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/verifications/export`,
    {
      params,
      cleanParams: true,
      responseType: 'blob',
    }
  )

  const filename =
    response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'verifikasi-perencanaan-bmhp.xlsx'

  return { blob: response.data, filename }
}
