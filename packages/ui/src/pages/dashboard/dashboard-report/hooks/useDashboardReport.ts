import { useQuery } from '@tanstack/react-query'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import {
  exportDashboardReport,
  getDashboardReport,
} from '../dashboard-report.service'
import { DashboardReportParams } from '../dashboard-report.type'

type Params = {
  params: DashboardReportParams
  paramsExportAll: DashboardReportParams
  enabled: boolean
  type: 'monthly' | 'annual'
}

export default function useDashboardReport({
  params,
  paramsExportAll,
  enabled,
  type,
}: Params) {
  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [`${type}-report`, params],
    queryFn: () => getDashboardReport(params),
    enabled: enabled && !!params?.entity_id && !!params?.from && !!params?.to,
  })

  const {
    refetch: onExport,
    isLoading: exportLoading,
    isFetching: exportFetching,
  } = useQuery({
    queryKey: [`export-${type}-report`, params],
    queryFn: () => exportDashboardReport(params),
    enabled: false,
  })

  const exportAllQueryKey = [`export-all-${type}-report`, paramsExportAll]
  const {
    refetch: onExportAll,
    isLoading: exportAllLoading,
    isFetching: exportAllFetching,
    isSuccess,
  } = useQuery({
    queryKey: exportAllQueryKey,
    queryFn: () => exportDashboardReport(paramsExportAll, true),
    enabled: false,
  })

  useSetLoadingPopupStore(
    exportLoading || exportFetching || exportAllLoading || exportAllFetching
  )

  useSetExportPopupStore(isSuccess, exportAllQueryKey)

  return {
    data: dataSource?.data,
    isLoading: isLoading || isFetching,
    onExport,
    onExportAll,
  }
}
