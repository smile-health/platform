'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { useTranslation } from 'react-i18next'

import ActivityForm from './components/ActivityForm'
import { usePermission } from '#hooks/usePermission'

export default function ActivityCreatePage(): JSX.Element {
  usePermission('activity-mutate')
  const { t } = useTranslation(['common', 'activity'])
  return (
    <Container
      title={t('activity:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('activity:title.create')}`} />
      <div className="mt-6 space-y-6">
        <ActivityForm />
      </div>
    </Container>
  )
}
