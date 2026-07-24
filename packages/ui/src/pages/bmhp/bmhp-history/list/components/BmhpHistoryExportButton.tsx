import { Button } from '#components/button'
import Download from '#components/icons/Download'
import { useTranslation } from 'react-i18next'

import { useBmhpHistoryExport } from './useBmhpHistoryExport'

export default function BmhpHistoryExportButton() {
  const { t } = useTranslation('coldStorageCapacity')
  const { exportData, isLoading } = useBmhpHistoryExport()

  const handleExport = () => {
    exportData.mutate()
  }

  return (
    <Button
      variant="subtle"
      leftIcon={<Download className="ui-size-5" />}
      onClick={handleExport}
      loading={isLoading}
    >
      {t('button.export')}
    </Button>
  )
}
