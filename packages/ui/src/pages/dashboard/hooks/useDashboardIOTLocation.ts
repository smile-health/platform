import { ForwardedRef, useImperativeHandle } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { handleFilterDashboardIOT } from '../dashboard.helper'
import { getDashboardIOTLocation } from '../dashboard.service'
import {
  TDashboardIOTFilter,
  TDashboardIOTHandler,
  TDashboardIOTSubPath,
} from '../dashboard.type'
import useDashboardIOTExport from './useDashboardIOTExport'

type Params = {
  path: TDashboardIOTSubPath
  filter: TDashboardIOTFilter
  onResetPage: VoidFunction
  enabled?: boolean
  page: number
  paginate: number
}

export default function useDashboardIOTLocation(
  ref: ForwardedRef<TDashboardIOTHandler>,
  params: Params
) {
  const { path, filter, onResetPage, page, paginate, enabled } = params

  const {
    i18n: { language },
  } = useTranslation()

  const {
    data: dataSource,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [`dashboard-${path}-location`, filter, language, page, paginate],
    queryFn: () =>
      getDashboardIOTLocation(
        { ...handleFilterDashboardIOT(filter), page, paginate },
        path
      ),
    enabled,
  })

  const { onExport } = useDashboardIOTExport({ path, filter, type: 'location' })

  useImperativeHandle(ref, () => ({
    onResetPage,
    onExport,
  }))

  return {
    isLoading: isLoading || isFetching,
    dataSource,
  }
}
