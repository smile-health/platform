import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getComplianceSummaryList } from '../dashboard-stock-taking.constant'
import {
  createHookReturn,
  generateSummary,
  handleFilter,
} from '../dashboard-stock-taking.helper'
import {
  listCompliance,
  listComplianceSummary,
} from '../dashboard-stock-taking.service'

type Params = {
  filter: Values<Record<string, any>>
  page: number
  paginate: number
}

export default function useStockTakingDashboardCompliance(config: Params) {
  const { filter, page, paginate } = config
  const { t } = useTranslation('dashboardStockTaking')

  const [enabledTable, setEnabledTable] = useState(false)
  const [enabledSummary, setEnabledSummary] = useState(false)

  const complianceSummary = getComplianceSummaryList(t)
  const params = handleFilter(filter)
  const paramsPaginate = {
    page,
    paginate,
    ...params,
  }

  const { data: table, ...tableQuery } = useQuery({
    queryKey: ['compliance', paramsPaginate],
    queryFn: () => listCompliance(paramsPaginate),
    enabled: enabledTable && !!params?.period_id,
    placeholderData: keepPreviousData,
  })

  const { data: summary, ...summaryQuery } = useQuery({
    queryKey: ['compliance-summary', params],
    queryFn: () => listComplianceSummary(params),
    enabled: enabledSummary && !!params?.period_id,
    placeholderData: keepPreviousData,
  })

  const isLoading = tableQuery?.isLoading || tableQuery?.isFetching
  const isLoadingSummary = summaryQuery?.isLoading || summaryQuery?.isFetching

  useEffect(() => {
    if (tableQuery?.isFetched && summaryQuery?.isFetched) {
      if (enabledTable) setEnabledTable(false)
      if (enabledSummary) setEnabledSummary(false)
    }
  }, [tableQuery, summaryQuery, enabledTable, enabledSummary])

  const getData = (pagination: number) => {
    setEnabledTable(true)
    if (!pagination) setEnabledSummary(true)
  }

  return createHookReturn(
    getData,
    table,
    isLoading,
    isLoadingSummary,
    generateSummary(summary?.data, complianceSummary)
  )
}
