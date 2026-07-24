'use client'

import { useRouter } from 'next/navigation'
import AssetInventoryListPage from '#pages/asset-inventory/list/AssetInventoryListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../GlobalAssetManagementsLayout'

const GlobalAssetInventoryListPage = () => {
  hasPermission('global-asset-managements-menu')

  const router = useRouter()
  const {
    i18n: { language, t },
  } = useTranslation(['assetInventory'])
  return (
    <GlobalAssetManagementsLayout
      title={t('assetInventory:asset_inventory_list')}
      showButtonCreate={hasPermission('asset-inventory-mutate')}
      buttonCreate={{
        label: t('assetInventory:create_inventory_asset'),
        onClick: () =>
          router.push(
            `/${language}/v5/global-asset-managements/operational-asset-inventory/create`
          ),
      }}
    >
      <AssetInventoryListPage isGlobal />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalAssetInventoryListPage
