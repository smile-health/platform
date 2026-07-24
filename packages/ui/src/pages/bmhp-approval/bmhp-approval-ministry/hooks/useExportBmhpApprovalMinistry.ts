import { useMutation } from '@tanstack/react-query'

import { ListBmhpApprovalMinistryParams } from '../libs/bmhp-approval-ministry.type'
import { exportBmhpApprovalMinistry } from '../services/bmhp-approval-ministry.service'

export const useExportBmhpApprovalMinistry = (
  params: ListBmhpApprovalMinistryParams
) => {
  const mutation = useMutation({
    mutationKey: ['export-bmhp-approval-ministry', params],
    mutationFn: () => exportBmhpApprovalMinistry(params),
  })

  return {
    exportData: mutation,
    isLoading: mutation.isPending,
  }
}
