import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { exportPeriodOfStockTakings } from '../../services/period-of-stock-taking.services'

type Props = {
  filter: Record<string, any>
}

export const usePeriodOfStockTakingListExport = ({ filter }: Props) => {
  const exportQuery = useQuery({
    queryKey: ['export-list-period-of-stock-taking', filter.getValues()],
    queryFn: () => exportPeriodOfStockTakings(filter.getValues()),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery.isLoading || exportQuery.isFetching)

  return {
    exportQuery,
  }
}
