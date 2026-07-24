import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  SmileVsSmdvEntityResponse,
  SmileVsSmdvMaterialResponse,
  SmileVsSmdvSummaryParams,
  SmileVsSmdvSummaryResponse,
} from './dashboard-smile-smdv.type'

export async function getSmileVsSmdvSummary(params: SmileVsSmdvSummaryParams) {
  const response = await axios.get<SmileVsSmdvSummaryResponse>(
    '/warehouse-report/biofarma/summary',
    {
      params,
    }
  )

  return response?.data
}

export async function getSmileVsSmdvEntities(params: SmileVsSmdvSummaryParams) {
  const response = await axios.get<SmileVsSmdvEntityResponse>(
    '/warehouse-report/biofarma/entity',
    {
      params,
    }
  )

  return response?.data
}

export async function getSmileVsSmdvMaterials(
  params: SmileVsSmdvSummaryParams
) {
  const response = await axios.get<SmileVsSmdvMaterialResponse>(
    '/warehouse-report/biofarma/material',
    {
      params,
    }
  )

  return response?.data
}

export async function exportDashboardReport(params: SmileVsSmdvSummaryParams) {
  const response = await axios.get('/warehouse-report/biofarma/export', {
    params,
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
