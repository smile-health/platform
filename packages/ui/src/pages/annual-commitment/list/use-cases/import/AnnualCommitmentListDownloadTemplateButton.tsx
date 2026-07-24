import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import Download from '#components/icons/Download'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { downloadTemplateAnnualCommitments } from '../../annual-commitment-list.service'

const AnnualCommitmentListDownloadTemplateButton = () => {
  const { t } = useTranslation('annualCommitmentList')

  const downloadTemplate = useQuery({
    queryKey: ['download-template-annual-commitment'],
    queryFn: () => downloadTemplateAnnualCommitments(),
    enabled: false,
  })

  useSetLoadingPopupStore(downloadTemplate?.isFetching)

  const handleDownloadTemplate = () => {
    return downloadTemplate?.refetch()
  }

  return (
    <Button
      id="btn-download-template"
      variant="subtle"
      type="button"
      onClick={handleDownloadTemplate}
      leftIcon={<Download className="ui-size-5" />}
    >
      {t('button.downloadTemplate')}
    </Button>
  )
}

export default AnnualCommitmentListDownloadTemplateButton
