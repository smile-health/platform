import { useQuery } from '@tanstack/react-query'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { numberFormatter } from '#utils/formatter'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  getComplianceColumns,
  getResultColumns,
  StockTakingType,
} from '../dashboard-stock-taking.constant'
import {
  createHookReturn,
  handleFilter,
} from '../dashboard-stock-taking.helper'
import { exportStockTaking } from '../dashboard-stock-taking.service'
import useStockTakingDashboardCompliance from './useStockTakingDashboardCompliance'
import useStockTakingDashboardMaterial from './useStockTakingDashboardMaterial'
import useStockTakingDashboardResult from './useStockTakingDashboardResult'

type Params = {
  tab: StockTakingType
  filter: Values<Record<string, any>>
  page: number
  paginate: number
}

export default function useStockTakingDashboardData(config: Params) {
  const { tab, filter, page, paginate } = config
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardStockTaking')

  const [
    getCompliance,
    {
      isLoading: isLoadingCompliance,
      isLoadingSummary: isLoadingComplianceSummary,
      table: tableCompliance,
      summary: summaryCompliance,
    },
  ] = useStockTakingDashboardCompliance({
    filter,
    page,
    paginate,
  })

  const [
    getResult,
    {
      isLoading: isLoadingResult,
      isLoadingSummary: isLoadingResultSummary,
      table: tableResult,
      summary: summaryResult,
    },
  ] = useStockTakingDashboardResult({
    filter,
    page,
    paginate,
  })

  const [getMaterial, { isLoading: isLoadingMaterial, table: tableMaterial }] =
    useStockTakingDashboardMaterial({
      filter,
      page,
      paginate,
    })

  const paramExport = handleFilter(filter)

  const type = {
    [StockTakingType.Entity]: 'compliance',
    [StockTakingType.Result]: 'result',
    [StockTakingType.Material]: 'materials',
  }

  const {
    refetch,
    isLoading,
    isFetching,
    isSuccess: isSuccessExpport,
  } = useQuery({
    queryKey: ['export-stock-taking', paramExport, tab],
    queryFn: () => exportStockTaking(paramExport, type[tab]),
    enabled: false,
  })

  const generateNumber = (index: number) => (page - 1) * paginate + (index + 1)
  const formatNumber = (value = 0) => numberFormatter(value, language)

  const getTableData = () => {
    switch (tab) {
      case StockTakingType.Entity:
        return tableCompliance
      case StockTakingType.Result:
        return tableResult
      case StockTakingType.Material:
        return tableMaterial
      default:
        break
    }
  }

  const getTableColumns = () => {
    switch (tab) {
      case StockTakingType.Entity:
        return getComplianceColumns(t, generateNumber, formatNumber)
      case StockTakingType.Result:
        return getResultColumns(t, generateNumber, formatNumber)
      default:
        return []
    }
  }

  const getSummary = () => {
    switch (tab) {
      case StockTakingType.Entity:
        return summaryCompliance
      case StockTakingType.Result:
        return summaryResult
      default:
        break
    }
  }

  const fetcherMap = {
    [StockTakingType.Entity]: getCompliance,
    [StockTakingType.Result]: getResult,
    [StockTakingType.Material]: getMaterial,
  }

  useSetLoadingPopupStore(isLoading || isFetching)
  useSetExportPopupStore(isSuccessExpport,['export-stock-taking', paramExport, tab])

  const getData = (pagination: number) => {
    const fetcher = fetcherMap[tab]
    if (typeof fetcher === 'function') {
      setTimeout(() => fetcher(pagination), 300)
    }
  }

  return createHookReturn(
    getData,
    getTableData(),
    isLoadingCompliance || isLoadingResult || isLoadingMaterial,
    isLoadingComplianceSummary || isLoadingResultSummary,
    getSummary(),
    getTableColumns(),
    () => refetch()
  )
}
