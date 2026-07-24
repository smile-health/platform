'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import { AxiosError } from 'axios'

import MaterialVolumeDetailInfo from './components/MaterialVolumeDetailInfo'
import { useMaterialVolumeDetail } from './hooks/useMaterialVolumeDetail'

const MaterialVolumeDetailPage: FC = (): JSX.Element => {
  usePermission('material-volume-management-global-view')
  const { data, error, isLoading, t } = useMaterialVolumeDetail()

  useSetLoadingPopupStore(isLoading)

  if ((error as AxiosError)?.response?.status === 403) return <Error403Page />
  if ((error as AxiosError)?.response?.status === 404) return <Error404Page />
  if ((error as AxiosError)?.response?.status === 422) return <Error404Page />

  return (
    <AppLayout
      title={t('materialVolume:title.detail')}
      backButton={{ show: true }}
    >
      <Meta title={`Smile | Global ${t('materialVolume:title.detail')}`} />
      <div className="ui-space-y-6">
        <MaterialVolumeDetailInfo data={data} isLoading={isLoading} />
      </div>
    </AppLayout>
  )
}

export default MaterialVolumeDetailPage
