'use client'

import Meta from "#components/layouts/Meta"
import Container from "#components/layouts/PageContainer"
import { usePermission } from "#hooks/usePermission"
import ActivityDetailInfo from "#pages/activity/components/ActivityDetailInfo"
import { useProgramDetailsActivityDetail } from "./hooks/useProgramDetailsActivityDetail"

const GlobalSettingProgramActivityDetailPage: React.FC = () => {
  usePermission('activity-global-view')
  const {
    t,
    data,
    isFetching,
    isLoadingStatus,
    onChangeStatus,
    pathEdit
  } = useProgramDetailsActivityDetail()

  return (
    <Container
      withLayout
      title={t('activity:title.information')}
      hideTabs
    >
      <Meta title={`SMILE | ${t('programGlobalSettings:title.list')} ${t('activity:title.information')}`} />

      <div className="ui-space-y-6">
        <ActivityDetailInfo
          data={data}
          isLoading={isFetching}
          onChangeStatus={onChangeStatus}
          isLoadingUpdateStatus={isLoadingStatus}
          pathEdit={pathEdit}
        />
      </div>
    </Container>
  )
}

export default GlobalSettingProgramActivityDetailPage
