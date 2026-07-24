import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

import {
  CompletenessMonitoringParams,
  CompletenessMonitoringResponse,
} from '../libs/completeness-monitoring.type'

const baseUrl = 'main/'

/**
 * GET /bmhp-approval/monitoring
 */
export const getCompletenessMonitoring = async (
  params: CompletenessMonitoringParams
): Promise<CompletenessMonitoringResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/monitoring`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<CompletenessMonitoringResponse>(response)
}

/**
 * GET /bmhp-approval/monitoring/xls
 */
export const exportCompletenessMonitoring = async (
  params: Partial<CompletenessMonitoringParams>
): Promise<void> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/monitoring/xls`, {
    params,
    cleanParams: true,
    responseType: 'json',
  })
  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)

  return response?.data
}
