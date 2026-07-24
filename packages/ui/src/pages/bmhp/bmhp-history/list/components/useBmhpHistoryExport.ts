import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getReactSelectValue } from '#utils/react-select'

import useMasterTable from '../hooks/useMasterTable'
import { useTableFilter } from '../hooks/useTableFilter'
import {
  exportBmhpHistoryType,
  GetBmhpHistoryTypeListParams,
} from '../master.service'

export const useBmhpHistoryExport = () => {
  const [isLoading, setIsLoading] = useState(false)
  const basePath = `/v5/bmhp-planning-history`

  const bmhpHistoryFilter = useTableFilter()
  const bmhpHistoryTable = useMasterTable({ basePath })

  const params: GetBmhpHistoryTypeListParams = {
    page: bmhpHistoryTable.pagination.page,
    paginate: bmhpHistoryTable.pagination.paginate,
    examination_id: getReactSelectValue(
      bmhpHistoryFilter?.filter.getValues()?.examination_id
    ),
    year: getReactSelectValue(bmhpHistoryFilter?.filter.getValues()?.year),
    search: bmhpHistoryFilter?.filter.getValues()?.search ?? undefined,
    status: getReactSelectValue(bmhpHistoryFilter?.filter.getValues()?.status),
  }

  const exportData = useMutation({
    mutationKey: ['export-bmhp-history'],
    mutationFn: async () => {
      setIsLoading(true)
      try {
        const response = await exportBmhpHistoryType(params)
        return response
      } finally {
        setIsLoading(false)
      }
    },
  })

  return {
    exportData,
    isLoading,
  }
}
