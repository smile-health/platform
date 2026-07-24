'use client'

import { usePermission } from '#hooks/usePermission'
import ManufacturerCreatePage from '#pages/manufacturer/ManufacturerCreatePage'

const GlobalSettingUserManufacturerPage = () => {
  usePermission('manufacturer-global-mutate')
  return <ManufacturerCreatePage isGlobal />
}

export default GlobalSettingUserManufacturerPage
