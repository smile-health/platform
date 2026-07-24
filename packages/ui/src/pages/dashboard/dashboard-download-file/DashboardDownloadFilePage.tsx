import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '#components/empty-state'
import { H4 } from '#components/heading'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import cx from '#lib/cx'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardDownloadFileCard from './components/DashboardDownloadFileCard'
import { getDownloadList } from './dashboard-download-file.service'

export default function DashboardDownloadFilePage() {
  usePermission('dashboard-download-view')
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardDownload')

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['download-list', language],
    queryFn: getDownloadList,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  return (
    <Container title={t('title')} withLayout>
      <Meta title={generateMetaTitle(t('title'))} />
      <div
        className={cx('ui-border ui-border-neutral-300 ui-rounded', {
          'ui-divide-y ui-divide-neutral-300': dataSource?.data?.length,
          'ui-flex ui-flex-col ui-justify-center ui-items-center ui-h-96':
            !dataSource?.data?.length,
        })}
      >
        {dataSource?.data?.length ? (
          dataSource?.data?.map((item) => (
            <Fragment key={item?.id}>
              <div className="ui-p-3 ui-text-center">
                <H4>{item?.title}</H4>
              </div>

              {item?.list?.length ? (
                <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-p-4">
                  {item?.list?.map((file) => (
                    <DashboardDownloadFileCard
                      key={file?.code}
                      title={file?.name}
                      code={file?.code}
                      updated_at={file?.created_at}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t('empty.title')}
                  description={t('empty.description')}
                />
              )}
            </Fragment>
          ))
        ) : (
          <EmptyState
            withIcon
            title={t('empty.title')}
            description={t('empty.description')}
          />
        )}
      </div>
    </Container>
  )
}
