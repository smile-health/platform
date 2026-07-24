import React from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import AssetInventoryForm from './components/AssetInventoryForm'

const AssetInventoryCreatePage = () => {
  usePermission('asset-inventory-mutate')
  const { t } = useTranslation(['common', 'assetInventory'])
  const router = useSmileRouter()

  return (
    <AppLayout
      title={t('assetInventory:asset_inventory')}
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.pushGlobal(
            '/v5/global-asset/management/operational-asset-inventory'
          )
        },
      }}
    >
      <Meta title={`SMILE | ${t('assetInventory:asset_inventory')}`} />
      <AssetInventoryForm />
    </AppLayout>
  )
}

export default AssetInventoryCreatePage
