'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'

import AssetTypeDetailInfo from './components/AssetTypeDetailInfo'
import { useAssetTypeDetail } from './hooks/useAssetTypeDetail'

const AssetTypeDetailPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(isGlobal ? 'asset-type-global-view' : 'asset-type-view')
  const {
    data,
    isLoading,
    onUpdateStatus,
    isUpdateStatus,
    t,
    handleBackToList,
  } = useAssetTypeDetail({ isGlobal })

  return (
    <AppLayout
      title={t('assetType:detail.title')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetType:detail.title')}`}
      />
      <div className="ui-space-y-6">
        <AssetTypeDetailInfo
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

export default AssetTypeDetailPage
