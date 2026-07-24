import { useMutation } from '@tanstack/react-query'

import { getBeritaAcaraPdf } from '../services/ministry-detail.service'
import type { MinistryProcurementParams } from '../services/ministry-detail.service'

export const useBeritaAcaraPdf = (params: MinistryProcurementParams) => {
  const mutation = useMutation({
    mutationKey: ['download-berita-acara-pdf', params],
    mutationFn: () => getBeritaAcaraPdf(params),
  })

  return {
    downloadPdf: mutation,
    isLoading: mutation.isPending,
  }
}
