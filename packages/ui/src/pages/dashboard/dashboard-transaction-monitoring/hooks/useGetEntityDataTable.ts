import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { numberFormatter } from '#utils/formatter'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../../dashboard.helper'
import { getEntity } from '../../dashboard.service'
import {
  tableEntityColumns,
  tableEntityCompleteColumns,
  TransactionChartType,
} from '../dashboard-transaction-monitoring.constant'
import { getEntityComplete } from '../dashboard-transaction-monitoring.service'

export default function useGetEntityDataTable<T extends TransactionChartType>(
  filter: Values<Record<string, any>>,
  tab: T,
  sort?: 'asc' | 'desc'
) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardMonitoringTransactions')

  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const { page, paginate } = pagination

  const finalFilter = handleFilter({ sort, ...filter })
  const params = { ...finalFilter, page, paginate }
  const enabled = Object.values(finalFilter)?.length > 0

  const {
    data: entityData,
    isLoading: isEntityLoading,
    isFetching: isEntityFetching,
  } = useQuery({
    queryKey: ['transaction-by-entity', params, tab],
    queryFn: () => getEntity(params, 'transaction'),
    enabled: enabled && tab === 'entity',
  })

  const {
    data: entityCompleteData,
    isLoading: isEntityCompleteLoading,
    isFetching: isEntityCompleteFetching,
  } = useQuery({
    queryKey: ['transaction-by-entity-complete', params, tab],
    queryFn: () => getEntityComplete(params),
    enabled: enabled && tab === 'entity-complete',
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const formatNumber = (value?: number) => {
    return numberFormatter(value ?? 0, language)
  }

  const getStockData = () => {
    switch (tab) {
      case TransactionChartType.Entity:
        return entityData

      case TransactionChartType.Entity_Complete:
        return entityCompleteData

      default:
        break
    }
  }

  const getStockColumns = () => {
    switch (tab) {
      case TransactionChartType.Entity:
        return tableEntityColumns(
          t,
          page,
          paginate,
          formatNumber,
          filter?.transaction_type?.label
        )

      case TransactionChartType.Entity_Complete:
        return tableEntityCompleteColumns(
          t,
          page,
          paginate,
          formatNumber,
          filter?.informationType
        )

      default:
        return []
    }
  }

  return {
    dataSource: getStockData(),
    columns: getStockColumns(),
    isLoading:
      isEntityLoading ||
      isEntityFetching ||
      isEntityCompleteLoading ||
      isEntityCompleteFetching,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  }
}
