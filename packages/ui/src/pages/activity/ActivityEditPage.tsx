'use client'

import { Fragment } from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { Skeleton } from '#components/skeleton'
import { useTranslation } from 'react-i18next'

import ActivityForm from './components/ActivityForm'
import { useActivityDetail } from './hooks/useActivityDetail'
import { usePermission } from '#hooks/usePermission'

export default function ActivityEditPage(): JSX.Element {
  usePermission('activity-mutate')
  const { t } = useTranslation(['common', 'activity'])
  const { data, isLoading } = useActivityDetail()

  return (
    <Container
      title={t('activity:title.edit')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('activity:title.edit')}`} />
      <div className="mt-6">
        {isLoading ? (
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
          <ActivityForm isEdit defaultValues={data} />
        )}
      </div>
    </Container>
  )
}
