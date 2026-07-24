'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'

import ModelAssetForm from './components/ModelAssetForm'
import ModelAssetSkeleton from './components/ModelAssetSkeleton'
import { useModelAssetDetail } from './hooks/useModelAssetDetail'

const ModelAssetEditPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission('model-asset-management-global-mutate')
  const { data, isLoading, defaultValue, t, handleBackToList } =
    useModelAssetDetail({
      isGlobal,
    })

  return (
    <AppLayout
      title={t('modelAsset:form.title.edit')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('modelAsset:form.title.edit')}`}
      />
      <div className="ui-space-y-6">
        {isLoading ? (
          <ModelAssetSkeleton />
        ) : (
          <ModelAssetForm data={data} defaultValues={defaultValue} />
        )}
      </div>
    </AppLayout>
  )
}

export default ModelAssetEditPage
