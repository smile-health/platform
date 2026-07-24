import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

import {
  BmhpMinistryRecapitulationParams,
  BmhpMinistryRecapitulationResponse,
  GetMinistryRecapitulationDetailResponse,
  ListBmhpApprovalMinistryParams,
  ListBmhpApprovalMinistryResponse,
  MinistryRecapitulationDetailParams,
  SaveDeskResultPayload,
  SaveDeskResultRecordPayload,
} from '../libs/bmhp-approval-ministry.type'

export type {
  MinistryRecapitulationDetailParams,
  GetMinistryRecapitulationDetailResponse,
}

const baseUrl = 'main/'

/**
 * Fetch BMHP Approval list for Ministry of Health view
 * GET /bmhp-approval/ministry-of-health
 */
export const listBmhpApprovalMinistry = async (
  params: ListBmhpApprovalMinistryParams
): Promise<ListBmhpApprovalMinistryResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-of-health`,
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<ListBmhpApprovalMinistryResponse>(response)
}

/**
 * Export BMHP Approval list to Excel
 * GET /bmhp-approval/ministry-of-health/xls
 */
export const exportBmhpApprovalMinistry = async (
  params: ListBmhpApprovalMinistryParams
): Promise<any> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-of-health/xls`,
    {
      params,
      cleanParams: true,
      responseType: 'json',
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)

  return response.data
}

/**
 * Fetch BMHP Ministry Recapitulation Detail
 * GET /bmhp-approval/ministry-recapitulation
 */
export const getBmhpMinistryRecapitulation = async (
  params: BmhpMinistryRecapitulationParams
): Promise<BmhpMinistryRecapitulationResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-recapitulation`,
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<BmhpMinistryRecapitulationResponse>(response)
}

/**
 * Save Desk Result
 * POST /bmhp-approval/procurement-recapitulation/desk-result
 */
export const saveDeskResult = async (
  payload: SaveDeskResultPayload
): Promise<any> => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/procurement-recapitulation/desk-result`,
    payload
  )

  return handleAxiosResponse<any>(response)
}

/**
 * Save Desk Result Record
 * POST /bmhp-approval/procurement-recapitulation/desk-result-record
 */
export const saveDeskResultRecord = async (
  payload: SaveDeskResultRecordPayload
): Promise<any> => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/procurement-recapitulation/desk-result-record`,
    payload
  )

  return handleAxiosResponse<any>(response)
}

/**
 * GET /bmhp-approval/ministry-recapitulation/detail
 */
export const getMinistryRecapitulationDetail = async (
  params: MinistryRecapitulationDetailParams
): Promise<GetMinistryRecapitulationDetailResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-recapitulation/detail`,
    {
      params,
      cleanParams: true,
    }
  )
  return handleAxiosResponse<GetMinistryRecapitulationDetailResponse>(response)
}

/**
 * Export Ministry Recapitulation to Excel
 * GET /bmhp-approval/ministry-recapitulation/xls
 */
export const exportBmhpMinistryRecapitulation = async (
  params: BmhpMinistryRecapitulationParams
): Promise<any> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/ministry-recapitulation/xls`,
    {
      params,
      cleanParams: true,
      responseType: 'json',
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)

  return response.data
}
