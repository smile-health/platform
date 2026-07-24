import { Button } from '#components/button'
import Download from '#components/icons/Download'
import { useTranslation } from 'react-i18next'

import { useProcurementRecapitulationExport } from '../hooks/useProcurementRecapitulationExport'

interface Props {
  programPlanId: number
  remainingStockDate: string
  regencyId?: number
}

export default function ProcurementRecapitulationExportButton({
  programPlanId,
  remainingStockDate,
  regencyId,
}: Props) {
  const { t } = useTranslation(['bmhpApproval'])
  const { exportData, isLoading } = useProcurementRecapitulationExport({
    program_plan_id: programPlanId,
    remaining_stock_date: remainingStockDate,
    ...(regencyId ? { regency_id: regencyId } : {}),
  })

  return (
    <Button
      type="button"
      variant="subtle"
      leftIcon={<Download className="ui-size-5" />}
      onClick={() => exportData.mutate()}
      loading={isLoading}
    >
      {t('bmhpApproval:procurement_recapitulation.table.btn_export') as string}
    </Button>
  )
}

