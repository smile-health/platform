'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'

import AssetVendorDetailInfo from './components/AssetVendorDetailInfo'
import { useAssetVendorDetail } from './hooks/useAssetVendorDetail'

const AssetVendorDetailPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(isGlobal ? 'asset-vendor-global-view' : 'asset-vendor-view')
  const {
    data,
    isLoading,
    onUpdateStatus,
    isUpdateStatus,
    t,
    handleBackToList,
  } = useAssetVendorDetail({ isGlobal })

  return (
    <AppLayout
      title={t('assetVendor:detail.title')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetVendor:detail.title')}`}
      />
      <div className="ui-space-y-6">
        <AssetVendorDetailInfo
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

export default AssetVendorDetailPage
