'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import AnalysisParameterForm from './components/AnalysisParameterForm'
import AnalysisParameterSkeleton from './components/AnalysisParameterSkeleton'
import { useAnalysisParameterDetail } from './hooks/useAnalysisParameterDetail'

export default function AnalysisParameterEditPage(): JSX.Element {
  usePermission('analysis-parameter-mutate')
  const { t } = useTranslation(['common', 'analysisParameter'])
  const router = useSmileRouter()
  const { data, isLoading } = useAnalysisParameterDetail()

  return (
    <Container
      title={t('analysisParameter:title.edit')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => router.push('/v5/analysis-parameter'),
      }}
    >
      <Meta title={`Smile | ${t('analysisParameter:title.edit')}`} />
      {isLoading ? (
        <AnalysisParameterSkeleton />
      ) : (
        <AnalysisParameterForm isEdit defaultValues={data} />
      )}
    </Container>
  )
}
