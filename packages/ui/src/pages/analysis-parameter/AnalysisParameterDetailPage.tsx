'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import AnalysisParameterDetailInfo from './components/AnalysisParameterDetailInfo'
import { useAnalysisParameterDetail } from './hooks/useAnalysisParameterDetail'

export default function AnalysisParameterDetailPage(): JSX.Element {
  usePermission('analysis-parameter-view')
  const { t } = useTranslation(['common', 'analysisParameter'])
  const router = useSmileRouter()

  const { data, isLoading } = useAnalysisParameterDetail()

  return (
    <Container
      title={t('analysisParameter:title.detail')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => router.push('/v5/analysis-parameter'),
      }}
    >
      <Meta title={`Smile | ${t('analysisParameter:title.detail')}`} />
      <AnalysisParameterDetailInfo
        data={data}
        isLoading={isLoading}
      />
    </Container>
  )
}
