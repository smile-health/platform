'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import TestMethodDetailInfo from './components/TestMethodDetailInfo'
import { useTestMethodDetail } from './hooks/useTestMethodDetail'

export default function TestMethodDetailPage(): JSX.Element {
  usePermission('test-method-view')
  const { t } = useTranslation(['testMethod', 'common'])
  const router = useSmileRouter()

  const { data, isLoading } = useTestMethodDetail()

  return (
    <Container
      title={t('title.detail')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => router.push('/v5/test-method'),
      }}
    >
      <Meta title={`Smile | ${t('title.detail')}`} />
      <div className="ui-space-y-6">
        <TestMethodDetailInfo
          data={data}
          isLoading={isLoading}
        />
      </div>
    </Container>
  )
}
