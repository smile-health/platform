import { useQuery } from '@tanstack/react-query'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { exportLPLPO } from '../lplpo.service'
import { LPLPOParams } from '../lplpo.type'

const useLPLPOExport = (params: LPLPOParams, paramsExportAll: LPLPOParams) => {
  const {
    refetch: onExport,
    isLoading: exportLoading,
    isFetching: exportFetching,
    isSuccess: exportSuccess,
  } = useQuery({
    queryKey: [`export-lplpo-report`, params],
    queryFn: () => exportLPLPO(params),
    enabled: false,
  })

  const {
    refetch: onExportAll,
    isLoading: exportAllLoading,
    isFetching: exportAllFetching,
    isSuccess: exportAllSuccess,
  } = useQuery({
    queryKey: [`export-all-lplpo-report`, paramsExportAll],
    queryFn: () => exportLPLPO(paramsExportAll, true),
    enabled: false,
  })

  useSetLoadingPopupStore(
    exportLoading || exportFetching || exportAllLoading || exportAllFetching
  )

  useSetExportPopupStore(exportSuccess, [
    `export-lplpo-report`,
    params,
  ])

  useSetExportPopupStore(exportAllSuccess, [
    `export-all-lplpo-report`,
    paramsExportAll,
  ])

  return {
    onExport,
    onExportAll,
  }
}

export default useLPLPOExport
