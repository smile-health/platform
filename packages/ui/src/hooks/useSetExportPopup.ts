import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useExportAsyncPopupStore } from '#store/exportAsync.store'

export const useSetExportPopupStore = (
  dependency: boolean,
  queryKeyExport: any = null
) => {
  const { setExportAsyncPopup } = useExportAsyncPopupStore()
  const queryClient = useQueryClient()
  useEffect(() => {
    setExportAsyncPopup(dependency)
    return () => {
      if (queryKeyExport) {
        setTimeout(
          () => queryClient.removeQueries({ queryKey: queryKeyExport }),
          1000
        )
      }
    }
  }, [dependency])
}
