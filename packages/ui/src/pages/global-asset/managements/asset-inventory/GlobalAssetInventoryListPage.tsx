'use client'

import { EXTERNAL_USER_ROLE } from '#constants/roles'
import useSmileRouter from '#hooks/useSmileRouter'
import AssetInventoryListPage from '#pages/asset-inventory/list/AssetInventoryListPage'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../../GlobalAssetManagementsLayout'
import { globalAssetManagementsChildTabs } from '../managements.constants'

const GlobalAssetInventoryListPage = () => {
  hasPermission('global-asset-managements-menu')

  const {
    i18n: { t },
  } = useTranslation(['assetInventory'])
  const router = useSmileRouter()

  const childTabs = globalAssetManagementsChildTabs(
    t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  const user = getUserStorage()
  const isSanitary =
    user?.external_properties?.role?.id === EXTERNAL_USER_ROLE.SANITARIAN

  return (
    <GlobalAssetManagementsLayout
      title={t('assetInventory:asset_inventory_list')}
      showButtonCreate={hasPermission('asset-inventory-mutate')}
      buttonCreate={{
        label: t('assetInventory:create_inventory_asset'),
        onClick: () =>
          router.pushGlobal(
            `/v5/global-asset/management/operational-asset-inventory/create`
          ),
      }}
      childTabs={isSanitary ? undefined : childTabs}
      isSanitary={isSanitary}
    >
      <AssetInventoryListPage isGlobal />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalAssetInventoryListPage
