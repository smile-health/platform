import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

export const materialChildTabs = (
  t: TFunction<['material', 'common', 'materialVolume']>,

  getLink: (url: string) => string
) => [
  {
    id: 'tab-material-data',
    label: t('common:tab.material.tabs.material_data'),
    href: getLink('/v5/global-settings/material/data'),
    isShow: hasPermission('material-global-view'),
  },
  {
    id: 'tab-material-volume',
    label: t('common:tab.material.tabs.material_volume'),
    href: getLink('/v5/global-settings/material/volume'),
    isShow: hasPermission('material-volume-management-global-view'),
  },
]
