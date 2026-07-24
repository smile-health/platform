'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { useTranslation } from 'react-i18next'

import ActivityDetailInfo from './components/ActivityDetailInfo'
import { useActivityDetail } from './hooks/useActivityDetail'
import { usePermission } from '#hooks/usePermission'

export default function ActivityDetailPage(): JSX.Element {
  usePermission('activity-view')
  const { t } = useTranslation(['activity', 'common'])

  const { data, isLoading, onChangeStatus, isLoadingStatus } = useActivityDetail()

  return (
    <Container
      title={t('title.information')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('title.information')}`} />
      <div className="ui-space-y-6">
        <ActivityDetailInfo
          data={data}
          isLoading={isLoading}
          onChangeStatus={onChangeStatus}
          isLoadingUpdateStatus={isLoadingStatus}
        />
      </div>
    </Container>
  )
}
