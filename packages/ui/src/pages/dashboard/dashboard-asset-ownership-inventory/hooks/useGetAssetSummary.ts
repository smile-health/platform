import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'

import { handleFilter } from '../dashboard-asset-ownership-inventory.helper'
import { getAssetSummary } from '../dashboard-asset-ownership-inventory.service'

export type DashboardSummaryDetail = {
  id: number | null
  title: string | null
  total: number | null
  color?: string | null
}

export type DashboardSummaryEntry = {
  title: string | null
  details: DashboardSummaryDetail[] | null
  total: number | null
  id: number | null
}

export default function useGetAssetSummary(
  filter: Values<Record<string, any>>,
  isLoadingAssetTypes: boolean,
  language: string
) {
  const params = handleFilter(filter)
  const enabled = Object.values(params)?.length > 0 && !isLoadingAssetTypes

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['asset-ownership-inventory-summary', params, language],
    queryFn: () => getAssetSummary(params),
    enabled,
  })

  const assetOwnershipInventorySummary: DashboardSummaryEntry[] =
    useMemo(() => {
      const summary = data?.data || []

      return summary?.map((item) => ({
        title: item?.title || '',
        details: item?.details?.toSorted(
          (a, b) => (b?.total ?? 0) - (a?.total ?? 0)
        ),
        total: item?.total || 0,
        id: item?.id,
      }))
    }, [data, language])

  const tabs = useMemo(
    () =>
      data?.data?.map((item) => ({
        id: item?.id?.toString() || '',
        label: item?.title || '',
      })),
    [data, language]
  )

  return {
    tabs,
    isLoading: isLoading || isFetching,
    data: assetOwnershipInventorySummary,
  }
}
