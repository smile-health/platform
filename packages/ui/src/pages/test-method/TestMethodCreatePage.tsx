'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import TestMethodForm from './components/TestMethodForm'

export default function TestMethodCreatePage(): JSX.Element {
  usePermission('test-method-mutate')
  const { t } = useTranslation(['common', 'testMethod'])
  return (
    <Container
      title={t('testMethod:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('testMethod:title.create')}`} />
      <div className="mt-6 space-y-6">
        <TestMethodForm />
      </div>
    </Container>
  )
}
