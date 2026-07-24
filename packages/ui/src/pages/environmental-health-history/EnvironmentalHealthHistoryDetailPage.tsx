'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import EnvironmentalHealthHistoryDetailInfo from './components/EnvironmentalHealthHistoryDetailInfo'
import { useEnvironmentalHealthHistoryDetail } from './hooks/useEnvironmentalHealthHistoryDetail'

export default function EnvironmentalHealthHistoryDetailPage(): JSX.Element {
  usePermission('environmental-health-history-view')
  const { t } = useTranslation(['common', 'environmentalHealthHistory'])
  const router = useSmileRouter()

  const { data, isLoading } = useEnvironmentalHealthHistoryDetail()

  return (
    <Container
      title={t('environmentalHealthHistory:title.detail')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => router.push('/v5/environmental-health-history'),
      }}
    >
      <Meta title={`Smile | ${t('environmentalHealthHistory:title.detail')}`} />
      <EnvironmentalHealthHistoryDetailInfo
        data={data}
        isLoading={isLoading}
      />
    </Container>
  )
}
