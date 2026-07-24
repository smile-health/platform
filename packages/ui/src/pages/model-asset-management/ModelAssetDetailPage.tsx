'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'

import ModelAssetDetailInfo from './components/ModelAssetDetailInfo'
import { useModelAssetDetail } from './hooks/useModelAssetDetail'

const ModelAssetDetailPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(
    isGlobal
      ? 'model-asset-management-global-view'
      : 'model-asset-management-view'
  )
  const {
    data,
    isLoading,
    onUpdateStatus,
    isUpdateStatus,
    t,
    handleBackToList,
  } = useModelAssetDetail({ isGlobal })

  return (
    <AppLayout
      title={t('modelAsset:detail.title')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('modelAsset:detail.title')}`}
      />
      <div className="ui-space-y-6">
        <ModelAssetDetailInfo
          data={data}
          isGlobal={isGlobal}
          isLoading={isLoading}
          onUpdateStatus={onUpdateStatus}
          isLoadingUpdateStatus={isUpdateStatus}
        />
      </div>
    </AppLayout>
  )
}

export default ModelAssetDetailPage
