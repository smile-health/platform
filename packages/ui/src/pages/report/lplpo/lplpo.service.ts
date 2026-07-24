import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import { LPLPOParams, LPLPOResponse } from './lplpo.type'

export async function getLPLPOReport(params: LPLPOParams) {
  const response = await axios.get<LPLPOResponse>(
    '/warehouse-report/report/lplpo',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function exportLPLPO(params: LPLPOParams, isAll = false) {
  const response = await axios.get(
    `/warehouse-report/report/lplpo/${isAll ? 'export/all' : 'export'}`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}
