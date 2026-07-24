import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  downloadFileExportHistory,
  getListExportHistory,
} from '../export-history-list.services'
import ExportHistoryFilterSchema from '../schema/ExportHistoryFilterSchema'
import { useLoadingPopupStore } from '#store/loading.store'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'

export default function useExportHistoryList() {
  const {
    t,
    i18n: { language },
  } = useTranslation('exportHistory')
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => ExportHistoryFilterSchema(t),
    [t]
  )

  const filter = useFilter(filterSchema)
  const { query } = filter
  const params = {
    ...pagination,
    start_date: query.request_date?.start?.toString(),
    end_date: query.request_date?.end?.toString(),
    program_id: query?.program_id?.value,
    keyword: query?.keyword,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['list-export-history', params, language],
    queryFn: () => getListExportHistory(params),
    placeholderData: keepPreviousData,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const { setLoadingPopup } = useLoadingPopupStore()

  const downloadFile = async (fileName: string, originalFileName: string) => {
    if (!fileName && !originalFileName) return toast.danger({ description: `Error, file doesn't exist` })
    try {
      setLoadingPopup(true)
      await downloadFileExportHistory(originalFileName, fileName)
    } catch (error) {
      toast.danger({ description: `Error, file doesn't exist` })
    } finally {
      setLoadingPopup(false)
    }
  }

  useSetLoadingPopupStore(isFetching)

  return {
    pagination,
    setPagination,
    filter,
    handleChangeLimit,
    data,
    isLoading: isLoading || isFetching,
    downloadFile,
  }
}
