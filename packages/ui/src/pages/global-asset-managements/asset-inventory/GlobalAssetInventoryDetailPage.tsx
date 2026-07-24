import AssetInventoryDetailPage from '#pages/asset-inventory/detail/AssetInventoryDetailPage'
import { hasPermission } from '#shared/permission/index'

export default function GlobalAssetInventoryDetailPage() {
  hasPermission('global-asset-managements-menu')
  return <AssetInventoryDetailPage />
}
