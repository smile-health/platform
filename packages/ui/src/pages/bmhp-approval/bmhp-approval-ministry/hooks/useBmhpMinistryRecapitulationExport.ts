import { useMutation } from '@tanstack/react-query'

import { exportBmhpMinistryRecapitulation } from '../services/bmhp-approval-ministry.service'
import type { BmhpMinistryRecapitulationParams } from '../libs/bmhp-approval-ministry.type'

export const useBmhpMinistryRecapitulationExport = (
  params: BmhpMinistryRecapitulationParams
) => {
  const mutation = useMutation({
    mutationKey: ['export-bmhp-ministry-recapitulation', params],
    mutationFn: () => exportBmhpMinistryRecapitulation(params),
  })

  return {
    exportData: mutation,
    isLoading: mutation.isPending,
  }
}
