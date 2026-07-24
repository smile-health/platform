import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getLabelOptions, handleFilter } from '../user-activity.helper'
import { getOverview } from '../user-activity.service'

export default function useGetOverviewChart(
  filter: Values<Record<string, any>>
) {
  const { t } = useTranslation('userActivity')
  const [enabled, setEnabled] = useState(false)

  const params = handleFilter(filter)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['overview-activity', params],
    queryFn: () => getOverview(params),
    enabled: enabled && !!params?.from && !!params.to,
    staleTime: 0,
    gcTime: 0,
  })

  const activeLabel = t('title.type.active')
  const activeTotal = data?.overview?.active?.entity ?? 0
  const inactiveLabel = t('title.type.inactive')
  const inactiveTotal = data?.overview?.inactive?.entity ?? 0
  const loading = isLoading || isFetching

  const getChart = () => {
    if (!enabled) setEnabled(true)
  }

  return {
    month: data?.month,
    activity: {
      id: data?.activity_id,
      name: data?.activity_name,
    },
    data: [
      {
        value: activeTotal,
        name: activeLabel,
        labelLine: {
          length: 30,
        },
        label: getLabelOptions(true),
      },
      {
        value: inactiveTotal,
        name: inactiveLabel,
        labelLine: {
          length: 30,
        },
        label: getLabelOptions(),
      },
    ],
    total: activeTotal + inactiveTotal,
    legendMaps: {
      [activeLabel]: `${activeTotal} ${activeLabel}`,
      [inactiveLabel]: `${inactiveTotal} ${inactiveLabel}`,
    },
    isEmpty: !data?.overview && !loading,
    isLoading: loading,
    getChart: () => setTimeout(getChart, 300),
  }
}
