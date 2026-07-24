import { useQuery } from '@tanstack/react-query'
import { useFilter } from '#components/filter'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

import { handleFilter } from '../stock-book.helper'
import { exportStockBook } from '../stock-book.service'

export default function useStockBookExport(
  filter: ReturnType<typeof useFilter>
) {
  const params = handleFilter(filter?.query)

  const exportQuery = useQuery({
    queryKey: ['stock-book-export', params],
    queryFn: () => exportStockBook(params),
    enabled: false,
  })

  const exportAllQueryKey = ['stock-book-export-all', params]
  const exportAllQuery = useQuery({
    queryKey: exportAllQueryKey,
    queryFn: () => exportStockBook(params, true),
    enabled: false,
  })

  const isLoading =
    exportQuery?.isLoading ||
    exportQuery?.isFetching ||
    exportAllQuery?.isLoading ||
    exportAllQuery?.isFetching

  const onExport = async (isAll = false) => {
    const isValid = await filter.trigger()
    if (isValid) {
      setTimeout(isAll ? exportAllQuery?.refetch : exportQuery?.refetch, 300)
    }
  }

  useSetLoadingPopupStore(isLoading)
  useSetExportPopupStore(exportAllQuery.isSuccess, exportAllQueryKey)

  return {
    isLoading: isLoading,
    onExport: () => onExport(),
    onExportAll: () => onExport(true),
  }
}
