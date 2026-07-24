'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'

import MaterialVolumeForm from './components/MaterialVolumeForm'
import MaterialVolumeSkeleton from './components/MaterialVolumeSkeleton'
import { useMaterialVolumeDetail } from './hooks/useMaterialVolumeDetail'

const MaterialVolumeEditPage: FC<CommonType> = ({
  isGlobal = true,
}): JSX.Element => {
  usePermission('material-volume-management-global-mutate')
  const { data, isLoading, defaultValue, t } = useMaterialVolumeDetail()

  useSetLoadingPopupStore(isLoading)

  return (
    <AppLayout
      title={t('materialVolume:title.edit')}
      backButton={{
        show: true,
      }}
    >
      <Meta title={`Smile | Global ${t('materialVolume:title.edit')}`} />
      <div className="ui-space-y-6">
        {isLoading ? (
          <MaterialVolumeSkeleton />
        ) : (
          <MaterialVolumeForm
            defaultValues={defaultValue}
            isGlobal={isGlobal}
          />
        )}
      </div>
    </AppLayout>
  )
}

export default MaterialVolumeEditPage
