'use client'

import AssetInventoryCreatePage from '#pages/asset-inventory/form/AssetInventoryCreatePage'
import { hasPermission } from '#shared/permission/index'

const GlobalAssetInventoryCreatePage = () => {
  hasPermission('global-asset-managements-menu')
  return <AssetInventoryCreatePage />
}

export default GlobalAssetInventoryCreatePage
