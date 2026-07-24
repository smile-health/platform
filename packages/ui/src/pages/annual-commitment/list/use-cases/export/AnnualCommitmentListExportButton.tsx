import { Button } from '#components/button'
import Export from '#components/icons/Export'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { useAnnualCommitmentListExport } from './useAnnualCommitmentListExport'

const AnnualCommitmentListExportButton = () => {
  const { t } = useTranslation('annualCommitmentList')

  const { exportData } = useAnnualCommitmentListExport()

  useSetLoadingPopupStore(exportData?.isFetching)

  const handleExport = () => {
    exportData?.refetch()
  }

  return (
    <Button
      id="btn-export"
      variant="subtle"
      type="button"
      onClick={handleExport}
      leftIcon={<Export className="ui-size-5" />}
    >
      {t('button.export')}
    </Button>
  )
}

export default AnnualCommitmentListExportButton
