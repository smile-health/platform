import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  DashboardReportParams,
  DashboardReportResponse,
} from './dashboard-report.type'

export async function getDashboardReport(params: DashboardReportParams) {
  const response = await axios.get<DashboardReportResponse>(
    '/warehouse-report/periodic-material-stock',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function exportDashboardReport(
  params: DashboardReportParams,
  isAll = false
) {
  const response = await axios.get(
    `/warehouse-report/periodic-material-stock/${isAll ? 'export-all' : 'export'}`,
    {
      responseType: 'blob',
      params,
      cleanParams: true,
    }
  )

  if (!isAll) {
    parseDownload(response?.data, response?.headers?.filename)
  }

  return response?.data
}
