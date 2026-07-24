import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  GetBmhpVerificationsResponse,
  GetTargetInputParams,
  GetTargetInputResponse,
  PatchVerificationStatusBody,
  PatchVerificationStatusResponse,
  ReviewProgramPlanBody,
  ReviewProgramPlanResponse,
  TargetAdjustmentParams,
  UpdateTargetInputPayload,
  UpdateTargetInputResponse,
  UpdateVerificationStatusBody,
  UpdateVerificationStatusResponse,
} from '../libs/target-adjustment.type'

// const baseUrl = 'main/'
const baseUrl = 'main/'

/**
 * GET /bmhp-approval/verifications
 * Returns all entities with their planning verification data (no pagination).
 */
export const getTargetAdjustmentData = async (
  params: TargetAdjustmentParams
): Promise<GetBmhpVerificationsResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/verifications`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<GetBmhpVerificationsResponse>(response)
}

/**
 * POST /bmhp-approval/verifications/revision
 * Set program plan status to REVISION.
 */
export const reviewProgramPlan = async (
  body: ReviewProgramPlanBody
): Promise<ReviewProgramPlanResponse> => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/verifications/revision`,
    body
  )
  return handleAxiosResponse<ReviewProgramPlanResponse>(response)
}

/**
 * POST /bmhp-approval/verifications/status
 * Approve or reject all planning data for a program plan.
 */
export const updateVerificationStatus = async (
  body: UpdateVerificationStatusBody
): Promise<UpdateVerificationStatusResponse> => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/verifications/status`,
    body
  )
  return handleAxiosResponse<UpdateVerificationStatusResponse>(response)
}

/**
 * PUT /bmhp-approval/verifications/status
 * Approve or reject a specific combination.
 */
export const patchVerificationStatus = async (
  body: PatchVerificationStatusBody
): Promise<PatchVerificationStatusResponse> => {
  const response = await axios.put(
    `${baseUrl}bmhp-approval/verifications/status`,
    body
  )
  return handleAxiosResponse<PatchVerificationStatusResponse>(response)
}

/**
 * GET /bmhp-approval/verifications/export
 * Export as Excel file.
 */
export const exportTargetAdjustmentData = async (
  params: TargetAdjustmentParams
): Promise<{ blob: Blob; filename: string }> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/verifications/export`,
    { params, cleanParams: true, responseType: 'blob' }
  )
  const filename =
    response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'target-adjustment-bmhp.xlsx'
  return { blob: response.data, filename }
}

/**
 * GET /bmhp-approval/verifications/target-input
 * Fetch per-entity target input data to populate the Add Target Drawer.
 */
export const getTargetInput = async (
  params: GetTargetInputParams
): Promise<GetTargetInputResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/verifications/target-input`,
    { params, cleanParams: true }
  )
  return handleAxiosResponse<GetTargetInputResponse>(response)
}

/**
 * PUT /bmhp-approval/verifications/target-input
 * Save edited adjustment targets for one Puskesmas.
 */
export const updateTargetInput = async (
  body: UpdateTargetInputPayload
): Promise<UpdateTargetInputResponse> => {
  const response = await axios.put(
    `${baseUrl}bmhp-approval/verifications/target-input`,
    body
  )
  return handleAxiosResponse<UpdateTargetInputResponse>(response)
}

/**
 * GET /bmhp-approval/verifications/template
 * Download Excel template for target adjustment import.
 */
export const downloadTemplateTargetAdjustment = async (
  programPlanId: number
): Promise<boolean> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/verifications/template`,
    {
      params: { program_plan_id: programPlanId },
      responseType: 'blob',
    }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return true
}

/**
 * POST /bmhp-approval/verifications/import
 * Import target adjustment data from Excel file.
 */
export const importTargetAdjustment = async (
  programPlanId: number,
  data: FormData
): Promise<void> => {
  const result = await axios.post(
    `${baseUrl}bmhp-approval/verifications/import`,
    data,
    { params: { program_plan_id: programPlanId } }
  )
  return result?.data
}
