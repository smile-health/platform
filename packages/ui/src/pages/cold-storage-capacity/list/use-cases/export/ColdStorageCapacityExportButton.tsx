import { Button } from '#components/button'
import Download from '#components/icons/Download'
import { useTranslation } from 'react-i18next'

import { useColdStorageCapacityExport } from './useColdStorageCapacityExport'

export default function ColdStorageCapacityExportButton() {
  const { t } = useTranslation('coldStorageCapacity')
  const { exportData } = useColdStorageCapacityExport()

  const handleExport = () => {
    exportData.refetch()
  }

  return (
    <Button
      variant="subtle"
      leftIcon={<Download className="ui-size-5" />}
      onClick={handleExport}
      loading={exportData.isFetching}
    >
      {t('button.export')}
    </Button>
  )
}
