import { useMutation } from '@tanstack/react-query'

import { ProcurementRecapitulationParams } from '../libs/procurement-recapitulation.type'
import { getProcurementRecapitulationXls } from '../services/procurement-recapitulation.service'

type ExportParams = Pick<
  ProcurementRecapitulationParams,
  'program_plan_id' | 'regency_id' | 'remaining_stock_date'
>

export const useProcurementRecapitulationExport = (params: ExportParams) => {
  const mutation = useMutation({
    mutationKey: ['export-procurement-recapitulation', params.program_plan_id],
    mutationFn: () => getProcurementRecapitulationXls(params),
  })

  return {
    exportData: mutation,
    isLoading: mutation.isPending,
  }
}
