'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'

import AssetVendorForm from './components/AssetVendorForm'
import AssetVendorSkeleton from './components/AssetVendorSkeleton'
import { useAssetVendorDetail } from './hooks/useAssetVendorDetail'

const AssetVendorEditPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission('asset-vendor-global-mutate')
  const { isLoading, defaultValue, t, handleBackToList } = useAssetVendorDetail(
    {
      isGlobal,
    }
  )

  return (
    <AppLayout
      title={t('assetVendor:form.title.edit')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetVendor:form.title.edit')}`}
      />
      <div className="ui-space-y-6">
        {isLoading ? (
          <AssetVendorSkeleton />
        ) : (
          <AssetVendorForm defaultValues={defaultValue} isGlobal={isGlobal} />
        )}
      </div>
    </AppLayout>
  )
}

export default AssetVendorEditPage
