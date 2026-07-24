import { usePermission } from '#hooks/usePermission'
import ManufacturerDetailPage from '#pages/manufacturer/ManufacturerDetailPage'

export default function GlobalSettingManufacturerDetailPage() {
  usePermission('manufacturer-global-view')

  return <ManufacturerDetailPage isGlobal />
}
