import React from 'react'
import { EmptyState } from '#components/empty-state'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import DistributionDisposalDetailBox from './components/DistributionDisposalDetailBox'
import DistributionDisposalDetailComment from './components/DistributionDisposalDetailComment'
import DistributionDisposalDetailFloatingBar from './components/DistributionDisposalDetailFloatingBar'
import DistributionDisposalDetailMaterial from './components/DistributionDisposalDetailMaterial'
import DistributionDisposalDetailStatus from './components/DistributionDisposalDetailStatus'
import { STATUS_DISTRIBUTION_DISPOSAL } from './constants/status'
import useDistributionDisposalDetailData from './hooks/useDistributionDisposalDetailData'
import DistributionDisposalDetailContext from './utils/distribution-disposal-detail.context'

const DistributionDisposalDetailPage: React.FC = () => {
  usePermission('disposal-distribution-view')

  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])
  const router = useSmileRouter()

  const detailData = useDistributionDisposalDetailData(language)

  const title = detailData.data
    ? `${t('distributionDisposal:detail.title')} - KPM-${detailData.data.id}`
    : t('distributionDisposal:detail.title')

  const backButtonObject = detailData.inProcess
    ? {
        show: true,
        label: t('distributionDisposal:detail.action.back_to_detail'),
        onClick: () => {
          detailData.setInProcess(false)
        },
      }
    : {
        show: true,
        label: t('common:back_to_list'),
        onClick: () => {
          router.push('/v5/disposal-shipment')
        },
      }

  useSetLoadingPopupStore(detailData.isLoading || detailData.isFetching)

  return (
    <AppLayout title={title} backButton={backButtonObject}>
      <Meta title={title} />
      {detailData?.data ? (
        <DistributionDisposalDetailContext.Provider value={detailData}>
          <div className="ui-space-y-6">
            <DistributionDisposalDetailStatus />
            <DistributionDisposalDetailMaterial />
            {!detailData.inProcess && <DistributionDisposalDetailBox />}
          </div>

          <DistributionDisposalDetailComment />
          {([
            detailData.data?.vendor?.id,
            detailData.data?.customer?.id,
          ].includes(Number(detailData?.activeProgram?.entity_id)) ||
            detailData.isIronHandedRole) &&
          Number(detailData.data?.status) ===
            STATUS_DISTRIBUTION_DISPOSAL.SENT &&
          hasPermission('disposal-distribution-mutate') ? (
            <DistributionDisposalDetailFloatingBar />
          ) : null}
        </DistributionDisposalDetailContext.Provider>
      ) : (
        <EmptyState
          title={t('common:message.empty.title')}
          description={t('common:message.empty.description')}
          withIcon
        />
      )}
    </AppLayout>
  )
}

export default DistributionDisposalDetailPage
