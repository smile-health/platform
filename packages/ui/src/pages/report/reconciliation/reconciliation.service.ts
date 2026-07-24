import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  ReconciliationEntityParams,
  ReconciliationEntityResponse,
  ReconciliationSummaryParams,
  ReconciliationSummaryResponse,
} from './reconciliation.type'

export async function getReconciliationSummary(
  params: ReconciliationSummaryParams
) {
  const response = await axios.get<ReconciliationSummaryResponse>(
    '/warehouse-report/reconciliation/summary-report',
    {
      params,
    }
  )

  return response?.data
}

export async function getReconciliationEntities(
  params: ReconciliationEntityParams
) {
  const response = await axios.get<ReconciliationEntityResponse>(
    '/warehouse-report/reconciliation/entities-report',
    {
      params,
    }
  )

  return response?.data
}

export async function getReconciliationEntitiesExport(
  params: ReconciliationEntityParams
) {
  const response = await axios.get(
    '/warehouse-report/reconciliation/entities-report/export',
    {
      responseType: 'blob',
      params,
    }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}
