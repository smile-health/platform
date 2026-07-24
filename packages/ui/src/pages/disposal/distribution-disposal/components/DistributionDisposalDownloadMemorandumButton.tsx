import React from 'react'
import { Button } from '#components/button'
import PaperIcon from '#components/icons/PaperIcon'
import { useTranslation } from 'react-i18next'

import { useDistributionDisposalDownlaodMemo } from '../hooks/useDistributionDisposalDownlaodMemo'

const DistributionDisposalDownloadMemorandumButton = () => {
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { downloadQuery } = useDistributionDisposalDownlaodMemo()

  return (
    <Button
      id="download__memorandum__distribution_disposal"
      data-testid="download__memorandum__distribution_disposal"
      type="button"
      variant="outline"
      onClick={() => downloadQuery.refetch()}
      disabled={downloadQuery.isFetching || downloadQuery.isLoading}
      leftIcon={<PaperIcon />}
    >
      {t('distributionDisposal:detail.action.download_memorandum')}
    </Button>
  )
}

export default DistributionDisposalDownloadMemorandumButton
