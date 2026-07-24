import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleMicroplanningFilter } from '../../dashboard.helper'
import {
  tableTotalTargetColumns,
  MicroplanningDashboardType,
} from '../dashboard-microplanning.constant'
import { getTotalTargetData } from '../dashboard-microplanning.service'

export default function useGetTotalTargetDataTable<T extends MicroplanningDashboardType>(
  filter: Values<Record<string, any>>,
  tab: T,
  submitKey: number
) {
  const { t } = useTranslation('dashboardMicroplanning')

  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const { page, paginate } = pagination

  const finalFilter = handleMicroplanningFilter({ ...filter })
  const params = { ...finalFilter, page, paginate }

  const {
    data: totalTargetData,
    isLoading: istotalTargetLoading,
    isFetching: istotalTargetFetching,
  } = useQuery({
    queryKey: ['total-target', params, tab, submitKey],
    queryFn: () => getTotalTargetData(params, tab),
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const data = totalTargetData?.data ?? []

  const columns = tableTotalTargetColumns(t, totalTargetData?.columns ?? [])

  return {
    name: 'total-target',
    dataSource: data,
    columns: columns,
    isLoading: istotalTargetLoading,
    isFetching: istotalTargetFetching,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    total: totalTargetData?.total_item,
  }
}