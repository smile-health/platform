import AssetInventoryEditPage from '#pages/asset-inventory/form/AssetInventoryEditPage'
import { hasPermission } from '#shared/permission/index'

export default function GlobalAssetInventoryEditPage() {
  hasPermission('global-asset-managements-menu')
  return <AssetInventoryEditPage />
}
