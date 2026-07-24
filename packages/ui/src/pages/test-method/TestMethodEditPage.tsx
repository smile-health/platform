'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import TestMethodForm from './components/TestMethodForm'
import { useTestMethodDetail } from './hooks/useTestMethodDetail'

export default function TestMethodEditPage(): JSX.Element {
  usePermission('test-method-mutate')
  const { t } = useTranslation(['common', 'testMethod'])
  const { data, isLoading } = useTestMethodDetail()

  if (isLoading) return <div>Loading...</div>

  return (
    <Container
      title={t('testMethod:title.edit')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('testMethod:title.edit')}`} />
      <div className="mt-6 space-y-6">
        <TestMethodForm isEdit defaultValues={data} />
      </div>
    </Container>
  )
}
