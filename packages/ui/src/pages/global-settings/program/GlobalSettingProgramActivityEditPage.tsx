'use client'
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { Skeleton } from "#components/skeleton"
import Meta from "#components/layouts/Meta"
import Container from "#components/layouts/PageContainer"
import ActivityForm from "#pages/activity/components/ActivityForm"
import { useProgramDetailsActivityDetail } from "./hooks/useProgramDetailsActivityDetail"
import { usePermission } from "#hooks/usePermission"

const GlobalSettingProgramActivityEditPage: React.FC = () => {
  usePermission('activity-global-mutate')
  const { t } = useTranslation(['activity', 'programGlobalSettings'])
  const { data, isFetching, pathBack } = useProgramDetailsActivityDetail()

  return (
    <Container
      withLayout
      title={t('activity:title.edit')}
      hideTabs
    >
      <Meta title={`SMILE | ${t('programGlobalSettings:title.list')} ${t('activity:title.edit')}`} />

      <div className="mt-6 space-y-6">
        {isFetching ? (
          <Fragment>
            <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-space-y-4 ui-rounded">
              <div className="ui-flex ui-justify-end">
                <Skeleton className="ui-h-10 ui-w-[150px]" />
              </div>
              <Skeleton className="ui-h-4 ui-w-[200px]" />
              <Skeleton className="ui-h-10 ui-w-1/2" />
              <Skeleton className="ui-h-10 ui-w-1/2" />
              <Skeleton className="ui-h-10 ui-w-1/2" />
            </div>
            <div className="ui-flex ui-justify-end ui-gap-4 ui-mt-6">
              <Skeleton className="ui-h-10 ui-w-32" />
              <Skeleton className="ui-h-10 ui-w-32" />
              <Skeleton className="ui-h-10 ui-w-32" />
            </div>
          </Fragment>
        ) : (
          <ActivityForm isEdit defaultValues={data} pathBack={pathBack} />
        )}
      </div>
    </Container>
  )
}

export default GlobalSettingProgramActivityEditPage
