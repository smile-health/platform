'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { CommonType } from '#types/common'

import AssetTypeForm from './components/AssetTypeForm'
import AssetTypeSkeleton from './components/AssetTypeSkeleton'
import { useAssetTypeDetail } from './hooks/useAssetTypeDetail'

const BudgetSourceEditPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission('asset-type-global-mutate')
  const { isLoading, defaultValue, t, handleBackToList } = useAssetTypeDetail({
    isGlobal,
  })

  return (
    <AppLayout
      title={t('assetType:form.title.edit')}
      backButton={{
        show: true,
        onClick: () => handleBackToList(),
      }}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('assetType:form.title.edit')}`}
      />
      <div className="ui-space-y-6">
        {isLoading ? (
          <AssetTypeSkeleton />
        ) : (
          <AssetTypeForm defaultValues={defaultValue} />
        )}
      </div>
    </AppLayout>
  )
}

export default BudgetSourceEditPage
