import { ForwardedRef, useImperativeHandle } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { handleFilterDashboardIOT } from '../dashboard.helper'
import { getDashboardIOTReview } from '../dashboard.service'
import {
  TDashboardIOTFilter,
  TDashboardIOTHandler,
  TDashboardIOTSubPath,
} from '../dashboard.type'
import useDashboardIOTExport from './useDashboardIOTExport'

type Params = {
  path: TDashboardIOTSubPath
  filter: TDashboardIOTFilter
  enabled?: boolean
}

export default function useDashboardIOTOverall(
  ref: ForwardedRef<TDashboardIOTHandler>,
  { path, filter, enabled }: Params
) {
  const {
    i18n: { language },
  } = useTranslation()

  const {
    data: dataSource,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [`dashboard-${path}-review`, filter, language],
    queryFn: () =>
      getDashboardIOTReview(handleFilterDashboardIOT(filter), path),
    enabled,
    initialData: {
      last_updated: '',
      data: {
        categories: [],
        dataset: [],
      },
    },
  })

  const { onExport } = useDashboardIOTExport({ path, filter, type: 'review' })

  useImperativeHandle(ref, () => ({
    onExport,
  }))

  return {
    isLoading: isLoading || isFetching,
    dataSource,
  }
}
