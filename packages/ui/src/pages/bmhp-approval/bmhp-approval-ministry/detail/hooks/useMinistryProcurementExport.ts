import { useMutation } from '@tanstack/react-query'

import { MinistryProcurementParams, getMinistryProcurementXls } from '../services/ministry-detail.service'

export const useMinistryProcurementExport = (
  params: MinistryProcurementParams
) => {
  const mutation = useMutation({
    mutationKey: ['export-ministry-procurement-detail', params],
    mutationFn: () => getMinistryProcurementXls(params),
  })

  return {
    exportData: mutation,
    isLoading: mutation.isPending,
  }
}
