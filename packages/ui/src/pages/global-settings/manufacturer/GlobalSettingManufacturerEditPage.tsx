'use client'

import { usePermission } from '#hooks/usePermission'
import ManufacturerEditPage from '#pages/manufacturer/ManufacturerEditPage'

const GlobalSettingManufacturerEditPage = () => {
  usePermission('manufacturer-global-mutate')

  return <ManufacturerEditPage isGlobal />
}

export default GlobalSettingManufacturerEditPage
