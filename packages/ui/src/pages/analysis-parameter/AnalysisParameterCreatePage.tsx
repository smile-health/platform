'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import AnalysisParameterForm from './components/AnalysisParameterForm'

export default function AnalysisParameterCreatePage(): JSX.Element {
  usePermission('analysis-parameter-mutate')
  const { t } = useTranslation(['common', 'analysisParameter'])
  const router = useSmileRouter()

  return (
    <Container
      title={t('analysisParameter:title.create')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => router.push('/v5/analysis-parameter'),
      }}
    >
      <Meta title={`Smile | ${t('analysisParameter:title.create')}`} />
      <AnalysisParameterForm />
    </Container>
  )
}
