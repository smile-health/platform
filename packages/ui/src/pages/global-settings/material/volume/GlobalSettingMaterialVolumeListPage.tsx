'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import MaterialVolumeListPage from '#pages/material-volume-management/MaterialVolumeListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../../GlobalSettings'
import { materialChildTabs } from '../material.constants'

const GlobalSettingMaterialVolumeListPage: React.FC = () => {
  const router = useSmileRouter()
  const { t } = useTranslation(['material', 'common', 'materialVolume'])
  const tabsItems = materialChildTabs(t, router.getAsLinkGlobal)

  return (
    <GlobalSettings
      title={t('materialVolume:title.material_volume')}
      showButtonCreate={hasPermission('material-global-mutate')}
      buttonCreate={{
        label: t('materialVolume:title.add'),
        onClick: () =>
          router.pushGlobal(`/v5/global-settings/material/volume/create`),
      }}
      childTabs={tabsItems}
    >
      <MaterialVolumeListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingMaterialVolumeListPage
