import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { exportDistributionDisposal } from '../services/distribution-disposal.services'

type Props = {
  filter: Record<string, any>
  additionalQuery: Record<string, any>
}

export const useDistributionDisposalListExport = ({
  filter,
  additionalQuery,
}: Props) => {
  const filterQuery = useMemo(() => {
    const raw = {
      ...filter.query,
      date_range: {
        start: filter.query.date_range?.start?.toString(),
        end: filter.query.date_range?.end?.toString(),
      },
    }
    return Object.fromEntries(
      Object.entries(raw).filter(([key, val]) => {
        if (key === 'purpose') return true
        return !!val
      })
    )
  }, [filter.query])

  const queryKey = [
    'export-list-distribution-disposal',
    JSON.stringify(filterQuery),
    additionalQuery,
  ]
  const exportQuery = useQuery({
    queryKey,
    queryFn: () =>
      exportDistributionDisposal({
        ...filterQuery,
        purpose: additionalQuery.purpose as string,
      }),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery.isLoading || exportQuery.isFetching)
  return {
    exportQuery,
  }
}
