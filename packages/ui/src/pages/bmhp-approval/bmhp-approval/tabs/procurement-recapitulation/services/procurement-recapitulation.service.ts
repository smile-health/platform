import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

import {
  GetProcurementRecapitulationResponse,
  ProcurementRecapitulationParams,
  SaveRemainingStockPayload,
  SaveRemainingStockResponse,
} from '../libs/procurement-recapitulation.type'

const baseUrl = 'main/'

/**
 * GET /bmhp-approval/procurement-recapitulation
 * Returns procurement recapitulation list for the logged-in entity.
 */
export const getProcurementRecapitulation = async (
  params: ProcurementRecapitulationParams
): Promise<GetProcurementRecapitulationResponse> => {
  const response = await axios.get(
    `${baseUrl}bmhp-approval/procurement-recapitulation`,
    { params, cleanParams: true }
  )
  return handleAxiosResponse<GetProcurementRecapitulationResponse>(response)
}

/**
 * POST /bmhp-approval/procurement-recapitulation
 * Save remaining stock inputs; server recalculates proposal_qty automatically.
 * Validates that response has status: true, otherwise throws error.
 */
export const saveRemainingStock = async (
  body: SaveRemainingStockPayload
): Promise<SaveRemainingStockResponse> => {
  const response = await axios.post(
    `${baseUrl}bmhp-approval/procurement-recapitulation`,
    body
  )
  const result = handleAxiosResponse<SaveRemainingStockResponse>(response)

  // Check if backend returned status: false
  if ((result as any)?.status === false) {
    const errorMessage = (result as any)?.message || 'Unknown error occurred'
    throw new Error(errorMessage)
  }

  return result
}

/**
 * GET /bmhp-approval/procurement-recapitulation/xls
 * Export procurement recapitulation as Excel file.
 * Note: page/paginate are intentionally excluded — the export returns all data.
 */
export const getProcurementRecapitulationXls = async (
  params: Pick<
    ProcurementRecapitulationParams,
    'program_plan_id' | 'regency_id' | 'remaining_stock_date'
  >
): Promise<void> => {
  const { program_plan_id, regency_id, remaining_stock_date } = params
  const response = await axios.get(
    `${baseUrl}bmhp-approval/procurement-recapitulation/xls`,
    {
      responseType: 'json',
      params: { program_plan_id, regency_id, remaining_stock_date },
      cleanParams: true,
    }
  )

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)
}
