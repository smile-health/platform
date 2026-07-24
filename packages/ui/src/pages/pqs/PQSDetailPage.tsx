'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import { AxiosError } from 'axios'

import PQSDetailInfo from './components/PQSDetailInfo'
import { usePQSDetail } from './hooks/usePQSDetail'

const PQSDetailPage: FC = (): JSX.Element => {
  usePermission('pqs-global-view')
  const { data, error, isLoading, t, handleBackToList } = usePQSDetail()

  useSetLoadingPopupStore(isLoading)

  if ((error as AxiosError)?.response?.status === 403) return <Error403Page />
  if ((error as AxiosError)?.response?.status === 404) return <Error404Page />
  if ((error as AxiosError)?.response?.status === 422) return <Error404Page />

  return (
    <AppLayout
      title={t('pqs:title.detail')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta title={`Smile | Global ${t('pqs:title.detail')}`} />
      <div className="ui-space-y-6">
        <PQSDetailInfo data={data} isLoading={isLoading} />
      </div>
    </AppLayout>
  )
}

export default PQSDetailPage
